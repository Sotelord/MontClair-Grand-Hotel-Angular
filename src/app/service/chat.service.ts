import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ChatMessage, ChatSuggestion } from '../models/chat-message.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);

  // Historial reactivo de mensajes para los componentes
  messages = signal<ChatMessage[]>([]);
  isTyping = signal<boolean>(false);
  isOpen = signal<boolean>(false);

  // Identificador único de sesión para persistir contexto en el backend y n8n
  private sessionId: string;
  private readonly SESSION_STORAGE_KEY = 'montclair_chat_session_id';
  private readonly HISTORY_STORAGE_KEY = 'montclair_chat_history';

  // Preguntas frecuentes sugeridas
  readonly suggestions: ChatSuggestion[] = [
    {
      label: '¿Qué suites tienen disponibles?',
      prompt: '¿Cuáles son los tipos de suites y habitaciones disponibles en el hotel?',
      icon: '🏨',
    },
    {
      label: 'Horarios de Check-In & Check-Out',
      prompt: '¿Cuáles son los horarios de Check-in y Check-out en MontClair?',
      icon: '⏰',
    },
    {
      label: 'Servicios exclusivos y Spa',
      prompt: '¿Qué servicios exclusivos, spa y gastronomía ofrecen?',
      icon: '✨',
    },
    {
      label: '¿Cómo reservar una habitación?',
      prompt: '¿Cómo puedo realizar una reserva en línea?',
      icon: '🛎️',
    },
  ];

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.loadHistory();
  }

  toggleChat(): void {
    this.isOpen.update((v) => !v);
  }

  openChat(): void {
    this.isOpen.set(true);
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  /**
   * Envía un mensaje del usuario conectado directamente al backend (/api/ai/chat)
   * que consulta la base de datos en tiempo real (habitaciones, precios, servicios)
   * y orquesta con n8n.
   */
  sendMessage(userText: string): void {
    const trimmed = userText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
      status: 'sent',
    };

    this.addMessage(userMsg);
    this.isTyping.set(true);

    const payload = {
      message: trimmed,
      sessionId: this.sessionId,
      source: 'web_chat_bubble',
      hotel: 'MontClair Grand Hotel',
    };

    const backendChatUrl = `${environment.apiUrl}/ai/chat`;

    // 1. Conexión directa al backend Spring Boot
    this.http
      .post<{ reply?: string; output?: string; response?: string }>(
        backendChatUrl,
        payload,
      )
      .pipe(
        map((res) => {
          return res?.reply || res?.output || res?.response || this.getSmartConciergeResponse(trimmed);
        }),
        catchError(() => {
          // 2. Si el backend está en proceso de arranque o inaccesible, prueba n8n o fallback inteligente
          if (environment.n8nChatWebhookUrl && !environment.n8nChatWebhookUrl.includes('localhost:5678')) {
            return this.http
              .post<{ reply?: string; output?: string; response?: string }>(
                environment.n8nChatWebhookUrl,
                payload,
              )
              .pipe(
                map((res) => res?.reply || res?.output || res?.response || this.getSmartConciergeResponse(trimmed)),
                catchError(() => of(this.getSmartConciergeResponse(trimmed))),
              );
          }
          return of(this.getSmartConciergeResponse(trimmed));
        }),
      )
      .subscribe((replyText) => {
        this.isTyping.set(false);
        const assistantMsg: ChatMessage = {
          id: 'ast_' + Date.now(),
          sender: 'assistant',
          text: replyText,
          timestamp: new Date(),
          status: 'sent',
        };
        this.addMessage(assistantMsg);
      });
  }

  clearChat(): void {
    this.messages.set([this.createWelcomeMessage()]);
    localStorage.removeItem(this.HISTORY_STORAGE_KEY);
  }

  private addMessage(msg: ChatMessage): void {
    this.messages.update((list) => {
      const updated = [...list, msg];
      this.saveHistory(updated);
      return updated;
    });
  }

  private loadHistory(): void {
    try {
      const raw = localStorage.getItem(this.HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed: ChatMessage[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.messages.set(
            parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
          );
          return;
        }
      }
    } catch {
      // Ignorar error al parsear localStorage
    }
    this.messages.set([this.createWelcomeMessage()]);
  }

  private saveHistory(msgs: ChatMessage[]): void {
    try {
      localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(msgs));
    } catch {
      // LocalStorage lleno o restringido
    }
  }

  private createWelcomeMessage(): ChatMessage {
    return {
      id: 'welcome_' + Date.now(),
      sender: 'assistant',
      text: '¡Bienvenido a MontClair Grand Hotel! 🏨✨\n\nSoy su Concierge Virtual conectado en tiempo real al sistema del hotel. Estoy a su entera disposición para informarle sobre la disponibilidad de nuestras suites, tarifas oficiales, servicios exclusivos y guiarle en su reserva.\n\n¿En qué puedo asistirle hoy?',
      timestamp: new Date(),
      status: 'sent',
    };
  }

  private getOrCreateSessionId(): string {
    let id = localStorage.getItem(this.SESSION_STORAGE_KEY);
    if (!id) {
      id = 'session_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      localStorage.setItem(this.SESSION_STORAGE_KEY, id);
    }
    return id;
  }

  /**
   * Base de conocimiento inteligente del hotel para respuestas de alta fidelidad si el servidor está offline
   */
  private getSmartConciergeResponse(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('check-in') || q.includes('check in') || q.includes('horario') || q.includes('salida') || q.includes('llegada')) {
      return 'En MontClair Grand Hotel nuestros horarios oficiales son:\n\n• **Check-in:** A partir de las **15:00 hrs**.\n• **Check-out:** Hasta las **12:00 hrs** del mediodía.\n\nSi requiere un *Early Check-in* o *Late Check-out*, puede solicitarlo al momento de su reserva o con nuestro equipo de recepción.';
    }

    if (q.includes('habitacion') || q.includes('habitaciones') || q.includes('suite') || q.includes('suites') || q.includes('tipo') || q.includes('tarifa') || q.includes('precio')) {
      return 'Contamos con una exquisita selección de estancias de lujo registradas en nuestro sistema:\n\n1. **Simple:** Habitación estándar — $80.00 USD/noche\n2. **Deluxe:** Habitación amplia con servicios premium — $116.52 USD/noche\n3. **Suite:** Habitación de lujo con sala privada — $200.00 USD/noche\n4. **Premium Suite:** Balcón privado y vista exclusiva — $280.00 USD/noche\n5. **Suite Royale:** La máxima experiencia de lujo — $350.00 USD/noche\n\nPuede ver la galería completa y reservar desde la sección **Habitaciones** del menú superior.';
    }

    if (q.includes('reserva') || q.includes('reservar') || q.includes('pagar')) {
      return 'Realizar su reserva es muy sencillo:\n\n1. Haga clic en el botón dorado **"Reservar Ahora"** en la parte superior.\n2. Seleccione sus fechas de estadía, número de huéspedes y su suite predilecta.\n3. Complete sus datos personales.\n4. Puede confirmar su reserva de inmediato mediante nuestra pasarela segura.\n\n¿Desea que le asista con alguna fecha en particular?';
    }

    if (q.includes('servicio') || q.includes('spa') || q.includes('restaurante') || q.includes('piscina') || q.includes('gimnasio') || q.includes('desayuno')) {
      return 'MontClair Grand Hotel ofrece experiencias excepcionales activas:\n\n• **Spa & Centro de Bienestar:** Terapias relajantes y circuito de aguas.\n• **Alta Gastronomía:** Restaurante gourmet con sommeliers internacionales.\n• **Piscina & Solárium:** Vistas panorámicas y servicio de coctelería.\n• **Room Service 24/7:** Atención de primera categoría en la comodidad de su suite.';
    }

    if (q.includes('contacto') || q.includes('telefono') || q.includes('correo') || q.includes('ubicacion') || q.includes('donde')) {
      return 'Estamos ubicados en el corazón de Mónaco con acceso privilegiado a los principales puntos de interés.\n\n• **Teléfono de recepción:** +377 93 12 34 56\n• **Correo electrónico:** reservas@montclairgrandhotel.com\n• **Atención:** 24 horas al día, los 365 días del año.';
    }

    return 'Con mucho gusto puedo asistirle con esa consulta. Para brindarle los detalles más precisos sobre disponibilidad y solicitudes especiales, también puede contactar directamente a nuestra recepción al teléfono **+377 93 12 34 56** o dirigirse a la sección **Reservar Ahora**. ¿Hay algún detalle específico que le gustaría conocer?';
  }
}
