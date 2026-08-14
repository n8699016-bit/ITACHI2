// plugins/translate.js

import axios from "axios";

const API = "https://api.mymemory.translated.net/get";

const handler = async (m, { conn, text, usedPrefix }) => {
    if (!text?.trim()) {
        return m.reply(
            `╭━━━〔 🌍 *الترجمة* 〕━━━╮\n` +
            `┃\n` +
            `┃ ✍️ *اكتب النص اللي عايز تترجمه*\n` +
            `┃\n` +
            `┃ 💡 *أمثلة:*\n` +
            `┃ ❯ ${usedPrefix}ترجم hello world\n` +
            `┃ ❯ ${usedPrefix}ترجم en-ar Hello my friend\n` +
            `┃ ❯ ${usedPrefix}translate ar-en أهلاً يا صاحبي\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );
    }

    let query = text.trim();
    let from = "auto";
    let to = "ar";

    /*
     * الصيغة:
     * .ترجم en-ar Hello world
     * .ترجم ar-en أهلاً بالعالم
     */

    const langMatch = query.match(
        /^([a-z]{2})[-:]([a-z]{2})\s+(.+)$/i
    );

    if (langMatch) {
        from = langMatch[1].toLowerCase();
        to = langMatch[2].toLowerCase();
        query = langMatch[3].trim();
    }

    if (!query) {
        return m.reply(
            `❌ اكتب النص اللي عايز تترجمه.`
        );
    }

    await m.react("🌍");

    try {
        const response = await axios.get(API, {
            params: {
                q: query,
                langpair: `${from}|${to}`
            },
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            },
            validateStatus: () => true
        });

        if (response.status !== 200) {
            throw new Error(
                `خطأ في خدمة الترجمة: ${response.status}`
            );
        }

        const data = response.data;

        if (
            !data ||
            data.responseStatus !== 200 ||
            !data.responseData?.translatedText
        ) {
            throw new Error(
                data?.responseDetails ||
                "خدمة الترجمة لم ترجع نتيجة."
            );
        }

        const translated = data.responseData.translatedText;

        await m.reply(
            `╭━━━〔 🌍 *الترجمة* 〕━━━╮\n` +
            `┃\n` +
            `┃ 📝 *النص:*\n` +
            `┃ ${query}\n` +
            `┃\n` +
            `┃ 🔤 *من:* ${from.toUpperCase()}\n` +
            `┃ 🎯 *إلى:* ${to.toUpperCase()}\n` +
            `┃\n` +
            `┃ 💬 *الترجمة:*\n` +
            `┃ ${translated}\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━━━╯`
        );

        await m.react("✅");

    } catch (error) {
        console.error(
            "❌ Translate ERROR:",
            error?.response?.data || error
        );

        await m.react("❌");

        let message =
            error?.message ||
            "حصل خطأ أثناء الترجمة.";

        if (
            error?.code === "ECONNABORTED" ||
            error?.message?.includes("timeout")
        ) {
            message =
                "خدمة الترجمة اتأخرت في الرد، حاول تاني بعد شوية.";
        }

        await m.reply(
            `╭━━━〔 ❌ *خطأ في الترجمة* 〕━━━╮\n` +
            `┃\n` +
            `┃ ⚠️ ${message}\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};

handler.help = [
    "ترجم <النص>",
    "ترجم <من-إلى> <النص>",
    "translate <النص>"
];

handler.tags = [
    "tools"
];

handler.category = "tools";

handler.command =
    /^(ترجم|ترجمة|translate)$/i;

export default handler;