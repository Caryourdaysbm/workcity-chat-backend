import Message from '@models/Message.js';

export async function getUnreadCountMap(userId: any, convIds: any[]) {
  const unreads = await Message.aggregate([
    { $match: { conversation: { $in: convIds }, readBy: { $ne: userId } } },
    { $group: { _id: '$conversation', count: { $sum: 1 } } }
  ]);
  return new Map(unreads.map((u: any) => [String(u._id), u.count]));
}
