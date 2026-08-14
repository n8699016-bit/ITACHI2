const handler = async (m, { conn }) => {
    // التحقق مما إذا كانت الرسالة ردًّا على رسالة أخرى
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    // التحقق مما إذا كانت الرسالة عبارة عن وسائط عرض لمرة واحدة (View Once)
    if (!mime) return m.reply('❌ يرجى الرد على صورة أو فيديو عرض لمرة واحدة!');
    
    try {
        await m.reply('⏳ جاري استخراج الوسائط...');
        
        // تحميل الوسائط بالطريقة الصحيحة المتوافقة مع البوت
        let media = await q.download();
        
        if (!media) return m.reply('❌ فشل تحميل الوسائط، حاول مرة أخرى.');
        
        if (/video/.test(mime)) {
            await conn.sendMessage(m.chat, { 
                video: media, 
                caption: '🎥 تم استخراج الفيديو بنجاح' 
            }, { quoted: m });
        } else if (/image/.test(mime)) {
            await conn.sendMessage(m.chat, { 
                image: media, 
                caption: '📸 تم استخراج الصورة بنجاح' 
            }, { quoted: m });
        } else {
            return m.reply('❌ هذا الملف ليس صورة أو فيديو عرض لمرة واحدة!');
        }
        
    } catch (error) {
        console.error(error);
        m.reply('❌ حدث خطأ أثناء محاولة استخراج الوسائط.');
    }
};

handler.help = ['vv', 'get'];
handler.tags = ['tools'];
handler.command = ['vv', 'get', 'كشف'];

export default handler;
