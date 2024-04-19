import {createServer} from 'http';
import {Server} from 'socket.io';
const httpServer = createServer();
export const socketServer = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});
httpServer.listen(4173,()=>
{
  console.log('Socket server running on port 4173: '+  import.meta.env.DEV);
});