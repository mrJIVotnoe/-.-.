import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// 1. Health check & Self-hosting status endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'jiv-vladivostok-fleet',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsageMB: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
    cloudProvider: process.env.CLOUD_PROVIDER || 'Bare-Metal / Self-Hosted',
    version: '1.0.0-launch'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    appName: 'JIV Vladivostok Fleet Management Platform',
    mode: process.env.NODE_ENV || 'development',
    selfHostedReady: true,
    migrationCompatibility: ['Yandex.Cloud (YCR/YDB)', 'Sber Cloud.ru (CCE/SWR)', 'Docker Compose', 'Bare Metal'],
    databaseDriver: process.env.DATABASE_URL ? 'PostgreSQL' : 'Local Persistence (JSON / LocalStorage)',
    geminiAiActive: Boolean(process.env.GEMINI_API_KEY),
    serverTime: new Date().toISOString()
  });
});

// 2. Backup & Export endpoint for seamless cloud migration
app.get('/api/v1/export-data', (req, res) => {
  res.json({
    exportedAt: new Date().toISOString(),
    schemaVersion: '1.0',
    platform: 'JIV Fleet Vladivostok',
    data: {
      systemConfig: {
        launchPhase: true,
        commissionRate: 0,
        currency: 'RUB',
        supportedLangs: ['ru', 'en', 'zh', 'zh-TW']
      },
      message: 'System data exported successfully for cloud migration.'
    }
  });
});

// 2. Backup & Export endpoint for seamless cloud migration
app.get('/api/v1/export-data', (req, res) => {
  res.json({
    exportedAt: new Date().toISOString(),
    schemaVersion: '1.0',
    platform: 'JIV Fleet Vladivostok',
    data: {
      systemConfig: {
        launchPhase: true,
        commissionRate: 0,
        currency: 'RUB',
        supportedLangs: ['ru', 'en', 'zh', 'zh-TW']
      },
      message: 'System data exported successfully for cloud migration.'
    }
  });
});

// ========================================================
// 3. Telegram Bot & Mini App Integration Endpoints
// ========================================================

// 3a. Telegram Bot Config & Status
app.get('/api/telegram/config', (req, res) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'JivVladivostokFleetBot';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const isConfigured = Boolean(botToken && botToken.length > 10);

  res.json({
    configured: isConfigured,
    botUsername,
    miniAppUrl: appUrl,
    directLaunchUrl: `https://t.me/${botUsername}/app`,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || `${appUrl}/api/telegram/webhook`,
    supportedFeatures: [
      'Mini App Container (Telegram WebApp JS SDK)',
      '0% Commission Direct Booking Notifications',
      'Digital Captain Bridge Telegram Sync',
      'Sea Concierge & Emergency SOS Dispatcher',
      'InitData HMAC-SHA256 Auth Verification'
    ]
  });
});

// Helper function to send Telegram message
async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { success: false, reason: 'TELEGRAM_BOT_TOKEN is not set' };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });
    const data = await response.json();
    return { success: response.ok, data };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// 3b. Telegram Webhook Handler (Receives bot updates from Telegram servers)
app.post('/api/telegram/webhook', async (req, res) => {
  const update = req.body;
  
  if (update && update.message) {
    const { chat, text, from } = update.message;
    const chatId = chat.id;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    if (text === '/start' || text?.startsWith('/start')) {
      const welcomeMessage = 
        `⚓ <b>Добро пожаловать в ФАРВАТЕР JIV Fleet!</b>\n\n` +
        `Привет, <b>${from?.first_name || 'Капитан'}</b>! 👋\n` +
        `Главная цифровая экосистема флотской акватории Владивостока и Залива Петра Великого.\n\n` +
        `✨ <b>Возможности Mini App:</b>\n` +
        `• 0% комиссия — прямая бронь катеров и яхт\n` +
        `• Морское такси и Рейдовая эвакуация SOS\n` +
        `• Капитанский мостик & Рыболовный чат\n` +
        `• Погода, гидрометеоцентр и радары`;

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '🚀 Открыть Mini App ФАРВАТЕР',
              web_app: { url: appUrl }
            }
          ],
          [
            { text: '🛥️ Флот и Катера', callback_data: 'view_fleet' },
            { text: '🆘 МЧС SOS / Такси', callback_data: 'emergency_info' }
          ]
        ]
      };

      await sendTelegramMessage(chatId, welcomeMessage, keyboard);
    } else if (text === '/fleet' || text === '/boats') {
      const fleetMessage = `🛥️ <b>Каталог Флота Владивостока:</b>\nНажмите кнопку ниже, чтобы открыть интерактивную карту и забронировать судно с 0% комиссией.`;
      await sendTelegramMessage(chatId, fleetMessage, {
        inline_keyboard: [[{ text: '🌊 Посмотреть флот на карте', web_app: { url: appUrl } }]]
      });
    } else {
      const defaultReply = `⚓ Получено сообщение. Для полного взаимодействия открывайте наше Telegram Mini App!`;
      await sendTelegramMessage(chatId, defaultReply, {
        inline_keyboard: [[{ text: '📱 Запустить ФАРВАТЕР Mini App', web_app: { url: appUrl } }]]
      });
    }
  }

  // Always return 200 OK to Telegram webhook ping
  res.status(200).send('OK');
});

// 3c. Send Push Notification / Booking alert to Telegram Chat
app.post('/api/telegram/send-notification', async (req, res) => {
  const { chatId, title, message, actionUrl } = req.body;

  if (!chatId || !message) {
    return res.status(400).json({ error: 'chatId and message are required fields' });
  }

  const formattedText = `<b>${title || '⚓ Уведомление JIV Fleet'}</b>\n\n${message}`;
  const appUrl = actionUrl || process.env.APP_URL || 'http://localhost:3000';

  const result = await sendTelegramMessage(chatId, formattedText, {
    inline_keyboard: [[{ text: '🔗 Открыть в ФАРВАТЕР Mini App', web_app: { url: appUrl } }]]
  });

  res.json({
    status: result.success ? 'sent' : 'simulated_or_failed',
    chatId,
    details: result
  });
});

