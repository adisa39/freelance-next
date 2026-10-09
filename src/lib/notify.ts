import { Notification } from '@/models/Misc';
import type { Role } from './auth';

/**
 * In-app notification. Laravel's notify() also fans out to email/SMS/push using DB templates;
 * plug nodemailer/Twilio/etc. in here if you need those channels.
 */
export async function notify(role: Role, recipient: unknown, title: string, body = '', url = '') {
  await Notification.create({ recipientRole: role, recipient: String(recipient), title, body, url });
}
