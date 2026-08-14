/* 
by: VA ~ VENOM
*/

const example = async (m, { conn }) => {

conn.msgUrl(m.chat,
  '*🔥 Special Offer*',
  {
    img: 'https://example.com/promo.jpg',
    title: '50% OFF',
    body: 'Limited time',
    big: true,
    mentions: ['201234567890@s.whatsapp.net', '201111111111@s.whatsapp.net'],
    newsletter: {
      name: '𝕭𝖑𝖆𝖈𝖐 𝕾𝖍𝖆𝖉𝖔𝖜𝖘🕷️',
      jid: '0029Vb82elIJkK7GCns06J00@newsletter'
    }
  },
  m
)

};

example.usage = ["تست1"]


/* ↓ قسم الأمر ↓ */
example.category = "example"


/* ↓ استخدم الأوامر ↓ */
example.command = ["تست1"] 


/* ↓ بتعمل ايقاف ل الأمر ↓ */
example.disabled = false // لو عملتها true بيشتغل ب بدايه لو خليتها false بيشتغل بدون بدايه 

/* ↓ استخدام الأمر بعد ثانيه من الاستخدام لمنع الاسبام ↓ */
example.cooldown = 1000; // تقدر تزود الثواني 


/* ↓ استخدام الأمر ب بدايه أو لا ↓ */
example.usePrefix = false; // لو عملتها true الأمر هيبقي من غير بدايه 

export default example;
