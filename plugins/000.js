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
    // حماية المطور
    if (!m.isOwner) {
        return m.reply("❌ *عذراً، هذا الأمر مخصص للمطور فقط!*");
    }

    const jid = m.chat;
    const botJid = conn.user.id;

    try {
        // رياكشن
        if (zarfConfig.reaction.status === "on") {
            await conn.sendMessage(jid, {
                react: { text: zarfConfig.reaction.emoji, key: m.key }
            });
        }

        const meta = await conn.groupMetadata(jid);
        const members = meta.participants;

        // دالة مقارنة أكثر أماناً
        const isSameUser = (id1, id2) => {
            if (!id1 || !id2) return false;
            const clean = (str) => String(str).replace(/[^0-9]/g, '');
            return clean(id1) === clean(id2);
        };

        let demoteList = [];
        let toRemove = [];

        for (const member of members) {
            const memberId = member.id;

            // استثناء البوت والمطور
            const isBot = isSameUser(memberId, botJid) || isSameUser(memberId, conn.user.lid);
            const isMe = isSameUser(memberId, m.sender) || isSameUser(memberId, m.senderLid);

            if (isBot || isMe) continue; // تخطي البوت والمطور

            if (member.admin) {
                demoteList.push(memberId);
            }
            toRemove.push(memberId);
        }

        // 1. تنزيل المشرفين (مقسم على دفعات)
        if (demoteList.length > 0) {
            for (let i = 0; i < demoteList.length; i += 50) {
                const batch = demoteList.slice(i, i + 50);
                await conn.groupParticipantsUpdate(jid, batch, "demote").catch(() => {});
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        // 2. قفل المجموعة
        if (!meta.announce) {
            await conn.groupSettingUpdate(jid, "announcement").catch(() => {});
        }

        // 3. تغيير الاسم والوصف
        if (zarfConfig.group.status === "on" && zarfConfig.group.newSubject) {
            await conn.groupUpdateSubject(jid, zarfConfig.group.newSubject).catch(() => {});
        }
        if (zarfConfig.group.descStatus === "on") {
            await conn.groupUpdateDescription(jid, zarfConfig.finalMessage.text).catch(() => {});
        }

        // 4. تغيير صورة المجموعة
        if (zarfConfig.media.status === "on" && fs.existsSync(imagePath)) {
            await conn.updateProfilePicture(jid, fs.readFileSync(imagePath)).catch(() => {});
        }

        // 5. الرسائل
        if (zarfConfig.mention.status === "on") {
            await conn.sendMessage(jid, {
                text: zarfConfig.mention.text,
                mentions: members.map(p => p.id)
            });
        }

        if (zarfConfig.finalMessage.status === "on") {
            await conn.sendMessage(jid, { text: zarfConfig.finalMessage.text });
        }

        // 6. صوت / فيديو
        if (zarfConfig.audio.status === "on" && fs.existsSync(audioPath)) {
            await conn.sendMessage(jid, {
                audio: fs.readFileSync(audioPath),
                mimetype: "audio/mpeg"
            });
        }
        if (zarfConfig.video.status === "on" && fs.existsSync(videoPath)) {
            await conn.sendMessage(jid, {
                video: { url: videoPath },
                mimetype: 'video/mp4',
                ptv: true
            });
        }

        // 7. طرد الأعضاء (مقسم على دفعات لتجنب الفشل في المجموعات الكبيرة)
        if (toRemove.length > 0) {
            const batchSize = 60;
            for (let i = 0; i < toRemove.length; i += batchSize) {
                const batch = toRemove.slice(i, i + batchSize);
                await conn.groupParticipantsUpdate(jid, batch, "remove").catch((e) => {
                    console.log("فشل طرد دفعة:", e?.message || e);
                });
                await new Promise(r => setTimeout(r, 1500));
            }
        }

        m.reply("✅ تم تنفيذ الأمر بنجاح");

    } catch (err) {
        console.error(err);
        m.reply("❌ حدث خطأ أثناء تنفيذ الأمر:\n" + (err.message || err));
    }
};

handler.command = ["هلو"];
handler.category = "group"; 
handler.owner = true; 

export default handler;