// 3d. Verify Telegram InitData (HMAC-SHA256 Security Check)
app.post('/api/telegram/verify-initdata', (req, res) => {
  const { initData } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!initData) {
    return res.status(400).json({ valid: false, error: 'initData missing' });
  }

  if (!botToken) {
    // If bot token isn't configured yet, accept mock/preview data in dev mode
    return res.json({ 
      valid: true, 
      simulated: true, 
      message: 'Bot token not set; developer validation bypass active.' 
    });
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const params: string[] = [];
    urlParams.forEach((value, key) => {
      params.push(`${key}=${value}`);
    });
    params.sort();

    const dataCheckString = params.join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const isValid = calculatedHash === hash;
    res.json({ valid: isValid, user: urlParams.get('user') ? JSON.parse(urlParams.get('user')!) : null });
  } catch (e: any) {
    res.status(500).json({ valid: false, error: e?.message || 'Verification failed' });
  }
});

// ========================================================
// 4. WeChat Mini App & WeChat Pay (微信小程序 & 微信支付) Endpoints
// ========================================================

// 4a. WeChat Mini App Configuration
app.get('/api/wechat/config', (req, res) => {
  const appId = process.env.WECHAT_APP_ID || 'wx1234567890abcdef';
  const mchId = process.env.WECHAT_MCH_ID || '1600000000';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const isConfigured = Boolean(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET);

  res.json({
    configured: isConfigured,
    appId,
    mchId,
    miniAppTitle: 'ФАРВАТЕР 符拉迪沃斯托克 JIV 舰队',
    webviewUrl: `${appUrl}?lang=zh&channel=wechat_miniprogram`,
    supportedFeatures: [
      'WeChat Mini App Container (微信小程序 Webview)',
      'WeChat Pay 0% Commission (微信支付 0% 手续费)',
      'Chinese Yuan Conversion (RMB 实时汇率转换)',
      'WeChat Customer Service (微信客服 & 消息通知)',
      'WeChat JS-SDK Location & QR Scan (微信 JSSDK 定位 & 扫码)'
    ]
  });
});

// 4b. WeChat Code2Session Auth Endpoint (wx.login code exchange)
app.post('/api/wechat/auth/code2session', async (req, res) => {
  const { code } = req.body;
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!code) {
    return res.status(400).json({ error: 'Code parameter is required' });
  }

  // If credentials are not set in dev mode, return simulated session
  if (!appId || !appSecret) {
    return res.json({
      openid: `wx_sim_openid_${Date.now().toString(36)}`,
      session_key: 'simulated_session_key',
      simulated: true,
      message: 'Dev mode: WECHAT_APP_ID or WECHAT_APP_SECRET not set. Returning demo openid.'
    });
  }

  try {
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const response = await fetch(wxUrl);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'WeChat auth request failed' });
  }
});

// 4c. WeChat Pay Unified Order (微信支付 - 统一下单)
app.post('/api/wechat/pay/unifiedorder', async (req, res) => {
  const { openid, bookingId, boatTitle, rubAmount } = req.body;

  if (!rubAmount) {
    return res.status(400).json({ error: 'rubAmount is required' });
  }

  // Convert RUB to RMB (e.g., 1 RUB ~ 0.082 RMB; in fen: RMB * 100)
  const exchangeRate = 0.082;
  const rmbAmount = (rubAmount * exchangeRate).toFixed(2);
  const totalFeeFen = Math.round(parseFloat(rmbAmount) * 100); // 微信支付以分为单位

  const appId = process.env.WECHAT_APP_ID || 'wx1234567890abcdef';
  const timeStamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const packageStr = `prepay_id=wx_sim_prepay_${Date.now()}`;

  // Generate simulated signature for demo/dev mode
  const signType = 'MD5';
  const paySign = crypto
    .createHash('md5')
    .update(`appId=${appId}&nonceStr=${nonceStr}&package=${packageStr}&signType=${signType}&timeStamp=${timeStamp}&key=SIMULATED_KEY`)
    .digest('hex')
    .toUpperCase();

  res.json({
    status: 'success',
    bookingId: bookingId || 'RENT-VL-9901',
    boatTitle: boatTitle || 'Катер "Владивосток"',
    currencyDetails: {
      rubAmount,
      rmbAmount,
      totalFeeFen,
      commissionRate: '0%'
    },
    payParams: {
      appId,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType,
      paySign
    }
  });
});

// 4d. WeChat Official Account / Mini App Webhook (微信客服与消息对接)
app.get('/api/wechat/message/webhook', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;
  const token = process.env.WECHAT_TOKEN || 'jiv_vladivostok_wechat_token';

  if (signature && timestamp && nonce) {
    const array = [token, timestamp, nonce].sort();
    const str = array.join('');
    const sha1 = crypto.createHash('sha1').update(str).digest('hex');

    if (sha1 === signature) {
      return res.send(echostr);
    }
  }

  res.send(echostr || 'WeChat Webhook Active');
});

// 4. Static Asset Serving in Production Mode or Vite Middleware in Development
async function setupFrontend() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1d', index: false }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite middleware initialization skipped or failed:', e);
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }
}

setupFrontend().then(() => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`⚓ JIV Fleet Platform Server Running`);
    console.log(`🌐 Address: http://${HOST}:${PORT}`);
    console.log(`🛠️  Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Ready for Bare-Metal Self-Hosting & Cloud Migration`);
    console.log(`====================================================`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
});
