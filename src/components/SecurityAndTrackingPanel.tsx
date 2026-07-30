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
  AlertCircle,
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
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-amber-500/30 space-y-4" id="captain-active-dash">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Anchor className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'ru' ? 'Аккаунт Капитана' : 'Captain Account'}</span>
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    {lang === 'ru'
                      ? 'Авторизация Капитана выполнена. Вы можете свободно публиковать объявления и управлять флотом.'
                      : 'Captain signed in successfully. You can freely publish listings and manage your fleet.'}
                  </p>
                </div>

                {captainVerified ? (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {lang === 'ru' ? 'ПОДТВЕРЖДЁННАЯ КВАЛИФИКАЦИЯ' : 'VERIFIED QUALIFICATION'}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    {lang === 'ru' ? 'ДОБРОВОЛЬНАЯ ПРОВЕРКА' : 'OPTIONAL VERIFICATION'}
                  </span>
                )}
              </div>

              {/* Voluntary Verification Highlight */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'ru' ? 'Добровольная проверка документов' : 'Voluntary Document Verification'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptainVerified(!captainVerified);
                      triggerToast(
                        !captainVerified
                          ? (lang === 'ru' ? '✨ Статус «Подтверждённая квалификация» присвоен! Ваши объявления получили золотой бейдж.' : '✨ Status "Verified Qualification" granted!')
                          : (lang === 'ru' ? 'Статус верификации изменен.' : 'Verification status updated.')
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                      captainVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{captainVerified ? (lang === 'ru' ? '✓ Подтверждена' : '✓ Verified') : (lang === 'ru' ? 'Пройти проверку' : 'Pass Check')}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">
                  {lang === 'ru'
                    ? '💡 Отсутствие верификации НЕ мешает публикации объявлений. Однако её наличие добавляет знак «Подтверждённая квалификация» на ваши объявления и поднимает их в ТОП поисковой выдачи.'
                    : '💡 Verification is strictly optional. Having it adds a "Verified Qualification" badge and boosts your listings to the top of search.'}
                </p>

                {captainVerified && (
                  <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-emerald-400 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'ru' ? 'Удостоверение ГИМС МЧС и Судовой билет верифицированы' : 'GIMS License and Vessel Ticket verified'}</span>
                  </div>
                )}
              </div>

              {/* GPS Transmitter Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{lang === 'ru' ? 'GPS/ГЛОНАСС Мониторинг' : 'GPS/GLONASS Monitoring'}</span>
                    <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'Трансляция координат судна на карты' : 'Broadcasting live vessel coordinates on map'}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsTransmittingGPS(!isTransmittingGPS)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      isTransmittingGPS
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                        : 'bg-slate-900 text-slate-500 border-white/5'
                    }`}
                  >
                    {isTransmittingGPS ? (lang === 'ru' ? 'ПЕРЕДАЧА...' : 'TRANSMITTING...') : (lang === 'ru' ? 'ВКЛЮЧИТЬ' : 'ENABLE')}
                  </button>
                </div>

                {isTransmittingGPS && simulatedLogs.length > 0 && (
                  <div className="p-2.5 rounded bg-black border border-white/5 font-mono text-[9px] text-emerald-500/90 h-24 overflow-y-auto space-y-1 select-none">
                    {simulatedLogs.map((log, index) => (
                      <div key={index} className="truncate">{log}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* EMERGENCY SOS BUTTON */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-3" id="captain-sos-panel">
                <div className="flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">{lang === 'ru' ? 'Красная Кнопка ГИМС МЧС (SOS)' : 'Emergency SOS Beacon'}</span>
                </div>
                <p className="text-[10px] text-rose-300 leading-normal">
                  {lang === 'ru' 
                    ? 'Активация этого сигнала отправляет мгновенную эвакуационную команду береговой охране Владивостока с точными координатами ГЛОНАСС.'
                    : 'Activating this signal dispatches an immediate coast guard rescue team with GLONASS coordinates.'}
                </p>
                
                <button
                  type="button"
                  onClick={() => {
                    onSetPickupPoint({
                      latLon: selectedVessel ? selectedVessel.latLon : [43.0645, 131.8943],
                      type: 'evac'
                    });
                    triggerToast(lang === 'ru' ? '🚨 СИГНАЛ БЕДСТВИЯ SOS ОТПРАВЛЕН В ГИМС МЧС РФ!' : '🚨 SOS DISTRESS SIGNAL SENT TO COAST GUARD!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-mono transition-all shadow-lg shadow-rose-500/20"
                >
                  {lang === 'ru' ? 'АКТИВИРОВАТЬ ЭКСТРЕННУЮ SOS-ЭВАКУАЦИЮ' : 'ACTIVATE EMERGENCY SOS RESCUE'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onRoleChange) onRoleChange('captain');
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
              >
                <Anchor className="w-4 h-4" />
                <span>{lang === 'ru' ? 'Открыть Мостик Капитана' : 'Open Captain Bridge'}</span>
              </button>
            </div>
          </div>
        )}

        </div>
      </div>
  );
}
