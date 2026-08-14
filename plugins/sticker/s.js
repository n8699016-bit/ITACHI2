import { createSticker } from "../../system/utils.js";

const handler = async (m, { conn, bot }) => {
  if (!m.quoted) {
    return m.reply("❤️ ~ يرجى الرد على صورة أو فيديو لتحويله إلى ملصق ~ 💙");
  }

  m.react('⏳');

  try {
    const buffer = await m.quoted.download();
    const mime = m.quoted.mimetype || m.quoted.mediaType || '';

    if (!buffer) {
      m.react('❌');
      return m.reply("❌ لم يتم تحميل الوسائط، تأكد من الرد على صورة أو فيديو صحيح.");
    }

    const { pack, author } = bot?.config?.info?.copyright || { pack: "POMNI-AI", author: "ITACHI" };

    // إنشاء الملصق باستخدام دالة النظام مع تمرير البفر ونوع الميديا
    const stickerBuffer = await createSticker(buffer, { mime, pack, author });

    await conn.sendMessage(m.chat, { 
      sticker: stickerBuffer 
    }, { quoted: m });

    m.react('✅');
  } catch (e) {
    console.error("Sticker Error:", e);
    m.react('❌');
    m.reply(`❌ حدث خطأ: ${e.message}`);
  }
};

handler.usage = ["ملصق"];
handler.category = "sticker";
handler.command = ["ملصق", "s"];

export default handler;

