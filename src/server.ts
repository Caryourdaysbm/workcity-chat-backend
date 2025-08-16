import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';
import swagger from './swagger/openapi.json' with { type: 'json' };

import authRouter from './routes/auth.js';
import threadsRouter from './routes/threads.js';
import messagesRouter from './routes/messages.js';
import uploadRouter from './routes/upload.js';

import { Server as SocketIOServer } from 'socket.io';
import { authSocketMiddleware } from './socket/authSocket.js';
import { registerChatHandlers } from './socket/chatHandlers.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 300 }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swagger));

app.use('/api/auth', authRouter);
app.use('/api/threads', threadsRouter);
app.use('/api/conversations', messagesRouter);
app.use('/api/upload', uploadRouter);

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: process.env.CLIENT_ORIGIN?.split(',') || '*' } });
io.use(authSocketMiddleware);
io.on('connection', (socket) => registerChatHandlers(io, socket));

const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = process.env.MONGO_URI as string;

mongoose.connect(MONGO_URI).then(() => {
  server.listen(PORT, () => console.log(`Server listening on :${PORT}`));
}).catch((err) => {
  console.error('Mongo connection error', err);
  process.exit(1);
});
