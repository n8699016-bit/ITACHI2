async function handler(m, { command, text, conn }) {
    global.xoGames ??= {};
    const game = global.xoGames[m.chat];
    const [cmd] = text.trim().toLowerCase().split(' ');
    const isDelete = cmd === 'delete' || cmd === 'حذف';
    const isJoin = cmd === 'join' || cmd === 'انضمام';

    // دالة مساعدة آمنة لجلب الاسم
    const getName = async (jid) => {
        try {
            if (conn.getName) return await conn.getName(jid);
            if (conn.getContact) {
                const contact = await conn.getContact(jid);
                return contact?.pushname || contact?.name || jid.split('@')[0];
            }
            return jid.split('@')[0];
        } catch {
            return jid.split('@')[0];
        }
    };

    if (isDelete) {
        if (!game) return m.reply("❌ لا توجد لعبة نشطة للحذف!");
        if (game.player1 !== m.sender && game.player2 !== m.sender) 
            return m.reply("❌ فقط اللاعبين يمكنهم حذف اللعبة!");
        delete global.xoGames[m.chat];
        return m.reply("🗑️ تم حذف اللعبة!");
    }

    // الانضمام
    if (isJoin || cmd === 'join') {
        if (!game) return m.reply("❌ لا توجد لعبة للانضمام! اكتب *.xo* لإنشاء لعبة.");
        if (game.status === 'playing') return m.reply("❌ اللعبة بدأت بالفعل!");
        if (game.player1 === m.sender) return m.reply("❌ لا يمكنك اللعب ضد نفسك!");

        game.player2 = m.sender;
        game.status = 'playing';

        const name1 = await getName(game.player1);
        const name2 = await getName(game.player2);

        return conn.sendMessage(m.chat, {
            text: `🎮 بدأت اللعبة!\n\n${drawBoard(game.board)}\n\n@${game.player1.split('@')[0]} (${name1}) ❌  ضد  @${game.player2.split('@')[0]} (${name2}) ⭕\n\n@${game.player1.split('@')[0]} يبدأ! اختر رقم من 1 إلى 9`,
            mentions: [game.player1, game.player2]
        });
    }

    // إذا فيه لعبة موجودة
    if (game) {
        if (game.status === 'waiting') {
            const name = await getName(game.player1);
            return m.reply(
                `❌ @${game.player1.split('@')[0]} (${name}) ينتظر خصماً.\n\nاكتب *.xo join* للانضمام أو *.xo delete* للإلغاء!`,
                null,
                { mentions: [game.player1] }
            );
        } else {
            return m.reply("❌ توجد لعبة نشطة في هذه الدردشة!\n\nاكتب *.xo delete* لإلغاء اللعبة الحالية.");
        }
    }

    // إنشاء لعبة جديدة
    global.xoGames[m.chat] = {
        player1: m.sender,
        player2: null,
        board: Array(9).fill(null),
        turn: 'X',
        status: 'waiting'
    };

    const name = await getName(m.sender);
    return m.reply(
        `🎮 تم إنشاء لعبة XO!\n\n@${m.sender.split('@')[0]} (${name}) ينتظر خصماً.\n\nاكتب *.xo join* للانضمام!`,
        null,
        { mentions: [m.sender] }
    );
}

handler.before = async (m, { conn }) => {
    if (!m.text || !global.xoGames?.[m.chat]) return false;
    const game = global.xoGames[m.chat];
    if (game.status !== 'playing') return false;
    
    const currentPlayer = game.turn === 'X' ? game.player1 : game.player2;
    if (m.sender !== currentPlayer) return false;
    
    const move = parseInt(m.text.trim()) - 1;
    if (move < 0 || move > 8 || isNaN(move)) return false;
    if (game.board[move] !== null) return !await m.reply("❌ هذا المربع مشغول بالفعل!");
    
    game.board[move] = game.turn;
    const winner = checkWinner(game.board);
    
    if (winner || game.board.every(cell => cell)) {
        let text, winnerJid;
        
        if (winner) {
            winnerJid = winner === 'X' ? game.player1 : game.player2;
            text = `${drawBoard(game.board)}\n\n🎉 @${winnerJid.split('@')[0]} فاز!`;
            
            if (global.db?.users[winnerJid]) {
                global.db.users[winnerJid].xp = (global.db.users[winnerJid].xp || 0) + 500;
                global.db.users[winnerJid].cookies = (global.db.users[winnerJid].cookies || 0) + 10;
                text += `\n\n🏆 +500 XP | 🍪 +10 كوكيز`;
            }
        } else {
            text = `${drawBoard(game.board)}\n\n🤝 تعادل!`;
        }
        
        await conn.sendMessage(m.chat, { text, mentions: winnerJid ? [winnerJid] : undefined });
        delete global.xoGames[m.chat];
        return true;
    }
    
    game.turn = game.turn === 'X' ? 'O' : 'X';
    const nextPlayer = game.turn === 'X' ? game.player1 : game.player2;
    await conn.sendMessage(m.chat, { 
        text: `${drawBoard(game.board)}\n\n@${nextPlayer.split('@')[0]} دورك! (${game.turn})`,
        mentions: [nextPlayer] 
    });
    return true;
};

handler.usage = ["اكس"];
handler.category = "games";
handler.command = ['اكس', 'xo'];
handler.usePrefix = true;
export default handler;

const drawBoard = b => [0,3,6].map(i => 
    b.slice(i,i+3).map((c,idx) => c ? (c==='X'?'❌':'⭕') : `${i+idx+1}️⃣`).join(' | ')
).join('\n');

const checkWinner = b => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,c,d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    return null;
};