import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;
// const broadcastAuthInstance = axios.create({
//     baseURL: 'http://localhost:8000/api/broadcasting/',// the auth route
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//     }
// })
const echo = new Echo({
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
  authorizer: (channel) => {
    return {
      authorize: async (socketId, callback) => {
        // axios
        //     .post('/api/broadcasting/auth', {
        //         socket_id: socketId,
        //         channel_name: channel.name,
        //     })
        //     .then(response => {
        //         callback(false, response.data)
        //     })
        //     .catch(error => {
        //         callback(true, error)
        //     })

        try {
          const response = await fetch(`http://127.0.0.1:8000/api/broadcasting/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              socket_id: socketId,
              channel_name: channel.name,
            },
          });
          callback(false, response.data);
        } catch (error) {
          callback(true, error);
        }
      },
    };
  },
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
  wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
  wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
  forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
});

export default echo;
