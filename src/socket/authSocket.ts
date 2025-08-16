import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export function authSocketMiddleware(socket: Socket, next: (err?: any) => void) {
  const token = (socket.handshake.auth?.token || socket.handshake.headers['x-access-token']) as string | undefined;
  if (!token) return next(new Error('Missing token'));
  try {
    const payload = jwt.verify(String(token), process.env.JWT_SECRET!) as any;
    (socket as any).user = { id: payload.sub, role: payload.role, name: payload.name };
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
