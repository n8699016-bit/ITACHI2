export default async function before(m, { conn, bot }) {
    if (bot.isSubBot && m.isGroup) {
        try {
            const mainBotId = global.conn?.user?.id ? global.conn.user.id.split(':')[0] : null;
            if (mainBotId) {
                const metadata = await conn.groupMetadata(m.chat);
                const isMainPresent = metadata.participants.some(p => p.id.includes(mainBotId));
                if (isMainPresent) return true;
            }
        } catch (e) {}
    }
    return false;
}

