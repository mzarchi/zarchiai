// tgcloud/handlers/chat_member.js
import { api } from 'sdk';
import { ADMIN_CHAT_ID } from '../lib/config.js';

function getTehranDateTime() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  return { date, time };
}

export default async function (chatMemberUpdated) {
  const { chat, old_chat_member, new_chat_member } = chatMemberUpdated;

  if (chat.username !== 'MohammadZarchi') return;

  const user = new_chat_member.user;
  const oldStatus = old_chat_member.status;
  const newStatus = new_chat_member.status;

  const wasMember = ['member', 'administrator', 'creator', 'restricted'].includes(oldStatus);
  const isMember = ['member', 'administrator', 'creator', 'restricted'].includes(newStatus);

  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() || 'no name';

  const username = user.username ? `@${user.username}` : 'no username';
  const userId = user.id;

  const channelUsername = chat.username ? `@${chat.username}` : 'private channel';

  const { date, time } = getTehranDateTime();

  if (!wasMember && isMember) {
    const text =
      `#Join Member Notice!\n` +
      `User ID: #ci${userId}\n` +
      `Fullname: ${fullName}\n` +
      `Username: ${username}\n` +
      `Time: ${time} (Tehran)\n` +
      `Date: ${date}\n` +
      `Channel: ${channelUsername}`;

    await api.sendMessage({ chat_id: ADMIN_CHAT_ID, text });
  }

  if (wasMember && !isMember) {
    const text =
      `#Left Member Notice!\n` +
      `User ID: #ci${userId}\n` +
      `Fullname: ${fullName}\n` +
      `Username: ${username}\n` +
      `Time: ${time} (Tehran)\n` +
      `Date: ${date}\n` +
      `Channel: ${channelUsername}`;

    await api.sendMessage({ chat_id: ADMIN_CHAT_ID, text });
  }
}