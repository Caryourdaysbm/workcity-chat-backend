import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@models/User.js';
import { z } from 'zod';
import { validate } from '@middleware/validate.js';

const router = Router();

const signupSchema = z.object({ body: z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['admin','agent','customer','designer','merchant']).optional()
})});

router.post('/signup', validate(signupSchema), async (req, res) => {
  const { email, password, name, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name, role: role || 'customer' });
  const token = jwt.sign({ sub: String(user._id), role: user.role, name: user.name }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
});

const loginSchema = z.object({ body: z.object({
  email: z.string().email(),
  password: z.string().min(6)
})});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: String(user._id), role: user.role, name: user.name }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
});

export default router;
