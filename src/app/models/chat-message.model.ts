/**
 * Modelo para los mensajes del chat en vivo / Concierge IA de MontClair Grand Hotel.
 */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatSuggestion {
  label: string;
  prompt: string;
  icon?: string;
}

