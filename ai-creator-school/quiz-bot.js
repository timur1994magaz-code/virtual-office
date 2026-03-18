const TelegramBot = require('node-telegram-bot-api');
const { google } = require('googleapis');
const fs = require('fs');

// Config
const BOT_TOKEN = '8791576779:AAHXWa_vR3jZCRUFi8n1I1e-VI5oon5VjG0';
const NOTIFY_CHAT_ID = '8306873504'; // Тимур
const GOOGLE_SHEET_ID = '1k-v1fW3lSdlPXJkp_Ulv772ldDQKLEcTUo7ojYOc29w';
const GOOGLE_KEY_PATH = '/home/node/.openclaw/workspace/google-calendar-key.json';

// Questions
const questions = [
  {
    id: 'q1',
    text: '🎯 <b>Кто ты?</b>\n\nВыбери то, что ближе всего:',
    options: [
      { text: '👨‍💻 Фрилансер / самозанятый', score: 'hot' },
      { text: '🏢 Владелец бизнеса', score: 'hot' },
      { text: '📱 Маркетолог / SMM', score: 'warm' },
      { text: '👀 Просто интересно', score: 'cold' },
    ],
  },
  {
    id: 'q2',
    text: '💡 <b>Что привело тебя сюда?</b>',
    options: [
      { text: '💰 Хочу доход 150–250к+', score: 'hot' },
      { text: '🏢 Хочу внедрить в собственный бизнес', score: 'warm' },
      { text: '🤷 Пока просто смотрю', score: 'cold' },
    ],
  },
  {
    id: 'q3',
    text: '⚡ <b>Если увидишь чёткий план — готов начать обучение?</b>',
    options: [
      { text: '✅ Да, старт за 1–2 недели', score: 'hot' },
      { text: '🤔 Сначала разберусь, потом решу', score: 'warm' },
      { text: '😐 Пока не уверен(а)', score: 'cold' },
    ],
  },
  {
    id: 'q4',
    text: '⏰ <b>Сколько часов в неделю готов(а) уделять обучению?</b>',
    options: [
      { text: '💪 5–10 часов и больше', score: 'hot' },
      { text: '⚖️ 2–5 часов', score: 'warm' },
      { text: '⏳ Меньше 2 часов', score: 'cold' },
    ],
  },
];

// Contact collection steps
const contactSteps = [
  { id: 'name', text: '👤 Отлично! Давай познакомимся.\n\nКак тебя зовут?' },
  { id: 'contact', text: '📱 Теперь поделись контактом — нажми кнопку ниже 👇', isContact: true },
];

// State storage
const sessions = {};

function getSession(chatId) {
  if (!sessions[chatId]) {
    sessions[chatId] = {
      step: 'start',
      questionIndex: 0,
      answers: [],
      scores: [],
      contacts: {},
      username: '',
    };
  }
  return sessions[chatId];
}

function calcScore(scores) {
  const hot = scores.filter(s => s === 'hot').length;
  const warm = scores.filter(s => s === 'warm').length;
  const total = hot * 2 + warm;
  const max = scores.length * 2;
  return { hot, warm, total, max, label: hot >= 3 ? '🔥 Горячий' : hot >= 1 ? '🟡 Тёплый' : '🔵 Холодный' };
}

// Google Sheets
async function appendToSheet(data) {
  if (!GOOGLE_SHEET_ID) {
    console.log('No GOOGLE_SHEET_ID set, skipping sheets append');
    return;
  }
  try {
    const key = JSON.parse(fs.readFileSync(GOOGLE_KEY_PATH, 'utf8'));
    const auth = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Лист1!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });
    console.log('Appended to Google Sheets');
  } catch (e) {
    console.error('Sheets error:', e.message);
  }
}

// Init bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  session.step = 'quiz';
  session.questionIndex = 0;
  session.answers = [];
  session.scores = [];
  session.contacts = {};
  session.username = msg.from.username || '';

  await bot.sendMessage(chatId,
    '👋 Привет! Это анкета для записи на <b>персональную консультацию</b> по AI-видео для бизнеса.\n\n' +
    'Займёт всего <b>45 секунд</b> ⏱\n\n' +
    'После анкеты — запишем тебя на разбор, где покажу как выйти на <b>250 000 ₽/мес и выше</b> на AI-роликах.\n\n' +
    'Всего <b>5 вопросов</b> — и всё готово 👇',
    { parse_mode: 'HTML' }
  );

  setTimeout(() => sendQuestion(chatId, 0), 1500);
});

