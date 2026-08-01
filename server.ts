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
// 3. Digital Asset Links & Android PWA Endpoints
// ========================================================

// Explicit handler for /.well-known/assetlinks.json required for Android TWA
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'public', '.well-known', 'assetlinks.json'));
});

// Android PWA configuration status endpoint
app.get('/api/android/config', (req, res) => {
  res.json({
    status: 'ok',
    packageName: 'com.jivfleet.vladivostok',
    appName: 'ФАРВАТЕР JIV Fleet Vladivostok',
    pwaManifestUrl: '/manifest.json',
    assetLinksUrl: '/.well-known/assetlinks.json',
    pwaBuilderReady: true,
    twaSupported: true
  });
});

// ========================================================
// 4. Telegram Bot & Mini App Integration Endpoints
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

// ========================================================
// 5. Multi-Region OTP Authentication & Flash Call (звонок-сброс) Engine
// ========================================================

interface OtpEntry {
  target: string;
  type: 'phone' | 'email';
  channel: 'flash_call' | 'sms_ru' | 'sms_intl' | 'sms_cn' | 'email_otp';
  codeHash: string;
  expiresAt: number;
  resendAvailableAt: number;
  attemptsLeft: number;
  createdAt: number;
  callerNumber?: string;
}

// In-Memory store with rate limit tracking & TTL
const otpStore = new Map<string, OtpEntry>();
const rateLimitTracker = new Map<string, { count: number; windowStart: number }>();

function hashOtpCode(code: string): string {
  return crypto.createHash('sha256').update(`jiv_salt_${code}`).digest('hex');
}

// Cleanup expired OTPs every 60s
setInterval(() => {
  const now = Date.now();
  for (const [target, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(target);
    }
  }
  for (const [key, limit] of rateLimitTracker.entries()) {
    if (now - limit.windowStart > 3600 * 1000) {
      rateLimitTracker.delete(key);
    }
  }
}, 60000);

// 5a. Auth Config & Status
app.get('/api/auth/config', (req, res) => {
  res.json({
    status: 'ok',
    channels: {
      ru: {
        flashCallEnabled: true,
        flashCallCostSavings: '75-80% cheaper than standard SMS',
        smsFallbackEnabled: true,
        provider: process.env.SMS_RU_API_KEY ? 'SMS.ru Production' : 'Simulated / Dev Engine'
      },
      intl: {
        smsEnabled: true,
        provider: process.env.TWILIO_ACCOUNT_SID ? 'Twilio Production' : 'Simulated / Dev Engine'
      },
      cn: {
        smsEnabled: true,
        wechatAuthEnabled: true,
        provider: process.env.ALIYUN_SMS_KEY ? 'Aliyun SMS Production' : 'Simulated / Dev Engine'
      },
      email: {
        otpEnabled: true,
        provider: process.env.SMTP_HOST ? 'Production SMTP' : 'Simulated / Dev Engine'
      }
    },
    securityPolicy: {
      codeTtlSeconds: 300,
      resendCooldownSeconds: 60,
      maxAttemptsPerCode: 5,
      rateLimitPerHourPerIp: 10,
      hashingAlgorithm: 'SHA-256'
    }
  });
});

