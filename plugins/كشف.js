const handler = async (m, { conn }) => {
    // 1. التأكد من وجود رد على رسالة تحتوي على ميديا
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!m.quoted) return m.reply(`*❍━━━══━━❪🕸❫━━══━━━❍*
*🔱 ❯ من فضلك قم بالرد على رسالة* 〘 \`\`\`one view\`\`\` 〙، *التي تريد فتحها*
*❍━━━══━━❪🕸❫━━══━━━❍*`);
    
    // التحقق إذا كانت الرسالة المقتبسة تحتوي فعلاً على ميديا (صورة، فيديو، صوت، الخ)
    if (!/image|video|audio|sticker|document/.test(mime)) {
        return m.reply('*🚫 | هذه الرسالة لا تحتوي على وسائط (صورة أو فيديو أو صوت) لإعادة إرسالها!*');
    }

    try {
        // 2. تحميل الوسائط من الرسالة المقتبسة
        const media = await m.quoted.download();
        
        // 3. تحديد نوع الميديا لإعادة إرسالها بشكل صحيح
        let type = m.quoted.mtype;
        let messageContent = {};

        if (/image/.test(mime)) {
            messageContent = { image: media, caption: m.quoted.text || `*❍━━━══━━❪🕸❫━━══━━━❍*
> 🕸𝕴𝕿𝕬𝕮𝕳𝕴_𝕭𝖔𝖙🕸` };
        } else if (/video/.test(mime)) {
            messageContent = { video: media, caption: m.quoted.text || `*❍━━━══━━❪🕸❫━━══━━━❍*
> 🕸𝕴𝕿𝕬𝕮𝕳𝕴_𝕭𝖔𝖙🕸` };
        } else if (/audio/.test(mime)) {
            messageContent = { audio: media, mimetype: 'audio/mpeg', ptt: m.quoted.ptt };
        } else if (/sticker/.test(mime)) {
            messageContent = { sticker: media };
        } else {
            messageContent = { document: media, mimetype: mime, fileName: m.quoted.fileName || 'file' };
        }

        // 4. إرسال الوسائط
        await conn.sendMessage(m.chat, messageContent, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply('*❌ | فشل في تحميل أو إرسال الوسائط. تأكد أن البوت يراها بشكل صحيح.*');
    }
};

handler.command = ['vip', 'كشف'];
handler.usage = ["افتحها"];
handler.category = "tools";
export default handler;
