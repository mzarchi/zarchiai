// tgcloud/handlers/chat_member.js
import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { memberLogs } from '../schema.js';
import { ADMIN_CHAT_ID, LOG_CHANNEL_ID } from '../lib/config.js';

function getTehranDateTime(dateInput = new Date()) {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateInput);

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(dateInput);

  return { date, time };
}

function formatDuration(totalSeconds) {
  if (totalSeconds < 0) totalSeconds = 0;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  if (days > 0) {
    return `${days}, ${hh}:${mm}`;
  }
  return `${hh}:${mm}`;
}

function profileKeyboard(userId) {
  return {
    inline_keyboard: [
      [
        {
          text: 'Show Profile',
          url: `tg://user?id=${userId}`,
        },
      ],
    ],
  };
}

export default async function (chatMemberUpdated) {
  const { chat, old_chat_member, new_chat_member, date: eventUnix } = chatMemberUpdated;

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
  const userId = String(user.id);
  const channelUsername = chat.username ? `@${chat.username}` : 'private channel';

  const eventTime = new Date(eventUnix * 1000);
  const { date, time } = getTehranDateTime(eventTime);

  const replyMarkup = profileKeyboard(userId);

  if (!wasMember && isMember) {
    await db.insert(memberLogs).values({
      userId,
      join: eventTime,
    }).run();

    const text =
      `#Join Member Notice!\n` +
      `User ID: #ci${userId}\n` +
      `Fullname: ${fullName}\n` +
      `Username: ${username}\n` +
      `Time: ${time} (Tehran)\n` +
      `Date: ${date}\n` +
      `Channel: ${channelUsername}`;

    await api.sendMessage({
      chat_id: LOG_CHANNEL_ID,
      text,
      reply_markup: replyMarkup,
    });
  }

  if (wasMember && !isMember) {
    const rows = await db.select().from(memberLogs)
      .where(eq(memberLogs.userId, userId))
      .all();

    const openRecords = rows
      .filter((r) => r.left === null || r.left === undefined)
      .sort((a, b) => new Date(b.join) - new Date(a.join));

    let durationText = '';

    if (openRecords.length > 0) {
      const open = openRecords[0];

      await db.update(memberLogs)
        .set({ left: eventTime })
        .where(eq(memberLogs.id, open.id))
        .run();

      const joinedAt = new Date(open.join).getTime();
      const leftAt = eventTime.getTime();
      const durationSeconds = Math.floor((leftAt - joinedAt) / 1000);

      durationText = `Duration: ${formatDuration(durationSeconds)}\n`;
    } else {
      await db.insert(memberLogs).values({
        userId,
        left: eventTime,
      }).run();

      durationText = `Duration: (no join record)\n`;
    }

    const text =
      `#Left Member Notice!\n` +
      `User ID: #ci${userId}\n` +
      `Fullname: ${fullName}\n` +
      `Username: ${username}\n` +
      `Time: ${time} (Tehran)\n` +
      `Date: ${date}\n` +
      durationText +
      `Channel: ${channelUsername}`;

    await api.sendMessage({
      chat_id: LOG_CHANNEL_ID,
      text,
      reply_markup: replyMarkup,
    });
  }
}