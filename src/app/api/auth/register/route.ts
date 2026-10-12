import { route, ApiError } from '@/lib/api';

export const POST = route(async () => {
  throw new ApiError(410, 'Create freelancer and buyer accounts with an InterLink wallet.');
});
