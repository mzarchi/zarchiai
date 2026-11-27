// tgcloud/handlers/channel_post.js
import { api } from 'sdk';

const TARGET_CHANNEL = '@MohammadZarchi';

function daysAndHoursSinceCreation() {
    const CREATED_UNIX = 1612969454; // 2021-02-10 18:34:14 (Tehran)
    const nowUnix = Math.floor(Date.now() / 1000);
    const totalHours = Math.floor((nowUnix - CREATED_UNIX) / 3600);

    return {
        days: Math.floor(totalHours / 24),
        hours: totalHours % 24,
    };
}

export default async function (channelPost) {
    if (typeof channelPost.text !== 'string') return;
    const text = channelPost.text.trim();

    if (text !== '/updatebio') return;

    const { days, hours } = daysAndHoursSinceCreation();

    const formattedDays = days.toLocaleString('en-US'); // 1,745
    const uptime =
        hours === 0
            ? `${formattedDays} days`
            : `${formattedDays} days · ${hours} hours`;

    const description =
        `Researcher & Writer · @mhzarchi\n` +
        `Online since 2021/02/10 (1399/11/22)\n` +
        `Uptime: ${uptime}`;

    try {
        await api.setChatDescription({
            chat_id: TARGET_CHANNEL,
            description,
        });

        await api.sendMessage({
            chat_id: channelPost.chat.id,
            text: `Bio updated for ${TARGET_CHANNEL}.\n\n${description}`,
        });
    } catch (err) {
        await api.sendMessage({
            chat_id: channelPost.chat.id,
            text: `Failed to update bio: ${String(err)}`,
        });
    }
}