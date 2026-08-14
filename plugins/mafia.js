// ملف: mafia.js
const games = {}; // أوبجكت لحفظ حالة الألعاب في كل مجموعة

let handler = async (m, { conn, args, command, usedPrefix }) => {
    // تحديد الأمر الفرعي (بدء، انضمام، انطلاق، انهاء)
    let text = args[0] ? args[0].toLowerCase() : '';
    let chatId = m.chat;

    if (text === 'بدء' || text === 'start') {
        if (games[chatId]) return m.reply('⚠️ في لعبة مافيا شغالة حالياً في المجموعة!');
        
        games[chatId] = {
            state: 'LOBBY', // حالة اللعبة: في الانتظار
            players: [],
            host: m.sender // صاحب اللعبة
        };
        return m.reply('🕵️‍♂️ *تم فتح غرفة للعبة المافيا*\n\n- للانضمام اكتب: *.مافيا انضمام*\n- لبدء اللعبة (من قبل المضيف) اكتب: *.مافيا انطلاق*');
    }

    if (text === 'انضمام' || text === 'join') {
        if (!games[chatId]) return m.reply('⚠️ مافي لعبة شغالة حالياً. افتح لعبة بـ *.مافيا بدء*');
        if (games[chatId].state !== 'LOBBY') return m.reply('⚠️ اللعبة بدأت بالفعل، ما بتقدر تنضم الآن!');
        if (games[chatId].players.includes(m.sender)) return m.reply('✅ أنت منضم للعبة بالفعل!');

        games[chatId].players.push(m.sender);
        return m.reply(`👤 تم انضمامك! (العدد الحالي: ${games[chatId].players.length} لاعبين)`);
    }

    if (text === 'انطلاق' || text === 'play') {
        if (!games[chatId]) return m.reply('⚠️ مافي لعبة شغالة حالياً.');
        if (games[chatId].host !== m.sender) return m.reply('⚠️ صاحب اللعبة فقط هو من يستطيع بدءها.');
        if (games[chatId].players.length < 4) return m.reply('⚠️ الحد الأدنى لبدء المافيا هو 4 لاعبين!');

        games[chatId].state = 'PLAYING';
        let players = [...games[chatId].players];
        
        // خلط اللاعبين عشوائياً
        players.sort(() => Math.random() - 0.5);

        // توزيع الأدوار الأساسية (يمكنك تعديل النسب حسب العدد)
        let roles = {};
        roles[players[0]] = 'مافيا 🦹‍♂️';
        roles[players[1]] = 'طبيب 👨‍⚕️';
        roles[players[2]] = 'محقق 🕵️‍♂️';
        
        // الباقي قرويين
        for (let i = 3; i < players.length; i++) {
            roles[players[i]] = 'قروي 👨‍🌾';
        }

        games[chatId].roles = roles;

        m.reply('🚀 *تم بدء اللعبة!*\n\nسيتم إرسال الأدوار لكل لاعب في الخاص 📩.\n(الرجاء من اللاعبين التأكد من مراسلة البوت خاص مسبقاً لتفادي الحظر).\n\n🌙 اللعبة الآن في مرحلة [الليل]...');

        // إرسال الأدوار في الخاص لكل لاعب
        for (let player of players) {
            let roleMsg = `🎭 دورك في لعبة المافيا في مجموعة المضيف هو:\n\n*${roles[player]}*\n\nاستعد للمرحلة القادمة!`;
            // استخدام try-catch لتفادي توقف البوت إذا كان شخص قافل الخاص
            try {
                await conn.sendMessage(player, { text: roleMsg });
            } catch (e) {
                console.log(`فشل إرسال الدور للاعب ${player}`);
            }
        }
        
        return;
    }

    if (text === 'انهاء' || text === 'end') {
         if (!games[chatId]) return m.reply('⚠️ مافي لعبة لإنهائها.');
         delete games[chatId];
         return m.reply('🛑 تم إنهاء اللعبة الحالية وحذف الغرفة.');
    }

    // إذا لم يكتب أمر فرعي صحيح
    m.reply(`*أوامر لعبة المافيا 🕵️‍♂️:*\n\n- ${usedPrefix || '.'}مافيا بدء\n- ${usedPrefix || '.'}مافيا انضمام\n- ${usedPrefix || '.'}مافيا انطلاق\n- ${usedPrefix || '.'}مافيا انهاء`);
};

handler.usage = ["مافيا <الأمر>"];
handler.command = ["مافيا", "mafia"];
handler.category = "games";

export default handler;

