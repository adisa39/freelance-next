import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { bad } from './api';

const root = () => path.resolve(process.env.UPLOAD_DIR || './uploads');

export async function saveUpload(file: File, sub: 'projects' | 'messages' | 'tickets', allowed: string[], maxMb = 20) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!allowed.includes(ext)) throw bad(`Only ${allowed.join(', ')} files are allowed`);
  if (file.size > maxMb * 1024 * 1024) throw bad(`File too large (max ${maxMb}MB)`);
  const d = new Date();
  const rel = path.posix.join(sub, String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, '0'), `${randomUUID()}.${ext}`);
  const full = path.join(root(), rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(await file.arrayBuffer()));
  return rel;
}

export async function readUpload(rel: string) {
  const full = path.resolve(root(), rel);
  if (!full.startsWith(root() + path.sep)) throw bad('Invalid path'); // path traversal guard
  return readFile(full);
}

export const MIME: Record<string, string> = {
  pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', txt: 'text/plain',
};
