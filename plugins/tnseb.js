let handler = async (m, { conn, text, args }) => {
    try {
        const targetUser = m.sender;
        
        if (global.db && global.db.data) {
            const dbData = global.db.data;
            
            if (dbData.subBots && dbData.subBots[targetUser]) {
                delete dbData.subBots[targetUser];
                return m.reply("✅ *تمت إزالة بوتك الفرعي وإلغاء التنصيب بنجاح.*");
            } else {
                return m.reply("⚠️ *ليس لديك أي بوت فرعي منصب حالياً.*");
            }
        } else {
            return m.reply("❌ *قاعدة البيانات غير متوفرة حالياً.*");
        }

    } catch (err) {
        console.error(err);
        m.reply(`❌ حدث خطأ أثناء إزالة البوت: ${err.message}`);
    }
};

handler.command = ["ازالة_البوت", "الغاء_التنصيب", "unsub"];
handler.category = "tools";

export default handler;