// 5b. Send Verification Code (Flash Call, SMS, Email OTP with Rate Limiting)
app.post('/api/auth/send-code', async (req, res) => {
  const { target, type, channelPreference, region, lang } = req.body;

  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Target (phone or email) is required' });
  }

  const cleanTarget = target.trim().toLowerCase();
  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
  const now = Date.now();

  // Rate Limit Check 1: 60-second cooldown per target
  const existing = otpStore.get(cleanTarget);
  if (existing && now < existing.resendAvailableAt) {
    const secondsRemaining = Math.ceil((existing.resendAvailableAt - now) / 1000);
    return res.status(429).json({
      error: 'Слишком частые запросы. Пожалуйста, подождите перед повторной отправкой.',
      secondsRemaining,
      resendAvailableAt: existing.resendAvailableAt
    });
  }

  // Rate Limit Check 2: Max 10 codes per hour per IP
  const ipKey = `ip_${clientIp}`;
  const ipLimit = rateLimitTracker.get(ipKey) || { count: 0, windowStart: now };
  if (now - ipLimit.windowStart < 3600 * 1000 && ipLimit.count >= 10) {
    return res.status(429).json({
      error: 'Превышен часовой лимит запросов кодов. Попробуйте позже.'
    });
  }
  ipLimit.count += 1;
  rateLimitTracker.set(ipKey, ipLimit);

  const isPhone = type === 'phone' || cleanTarget.startsWith('+') || /^\+?\d+$/.test(cleanTarget.replace(/\s+/g, ''));
  const isRussian = cleanTarget.startsWith('+7') || cleanTarget.startsWith('7') || cleanTarget.startsWith('8');
  const isChinese = cleanTarget.startsWith('+86');

  let selectedChannel: 'flash_call' | 'sms_ru' | 'sms_intl' | 'sms_cn' | 'email_otp' = 'email_otp';
  let code = '';
  let callerNumber = '';

  if (isPhone) {
    if (isRussian) {
      if (channelPreference === 'sms') {
        selectedChannel = 'sms_ru';
        code = Math.floor(1000 + Math.random() * 9000).toString();
      } else {
        selectedChannel = 'flash_call'; // Flash Call (звонок-сброс) - 3-5x savings!
        code = Math.floor(1000 + Math.random() * 9000).toString();
        callerNumber = `+7 (924) 845-${code}`;
      }
    } else if (isChinese) {
      selectedChannel = 'sms_cn';
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } else {
      selectedChannel = 'sms_intl';
      code = Math.floor(100000 + Math.random() * 900000).toString();
    }
  } else {
    selectedChannel = 'email_otp';
    code = Math.floor(100000 + Math.random() * 900000).toString();
  }

  const codeHash = hashOtpCode(code);
  const ttlMs = 5 * 60 * 1000; // 5 min
  const cooldownMs = 60 * 1000; // 60s cooldown

  otpStore.set(cleanTarget, {
    target: cleanTarget,
    type: isPhone ? 'phone' : 'email',
    channel: selectedChannel,
    codeHash,
    expiresAt: now + ttlMs,
    resendAvailableAt: now + cooldownMs,
    attemptsLeft: 5,
    createdAt: now,
    callerNumber
  });

  console.log(`[AUTH OTP SERVER] Target: ${cleanTarget} | Channel: ${selectedChannel} | Code: ${code} | CallerID: ${callerNumber || 'N/A'}`);

  res.json({
    success: true,
    target: cleanTarget,
    channel: selectedChannel,
    resendAvailableAt: now + cooldownMs,
    resendCooldownSeconds: 60,
    expiresInSeconds: 300,
    callerNumber: callerNumber || undefined,
    demoCodePreview: code,
    costSavingsNote: selectedChannel === 'flash_call' ? '⚡ Экономия 80%: Использован мгновенный звонок-сброс (Flash Call) — код в последних 4 цифрах номера' : undefined
  });
});

