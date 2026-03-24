import Echo from "laravel-echo";
import Pusher from "pusher-js";
(window as any).Pusher = Pusher;
const echo = new Echo({
  broadcaster: "pusher",
  id: import.meta.env.VITE_APP_ID,
  key: import.meta.env.VITE_APP_KEY,
  wsHost: import.meta.env.VITE_APP_HOST,
  wsPort: import.meta.env.VITE_APP_PORT,
  cluster: import.meta.env.VITE_APP_CLUSTER,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
});
export default echo;
