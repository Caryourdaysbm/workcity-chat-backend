import { Router } from 'express';
import { requireAuth, AuthReq } from '@middleware/auth.js';
import Conversation from '@models/Conversation.js';
import Message from '@models/Message.js';
import mongoose from 'mongoose';
import { getUnreadCountMap } from '@services/messageService.js';
import { z } from 'zod';
import { validate } from '@middleware/validate.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthReq, res) => {
  const userId = new mongoose.Types.ObjectId(req.user!.id);
  const convs = await Conversation.aggregate([
    { $match: { 'participants.user': userId } },
    { $sort: { updatedAt: -1 } },
    { $lookup: { from: 'messages', localField: '_id', foreignField: 'conversation', as: 'messages', pipeline: [
      { $sort: { createdAt: -1 } },
      { $limit: 1 }
    ] } },
    { $addFields: { lastMessage: { $arrayElemAt: ['$messages', 0] } } },
    { $project: { messages: 0 } },
  ]);
  const convIds = convs.map((c: any) => c._id);
  const unreadMap = await getUnreadCountMap(userId, convIds);
  const result = convs.map((c: any) => ({
    _id: c._id,
    topic: c.topic,
    isGroup: c.isGroup,
    participants: c.participants,
    updatedAt: c.updatedAt,
    lastMessage: c.lastMessage || null,
    unreadCount: unreadMap.get(String(c._id)) || 0
  }));
  res.json(result);
});

const createThreadSchema = z.object({ body: z.object({
  participantIds: z.array(z.string()).min(0).default([]),
  topic: z.string().optional()
})});

router.post('/', requireAuth, validate(createThreadSchema), async (req: AuthReq, res) => {
  const { participantIds, topic } = req.body as { participantIds: string[], topic?: string };
  const unique = Array.from(new Set([req.user!.id, ...participantIds]));
  const participants = unique.map((id) => ({ user: id, role: 'customer' }));
  const conv = await Conversation.create({ participants, isGroup: participants.length > 2, createdBy: req.user!.id, topic });
  res.status(201).json(conv);
});

router.delete('/:id', requireAuth, async (req: AuthReq, res) => {
  const id = req.params.id;
  await Conversation.deleteOne({ _id: id, createdBy: req.user!.id });
  res.json({ ok: true });
});

export default router;
