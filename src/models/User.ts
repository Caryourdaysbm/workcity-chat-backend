import mongoose, { Schema, InferSchemaType } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin','agent','customer','designer','merchant'], default: 'customer', index: true },
  avatarUrl: { type: String },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export default mongoose.model('User', UserSchema);
