import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configuration de Pusher pour Laravel Reverb
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

export const initEcho = (token?: string) => {
  if (typeof window === 'undefined') return null;

  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'o229_key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
    wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
    wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    ...(token && {
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
  });
};

const echoInstance = initEcho();

export default echoInstance;
