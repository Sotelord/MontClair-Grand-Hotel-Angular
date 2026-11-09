const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export const environment = {
  production: !isLocalhost,
  apiUrl: isLocalhost
    ? 'http://localhost:8080/api'
    : 'https://supabase-camilo-web.mmzlot.easypanel.host/api',
  // URL del Webhook de n8n para el Agente IA de MontClair
  n8nChatWebhookUrl: 'https://primary-production-4cb5.up.railway.app/webhook/chat-montclair',
};