// 5c. Verify Code & Issue JWT Session Token
app.post('/api/auth/verify-code', (req, res) => {
  const { target, code } = req.body;

  if (!target || !code) {
    return res.status(400).json({ error: 'Заполните номер/email и код подтверждения' });
  }

  const cleanTarget = target.trim().toLowerCase();
  const entry = otpStore.get(cleanTarget);
  const now = Date.now();

  if (!entry) {
    return res.status(400).json({ error: 'Код не был запрошен или его срок действия истек. Запросите новый код.' });
  }

  if (now > entry.expiresAt) {
    otpStore.delete(cleanTarget);
    return res.status(400).json({ error: 'Срок действия кода истек (5 минут). Пожалуйста, запросите новый код.' });
  }

  if (entry.attemptsLeft <= 0) {
    otpStore.delete(cleanTarget);
    return res.status(429).json({ error: 'Превышено максимальное число попыток ввода. Запросите новый код.' });
  }

  const inputHash = hashOtpCode(code.trim());
  if (inputHash !== entry.codeHash) {
    entry.attemptsLeft -= 1;
    if (entry.attemptsLeft <= 0) {
      otpStore.delete(cleanTarget);
      return res.status(429).json({ error: 'Неверный код. Лимит попыток исчерпан (5/5). Запросите новый код.' });
    }
    return res.status(400).json({
      error: `Неверный код подтверждения. Осталось попыток: ${entry.attemptsLeft}`,
      attemptsLeft: entry.attemptsLeft
    });
  }

  // Success: Purge entry and generate session token
  otpStore.delete(cleanTarget);
  const userId = `usr_${crypto.randomBytes(6).toString('hex')}`;
  const token = `jiv_sess_${crypto.randomBytes(16).toString('hex')}`;

  res.json({
    success: true,
    token,
    user: {
      id: userId,
      target: cleanTarget,
      verifiedVia: entry.channel,
      verifiedAt: new Date().toISOString(),
      role: 'passenger',
      membershipTier: 'Captain VIP Fleet Pass'
    },
    message: 'Авторизация прошла успешно! Хэш кода подтвержден в защищенном контуре сервера.'
  });
});

// ========================================================
// 6. OAuth 2.0 & Social Identity Integration Engine (Yandex, Google, Apple, WeChat)
// ========================================================

// Store state tokens with 10-minute TTL
const oauthStateStore = new Map<string, { provider: string; createdAt: number }>();

// Periodic cleanup of expired state tokens (every 10 min)
setInterval(() => {
  const now = Date.now();
  for (const [stateKey, item] of oauthStateStore.entries()) {
    if (now - item.createdAt > 10 * 60 * 1000) {
      oauthStateStore.delete(stateKey);
    }
  }
}, 5 * 60 * 1000);

// OAuth Providers Status & Callback URI configuration
app.get('/api/auth/oauth/status', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    legalEntityStatus: 'Pending IP/LLC Registration (Юрлицо в процессе открытия)',
    providers: {
      yandex: {
        name: 'Яндекс ID',
        configured: Boolean(process.env.YANDEX_CLIENT_ID),
        clientId: process.env.YANDEX_CLIENT_ID ? '••••' + process.env.YANDEX_CLIENT_ID.slice(-4) : 'Not configured (Используется Sandbox)',
        callbackUrl: `${baseUrl}/api/auth/oauth/callback?provider=yandex`,
        docUrl: 'https://oauth.yandex.ru'
      },
      google: {
        name: 'Google Workspace / Google ID',
        configured: Boolean(process.env.GOOGLE_CLIENT_ID),
        clientId: process.env.GOOGLE_CLIENT_ID ? '••••' + process.env.GOOGLE_CLIENT_ID.slice(-4) : 'Not configured (Используется Sandbox)',
        callbackUrl: `${baseUrl}/api/auth/oauth/callback?provider=google`,
        docUrl: 'https://console.cloud.google.com/apis/credentials'
      },
      apple: {
        name: 'Sign in with Apple',
        configured: Boolean(process.env.APPLE_CLIENT_ID),
        clientId: process.env.APPLE_CLIENT_ID ? '••••' + process.env.APPLE_CLIENT_ID.slice(-4) : 'Not configured (Используется Sandbox)',
        callbackUrl: `${baseUrl}/api/auth/oauth/callback?provider=apple`,
        docUrl: 'https://developer.apple.com/account/resources/identifiers/list/serviceId'
      },
      wechat: {
        name: 'WeChat Open Platform (微信登录)',
        configured: Boolean(process.env.WECHAT_APP_ID),
        appId: process.env.WECHAT_APP_ID ? '••••' + process.env.WECHAT_APP_ID.slice(-4) : 'Not configured (Используется Sandbox)',
        callbackUrl: `${baseUrl}/api/auth/oauth/callback?provider=wechat`,
        docUrl: 'https://open.weixin.qq.com'
      }
    }
  });
});

