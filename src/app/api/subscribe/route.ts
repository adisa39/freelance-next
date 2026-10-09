import { z } from 'zod';
import { route, ok, bad } from '@/lib/api';
import { Subscriber } from '@/models/Cms';

export const POST = route(async (req) => {
  const { email } = z.object({ email: z.email() }).parse(await req.json());
  if (await Subscriber.exists({ email: email.toLowerCase() })) throw bad('You already subscribed to our newsletter');
  await Subscriber.create({ email });
  return ok();
});
