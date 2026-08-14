if (!global.deathNote) global.deathNote = {};

let handler = async (m, { conn, args, command, usedPrefix }) => {
    let chatId = m.chat;
    let sender = m.sender;
    let game = global.deathNote[chatId];
    let action = command.toLowerCase();
    let subAction = args[0] ? args[0].toLowerCase() : '';

    // التحقق مما إذا كان المستخدم استخدم أمراً فرعياً مثل (.ديث_نوت انضمام)
    if (action === 'ديث_نوت' || action === 'ديثنوت') {
        if (subAction === 'انضمام') action = 'انضمام';
        else if (subAction === 'بدء' || subAction === 'انطلاق') action = 'بدء_الفعالية';
        else if (subAction === 'نقطة') action = 'نقطة';
        else if (subAction === 'طرد') action = 'طرد';
        else if (subAction === 'انهاء' || subAction === 'إلغاء') action = 'انهاء_الفعالية';
    }

    // 1. فتح الفعالية
    if (action === 'ديث_نوت' || action === 'ديثنوت') {
        if (game) return m.reply('⚠️ هناك فعالية ديث نوت قائمة بالفعل في هذه المجموعة!');

        global.deathNote[chatId] = {
            status: 'LOBBY',
            host: sender,
            players: [],
            eliminated: [],
            canKick: null
        };

        let caption = `*❃━═━═✦•〘•🪦•〙•✦═━═━❃*\n` +
                      `*※فــ←ــعـاليـ←ـة ديــــ📓ـــث نوت※*\n` +
                      `*❴✾❵──━━━━❨🪦❩━━━━──❴✾❵*\n\n` +
                      `*🤹🏻‍♂️ المـقـدم:* @${sender.split('@')[0]}\n\n` +
                      `*📝 للانضمام اكتب:* *.انضمام*\n` +
                      `*🚀 للبدء (من المقدم) اكتب:* *.بدء_الفعالية*`;

        return conn.sendMessage(chatId, { text: caption, mentions: [sender] }, { quoted: m });
    }

    // 2. الانضمام للفعالية
    if (action === 'انضمام') {
        if (!game) return m.reply('⚠️ لا توجد فعالية ديث نوت قائمة حالياً.');
        if (game.status !== 'LOBBY') return m.reply('⚠️ لقد بدأت الفعالية بالفعل، لا يمكنك الانضمام الآن!');
        if (game.host === sender) return m.reply('⚠️ أنت مقدم الفعالية! لا يمكنك اللعب.');
        if (game.players.includes(sender)) return m.reply('✅ أنت منضم للفعالية بالفعل!');

        game.players.push(sender);
        return m.reply(`📓 *تم تسليمك الديث نوت!*\nعدد اللاعبين المنضمين حتى الآن: ${game.players.length}`);
    }

    // 3. بدء الفعالية
    if (action === 'بدء_الفعالية') {
        if (!game) return m.reply('⚠️ لا توجد فعالية قائمة.');
        if (game.host !== sender) return m.reply('⚠️ مقدم الفعالية فقط هو من يمكنه بدؤها!');
        if (game.players.length < 3) return m.reply('⚠️ يجب أن يكون هناك 3 لاعبين على الأقل لبدء الفعالية!');

        game.status = 'PLAYING';
        return m.reply(`*🎮 تم بدء فعالية ديث نوت!*\nعدد اللاعبين: ${game.players.length}\n\n*أيها المقدم، اطرح سؤالك الآن! أول من يجيب صح قم بإعطائه نقطة بـ:*\n*.نقطة @منشن*`);
    }

    // 4. إعطاء نقطة
    if (action === 'نقطة') {
        if (!game || game.status !== 'PLAYING') return m.reply('⚠️ لا توجد فعالية قيد اللعب حالياً.');
        if (game.host !== sender) return m.reply('⚠️ المقدم فقط هو من يحدد صاحب النقطة!');

        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
        if (!target || !game.players.includes(target)) {
            return m.reply('⚠️ يرجى منشنة لاعب موجود داخل الفعالية لإعطائه النقطة.');
        }

        game.canKick = target;
        return conn.sendMessage(chatId, {
            text: `🎉 *إجابة صحيحة يا @${target.split('@')[0]}!*\n\n*يحق لك الآن طرد أحد اللاعبين عبر الأمر:*\n*.طرد @منشن*`,
            mentions: [target]
        }, { quoted: m });
    }

    // 5. طرد لاعب
    if (action === 'طرد') {
        if (!game || game.status !== 'PLAYING') return m.reply('⚠️ لا توجد فعالية قيد اللعب.');
        if (game.canKick !== sender) return m.reply('⚠️ ليس لديك صلاحية الطرد! يجب أن تجيب على السؤال أولاً وتحصل على النقطة.');

        let victim = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
        if (!victim) return m.reply('⚠️ يرجى منشنة الشخص الذي تريد كتابة اسمه في الديث نوت لطردة!');
        if (!game.players.includes(victim)) return m.reply('⚠️ هذا الشخص ليس موجوداً ضمن اللاعبين النشطين.');
        if (victim === sender) return m.reply('⚠️ لا يمكنك طرد نفسك!');

        // استبعاد اللاعب
        game.players = game.players.filter(p => p !== victim);
        game.eliminated.unshift(victim); // إضافته في أول القائمة لتحديد المراكز الأخيرة
        game.canKick = null; // إعادة تصفير الصلاحية

        // إذا بقي لاعب واحد تنتهي الفعالية وتوزع الجوائز
        if (game.players.length === 1) {
            let firstPlace = game.players[0];
            let secondPlace = game.eliminated[0] || null;
            let thirdPlace = game.eliminated[1] || null;

            let finishMsg = `*❃━═━═✦•〘•🪦•〙•✦═━═━❃*\n` +
                            `*※فــ←ــعـاليـ←ـة ديــــ📓ـــث نوت※*\n` +
                            `*❴✾❵──━━━━❨🪦❩━━━━──❴✾❵*\n\n` +
                            `*الـــــجـوائــــ🏆ـــذ:*\n` +
                            `*الـمــقــــ🤹🏻‍♂️ـــدم:* @${game.host.split('@')[0]} 『50k』\n` +
                            `*الـمــ🥇ــركز الاول:* @${firstPlace.split('@')[0]} 『50k』\n`;

            let mentionsList = [game.host, firstPlace];

            if (secondPlace) {
                finishMsg += `*الـمــ🥈ـــركز الثاني:* @${secondPlace.split('@')[0]} 『40k』\n`;
                mentionsList.push(secondPlace);
            }
            if (thirdPlace) {
                finishMsg += `*المـــ🥉ــركز الثالث:* @${thirdPlace.split('@')[0]} 『30k』\n`;
                mentionsList.push(thirdPlace);
            }

            finishMsg += `\n*بــــــ🏵️ـاقي المراكز:* 『10k』\n\n` +
                          `*مبروك للفائزين وحظاً أوفر للبقية! 🪦*`;

            await conn.sendMessage(chatId, { text: finishMsg, mentions: mentionsList }, { quoted: m });
            delete global.deathNote[chatId];
            return;
        } else {
            return conn.sendMessage(chatId, {
                text: `🪦 *تم كتابة اسم @${victim.split('@')[0]} في الديث نوت وطرده من اللعبة!*\n\n👥 عدد اللاعبين المتبقين: ${game.players.length}\n*أيها المقدم، اطرح السؤال التالي!*`,
                mentions: [victim]
            }, { quoted: m });
        }
    }

    // 6. إنهاء الفعالية
    if (action === 'انهاء_الفعالية' || action === 'انهاء') {
        if (!game) return m.reply('⚠️ لا توجد فعالية لإنهائها.');
        if (game.host !== sender) return m.reply('⚠️ المقدم فقط هو من يمكنه إنهاء الفعالية.');

        delete global.deathNote[chatId];
        return m.reply('🛑 *تم إنهاء فعالية ديث نوت وإلغاؤها.*');
    }
};

handler.help = ['ديث_نوت'];
handler.tags = ['games'];
handler.command = ['ديث_نوت', 'ديثنوت', 'انضمام', 'بدء_الفعالية', 'نقطة', 'طرد', 'انهاء_الفعالية'];
handler.category = 'games';

export default handler;