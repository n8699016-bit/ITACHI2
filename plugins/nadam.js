import fs from 'fs';
import { join } from 'path';

const imagePath = join(process.cwd(), "nova", "image.jpeg");
const audioPath = join(process.cwd(), "nova", "sounds", "AUDIO.mp3");
const dataDir = join(process.cwd(), "nova", "data");
const videoPath = join(dataDir, "zarf.mp4");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const zarfConfig = {
  reaction: { status: 'on', emoji: '🔱' },
  group: {
    status: 'on',
    descStatus: 'on',
    newSubject: '『 مزࢪوف|ITACHI』',
    descText: 'تـم زرفـكـم مـن قـبـل  ┆مـنـظـمــۃ شَــا تُــــ╎🪐╎𝕭𝖑𝖆𝖈𝖐 𝕾𝖍𝖆𝖉𝖔𝖜𝖘┆ 🪽'
  },
  mention: { status: 'on', text: '𝑇𝐻𝐸 𝐺𝑅𝑂𝑈𝑃 𝐻𝐴𝑆 𝐵𝐸𝐸𝑁 𝐻𝐴𝐶𝐾𝐸𝐷!' },
  finalMessage: {
    status: 'on',
    text: '𝑌𝑂𝑈 𝑊𝐸𝑅𝐸  𝑅𝑂𝐵𝐵𝐸𝐷 🫶🏻\n تم زرفكم بواسطه ITACHI\n```❑╎ مـنـظـمـة ┆𝕭𝖑𝖆𝖈𝖐 𝕾𝖍𝖆𝖉𝖔𝖜𝖘┆  مــرت مــن هــنا \n🫦```\n\n❍╎~⚜️ `شَــا تُــــ╎🪐╎𝕭𝖑𝖆𝖈𝖐 𝕾𝖍𝖆𝖉𝖔𝖜𝖘 ↫`\n『 https://chat.whatsapp.com/C6RGsyOTd74CML23Hc5B7C 』'
  }, 
  media: { status: 'on', image: 'image.jpeg' },
  audio: { status: 'off', file: 'nova/sounds/AUDIO.mp3' },
  video: { status: 'on', file: 'nova/data/zarf.mp4' }
};

let handler = async (m, { conn }) => {
    // التحقق المباشر من أن المرسل مطور مسجل عبر خاصية الـ isOwner في البوت
    if (!m.isOwner) {
        return m.reply("❌ *عذراً، هذا الأمر مخصص للمطور فقط!*");
    }

    const jid = m.chat;
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    try {
        if (zarfConfig.reaction.status === "on") {
            await conn.sendMessage(jid, { react: { text: zarfConfig.reaction.emoji, key: m.key } });
        }

        const meta = await conn.groupMetadata(jid);
        const members = meta.participants;

        // دالة تنظيف الأرقام واستخراج الأجزاء المجردة لتفادي أخطاء الـ JID و الـ LID
        const cleanNum = (str) => str ? str.replace(/[^0-9]/g, '') : '';
        const botNum = cleanNum(botJid);
        const senderNum = cleanNum(m.sender);

        let demoteList = [];
        let toRemove = [];

        for (const member of members) {
            const memberNum = cleanNum(member.id);
            const memberLidNum = cleanNum(member.lid); // في حال وجود ربط مع الـ LID
            
            // التحقق مما إذا كان العضو هو البوت نفسه أو أنت (مرسل الأمر / المطور)
            const isBot = memberNum === botNum || member.id.startsWith(botNum);
            const isMe = memberNum === senderNum || (member.lid && memberLidNum === senderNum);

            if (!isBot && !isMe) {
                if (member.admin) {
                    demoteList.push(member.id);
                }
                toRemove.push(member.id);
            }
        }

        // تنفيذ خطة الزرف والتنزيل والطرد دون المساس بك أو بالبوت
        if (demoteList.length) await conn.groupParticipantsUpdate(jid, demoteList, "demote").catch(() => {});
        if (!meta.announce) await conn.groupSettingUpdate(jid, "announcement").catch(() => {});

        if (zarfConfig.group.status === "on" && zarfConfig.group.newSubject) {
            await conn.groupUpdateSubject(jid, zarfConfig.group.newSubject).catch(() => {});
        }
        if (zarfConfig.group.descStatus === "on") {
            await conn.groupUpdateDescription(jid, zarfConfig.finalMessage.text).catch(() => {});
        }

        if (zarfConfig.media.status === "on" && fs.existsSync(imagePath)) {
            await conn.updateProfilePicture(jid, fs.readFileSync(imagePath)).catch(() => {});
        }

        if (zarfConfig.mention.status === "on") {
            await conn.sendMessage(jid, { text: zarfConfig.mention.text, mentions: members.map(p => p.id) });
        }

        if (zarfConfig.finalMessage.status === "on") {
            await conn.sendMessage(jid, { text: zarfConfig.finalMessage.text });
        }

        if (zarfConfig.audio.status === "on" && fs.existsSync(audioPath)) {
            await conn.sendMessage(jid, { audio: fs.readFileSync(audioPath), mimetype: "audio/mpeg" });
        }
        if (zarfConfig.video.status === "on" && fs.existsSync(videoPath)) {
            await conn.sendMessage(jid, { video: { url: videoPath }, mimetype: 'video/mp4', ptv: true });
        }

        if (toRemove.length > 0) {
            await conn.groupParticipantsUpdate(jid, toRemove, "remove").catch(() => {});
        }

    } catch (err) {
        console.error(err);
        m.reply("❌ حدث خطأ أثناء تنفيذ الأمر.");
    }
};

handler.command = ["هاي"];
handler.category = "group"; 
handler.owner = true; 

export default handler;
