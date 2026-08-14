import fs from 'fs';
import path from 'path';

const wordsFilePath = path.resolve('plugins/group/badwords.json');
const statusFilePath = path.resolve('plugins/group/antibadword_status.json');

function getBadWords() {
  try {
    if (fs.existsSync(wordsFilePath)) {
      return JSON.parse(fs.readFileSync(wordsFilePath, 'utf8'));
    }
  } catch (e) {}
  return ["شتيمة1", "شتيمة2"];
}

function saveBadWords(words) {
  try {
    fs.writeFileSync(wordsFilePath, JSON.stringify(words, null, 2));
  } catch (e) {}
}

// حالة التشغيل لكل مجموعة (مفعل أو متوقف)
function getStatus(chatId) {
  try {
    if (fs.existsSync(statusFilePath)) {
      let data = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
      return data[chatId] ?? true; // افتراضياً يعمل
    }
  } catch (e) {}
  return true;
}

function setStatus(chatId, status) {
  try {
    let data = {};
    if (fs.existsSync(statusFilePath)) {
      data = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
    }
    data[chatId] = status;
    fs.writeFileSync(statusFilePath, JSON.stringify(data, null, 2));
  } catch (e) {}
}

let handler = async (m, { conn, text, command, isAdmin, isBotAdmin }) => {
  let badWords = getBadWords();
  let chatId = m.chat;

  // 1. إيقاف أو تشغيل نظام الحظر في المجموعة
  if (["منع_الشتم", "ايقاف_منع_الشتم"].includes(command)) {
    if (!isAdmin) return m.reply("⚠️ هذا الأمر للمشرفين فقط!");
    
    if (command === "منع_الشتم") {
      setStatus(chatId, true);
      return m.reply("✅ تم *تفعيل* نظام منع الشتائم والحذف التلقائي في هذه المجموعة.");
    } else {
      setStatus(chatId, false);
      return m.reply("❌ تم *إيقاف* نظام منع الشتائم في هذه المجموعة.");
    }
  }

  // 2. إضافة كلمات جديدة
  if (["حظر_كلمات", "addbadwords"].includes(command)) {
    if (!isAdmin) return m.reply("⚠️ هذا الأمر للمشرفين فقط!");
    if (!text) return m.reply("⚠️ يرجى كتابة الكلمات المراد حظرها.\nمثال: `.حظر_كلمات كلمة1 كلمة2`");
    
    let newWords = text.split(/[\s,]+/).map(w => w.trim().toLowerCase()).filter(Boolean);
    let added = 0;
    for (let w of newWords) {
      if (!badWords.includes(w)) {
        badWords.push(w);
        added++;
      }
    }
    saveBadWords(badWords);
    return m.reply(`✅ تمت إضافة ${added} كلمة بنجاح إلى قائمة الحظر.`);
  }

  // 3. حذف كلمة من الحظر
  if (["إلغاء_حظر_كلمة", "delbadword"].includes(command)) {
    if (!isAdmin) return m.reply("⚠️ هذا الأمر للمشرفين فقط!");
    if (!text) return m.reply("⚠️ يرجى كتابة الكلمة المراد إزالتها.\nمثال: `.إلغاء_حظر_كلمة كلمة`");

    let wordToRemove = text.trim().toLowerCase();
    let index = badWords.indexOf(wordToRemove);
    
    if (index === -1) {
      return m.reply(`⚠️ الكلمة ("${wordToRemove}") غير موجودة أساساً في قائمة المحظورات!`);
    }

    badWords.splice(index, 1);
    saveBadWords(badWords);
    return m.reply(`✅ تم بنجاح إزالة ("${wordToRemove}") من قائمة الكلمات الممنوعة.`);
  }

  // 4. عرض القائمة
  if (["قائمة_المحظورات", "badwordslist"].includes(command)) {
    if (!isAdmin) return m.reply("⚠️ هذا الأمر للمشرفين فقط!");
    return m.reply(`📋 *قائمة الكلمات الممنوعة (${badWords.length}):*\n\n` + badWords.map(w => `• ${w}`).join('\n'));
  }

  // 5. مراقبة الرسائل وحذف الشتائم (إذا كان النظام مفعلاً في هذه المجموعة)
  if (!m.text || m.fromMe || isAdmin) return;
  if (!getStatus(chatId)) return; // إذا كان متوقفاً، يتجاهل الرسائل
  
  let messageText = m.text.toLowerCase();
  let hasBadWord = badWords.some(word => messageText.includes(word));

  if (hasBadWord) {
    try {
      if (!isBotAdmin) return;
      await conn.sendMessage(m.chat, { delete: m.key });
      await conn.sendMessage(m.chat, { 
        text: `⚠️ @${m.sender.split('@')[0]} ممنوع استخدام هذه الألفاظ هنا! تم حذف رسالتك.`,
        mentions: [m.sender]
      });
    } catch (err) {}
  }
};

handler.help = ["منع_الشتم", "ايقاف_منع_الشتم", "حظر_كلمات", "إلغاء_حظر_كلمة", "قائمة_المحظورات"];
handler.tags = ["group"];
handler.command = ["منع_الشتم", "ايقاف_منع_الشتم", "حظر_كلمات", "addbadwords", "إلغاء_حظر_كلمة", "delbadword", "قائمة_المحظورات", "badwordslist"];
export default handler;

