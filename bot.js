const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Token ve Chat ID
const token = '7985565491:AAF3syGnxholYxhuE_GOPLE9VANi0pd5_x4';
const chatId = '-1002415228289';

// Botu başlat
const bot = new TelegramBot(token, { polling: true });

// Soruları yükle
const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
let activeQuestions = {};

// Başlatma mesajı
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Merhaba! KPSS Tarih Quiz'e hoş geldiniz. /quiz komutuyla başlayabilirsiniz.");
});

// Quiz başlat
bot.onText(/\/quiz/, (msg) => {
    // Rastgele bir soru seç
    const question = questions[Math.floor(Math.random() * questions.length)];
    activeQuestions[msg.chat.id] = question;

    const options = {
        reply_markup: {
            inline_keyboard: [
                question.cevaplar.map((cevap, index) => ({
                    text: cevap,
                    callback_data: index.toString()
                }))
            ]
        }
    };

    bot.sendMessage(msg.chat.id, `📝 *${question.konu}*\n${question.soru}`, {
        parse_mode: 'Markdown',
        ...options
    });
});

// Cevap kontrol
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userAnswer = parseInt(callbackQuery.data);
    const question = activeQuestions[chatId];

    if (!question) {
        bot.sendMessage(chatId, "Lütfen önce /quiz komutuyla bir quiz başlatın.");
        return;
    }

    if (userAnswer === question.dogru) {
        bot.sendMessage(chatId, "✅ Doğru cevap!");
    } else {
        bot.sendMessage(chatId, `❌ Yanlış cevap. Doğru cevap: ${question.cevaplar[question.dogru]}`);
    }

    delete activeQuestions[chatId]; // Soru tamamlandı
});

// Günlük mesaj gönderme (manuel tetikleme için)
async function sendDailyQuiz() {
    const question = questions[Math.floor(Math.random() * questions.length)];
    const options = {
        reply_markup: {
            inline_keyboard: [
                question.cevaplar.map((cevap, index) => ({
                    text: cevap,
                    callback_data: index.toString()
                }))
            ]
        }
    };

    await bot.sendMessage(chatId, `📝 *${question.konu}*\n${question.soru}`, {
        parse_mode: 'Markdown',
        ...options
    });
}

// Eğer manuel başlatma gerekirse aşağıdaki fonksiyonu çağırabilirsiniz
sendDailyQuiz().catch(console.error);
