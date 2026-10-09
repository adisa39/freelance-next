import { z } from 'zod';
import { route, ok, notFound } from '@/lib/api';
import { requireParty, requireUser } from '@/lib/auth';
import { Bid, Conversation, Job, Message } from '@/models/Marketplace';

export const GET = route(async () => {
  const { role, acct } = await requireParty();
  const convos = await Conversation.find({ [role === 'user' ? 'user' : 'buyer']: acct._id })
    .sort({ lastMessageAt: -1 }).populate([{ path: 'user', select: 'username firstname lastname' }, { path: 'buyer', select: 'username firstname lastname' }, { path: 'job', select: 'title' }]).lean();
  const readField = role === 'user' ? 'userReadAt' : 'buyerReadAt';
  const items = await Promise.all(convos.map(async (c) => {
    const [last, unread] = await Promise.all([
      Message.findOne({ conversation: c._id }).sort({ createdAt: -1 }).lean(),
      Message.countDocuments({ conversation: c._id, [readField]: null, senderRole: { $ne: role } }),
    ]);
    return { ...c, lastMessage: last?.message ?? null, unread };
  }));
  // A buyer sees chats they opened even before the first message; freelancers only see chats with messages.
  return ok(role === 'user' ? items.filter((c) => c.lastMessage !== null) : items);
});

/** Buyer opens (or reuses) a chat with a bidder — Buyer\ConversationController@bidChat */
export const POST = route(async (req) => {
  const buyer = await requireUser('buyer');
  const { bidId } = z.object({ bidId: z.string() }).parse(await req.json());
  const bid = await Bid.findOne({ _id: bidId, buyer: buyer._id });
  if (!bid) throw notFound('Bid not found');
  let convo = await Conversation.findOne({ buyer: buyer._id, user: bid.user });
  if (!convo) {
    convo = await Conversation.create({ buyer: buyer._id, user: bid.user, job: bid.job });
    await Job.updateOne({ _id: bid.job }, { $inc: { interviews: 1 } });
  }
  return ok(convo);
});
