
import { api } from 'sdk';

async function sendMessage(chatId, text) {
    return api.sendMessage({
        chat_id: chatId,
        text
    });
}

async function handleMessage(message) {
    const chatId = message.chat.id;
    const html = message.text;

    if (!html) {
        await sendMessage(
            chatId,
            'Please send your HTML code as a text message.'
        );
        return;
    }

    if (html.length > 50000) {
        await sendMessage(
            chatId,
            'HTML content is too large. Please send a smaller document.'
        );
        return;
    }

    // Widget creation will be implemented here.
    await sendMessage(
        chatId,
        'HTML received successfully.'
    );
}

export default async function handler(message) {
    try {
        await handleMessage(message);
    } catch (error) {
        console.error('Handler error:', error);

        await sendMessage(
            message.chat.id,
            'An error occurred while processing your HTML.'
        );
    }
}
