import { Router } from 'express';
import { requireAuth } from '@middleware/auth.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

const router = Router();

router.post('/', requireAuth, async (req: any, res) => {
  if (!req.files?.file) return res.status(400).json({ error: 'No file uploaded' });
  const file = req.files.file;
  const dir = process.env.UPLOAD_DIR || './uploads';
  fs.mkdirSync(dir, { recursive: true });
  const id = uuid();
  const ext = path.extname(file.name);
  const name = `${id}${ext}`;
  const p = path.join(dir, name);
  await file.mv(p);
  const url = `/uploads/${name}`;
  res.json({ id, name: file.name, url, mime: file.mimetype, size: file.size });
});

export default router;
