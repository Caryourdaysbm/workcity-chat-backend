import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ParticipantSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['admin','agent','customer','designer','merchant'], required: true },
  lastReadAt: { type: Date, default: null }
}, { _id: false });

const ConversationSchema = new Schema({
  participants: { type: [ParticipantSchema], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isGroup: { type: Boolean, default: false },
  topic: { type: String }
}, { timestamps: true });

export type ConversationDoc = InferSchemaType<typeof ConversationSchema> & { _id: mongoose.Types.ObjectId };
export default mongoose.model('Conversation', ConversationSchema);
