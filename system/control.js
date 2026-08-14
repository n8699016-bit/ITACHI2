import fs from "fs";
import path from "path";

const group = async (ctx, event, eventType) => {
    try {
        if (!event?.participants) return null;

        const participants = event.participants.filter(p => p?.phoneNumber).map(p => p.phoneNumber);
        const author = event.author;
        let txt;

        const users = participants.length 
            ? participants.map(p => '@' + p.split('@')[0]).join(' and ') 
            : 'No users';
        const authorTag = author ? '@' + author.split('@')[0] : 'Unknown';

        const messages = {
            add: `♡゙ مـنـور/ه ${users}${authorTag === users ? "" : `\n𝐛𝐲 ${authorTag}`}`,
            remove: `${users} تم إزالته من الجروب${authorTag === users ? "" : `\n𝐛𝐲 ${authorTag}`}`,
            promote: `♡゙ مـبـروك الادمـن ${users}\nby ${authorTag}`,
            demote: `♡゙ بـقـيـت عـضـو خـلاص ${users}\nby ${authorTag}`
        };

        txt = messages[eventType];
        if (!txt) return null;
        
        if (global.db.groups[event.chat].noWelcome === true) return 9999;

        const img = ["remove", "add"].includes(eventType) 
            ? (event.userUrl || "https://files.catbox.moe/hm9iq4.jpg") 
            : "https://files.catbox.moe/hm9iq4.jpg";

        await ctx.sock.msgUrl(event.chat, txt, {
            img,
            title: ctx.config?.info.nameBot || "WhatsApp Bot",
            body: "𝐴 𝑠𝑖𝑚𝑝𝑙𝑒 𝑊𝒉𝑎𝑡𝑠𝐴𝑝𝑝 𝑏𝑜𝑡 𝑓𝑜𝑟 𝑏𝑒𝑔𝑖𝑛𝑛𝑒𝑟𝑠, 𝑏𝑦 𝑉𝐸𝑁𝑂𝑀",
            mentions: author ? [author, ...participants] : participants,
            newsletter: {
                name: '𝕭𝖑𝖆𝖈𝖐 𝕾𝖍𝖆𝖉𝖔𝖜𝖘🕷️',
                jid: '0029Vb82elIJkK7GCns06J00@newsletter'
            },
            big: ["remove", "add"].includes(eventType)
        });

    } catch (e) {
        console.error(e);
    }
    return null;
};

const access = async (msg, checkType, time) => {
    const conn = await msg.client();
    
    const quoted = {
        key: {
            participant: `${msg.sender.split('@')[0]}@s.whatsapp.net`,
            remoteJid: 'status@broadcast',
            fromMe: false,
        },
        message: {
            contactMessage: {
                displayName: `${msg.pushName}`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${msg.pushName}\nitem1.TEL;waid=${msg.sender.split('@')[0]}:${msg.sender.split('@')[0]}\nEND:VCARD`,
            },
        },
        participant: '0@s.whatsapp.net',
    };
    
    const messages = {
        cooldown: `*♡⏳ استنى ${time || 'بعض كام ثانيه'} ثانية وكمل الأمر ⏳♡*\n⊱⋅ ──────────── ⋅⊰\n> *_لازم تصبر شويه عشان الأمر ده مينفعش فيه الاسبام_*`,
        owner: `*♡ 🇩🇪 الأمر ده لـ المطورين فقط 🇩🇪♡*\n⊱⋅ ──────────── ⋅⊰\n> *_الامر ده لـ المطورين البوت لازم تكون مطور عشان تقدر تستخدمه_`,
        group: `*♡💠 الأمر ده بيشتغل بس ف الجروبات 💠♡*\n⊱⋅ ──────────── ⋅⊰\n> *_لازم الأمر ده تستخدمه ف جروب فقط ممنوع غير كده_*`,
        admin: `*♡📯 الأمر ده لـ الادمن فقط 📯♡*\n⊱⋅ ──────────── ⋅⊰\n> *_انت مجرد عضو لازم تبقي ادمن يا عضو يا عبد_*`,
        private: `*♡🏷️ الأمر ده في الخاص فقط 🏷️♡*\n⊱⋅ ──────────── ⋅⊰\n> *_الامر ف الخاص بس ياحبيبي_*`,
        botAdmin: `*♡📌 لازم اكون ادمن عشان انقذ الأمر 📌♡*\n⊱⋅ ──────────── ⋅⊰\n> *_حطني ادمن عشان تقدر تستعمل الأمر ده_*`,
        noSub: `*♡🫒 الأمر ده ف البوت الأساسي فقط 🫒♡*\n⊱⋅ ──────────── ⋅⊰\n> *_ادخل الجروب ده و جرب الأمر [ https://chat.whatsapp.com/Epfd9J7t8tR6nnpIDjtGQZ?mode=gi_t ] ياريت من غير سبام_*`,
        disabled: `*♡🗃️ الامر متوقف (تحت صيانة) 🗃️♡*\n⊱⋅ ──────────── ⋅⊰\n> *_الامر تحت صيانه قريباً بيشتغل تاني_*`,
        error: `*♡❌ الأمر فيه خطأ، كلم المطورين ❌♡*\n⊱⋅ ──────────── ⋅⊰\n*_اكتب " .المطور " عشان يبعتلك رقم المطور_*`
    };
    
    if (conn && messages[checkType]) {
        await conn.msgUrl(msg.chat, messages[checkType], {
            img: "https://i.pinimg.com/originals/02/c3/51/02c351dfd4eb72a62f225ce964dc510d.jpg",
            title: "𝐀𝐥𝐞𝐫𝐭𝐬 | 𝐖𝐚𝐫𝐧𝐢𝐧𝐠𝐬",
            body: "𝐵𝑜𝑡 𝑎𝑙𝑒𝑟𝑡𝑠: 𝑅𝑒𝑎𝑑 𝑡𝒉𝑒 𝑚𝑒𝑠𝑠𝑎𝑔𝑒 𝑡𝑜 𝑙𝑒𝑎𝑟𝑛 𝑚𝑜𝑟𝑒",
            newsletter: {
                name: '𝕭𝖑𝖆𝖈𝖐 𝕾𝖍𝖆𝖉𝖔𝖜𝖘🕷️',
                jid: '0029Vb82elIJkK7GCns06J00@newsletter'
            },
            big: false
        }, quoted);
        return false;  
    }
    return null;  
};

export { access, group };
