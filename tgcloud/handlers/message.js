import { api, db } from 'sdk';
import { memberLogs } from '../schema.js';
import { ADMIN_CHAT_ID } from '../lib/config.js';

const TARGET_CHANNEL_ID = '@MohammadZarchi';

const CREATED_UNIX = 1612969454;

function daysAndHoursSinceCreation() {
  const nowUnix = Math.floor(Date.now() / 1000);
  const diffSeconds = nowUnix - CREATED_UNIX;
  const totalHours = Math.floor(diffSeconds / 3600);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { days, hours };
}

export default async function (message) {
  if (message.from?.id !== ADMIN_CHAT_ID) return;
  if (typeof message.text !== 'string') return;

  const text = message.text.trim();

  if (text === '/count') {
    const allRows = await db
      .select({ userId: memberLogs.userId })
      .from(memberLogs)
      .all();
    const uniqueUsers = new Set(allRows.map((r) => r.userId)).size;
    await api.sendMessage({
      chat_id: ADMIN_CHAT_ID,
      text: `Unique users in DB: ${uniqueUsers}\nTotal records: ${allRows.length}`,
    });
    return;
  }

  if (text === '/updatebio') {
    const { days, hours } = daysAndHoursSinceCreation();
    const description =
      `Writer, Content Researcher: @mhzarchi\n` +
      `Created: 2021/02/10 (AD), 1399/11/22 (PC)\n` +
      `Channel Age: ${days} days, ${hours} hours`;

    try {
      await api.setChatDescription({
        chat_id: TARGET_CHANNEL_ID,
        description,
      });
      await api.sendMessage({
        chat_id: ADMIN_CHAT_ID,
        text: `Channel bio updated successfully.\n\n${description}`,
      });
    } catch (err) {
      await api.sendMessage({
        chat_id: ADMIN_CHAT_ID,
        text: `Failed to update bio: ${String(err)}`,
      });
    }
    return;
  }
}