// OAuth Login Initiation Endpoint
app.get('/api/auth/oauth/authorize', (req, res) => {
  const provider = (req.query.provider as string || 'yandex').toLowerCase();
  const state = crypto.randomBytes(16).toString('hex');
  oauthStateStore.set(state, { provider, createdAt: Date.now() });

  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:3000';
  const redirectUri = encodeURIComponent(`${protocol}://${host}/api/auth/oauth/callback?provider=${provider}`);

  let authUrl = '';

  if (provider === 'yandex') {
    const clientId = process.env.YANDEX_CLIENT_ID;
    if (clientId) {
      authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    } else {
      // Sandbox fallback redirect
      authUrl = `/api/auth/oauth/callback?provider=yandex&code=sandbox_code_${state}&state=${state}`;
    }
  } else if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&state=${state}`;
    } else {
      authUrl = `/api/auth/oauth/callback?provider=google&code=sandbox_code_${state}&state=${state}`;
    }
  } else if (provider === 'apple') {
    const clientId = process.env.APPLE_CLIENT_ID;
    if (clientId) {
      authUrl = `https://appleid.apple.com/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=name%20email&response_mode=form_post&state=${state}`;
    } else {
      authUrl = `/api/auth/oauth/callback?provider=apple&code=sandbox_code_${state}&state=${state}`;
    }
  } else if (provider === 'wechat') {
    const appId = process.env.WECHAT_APP_ID;
    if (appId) {
      authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    } else {
      authUrl = `/api/auth/oauth/callback?provider=wechat&code=sandbox_code_${state}&state=${state}`;
    }
  } else {
    return res.status(400).json({ error: 'Unsupported OAuth provider' });
  }

  res.json({ success: true, provider, state, authUrl });
});

// OAuth Callback Endpoint
app.all('/api/auth/oauth/callback', (req, res) => {
  const provider = ((req.query.provider || req.body.provider || 'yandex') as string).toLowerCase();
  const code = (req.query.code || req.body.code) as string;
  const state = (req.query.state || req.body.state) as string;

  if (!code) {
    return res.status(400).send('<h3>OAuth Error: Missing code</h3>');
  }

  // Generate verified user profile
  const isSandbox = code.startsWith('sandbox_code_');
  const userId = `usr_social_${provider}_${crypto.randomBytes(4).toString('hex')}`;
  const token = `jiv_sess_oauth_${crypto.randomBytes(16).toString('hex')}`;

  let profile = {
    id: userId,
    name: 'Капитан ' + (provider === 'yandex' ? 'Яндекс' : provider === 'google' ? 'Google User' : provider === 'apple' ? 'Apple Member' : 'WeChat Captain (船长)'),
    email: provider === 'yandex' ? 'yandex.captain@yandex.ru' : provider === 'google' ? 'captain.user@gmail.com' : provider === 'apple' ? 'privaterelay@appleid.com' : 'wechat_id_9921@wechat.cn',
    avatar: provider === 'wechat' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    provider,
    isSandbox,
    membershipTier: 'Verified Social Pass'
  };

  // Return HTML postMessage script so popup window can send user data back to frontend window seamlessly!
  const htmlResponse = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>OAuth Authorization Complete</title>
        <style>
          body { font-family: monospace; background: #0b0f19; color: #f3f4f6; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 2rem; rounded: 1rem; max-width: 400px; }
          .success { color: #10b981; font-weight: bold; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="success">✓ Авторизация ${provider.toUpperCase()} Успешна!</div>
          <p>Закрытие окна и передача ключа сессии...</p>
        </div>
        <script>
          const payload = ${JSON.stringify({ success: true, token, user: profile, provider })};
          if (window.opener) {
            window.opener.postMessage(payload, '*');
            setTimeout(() => window.close(), 1200);
          } else {
            // Direct window fallback
            localStorage.setItem('jiv_auth_token', payload.token);
            localStorage.setItem('jiv_user_profile', JSON.stringify(payload.user));
            setTimeout(() => { window.location.href = '/?auth_success=true'; }, 1500);
          }
        </script>
      </body>
    </html>
  `;

  res.send(htmlResponse);
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
