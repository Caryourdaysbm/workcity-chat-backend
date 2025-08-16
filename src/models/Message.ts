import mongoose, { Schema, InferSchemaType } from 'mongoose';

const AttachmentSchema = new Schema({
  id: String,
  name: String,
  url: String,
  mime: String,
  size: Number
}, { _id: false });

const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  body: { type: String, default: '' },
  attachments: { type: [AttachmentSchema], default: [] },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export type MessageDoc = InferSchemaType<typeof MessageSchema> & { _id: mongoose.Types.ObjectId };
export default mongoose.model('Message', MessageSchema);
