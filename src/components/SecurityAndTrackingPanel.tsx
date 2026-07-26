/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Anchor, 
  Building2,
  MapPin, 
  Route, 
  Heart, 
  Share2, 
  Navigation, 
  Radio, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  Star,
  Upload,
  Download,
  Check,
  FileText,
  Lock,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vessel } from '../types';
import { useTranslation } from '../lib/translations';
import InteractiveSeaMap from './InteractiveSeaMap';
import { useProjectLine } from '../lib/projectLineContext';

interface SecurityAndTrackingPanelProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel | null) => void;
  onSetCustomRoute: (points: [number, number][]) => void;
  onSetPickupPoint: (point: { latLon: [number, number]; type: 'pickup' | 'evac' } | null) => void;
  currentRoutePoints: [number, number][];
  currentPickupPoint: { latLon: [number, number]; type: 'pickup' | 'evac' } | null;
  activeRole?: 'client' | 'captain' | 'partner';
  onRoleChange?: (role: 'client' | 'captain' | 'partner') => void;
}

// Preset scenic marine tours of Vladivostok
const PRESET_ROUTES = [
  {
    id: 'russky-bridge',
    name: '🌉 Золотой Рог — Русский Мост',
    points: [
      [43.1155, 131.8900], // Golden Horn
      [43.0886, 131.9056], // Zmeinka
      [43.0645, 131.8943], // Pospelovo
      [43.0620, 131.9060]  // Under Russian Bridge
    ] as [number, number][],
    duration: '1.5 часа',
    length: '12 км'
  },
  {
    id: 'novik-starck',
    name: '🏝️ Бухта Новик — о. Шкота',
    points: [
      [43.0375, 131.8361], // Novik Pt
      [43.0030, 131.8120], // Stark Passage
      [42.9430, 131.8350]  // Shkota island cape
    ] as [number, number][],
    duration: '3 часа',
    length: '24 км'
  },
  {
    id: 'lighthouse-tour',
    name: '🧭 Маяки залива Босфор Восточный',
    points: [
      [43.0739, 131.8431], // Tokarevsky Light
      [43.0580, 131.8000], // Amursky bay
      [43.0110, 131.8900], // Basargin lighthouse
      [43.1155, 131.8900]  // Golden Horn return
    ] as [number, number][],
    duration: '2.5 часа',
    length: '20 км'
  }
];

