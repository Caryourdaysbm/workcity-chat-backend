import { Router } from 'express';
import { requireAuth, AuthReq } from '@middleware/auth.js';
import Message from '@models/Message.js';
import Conversation from '@models/Conversation.js';
import mongoose from 'mongoose';
import { z } from 'zod';
import { validate } from '@middleware/validate.js';

const router = Router();

const listSchema = z.object({ params: z.object({ conversationId: z.string() }), query: z.object({
  page: z.string().transform((v) => parseInt(v)).optional().default('1'),
  limit: z.string().transform((v) => parseInt(v)).optional().default('50')
}) });

router.get('/:conversationId/messages', requireAuth, validate(listSchema), async (req: AuthReq, res) => {
  const { conversationId } = req.params;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Message.find({ conversation: conversationId }).sort({ createdAt: 1 }).skip(skip).limit(limit),
    Message.countDocuments({ conversation: conversationId })
  ]);
  res.json({ items, page, limit, total });
});

const sendSchema = z.object({ params: z.object({ conversationId: z.string() }), body: z.object({
  body: z.string().min(1),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    mime: z.string(),
    size: z.number()
  })).optional().default([])
}) });

router.post('/:conversationId/messages', requireAuth, validate(sendSchema), async (req: AuthReq, res) => {
  const { conversationId } = req.params;
  const { body, attachments } = req.body;
  const conv = await Conversation.findById(conversationId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  const msg = await Message.create({ conversation: conversationId, sender: req.user!.id, body, attachments });
  await Conversation.updateOne({ _id: conversationId }, { $set: { updatedAt: new Date() } });
  res.status(201).json(msg);
});

const readSchema = z.object({ params: z.object({ conversationId: z.string() }) });

router.post('/:conversationId/read', requireAuth, validate(readSchema), async (req: AuthReq, res) => {
  const { conversationId } = req.params;
  const userId = new mongoose.Types.ObjectId(req.user!.id);
  await Message.updateMany({ conversation: conversationId, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } });
  await Conversation.updateOne(
    { _id: conversationId, 'participants.user': userId },
    { $set: { 'participants.$.lastReadAt': new Date() } }
  );
  res.json({ ok: true });
});

export default router;
