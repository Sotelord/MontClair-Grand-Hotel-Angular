const isLocalhost =
  typeof window === 'undefined' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const environment = {
  production: !isLocalhost,
  apiUrl: isLocalhost ? 'http://localhost:8080/api' : '/api',
  backendBaseUrl: isLocalhost
    ? 'http://localhost:8080'
    : 'https://supabase-camilo-web.mmzlot.easypanel.host',
  // URL del Webhook de n8n para el Agente IA de MontClair
  n8nChatWebhookUrl: 'https://n8n-n8n.mmzlot.easypanel.host/webhook/chat-montclair',
};

