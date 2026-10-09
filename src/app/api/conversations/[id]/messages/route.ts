import { route, ok, bad, forbidden, notFound } from '@/lib/api';
import { requireParty } from '@/lib/auth';
import { notify } from '@/lib/notify';
import { saveUpload } from '@/lib/upload';
import { Conversation, Message } from '@/models/Marketplace';

async function load(id: string) {
  const { role, acct } = await requireParty();
  const convo = await Conversation.findById(id);
  if (!convo) throw notFound('Conversation not found');
  if (String(convo[role === 'user' ? 'user' : 'buyer']) !== String(acct._id)) throw forbidden();
  return { role, acct, convo };
}

/** Polling endpoint: ?after=<ISO date> returns only newer messages. Marks the other side's messages as read. */
export const GET = route(async (req, ctx) => {
  const { id } = await ctx.params;
  const { role, convo } = await load(id);
  const after = new URL(req.url).searchParams.get('after');
  const items = await Message.find({ conversation: id, ...(after ? { createdAt: { $gt: new Date(after) } } : {}) }).sort({ createdAt: 1 }).lean();
  await Message.updateMany({ conversation: id, senderRole: { $ne: role }, [role === 'user' ? 'userReadAt' : 'buyerReadAt']: null }, { [role === 'user' ? 'userReadAt' : 'buyerReadAt']: new Date() });
  return ok({ items, blocked: convo.blocked });
});

const FILE_TYPES = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];

/** Accepts JSON {message} or multipart (message, files[]). */
export const POST = route(async (req, ctx) => {
  const { id } = await ctx.params;
  const { role, acct, convo } = await load(id);
  if (convo.blocked) throw forbidden('This conversation is blocked');
  let text = ''; const files: string[] = [];
  if ((req.headers.get('content-type') || '').includes('multipart/form-data')) {
    const form = await req.formData();
    text = String(form.get('message') ?? '').trim();
    const uploads = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
    if (uploads.length > 10) throw bad('Max 10 files');
    for (const f of uploads) files.push(await saveUpload(f, 'messages', FILE_TYPES, 2));
  } else text = String((await req.json()).message ?? '').trim();
  if (!text && !files.length) throw bad('Message field is required');
  const m = await Message.create({ conversation: id, senderRole: role, sender: String(acct._id), message: text, files, ...(role === 'user' ? { userReadAt: new Date() } : { buyerReadAt: new Date() }) });
  await Conversation.updateOne({ _id: id }, { lastMessageAt: new Date() });
  const other = role === 'user' ? 'buyer' : 'user';
  await notify(other, convo[other], 'New message', text.slice(0, 80), `/${other === 'user' ? 'freelancer' : 'buyer'}/messages?c=${id}`);
  return ok(m, 201);
});
