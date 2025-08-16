import type { Server, Socket } from 'socket.io';
import Message from '@models/Message.js';

export function registerChatHandlers(io: Server, socket: Socket) {
  const user = (socket as any).user;

  socket.on('conversation:join', (conversationId: string) => {
    socket.join(conversationId);
  });

  socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
    socket.to(data.conversationId).emit('typing', { userId: user.id, isTyping: data.isTyping });
  });

  socket.on('message:send', async (payload: { conversationId: string; body: string }) => {
    const msg = await Message.create({ conversation: payload.conversationId, sender: user.id, body: payload.body });
    io.to(payload.conversationId).emit('message:new', msg);
  });
}
