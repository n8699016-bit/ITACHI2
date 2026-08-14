let handler = async (m, { conn }) => {
    // التحقق مما إذا كانت الرسالة ردًّا على رسالة أخرى
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    // التحقق من أن الملف المردود عليه هو فيديو
    if (!mime) return m.reply('❌ يرجى الرد على مقطع فيديو تحب تحويله لدائري!');
    if (!/video/.test(mime)) return m.reply('❌ هذا ليس فيديو، يرجى الرد على فيديو فقط.');

    try {
        await m.reply('⏳ جاري المعالجة والتحويل إلى فيديو دائري...');
        
        // تحميل الفيديو من الرسالة المردود عليها
        let media = await q.download();
        
        if (!media) return m.reply('❌ فشل تحميل الفيديو من الرسالة، حاول مرة أخرى.');

        // إرسال الفيديو كرسالة دائرية
        await conn.sendMessage(m.chat, { 
            video: media, 
            ptv: true // الخاصية المسؤولة عن تحويله إلى فيديو نوت
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        m.reply(`❌ حدث خطأ أثناء المعالجة: ${error.message}`);
    }
};

handler.command = ['دائري', 'فيديو_نوت'];
handler.category = 'tools';

export default handler;