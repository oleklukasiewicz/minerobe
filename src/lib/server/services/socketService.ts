import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: import.meta.env.PUSHER_APP_ID,
  key: import.meta.env.VITE_PUSHER_KEY,
  secret: import.meta.env.PUSHER_SECRET,
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  useTLS: true,
});