function sendQuestion(chatId, index) {
  const q = questions[index];
  if (!q) return;

  if (q.options) {
    const keyboard = q.options.map((opt, i) => [{
      text: opt.text,
      callback_data: `q${index}_${i}`,
    }]);
    bot.sendMessage(chatId, q.text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  } else {
    // Open question
    const session = getSession(chatId);
    session.step = 'open_question';
    bot.sendMessage(chatId, q.text, { parse_mode: 'HTML' });
  }
}

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const session = getSession(chatId);
  const data = query.data;

  // Parse: q0_1 means question 0, option 1
  const match = data.match(/^q(\d+)_(\d+)$/);
  if (!match) return;

  const qIndex = parseInt(match[1]);
  const optIndex = parseInt(match[2]);
  const question = questions[qIndex];
  const option = question.options[optIndex];

  session.answers.push(option.text);
  session.scores.push(option.score);

  // Remove inline keyboard
  try {
    await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: chatId,
      message_id: query.message.message_id,
    });
  } catch (e) {}

  // Confirm answer
  await bot.answerCallbackQuery(query.id, { text: '✅' });

  // Next question
  const nextIndex = qIndex + 1;
  if (nextIndex < questions.length) {
    session.questionIndex = nextIndex;
    sendQuestion(chatId, nextIndex);
  } else {
    // All done, go to contacts
    startContactCollection(chatId);
  }
});

function startContactCollection(chatId) {
  const session = getSession(chatId);
  session.step = 'contact';
  session.contactIndex = 0;
  bot.sendMessage(chatId, contactSteps[0].text, { parse_mode: 'HTML' });
}

function sendContactRequest(chatId) {
  bot.sendMessage(chatId, contactSteps[1].text, {
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [[{ text: '📱 Поделиться контактом', request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const session = getSession(chatId);

  if (session.step === 'contact') {
    // Handle name input
    if (session.contactIndex === 0) {
      session.contacts.name = msg.text || '—';
      session.contactIndex = 1;
      sendContactRequest(chatId);
      return;
    }

    // Handle shared contact
    if (msg.contact) {
      session.contacts.phone = msg.contact.phone_number || '—';
      await finishQuiz(chatId);
      return;
    }
    return;
  }
});

async function finishQuiz(chatId) {
  const session = getSession(chatId);
  session.step = 'done';

  const score = calcScore(session.scores);
  const name = session.contacts.name || '—';
  const phone = session.contacts.phone || '—';
  const username = session.username ? `@${session.username}` : '—';

  // Remove keyboard and thank
  await bot.sendMessage(chatId, 
    `🎉 <b>Спасибо, ${name}!</b>\n\n` +
    `Твоя анкета принята. Мы скоро свяжемся с тобой!\n\n` +
    `А пока — заходи в наш Telegram-канал, там много полезного:\n` +
    `👉 @catschool_ai`,
    { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } }
  );

  // Notification to Timur
  const hotCount = session.scores.filter(s => s === 'hot').length;
  const notification = 
    `📋 <b>Новая анкета!</b>\n\n` +
    `👤 ${name} (${username})\n` +
    `📱 ${phone}\n` +
    `📊 Скор: ${hotCount}/${session.scores.length} — ${score.label}\n\n` +
    `Q1: ${session.answers[0] || '—'}\n` +
    `Q2: ${session.answers[1] || '—'}\n` +
    `Q3: ${session.answers[2] || '—'}\n` +
    `Q4: ${session.answers[3] || '—'}\n` +
    `Q4: ${session.answers[3] || '—'}`;

  await bot.sendMessage(NOTIFY_CHAT_ID, notification, { parse_mode: 'HTML' });

  // Google Sheets
  const now = new Date().toISOString();
  await appendToSheet([
    now, name, username, phone,
    session.answers[0], session.answers[1], session.answers[2],
    session.answers[3],
    `${hotCount}/${session.scores.length}`,
    score.label,
  ]);

  // Cleanup
  delete sessions[chatId];
}

console.log('🤖 AI Creator Quiz Bot started!');