export default function SecurityAndTrackingPanel({
  vessels,
  selectedVessel,
  onSelectVessel,
  onSetCustomRoute,
  onSetPickupPoint,
  currentRoutePoints,
  currentPickupPoint,
  activeRole: parentRole,
  onRoleChange
}: SecurityAndTrackingPanelProps) {
  // Local role backup if not supplied by parent
  const [localRole, setLocalRole] = useState<'client' | 'captain' | 'partner'>('client');
  const authRole = parentRole || localRole;
  const { lang, t } = useTranslation();
  const { projectLine } = useProjectLine();
  
  const handleRoleToggle = (role: 'client' | 'captain' | 'partner') => {
    if (onRoleChange) {
      onRoleChange(role);
    } else {
      setLocalRole(role);
    }
  };

  // Active Mode for Auth / Security directly mapped to selected language:
  // 'ru' for Russian (Mode 1), 'intl' for English/International (Mode 2), 'cn' for Chinese (Mode 3)
  const activeAuthTabMode: 'ru' | 'intl' | 'cn' = lang === 'ru' ? 'ru' : (lang === 'zh' || lang === 'zh-TW') ? 'cn' : 'intl';

  // Interactive Form Inputs
  const [phoneInput, setPhoneInput] = useState('+7 (902) 555-12-34');
  const [smsCodeInput, setSmsCodeInput] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [emailInput, setEmailInput] = useState('evgeny@yandex.ru');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Messenger Integrations
  const [maxConnected, setMaxConnected] = useState(true);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [wechatConnected, setWechatConnected] = useState(false);

  // Method Tab inside mode (phone, sso, email)
  const [authMethod, setAuthMethod] = useState<'phone' | 'sso' | 'email'>('phone');

  // Russian Email Domain Validator
  const isRussianEmail = (email: string) => {
    if (!email || !email.includes('@')) return true;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return true;
    const ruDomains = [
      'yandex.ru', 'ya.ru', 'yandex.com', 'mail.ru', 'bk.ru', 'inbox.ru',
      'list.ru', 'rambler.ru', 'internet.ru', 'sber.ru', 'sberbank.ru',
      'lenta.ru', 'autorub.ru', 'vk.com'
    ];
    return ruDomains.some(d => domain === d || domain.endsWith('.ru'));
  };

  const [incognitoMode, setIncognitoMode] = useState<boolean>(true); // Default to on for passengers
  const [yandexConnected, setYandexConnected] = useState<boolean>(false);
  const [isTransmittingGPS, setIsTransmittingGPS] = useState<boolean>(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  
  // Custom navigation pickup coords form
  const [customLat, setCustomLat] = useState<string>('43.0645');
  const [customLon, setCustomLon] = useState<string>('131.8943');

  // Favorites routes storage
  const [savedRoutes, setSavedRoutes] = useState<{ name: string; points: [number, number][] }[]>([
    {
      name: '❤️ Избранный: Мой семейный круиз',
      points: [[43.0375, 131.8361], [43.0620, 131.9060]]
    }
  ]);
  const [routeNameInput, setRouteNameInput] = useState<string>('');

  // Captain Yandex-style onboarding wizard states
  const [captainStep, setCaptainStep] = useState<number>(1);
  const [captainVerified, setCaptainVerified] = useState<boolean>(false);
  const [captainDocs, setCaptainDocs] = useState({
    fullName: '',
    phone: '',
    passportNum: '',
    gimsLicense: '',
    boatRegNum: '',
    hasLifeJackets: false,
    hasFirstAid: false,
    hasRadio: false,
    uploadedSelfie: false,
    uploadedGims: false,
    uploadedTicket: false,
    taxType: 'self_employed'
  });

  // Sharing states
  const [shareType, setShareType] = useState<'public' | 'private'>('private');

  // Toast confirmation state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // GPS logs simulator for Captain
  useEffect(() => {
    let logInterval: NodeJS.Timeout;
    if (isTransmittingGPS) {
      setSimulatedLogs([
        `[${new Date().toLocaleTimeString()}] 📡 Инициализация GPS-модема...`,
        `[${new Date().toLocaleTimeString()}] 🛰️ Соединение с ГЛОНАСС/GPS спутниками установлено. (Точность 2.8м)`
      ]);

      logInterval = setInterval(() => {
        const timeStr = new Date().toLocaleTimeString();
        const randLatDelta = (Math.random() - 0.5) * 0.0005;
        const randLonDelta = (Math.random() - 0.5) * 0.0005;
        const speed = (10 + Math.random() * 5).toFixed(1);
        const heading = Math.floor(Math.random() * 360);
        
        setSimulatedLogs(prev => [
          `[${timeStr}] 🛰️ TX: ${speed} knt | HDG: ${heading}° | SAT: 11 | OK`,
          ...prev.slice(0, 5)
        ]);
      }, 3000);
    } else {
      setSimulatedLogs([]);
    }
    return () => {
      if (logInterval) clearInterval(logInterval);
    };
  }, [isTransmittingGPS]);

  // Captain GPS simulator coordinates shifting
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isTransmittingGPS && selectedVessel) {
      let step = 0;
      const baseLat = selectedVessel.latLon[0];
      const baseLon = selectedVessel.latLon[1];

      intervalId = setInterval(() => {
        step += 1;
        const deltaLat = Math.sin(step * 0.15) * 0.002;
        const deltaLon = Math.cos(step * 0.15) * 0.002;
        
        const updatedVessel = {
          ...selectedVessel,
          latLon: [baseLat + deltaLat, baseLon + deltaLon] as [number, number],
          isLive: true
        };
        onSelectVessel(updatedVessel);
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTransmittingGPS, selectedVessel]);

  // Connect Yandex ID simulation
  const handleConnectYandexID = () => {
    setYandexConnected(true);
    setCaptainDocs(prev => ({
      ...prev,
      fullName: projectLine === 'ru' ? 'Воронов Владислав Игоревич' : projectLine === 'cn' ? '王伟 (Wang Wei)' : 'Alex Vance',
      phone: projectLine === 'ru' ? '+7 (914) 703-XX-XX' : projectLine === 'cn' ? '+86 138-XXXX-XXXX' : '+1 (555) 303-XXXX'
    }));
    
    if (projectLine === 'ru') {
      triggerToast('⚡ Авторизация через Яндекс ID выполнена успешно. Профиль привязан к Единой Системе!');
    } else if (projectLine === 'cn') {
      triggerToast('⚡ 微信登录绑定成功！微信小程序及WeChat Pay同步已激活。');
    } else {
      triggerToast('⚡ Google Workspace Integration complete! Safe maritime logs configured.');
    }
  };

  // Send Pick-up Pin
  const handleSendPickupPoint = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      onSetPickupPoint({
        latLon: [lat, lon],
        type: 'pickup'
      });
      triggerToast('📍 Координаты точки подачи успешно отправлены капитану и спроецированы на карту.');
    }
  };

  // Get current browser coordinates
  const handleGetGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCustomLat(lat.toFixed(5));
          setCustomLon(lon.toFixed(5));
          onSetPickupPoint({
            latLon: [lat, lon],
            type: 'pickup'
          });
          triggerToast('📍 Координаты вашего устройства получены с точностью до 10 метров!');
        },
        () => {
          // Fallback to Golden Horn
          setCustomLat('43.1155');
          setCustomLon('131.8900');
          triggerToast('⚠️ Ошибка геолокации. Установлены координаты центра бухты Золотой Рог.');
        }
      );
    } else {
      triggerToast('❌ Браузер не поддерживает определение координат.');
    }
  };

  // Save drawn route to favorites
  const handleSaveRoute = () => {
    if (currentRoutePoints.length === 0) {
      triggerToast('❌ Сначала нарисуйте или выберите маршрут!');
      return;
    }
    const name = routeNameInput.trim() || `🗺️ Маршрут #${savedRoutes.length + 1} (${currentRoutePoints.length} точ.)`;
    setSavedRoutes([...savedRoutes, { name, points: currentRoutePoints }]);
    setRouteNameInput('');
    triggerToast('⭐ Маршрут успешно добавлен в ваше Избранное на JIV!');
  };

  // Export functions generating real formatted XML/JSON files
  const downloadRouteFile = (format: 'gpx' | 'kml' | 'geojson') => {
    if (currentRoutePoints.length === 0) {
      triggerToast('❌ Нет активных точек для экспорта маршрута!');
      return;
    }

    let fileContent = '';
    let fileName = `jiv_route_${new Date().toISOString().slice(0,10)}`;
    let mimeType = 'text/plain';

    if (format === 'gpx') {
      const trkpts = currentRoutePoints.map(pt => `      <trkpt lat="${pt[0]}" lon="${pt[1]}"><time>${new Date().toISOString()}</time></trkpt>`).join('\n');
      fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="JIV Vladivostok" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>JIV Маршрут</name>
    <desc>Записанный морской прогулочный переход во Владивостоке</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>JIV Marine Walk</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
      fileName += '.gpx';
      mimeType = 'application/gpx+xml';
    } else if (format === 'kml') {
      const coordinates = currentRoutePoints.map(pt => `${pt[1]},${pt[0]},0`).join(' ');
      fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Морской маршрут JIV</name>
    <description>Сгенерировано в приложении Journey In Vladivostok</description>
    <Placemark>
      <name>Траектория пути</name>
      <LineString>
        <coordinates>${coordinates}</coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;
      fileName += '.kml';
      mimeType = 'application/vnd.google-earth.kml+xml';
    } else {
      const coordinates = currentRoutePoints.map(pt => [pt[1], pt[0]]);
      fileContent = JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "JIV Маршрут",
              description: "Экспортировано для навигатора"
            },
            geometry: {
              type: "LineString",
              coordinates: coordinates
            }
          }
        ]
      }, null, 2);
      fileName += '.geojson';
      mimeType = 'application/geo+json';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(`📥 Файл ${fileName.toUpperCase()} успешно сгенерирован и загружен!`);
  };

  // Handle Captain wizard steps
  const nextCaptainStep = () => {
    if (captainStep < 5) {
      setCaptainStep(captainStep + 1);
    } else {
      setCaptainVerified(true);
      triggerToast('🎉 Поздравляем! Верификация пройдена. Вашему судну присвоен статус «Проверен ГИМС и Яндекс Про»!');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in" id="auth-dashboard-container">
      {/* Control panel card */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-6 space-y-6 shadow-2xl relative overflow-hidden" id="security-control-left-card">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{t('subtitle', 'auth')}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t('title', 'auth')}</h2>
          </div>
        </div>

        {/* Toast notifications inside card */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/35 text-emerald-300 text-xs font-mono flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Three Auth Roles selectors */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
            {t('role_label', 'auth')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="verification-role-toggle">
            <button
              onClick={() => handleRoleToggle('client')}
              id="role-client-btn"
              type="button"
              className={`flex items-center justify-start gap-3 p-3 rounded-xl text-xs font-bold transition-all border ${
                authRole === 'client'
                  ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900 text-cyan-400 border-cyan-500/50 shadow-inner'
                  : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <span className="block font-bold text-sm">{t('role_client', 'auth')}</span>
                <span className="text-[9px] font-mono text-slate-400">
                  {lang === 'ru' ? 'Бесплатно (с рекламой)' : lang === 'zh' || lang === 'zh-TW' ? '免费 (含赞助)' : 'Free (Ad-supported)'}
                </span>
              </div>
            </button>

            <button
              onClick={() => handleRoleToggle('captain')}
              id="role-captain-btn"
              type="button"
              className={`flex items-center justify-start gap-3 p-3 rounded-xl text-xs font-bold transition-all border ${
                authRole === 'captain'
                  ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 text-emerald-400 border-emerald-500/50 shadow-inner'
                  : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Anchor className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <span className="block font-bold text-sm">{t('role_captain', 'auth')}</span>
                <span className="text-[9px] font-mono text-slate-400">
                  {lang === 'ru' ? 'Продвижение судна' : lang === 'zh' || lang === 'zh-TW' ? '船东与航道' : 'Shipowner / Listing'}
                </span>
              </div>
            </button>

            <button
              onClick={() => handleRoleToggle('partner')}
              id="role-partner-btn"
              type="button"
              className={`flex items-center justify-start gap-3 p-3 rounded-xl text-xs font-bold transition-all border ${
                authRole === 'partner'
                  ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 text-amber-400 border-amber-500/50 shadow-inner'
                  : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <div className="text-left">
                <span className="block font-bold text-sm">
                  {lang === 'ru' ? 'Мостик Партнёра' : lang === 'zh' || lang === 'zh-TW' ? '合作伙伴中心' : 'Partner Hub'}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {lang === 'ru' ? 'Рекламодатель ОРД' : lang === 'zh' || lang === 'zh-TW' ? '赞助与广告投放' : 'Advertiser & B2B'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* PASSENGER & CAPTAIN LOGIN OPTIONS (AUTOMATICALLY ADAPTED BY SELECTED LANGUAGE) */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-4" id="mode-specific-auth-card">
          
          {/* MODE 1: RUSSIAN MODE (AUTOMATIC FOR RU LANGUAGE) */}
          {activeAuthTabMode === 'ru' && (
            <div className="space-y-4 animate-fade-in">
              {/* Sub-tabs for Russian auth methods */}
              <div className="flex rounded-lg bg-slate-950 p-1 border border-white/5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${authMethod === 'phone' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  📱 Телефон + СМС
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('sso')}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${authMethod === 'sso' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  🔴 Яндекс ID
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${authMethod === 'email' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  ✉️ Почта РФ
                </button>
              </div>

              {/* Phone + SMS Method */}
              {authMethod === 'phone' && (
                <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  <span className="text-[11px] font-mono text-slate-300 block">
                    Введите номер мобильного телефона операторов РФ (+7):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+7 (900) 000-00-00"
                      className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSmsSent(true);
                        triggerToast('📨 СМС с кодом подтверждения отправлено на номер ' + phoneInput + ' (Код: 4829)');
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold font-mono transition-all"
                    >
                      {smsSent ? 'Повторить' : 'Запросить СМС'}
                    </button>
                  </div>

                  {smsSent && (
                    <div className="space-y-2 pt-2 border-t border-white/5 animate-fade-in">
                      <span className="text-[10px] text-emerald-400 font-mono block">
                        ✓ СМС отправлено. Введите 4-значный код:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={smsCodeInput}
                          onChange={(e) => setSmsCodeInput(e.target.value)}
                          placeholder="4829"
                          className="w-28 bg-slate-900 border border-emerald-500/30 rounded-lg px-3 py-2 text-white font-mono text-center tracking-widest text-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsLoggedIn(true);
                            triggerToast('✅ Успешный вход по СМС! Данные защищены в контуре РФ.');
                          }}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold font-mono transition-all"
                        >
                          Подтвердить и Войти
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Yandex ID Method */}
              {authMethod === 'sso' && (
                <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Бесшовная авторизация в 1 клик через единый паспорт Яндекс ID.
                  </p>
                  <button
                    type="button"
                    onClick={handleConnectYandexID}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/10"
                  >
                    <span>🔴 Войти через Яндекс ID (Единый Паспорт)</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Email + Password Method with Strict Russian Domain Check */}
              {authMethod === 'email' && (
                <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 block">
                      Логин (Адрес электронной почты):
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="vladimir@yandex.ru"
                      className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white font-mono ${
                        !isRussianEmail(emailInput) ? 'border-red-500 text-red-200' : 'border-white/10'
                      }`}
                    />

                    {/* Strict Russian Domain Warning */}
                    {!isRussianEmail(emailInput) && (
                      <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] space-y-1">
                        <div className="font-bold flex items-center gap-1 text-red-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>Требуется почтовый клиент РФ</span>
                        </div>
                        <p className="text-[10px] text-red-300 leading-normal">
                          По закону РФ в этом контуре разрешена регистрация строго через адреса на российских почтовых сервисах (Яндекс @yandex.ru, Mail.ru @mail.ru, @bk.ru, @inbox.ru, Рамблер @rambler.ru) или выберите вход по СМС / Яндекс ID.
                        </p>
                      </div>
                    )}

                    <label className="text-[10px] font-mono text-slate-400 block pt-1">
                      Пароль:
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />

                    <button
                      type="button"
                      disabled={!isRussianEmail(emailInput)}
                      onClick={() => {
                        setIsLoggedIn(true);
                        triggerToast('✅ Успешная авторизация по почте РФ: ' + emailInput);
                      }}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold font-mono transition-all ${
                        isRussianEmail(emailInput)
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/10'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Войти с паролем
                    </button>
                  </div>
                </div>
              )}

              {/* Messenger Integration: MAX */}
              <div className="p-3 rounded-xl bg-slate-950 border border-red-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>💬 Национальный мессенджер МАХ</span>
                      <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono">
                        Интеграция
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Прием билетов, уведомлений и штормовых предупреждений в МАХ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMaxConnected(!maxConnected);
                      triggerToast(!maxConnected ? '💬 Мессенджер МАХ успешно подключен к профилю!' : 'Мессенджер МАХ отключен');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      maxConnected ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-900 text-slate-400 border border-white/5'
                    }`}
                  >
                    {maxConnected ? 'Подключен' : 'Подключить'}
                  </button>
                </div>
              </div>

              {/* Data Residency Badge */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-[10px] font-mono text-slate-400 space-y-1">
                <span className="text-slate-200 font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>Локализация персональных данных (ФЗ-152):</span>
                </span>
                <p className="text-slate-400 leading-normal">
                  📍 Все данные клиентов и капитанов хранятся строго на территории Российской Федерации в дата-центрах Yandex Cloud / SberCloud (Москва и Владивосток).
                </p>
              </div>
            </div>
          )}

          {/* MODE 2: INTERNATIONAL MODE (AUTOMATIC FOR EN LANGUAGE) */}
          {activeAuthTabMode === 'intl' && (
            <div className="space-y-4 animate-fade-in">
              {/* Sub-tabs for International auth methods */}
              <div className="flex rounded-lg bg-slate-950 p-1 border border-white/5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAuthMethod('sso')}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${authMethod === 'sso' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  🌐 Social / SSO
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${authMethod === 'phone' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  📱 Mobile SMS
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${authMethod === 'email' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  ✉️ Any Email
                </button>
              </div>

              {/* SSO Method */}
              {authMethod === 'sso' && (
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoggedIn(true);
                      triggerToast('🔵 Connected with Google OAuth account!');
                    }}
                    className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all"
                  >
                    <span>🔵 Sign in with Google Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoggedIn(true);
                      triggerToast('⚫ Signed in with Apple ID!');
                    }}
                    className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all"
                  >
                    <span>⚫ Sign in with Apple ID</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoggedIn(true);
                        triggerToast('🟡 Logged in via KakaoTalk!');
                      }}
                      className="py-2 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-mono font-bold"
                    >
                      🟡 KakaoTalk
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoggedIn(true);
                        triggerToast('🟢 Logged in via LINE!');
                      }}
                      className="py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold"
                    >
                      🟢 LINE Login
                    </button>
                  </div>
                </div>
              )}

              {/* Intl Phone Method */}
              {authMethod === 'phone' && (
                <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  <span className="text-[11px] font-mono text-slate-300 block">
                    International Mobile Number (SMS Verification):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue="+1 (555) 019-2834"
                      placeholder="+1 or +82 or +81..."
                      className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => triggerToast('📨 International SMS code dispatched via Twilio/AWS SNS.')}
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-slate-950 rounded-lg text-xs font-bold font-mono transition-all"
                    >
                      Send SMS
                    </button>
                  </div>
                </div>
              )}

              {/* Global Email Method */}
              {authMethod === 'email' && (
                <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  <span className="text-[11px] font-mono text-slate-300 block">
                    Email address (accepts any global provider: Gmail, Yahoo, Outlook, etc.):
                  </span>
                  <input
                    type="email"
                    defaultValue="tourist@gmail.com"
                    placeholder="user@domain.com"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <input
                    type="password"
                    defaultValue="••••••••"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoggedIn(true);
                      triggerToast('✅ Signed in with global email account.');
                    }}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-lg text-xs font-bold font-mono transition-all"
                  >
                    Sign In / Register
                  </button>
                </div>
              )}

              {/* Messenger Integration: Telegram */}
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>✈️ Telegram Bot Integration (@vladiwater_bot)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Receive instant booking tickets & real-time ETA pushes via Telegram
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTelegramConnected(!telegramConnected);
                      triggerToast(!telegramConnected ? '✈️ Connected to @vladiwater_bot on Telegram!' : 'Telegram disconnected');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      telegramConnected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 border border-white/5'
                    }`}
                  >
                    {telegramConnected ? 'Active' : 'Connect'}
                  </button>
                </div>
              </div>

              {/* Data Residency Badge */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-[10px] font-mono text-slate-400 space-y-1">
                <span className="text-slate-200 font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Global Data Residency (GDPR & CCPA):</span>
                </span>
                <p className="text-slate-400 leading-normal">
                  📍 International user data is stored on distributed AWS Europe/US & Cloudflare Edge infrastructure. Not restricted to Russian servers.
                </p>
              </div>
            </div>
          )}

          {/* MODE 3: CHINESE MODE (AUTOMATIC FOR ZH LANGUAGE) */}
          {activeAuthTabMode === 'cn' && (
            <div className="space-y-4 animate-fade-in">
              {/* Sub-tabs for Chinese auth methods */}
              <div className="flex rounded-lg bg-slate-950 p-1 border border-white/5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAuthMethod('sso')}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${authMethod === 'sso' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  🟢 微信一键登录
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${authMethod === 'phone' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  📱 +86 手机验证
                </button>
              </div>

              {/* WeChat & Alipay SSO Method */}
              {authMethod === 'sso' && (
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoggedIn(true);
                      setWechatConnected(true);
                      triggerToast('🟢 微信一键授权成功！已绑定微信开放平台账号。');
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
                  >
                    <span>🟢 微信账号一键授权登录 (WeChat OAuth)</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLoggedIn(true);
                      triggerToast('🔵 支付宝账号快速验证成功！');
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all"
                  >
                    <span>🔵 支付宝账号快捷验证 (Alipay ID)</span>
                  </button>
                </div>
              )}

              {/* Mainland Phone Method */}
              {authMethod === 'phone' && (
                <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  <span className="text-[11px] font-mono text-slate-300 block">
                    中国大陆手机号 (+86 短信验证码):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue="+86 139 1234 5678"
                      className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => triggerToast('📨 验证码已发送至您的中国大陆手机号。')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold font-mono transition-all"
                    >
                      获取验证码
                    </button>
                  </div>
                </div>
              )}

              {/* Messenger / MiniApp Integration: WeChat */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>💬 微信小程序与卡包 (WeChat MiniApp)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      同步电子包船凭证至微信卡包，并支持 WeChat Pay 快捷结算
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWechatConnected(!wechatConnected);
                      triggerToast(!wechatConnected ? '💬 已成功关联微信小程序卡包！' : '微信小程序连接已解除');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      wechatConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-white/5'
                    }`}
                  >
                    {wechatConnected ? '已绑定' : '绑定'}
                  </button>
                </div>
              </div>

              {/* Data Residency Badge */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-[10px] font-mono text-slate-400 space-y-1">
                <span className="text-slate-200 font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>数据存储与隐私合规 (PIPL):</span>
                </span>
                <p className="text-slate-400 leading-normal">
                  📍 中国游客信息存储于腾讯云/阿里云中国大陆及香港服务器网关，严格遵循《中华人民共和国个人信息保护法》(PIPL) 标准。
                </p>
              </div>
            </div>
          )}

          {/* Masking / Incognito switch */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <span>🕵️‍♂️ {t('incognito_title', 'auth')}</span>
              </span>
              <span className="text-[10px] text-slate-500 block">{t('incognito_desc', 'auth')}</span>
            </div>
            <button
              onClick={() => {
                setIncognitoMode(!incognitoMode);
                triggerToast(
                  !incognitoMode 
                    ? (lang === 'ru' ? '🔒 Режим инкогнито включен' : '🔒 Incognito mode activated')
                    : (lang === 'ru' ? '🔓 Режим инкогнито выключен' : '🔓 Incognito mode deactivated')
                );
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${incognitoMode ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'}`}
            >
              {incognitoMode ? (lang === 'ru' ? 'Активен' : 'Active') : (lang === 'ru' ? 'Включить' : 'Enable')}
            </button>
          </div>
        </div>

        {/* CAPTAIN BRANCH */}
        {authRole === 'captain' && (
          <div className="space-y-6" id="captain-panel-flow">
            {!captainVerified ? (
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-4" id="captain-verification-wizard">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      {projectLine === 'ru' && `Регистрация Капитана • Шаг ${captainStep} из 5`}
                      {projectLine === 'cn' && `船长资质审核 • 第 ${captainStep} / 5 步`}
                      {projectLine === 'intl' && `Captain Onboarding • Step ${captainStep} of 5`}
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono flex items-center gap-1">
                      <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                      {projectLine === 'ru' && 'Yandex.Pro Верификация'}
                      {projectLine === 'cn' && 'WeChat 联运身份核验'}
                      {projectLine === 'intl' && 'Google Workspace ID Validation'}
                    </span>
                  </div>

                  {captainStep === 1 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-cyan-400 block">
                        {projectLine === 'ru' ? '1. Личные данные и Паспорт' : projectLine === 'cn' ? '1. 个人身份证件核实' : '1. Personal ID Verification'}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {projectLine === 'ru' && 'Введите ФИО и паспортные данные гражданина РФ для проверки через Государственные системы ЕСИА.'}
                        {projectLine === 'cn' && '请输入您的姓名及中华人民共和国居民身份证/护照号，以通过边防港务电子核查系统。'}
                        {projectLine === 'intl' && 'Please input your full legal name and passport ID for verification with Maritime Safety agencies.'}
                      </p>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={projectLine === 'ru' ? 'ФИО Капитана (как в паспорте)' : projectLine === 'cn' ? '您的真实姓名' : 'Full legal name'}
                          value={captainDocs.fullName}
                          onChange={(e) => setCaptainDocs({...captainDocs, fullName: e.target.value})}
                          className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder={projectLine === 'ru' ? 'Серия и Номер Паспорта' : projectLine === 'cn' ? '身份证/护照号码' : 'Passport / ID Number'}
                            value={captainDocs.passportNum}
                            onChange={(e) => setCaptainDocs({...captainDocs, passportNum: e.target.value})}
                            className="bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            placeholder={projectLine === 'ru' ? 'ИНН или СНИЛС' : projectLine === 'cn' ? '社会统一信用代码/其他' : 'Tax ID or SSN'}
                            className="bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-950 text-[10px] text-slate-500 font-mono">
                        {projectLine === 'ru' && '🔒 Данные шифруются по стандарту ГОСТ Р 34.12 и защищены ФЗ-152 о персональных данных.'}
                        {projectLine === 'cn' && '🔒 信息采用符合《个人信息保护法》(PIPL) 加密标准传输，完全保密。'}
                        {projectLine === 'intl' && '🔒 Data encrypted via TLS 1.3 standards, fully compliant with EU GDPR and CCPA guidelines.'}
                      </div>
                    </div>
                  )}

                  {captainStep === 2 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-cyan-400 block">
                        {projectLine === 'ru' ? '2. Удостоверение ГИМС (Лицензия)' : projectLine === 'cn' ? '2. 船长执照 (MSA 资质证书)' : '2. Captain License (IMO / USCG / MCA)'}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {projectLine === 'ru' && 'Прикрепите фото прав маломерного судна. Срок действия прав ГИМС в РФ составляет 10 лет.'}
                        {projectLine === 'cn' && '请上传您的海事局小船驾驶执照或适任证书。GIMS/MSA 资质审核。'}
                        {projectLine === 'intl' && 'Please upload your maritime vessel skipper certification or international master pilot license.'}
                      </p>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={
                            projectLine === 'ru' ? 'Номер удостоверения ГИМС МЧС РФ' :
                            projectLine === 'cn' ? '海事局适任证书编号' :
                            'USCG / MCA / IMO License Number'
                          }
                          value={captainDocs.gimsLicense}
                          onChange={(e) => setCaptainDocs({...captainDocs, gimsLicense: e.target.value})}
                          className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-white font-mono"
                        />
                        
                        <div className="flex items-center gap-3">
                          <label className={`flex-1 py-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            captainDocs.uploadedGims ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-dashed border-white/10 text-slate-400 hover:text-white'
                          }`}>
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {captainDocs.uploadedGims 
                                ? (projectLine === 'cn' ? '✓ 上传成功' : '✓ Загружено') 
                                : (projectLine === 'cn' ? '上传证书扫描件' : projectLine === 'intl' ? 'Upload license image' : 'Загрузить фото прав')
                              }
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  setCaptainDocs({...captainDocs, uploadedGims: true});
                                  triggerToast(
                                    projectLine === 'ru' ? '📁 Скан-копия удостоверения ГИМС успешно загружена.' :
                                    projectLine === 'cn' ? '📁 海事局船长执照扫描件已成功上传。' :
                                    '📁 Captain Yachtmaster license scanned and verified.'
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {captainStep === 3 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-cyan-400 block">
                        {projectLine === 'ru' ? '3. Судовой билет и Судно' : projectLine === 'cn' ? '3. 船舶国籍证书 / 船契' : '3. Vessel Registry & Hull ID'}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {projectLine === 'ru' && 'Каждое судно должно иметь государственный регистрационный номер РФ. Введите номер и загрузите судовой билет.'}
                        {projectLine === 'cn' && '所有运营船只必须具备合法的船只登记号，并在有效期内。请输入编号并上传船舶登记证书照片。'}
                        {projectLine === 'intl' && 'Each yacht must hold an official registry and dynamic Hull Identification Number (HIN).'}
                      </p>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={
                            projectLine === 'ru' ? 'Бортовой номер (например, Р 12-34 ВЛ)' :
                            projectLine === 'cn' ? '船身侧号/登记号 (如: 粤番 12345)' :
                            'Vessel Registration ID (e.g. US-HIN-12345)'
                          }
                          value={captainDocs.boatRegNum}
                          onChange={(e) => setCaptainDocs({...captainDocs, boatRegNum: e.target.value})}
                          className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-white font-mono"
                        />

                        <label className={`w-full py-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          captainDocs.uploadedTicket ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-dashed border-white/10 text-slate-400 hover:text-white'
                        }`}>
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {captainDocs.uploadedTicket 
                              ? (projectLine === 'cn' ? '✓ 船舶证书已导入' : '✓ Билет загружен') 
                              : (projectLine === 'cn' ? '上传船舶证书照片' : projectLine === 'intl' ? 'Upload registration copy' : 'Загрузить судовой билет')
                            }
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setCaptainDocs({...captainDocs, uploadedTicket: true});
                                triggerToast(
                                  projectLine === 'ru' ? '📁 Судовой билет МЧС загружен в базу.' :
                                  projectLine === 'cn' ? '📁 船舶登记证书已保存至港口数据库。' :
                                  '📁 Maritime vessel registration certificate logged and secured.'
                                );
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {captainStep === 4 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-cyan-400 block">
                        {lang === 'ru' ? '4. Обязательный фотоконтроль безопасности' : lang === 'en' ? '4. Mandatory Safety Photo Inspection' : '4. 强制性安全照相检查'}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {lang === 'ru'
                          ? 'Перед каждым выходом в море капитан обязан подтвердить наличие спасательного оборудования (стандарт Яндекс.Про).'
                          : lang === 'en'
                          ? 'Before each departure, the captain must confirm onboard life-saving equipment (Yandex.Pro standard).'
                          : '每次出海前，船长必须确认船上救生设备齐全（遵循 Yandex.Pro 标准）。'}
                      </p>

                      <div className="space-y-2 text-xs text-slate-300">
                        <label className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-white/5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={captainDocs.hasLifeJackets}
                            onChange={(e) => setCaptainDocs({...captainDocs, hasLifeJackets: e.target.checked})}
                            className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-white/10"
                          />
                          <span>{lang === 'ru' ? 'Спасательные жилеты по количеству пассажиров' : lang === 'en' ? 'Life jackets matching passenger count' : '匹配乘客人数的救生衣'}</span>
                        </label>
                        <label className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-white/5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={captainDocs.hasFirstAid}
                            onChange={(e) => setCaptainDocs({...captainDocs, hasFirstAid: e.target.checked})}
                            className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-white/10"
                          />
                          <span>{lang === 'ru' ? 'Комплект первой мед. помощи и аптечка ГИМС' : lang === 'en' ? 'First aid kit and maritime medical box' : '急救箱和水上医疗救护包'}</span>
                        </label>
                        <label className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-white/5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={captainDocs.hasRadio}
                            onChange={(e) => setCaptainDocs({...captainDocs, hasRadio: e.target.checked})}
                            className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-white/10"
                          />
                          <span>{lang === 'ru' ? 'Радиостанция УКВ диапазона морская' : lang === 'en' ? 'Marine VHF radio transceiver' : '对讲与海洋VHF无线电台'}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {captainStep === 5 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-cyan-400 block">
                        {lang === 'ru' ? '5. Проверка Биометрии и Налоги' : lang === 'en' ? '5. Biometric Selfie & Tax Profile' : '5. 人脸生物识别与税务类型'}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {lang === 'ru'
                          ? 'Сделайте селфи на веб-камеру вашего устройства для сверки лица с фотографией в паспорте. Укажите форму налогообложения.'
                          : lang === 'en'
                          ? 'Take a webcam selfie to match your passport photo. Select your business tax classification.'
                          : '请使用摄像头拍摄自拍，以与护照照片进行人脸比对。请选择您的纳税人类型。'}
                      </p>

                      <div className="space-y-3">
                        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5 text-[10px] font-mono">
                          <button
                            onClick={() => setCaptainDocs({...captainDocs, taxType: 'self_employed'})}
                            className={`flex-1 py-1.5 rounded text-center ${captainDocs.taxType === 'self_employed' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-500'}`}
                          >
                            {lang === 'ru' ? 'Самозанятый (Мой Налог)' : lang === 'en' ? 'Self-Employed' : '个体/自由职业'}
                          </button>
                          <button
                            onClick={() => setCaptainDocs({...captainDocs, taxType: 'ip'})}
                            className={`flex-1 py-1.5 rounded text-center ${captainDocs.taxType === 'ip' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-500'}`}
                          >
                            {lang === 'ru' ? 'ИП / ООО' : lang === 'en' ? 'Registered Business / LLC' : '企业/公司账户'}
                          </button>
                        </div>

                        <label className={`w-full py-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          captainDocs.uploadedSelfie ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-dashed border-white/10 text-slate-400 hover:text-white'
                        }`}>
                          <User className="w-3.5 h-3.5" />
                          <span>
                            {captainDocs.uploadedSelfie 
                              ? (lang === 'ru' ? '✓ Селфи подтверждено' : lang === 'en' ? '✓ Selfie Verified' : '✓ 自拍验证成功') 
                              : (lang === 'ru' ? 'Пройти Фотоконтроль / Сделать Селфи' : lang === 'en' ? 'Take Facial Verification' : '进行人脸安全比对')}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setCaptainDocs({...captainDocs, uploadedSelfie: true});
                                triggerToast(lang === 'ru' ? '📸 Фотоконтроль пройден успешно! Лицо совпадает на 98.4%.' : lang === 'en' ? '📸 Biometric check passed! Face match 98.4%.' : '📸 生物识别通过！面部匹配度98.4%');
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={nextCaptainStep}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold flex items-center gap-1"
                    >
                      <span>{captainStep === 5 ? (lang === 'ru' ? 'Завершить проверку' : lang === 'en' ? 'Finish Inspection' : '完成验证') : (lang === 'ru' ? 'Далее' : lang === 'en' ? 'Next' : '下一步')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-emerald-500/20 space-y-4" id="captain-active-dash">
                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'ru' ? 'Кабинет верифицирован' : lang === 'en' ? 'Account Verified' : '账户已实名认证'}</span>
                    </span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      {lang === 'ru' ? 'АКТИВЕН В ЯНДЕКС.ПРО' : lang === 'en' ? 'ACTIVE IN YANDEX.PRO' : '已入驻 YANDEX.PRO'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {lang === 'ru'
                      ? 'Ваш аккаунт полностью синхронизирован с реестром маломерных судов МЧС ГИМС. Доступна автоматическая печать судовых деклараций и договоров аренды.'
                      : lang === 'en'
                      ? 'Your account is fully synchronized with the state maritime vessel registry. Automated printing of charter declarations and lease contracts is available.'
                      : '您的账户已与海事小船登记库完全同步。可自动生成并打印包船申报单及租赁合同。'}
                  </p>

                  <div className="p-3 bg-slate-950 rounded-lg border border-white/5 space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">{lang === 'ru' ? 'Мои верифицированные лицензии:' : lang === 'en' ? 'Verified Maritime Licenses:' : '已核验的海事执照：'}</span>
                    <ul className="text-[10px] font-mono text-slate-400 space-y-1">
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> {lang === 'ru' ? 'Удостоверение ГИМС: №79АВ001234' : lang === 'en' ? 'GIMS License: #79AB001234' : '海事驾驶执照：№79АВ001234'}</li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> {lang === 'ru' ? 'Судовой билет: Р 09-12 ВЛ (проверен)' : lang === 'en' ? 'Vessel Ticket: R 09-12 VL (Verified)' : '船舶执照：Р 09-12 ВЛ（已核验）'}</li>
                    </ul>
                  </div>

                  {/* GPS Transmitter Toggle (Strict) */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">{lang === 'ru' ? 'GPS/ГЛОНАСС Мониторинг' : lang === 'en' ? 'GPS/GLONASS Monitoring' : 'GPS/格洛纳斯实时监控'}</span>
                        <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'Трансляция координат судна на карты Яндекса' : lang === 'en' ? 'Broadcasting live vessel coordinates on Yandex Maps' : '在地图上实时广播船舶坐标'}</span>
                      </div>
                      
                      <button
                        onClick={() => setIsTransmittingGPS(!isTransmittingGPS)}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          isTransmittingGPS
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                            : 'bg-slate-900 text-slate-500 border-white/5'
                        }`}
                      >
                        {isTransmittingGPS ? (lang === 'ru' ? 'ПЕРЕДАЧА...' : lang === 'en' ? 'TRANSMITTING...' : '正在广播...') : (lang === 'ru' ? 'ВКЛЮЧИТЬ' : lang === 'en' ? 'ENABLE' : '开启')}
                      </button>
                    </div>

                    {/* Sim logs console */}
                    {isTransmittingGPS && simulatedLogs.length > 0 && (
                      <div className="p-2.5 rounded bg-black border border-white/5 font-mono text-[9px] text-emerald-500/90 h-24 overflow-y-auto space-y-1 select-none">
                        {simulatedLogs.map((log, index) => (
                          <div key={index} className="truncate">{log}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* EMERGENCY SCARY SIGNAL (SOS) - STRICTLY IN CAPTAIN VIEW ONLY */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-3" id="captain-sos-panel">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                      <span className="text-xs font-bold font-mono uppercase tracking-wider">{lang === 'ru' ? 'Красная Кнопка ГИМС МЧС (SOS)' : lang === 'en' ? 'Emergency SOS Beacon' : '海事紧急求救 (SOS)'}</span>
                    </div>
                    <p className="text-[10px] text-rose-300 leading-normal">
                      {lang === 'ru' 
                        ? 'Активация этого сигнала отправляет мгновенную эвакуационную команду береговой охране Владивостока с точными координатами ГЛОНАСС. Используйте только при реальной угрозе затопления или крушения!'
                        : lang === 'en'
                        ? 'Activating this signal dispatches an immediate coast guard rescue team with precise GLONASS coordinates. Use strictly during life-threatening maritime distress!'
                        : '触发此信号将携带精确的GLONASS坐标向海岸警卫队发送紧急救援指令。请仅在真正发生海上危机时使用！'}
                    </p>
                    
                    <button
                      onClick={() => {
                        onSetPickupPoint({
                          latLon: selectedVessel ? selectedVessel.latLon : [43.0645, 131.8943],
                          type: 'evac'
                        });
                        triggerToast(lang === 'ru' ? '🚨 МГНОВЕННЫЙ СИГНАЛ БЕДСТВИЯ SOS ОТПРАВЛЕН В ГИМС МЧС РФ!' : lang === 'en' ? '🚨 EMERGENCY SOS DISTRESS SIGNAL SENT TO COAST GUARD!' : '🚨 紧急SOS求救信号已发送至海事部门！');
                      }}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-mono transition-all shadow-lg shadow-rose-500/20"
                    >
                      {lang === 'ru' ? 'АКТИВИРОВАТЬ ЭКСТРЕННУЮ SOS-ЭВАКУАЦИЮ' : lang === 'en' ? 'ACTIVATE EMERGENCY SOS RESCUE' : '触发紧急SOS求救'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setCaptainVerified(false);
                      setCaptainStep(1);
                    }}
                    className="text-slate-500 hover:text-slate-300 text-[10px] font-mono block mx-auto text-center hover:underline"
                  >
                    {lang === 'ru' ? 'Изменить регистрационные данные / документы' : lang === 'en' ? 'Edit Registration Credentials / Documents' : '修改登记资料 / 证明'}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
  );
}
