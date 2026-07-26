import React, { useState, useEffect } from 'react';
import { Vessel, WeatherCondition } from '../types';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  Sparkles, 
  Waves, 
  Send, 
  CheckCircle, 
  X,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface SeaTaxiPanelProps {
  vessels: Vessel[];
  setVessels: React.Dispatch<React.SetStateAction<Vessel[]>>;
  weather: WeatherCondition;
  onSuccessBooking: (details: any) => void;
}

interface TaxiLocation {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  latLon: [number, number];
}

export default function SeaTaxiPanel({ vessels, setVessels, weather, onSuccessBooking }: SeaTaxiPanelProps) {
  const { lang, t } = useTranslation();

  // --- Pickup Points ---
  const pickupLocations: TaxiLocation[] = [
    { id: 'tokarevsky', name: lang === 'ru' ? 'Эгершельд (Токаревский маяк)' : lang === 'en' ? 'Egersheld (Tokarevsky Lighthouse)' : '埃格尔舍尔德（托卡列夫斯基灯塔）', coordinates: { x: 31, y: 57 }, latLon: [43.0722, 131.8415] },
    { id: 'zmeinka', name: lang === 'ru' ? 'Бухта Змеинка (пирс)' : lang === 'en' ? 'Zmeinka Bay (pier)' : '兹梅因卡湾（码头）', coordinates: { x: 56, y: 49 }, latLon: [43.0872, 131.9135] },
    { id: 'diomid', name: lang === 'ru' ? 'Бухта Диомид (набережная)' : lang === 'en' ? 'Diomid Bay (embankment)' : '迪奥米德湾（滨海路）', coordinates: { x: 62, y: 45 }, latLon: [43.0850, 131.9250] },
    { id: 'pospelovo', name: lang === 'ru' ? 'о. Русский (Поспелово)' : lang === 'en' ? 'Russky Island (Pospelovo)' : '俄罗斯岛（波斯佩洛沃）', coordinates: { x: 48, y: 47 }, latLon: [43.0645, 131.8954] },
    { id: 'canal', name: lang === 'ru' ? 'о. Русский (Канал)' : lang === 'en' ? 'Russky Island (Canal)' : '俄罗斯岛（运河）', coordinates: { x: 45, y: 62 }, latLon: [43.0232, 131.8624] }
  ];

  // --- Destinations ---
  const destinationLocations: TaxiLocation[] = [
    { id: 'popova', name: lang === 'ru' ? 'о. Попова (пролив Старка)' : lang === 'en' ? 'Popov Island (Stark Strait)' : '波波夫岛（斯塔克海峡）', coordinates: { x: 25, y: 88 }, latLon: [42.9620, 131.7240] },
    { id: 'reineke', name: lang === 'ru' ? 'о. Рейнеке (причал)' : lang === 'en' ? 'Reineke Island (pier)' : '雷内克岛（码头）', coordinates: { x: 20, y: 95 }, latLon: [42.9150, 131.7110] },
    { id: 'rikorda', name: lang === 'ru' ? 'о. Рикорда (песчаная коса)' : lang === 'en' ? 'Rikord Island (sand spit)' : '里科达岛（沙嘴）', coordinates: { x: 10, y: 99 }, latLon: [42.8710, 131.6210] },
    { id: 'novik_rest', name: lang === 'ru' ? 'бухта Новик (Яхт-клуб)' : lang === 'en' ? 'Novik Bay (Yacht Club)' : '诺维克湾（游艇俱乐部）', coordinates: { x: 42, y: 69 }, latLon: [43.0031, 131.8385] },
    { id: 'zolotoy_rog', name: lang === 'ru' ? 'Бухта Золотой Рог (центр)' : lang === 'en' ? 'Golden Horn Bay (center)' : '金角湾（中心）', coordinates: { x: 53, y: 38 }, latLon: [43.1150, 131.8980] }
  ];

  // --- Form State ---
  const [selectedPickup, setSelectedPickup] = useState<string>('tokarevsky');
  const [selectedDest, setSelectedDest] = useState<string>('popova');
  const [passengers, setPassengers] = useState<number>(4);
  const [taxiType, setTaxiType] = useState<'budget' | 'comfort'>('budget');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');

  // --- Simulation States ---
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchStep, setSearchStep] = useState<number>(0);
  const [foundTaxi, setFoundTaxi] = useState<Vessel | null>(null);
  const [eta, setEta] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  // --- Telegram / Websocket Trigger states ---
  const [showTelegramToast, setShowTelegramToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Get active pickup and destination
  const pickupObj = pickupLocations.find(l => l.id === selectedPickup) || pickupLocations[0];
  const destObj = destinationLocations.find(l => l.id === selectedDest) || destinationLocations[0];

  // Recalculate distance and price on selection changes
  useEffect(() => {
    // Euclidean distance mock
    const dx = pickupObj.coordinates.x - destObj.coordinates.x;
    const dy = pickupObj.coordinates.y - destObj.coordinates.y;
    const rawDist = Math.sqrt(dx * dx + dy * dy);
    
    // Convert to realistic kilometers
    const km = Math.max(3.5, Math.round(rawDist * 0.45 * 10) / 10);
    setDistanceKm(km);

    // Calculate price
    const baseRate = taxiType === 'budget' ? 799 : 1500; // From 799 rub/hour model
    const perKmRate = taxiType === 'budget' ? 120 : 250;
    let computedPrice = Math.round(baseRate + km * perKmRate);

    // Dynamic pricing surcharges
    if (weather.status === 'stormy') {
      computedPrice = Math.round(computedPrice * 1.25); // +25% stormy surcharge
    } else if (weather.status === 'moderate') {
      computedPrice = Math.round(computedPrice * 1.10); // +10% wave surcharge
    }

    if (passengers > 4) {
      computedPrice += (passengers - 4) * 300; // Extra pass surcharge
    }

    setPrice(computedPrice);
  }, [selectedPickup, selectedDest, taxiType, passengers, weather.status]);

  // --- Start ordering flow (Yandex Go style) ---
  const handleOrderTaxi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    setIsSearching(true);
    setSearchStep(1);

    // Find nearest live taxi vessel
    // Available taxis: 'sea-taxi-24' (Tokarevsky) or 'sea-taxi-kater' (Zmeinka)
    const taxiVessels = vessels.filter(v => v.category === 'taxi');
    let bestTaxi = taxiVessels[0] || null;
    let minDistance = 9999;

    taxiVessels.forEach(v => {
      // Calculate distance between vessel and pickup location
      const dx = v.coordinates.x - pickupObj.coordinates.x;
      const dy = v.coordinates.y - pickupObj.coordinates.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        bestTaxi = v;
      }
    });

    setFoundTaxi(bestTaxi);
    // Calculated ETA: base 3 mins + distance-based minutes
    const computedEta = Math.max(4, Math.round(minDistance * 0.4 + 2));
    setEta(computedEta);

    // Step-by-step dispatch simulation logs
    setTimeout(() => {
      setSearchStep(2); // "Отправка webhook в Telegram капитана..."
      if (bestTaxi) {
        setToastMessage(
          lang === 'ru'
            ? `🤖 Бот @vladiwater_bot: Срочный вызов такси! Подача: ${pickupObj.name}. Клиент: ${guestName}. Сумма: ${price} ₽. Подтвердите в 1 клик.`
            : lang === 'en'
            ? `🤖 Bot @vladiwater_bot: Urgent taxi request! Boarding: ${pickupObj.name}. Client: ${guestName}. Total: ${price} RUB. Confirm in 1 click.`
            : `🤖 机器人 @vladiwater_bot: 紧急水上出租车请求！登船点: ${pickupObj.name}。客户: ${guestName}。总金额: ${price} 卢布。请一键确认。`
        );
        setShowTelegramToast(true);
      }
    }, 2000);

    setTimeout(() => {
      setSearchStep(3); // "Капитан подтвердил, подготавливаем судно..."
    }, 4500);

    setTimeout(() => {
      // Final confirmation
      setIsSearching(false);
      setSearchStep(0);
      setShowTelegramToast(false);

      // Update the taxi status to 'trip' in the parent vessel array!
      if (bestTaxi) {
        setVessels(prev => prev.map(v => {
          if (v.id === bestTaxi?.id) {
            return {
              ...v,
              status: 'trip', // status changed dynamically "на лету"
              coordinates: { x: pickupObj.coordinates.x, y: pickupObj.coordinates.y } // Instantly moves to the pickup point on radar!
            };
          }
          return v;
        }));
      }

      // Success callback boarding details
      onSuccessBooking({
        vesselName: bestTaxi ? bestTaxi.name : 'Морское такси Экспресс',
        date: lang === 'ru' ? 'Сегодня' : lang === 'en' ? 'Today' : '今天',
        time: new Date().toLocaleTimeString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' }),
        bookingType: 'taxi',
        duration: lang === 'ru' 
          ? `${distanceKm} км (~${Math.round(distanceKm * 1.5 + 5)} мин)` 
          : lang === 'en'
          ? `${distanceKm} km (~${Math.round(distanceKm * 1.5 + 5)} min)`
          : `${distanceKm} 公里 (~${Math.round(distanceKm * 1.5 + 5)} 分钟)`,
        totalPrice: price,
        captainName: bestTaxi ? bestTaxi.captainName : (lang === 'ru' ? 'Константин Морской' : 'Captain Constantine'),
        captainPhone: bestTaxi ? bestTaxi.captainPhone : '+7 (914) 777-22-11',
        seatsCount: passengers
      });
    }, 7500);
  };

  const getPassengerLabel = (n: number) => {
    if (lang === 'ru') return n === 1 ? 'пассажир' : n < 5 ? 'пассажира' : 'пассажиров';
    if (lang === 'en') return n === 1 ? 'passenger' : 'passengers';
    return '人';
  };

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden" id="sea-taxi-interactive-dispatch">
      
      {/* Absolute design grid lights */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />
      
      {/* Simulated Captain Telegram Bot Overlay Popup */}
      {showTelegramToast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl border border-blue-500/40 bg-slate-950 text-white shadow-2xl animate-bounce-short max-w-sm font-sans">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400">Telegram Bot Bridge (Live Webhook)</span>
            </div>
            <button onClick={() => setShowTelegramToast(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-mono">
            {toastMessage}
          </p>
          <div className="mt-3 flex gap-2 justify-end">
            <span className="text-[10px] bg-slate-900 border border-white/5 px-2 py-1 rounded text-amber-400 font-mono animate-pulse mr-auto">
              {lang === 'ru' ? 'Ожидание: 12с' : lang === 'en' ? 'Waiting: 12s' : '等待响应：12秒'}
            </span>
            <button 
              onClick={() => {
                setSearchStep(3);
                setShowTelegramToast(false);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded text-[10px] flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" /> {lang === 'ru' ? 'Принять вызов' : lang === 'en' ? 'Accept Call' : '接单'}
            </button>
          </div>
        </div>
      )}

      {/* Headline banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-xs font-mono uppercase text-amber-400 tracking-widest font-semibold">Sea Taxi Express 24/7</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase mt-1">
            {lang === 'ru' ? 'Круглосуточный Вызов Морского Такси' : lang === 'en' ? '24/7 Sea Taxi Express Booking' : '24/7 呼叫水上出租车'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ru'
              ? 'Мгновенный трансфер до островов Попова, Рейнеке, Рикорда и диких пляжей залива Петра Великого.'
              : lang === 'en'
              ? 'Instant transfer to Popov, Reineke, Rikord islands and wild beaches of Peter the Great Gulf.'
              : '即时前往波波夫岛、雷内克岛、里科达岛以及彼得大帝湾原始沙滩的过海交通。'}
          </p>
        </div>

        {/* Guest Choice Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>{lang === 'ru' ? 'Выбор гостей: Быстрый ответ < 15 сек' : lang === 'en' ? 'Guest Choice: Fast reply < 15s' : '住客推荐：15秒内极速回复'}</span>
        </div>
      </div>

      {/* Active simulation overlay screen */}
      {isSearching && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in" id="search-taxi-animation-overlay">
          
          {/* Circular animated radar sonar */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-ping scale-150 [animation-duration:3s]" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-cyan-500/30 animate-spin [animation-duration:15s]" />
            <div className="absolute w-12 h-12 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-500/40">
              <Navigation className="w-5 h-5 text-cyan-400 animate-pulse rotate-45" />
            </div>
          </div>

          <div className="space-y-4 max-w-sm">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
              {searchStep === 1 
                ? (lang === 'ru' ? 'Поиск ближайших такси...' : lang === 'en' ? 'Searching closest taxis...' : '正在搜寻最近的水上出租车...') 
                : searchStep === 2 
                ? (lang === 'ru' ? 'Оповещение Капитана...' : lang === 'en' ? 'Alerting Captain...' : '正在向船长发送警报...') 
                : (lang === 'ru' ? 'Завершение брони...' : lang === 'en' ? 'Completing booking...' : '正在完成预订...')}
            </h3>
            
            {/* Step messages */}
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400 bg-slate-900 border border-white/5 p-4 rounded-xl text-left">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${searchStep >= 1 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                <span>{lang === 'ru' ? 'ST_DWithin: Сканирование радиуса 3 км' : lang === 'en' ? 'ST_DWithin: Scanning 3 km radius' : 'ST_DWithin: 扫描3公里半径'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${searchStep >= 2 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                <span>
                  {lang === 'ru' 
                    ? `Telegram Bot: Отправка webhook-пуша ${foundTaxi?.name}` 
                    : lang === 'en' 
                    ? `Telegram Bot: Sending webhook push to ${foundTaxi?.name}` 
                    : `电报机器人：发送网页钩子推送给 ${foundTaxi?.name}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${searchStep >= 3 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                <span>
                  {lang === 'ru' 
                    ? `Webhook API: Капитан подтвердил вызов (ETA ${eta} мин)` 
                    : lang === 'en' 
                    ? `Webhook API: Captain confirmed call (ETA ${eta} min)` 
                    : `接口API：船长已确认接单（预计 ${eta} 分钟送达）`}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 animate-pulse">
              {lang === 'ru'
                ? '* Заявка зашифрована и передана на защищенный сервер.'
                : lang === 'en'
                ? '* Securely encrypted and processed on protected server.'
                : '* 数据已根据安全法规加密并传输至云端服务器。'}
            </p>
          </div>
        </div>
      )}

      {/* Main Form + Preview block */}
      <form onSubmit={handleOrderTaxi} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="sea-taxi-order-form">
        
        {/* Left Input form fields (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pickup location */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                {lang === 'ru' ? '📍 Пункт подачи (Место посадки)' : lang === 'en' ? '📍 Pickup Point (Boarding Place)' : '📍 上船点（登船地点）'}
              </label>
              <select
                value={selectedPickup}
                onChange={(e) => setSelectedPickup(e.target.value)}
                id="taxi-pickup-select"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {pickupLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Destination location */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                {lang === 'ru' ? '🏝️ Пункт назначения (Куда едем)' : lang === 'en' ? '🏝️ Destination (Where to)' : '🏝️ 目的地（去往哪里）'}
              </label>
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                id="taxi-dest-select"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {destinationLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Passengers Count */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                {lang === 'ru' ? '👥 Число пассажиров' : lang === 'en' ? '👥 Passenger Count' : '👥 乘船人数'}
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                id="taxi-passengers-select"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                  <option key={n} value={n}>{n} {getPassengerLabel(n)}</option>
                ))}
              </select>
            </div>

            {/* Taxi comfort class */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                {lang === 'ru' ? '⚡ Класс мореходности такси' : lang === 'en' ? '⚡ Sea Taxi Comfort Class' : '⚡ 水上出租车适航等级'}
              </label>
              <div className="flex bg-slate-950 rounded-xl p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setTaxiType('budget')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    taxiType === 'budget'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'ru' ? '⛵ Эконом (от 799 ₽/час)' : lang === 'en' ? '⛵ Economy (from 799 RUB/hr)' : '⛵ 经济型（799 卢布/小时起）'}
                </button>
                <button
                  type="button"
                  onClick={() => setTaxiType('comfort')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    taxiType === 'comfort'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'ru' ? '🚀 Скоростной (до 55 км/ч)' : lang === 'en' ? '🚀 Speed (up to 55 km/h)' : '🚀 高速型（高达 55 公里/小时）'}
                </button>
              </div>
            </div>
          </div>

          {/* Guest details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                {lang === 'ru' ? 'Ваше Имя' : lang === 'en' ? 'Your Name' : '您的姓名'}
              </label>
              <input 
                type="text"
                required
                placeholder={lang === 'ru' ? 'Михаил' : lang === 'en' ? 'Michael' : '迈克尔'}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                id="taxi-guest-name"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                {lang === 'ru' ? 'Номер телефона' : lang === 'en' ? 'Phone Number' : '电话号码'}
              </label>
              <input 
                type="tel"
                required
                placeholder="+7 (999) 555-44-33"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                id="taxi-guest-phone"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

        </div>

        {/* Right Summary and Dispatch block (Span 5) */}
        <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">{lang === 'ru' ? 'Расчет маршрута' : lang === 'en' ? 'Route Calculation' : '航程计算'}</span>
            <span className="text-xs text-slate-400 font-mono">GPS-Analysis</span>
          </div>

          {/* Navigation route display */}
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-white/5 text-xs text-slate-200">
            <div className="truncate flex-1 font-semibold text-white text-left">
              {pickupObj.name.split(' (')[0]}
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 mx-2 flex-shrink-0" />
            <div className="truncate flex-1 text-right font-semibold text-cyan-400">
              {destObj.name.split(' (')[0]}
            </div>
          </div>

          {/* Metrics List */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'ru' ? 'Дистанция перехода:' : lang === 'en' ? 'Transition Distance:' : '航程距离：'}</span>
              <span className="text-white font-bold">{distanceKm} {lang === 'ru' ? 'км' : lang === 'en' ? 'km' : '公里'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'ru' ? 'Ориентировочное время:' : lang === 'en' ? 'Estimated Time:' : '预计航行时间：'}</span>
              <span className="text-white font-bold">~{Math.round(distanceKm * 1.5 + 4)} {lang === 'ru' ? 'мин' : lang === 'en' ? 'min' : '分钟'}</span>
            </div>
            
            {/* Dynamic Weather Modifier Display */}
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'ru' ? 'Состояние моря:' : lang === 'en' ? 'Sea State:' : '海洋状态：'}</span>
              <span className={`font-bold ${weather.status === 'stormy' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {weather.status === 'stormy' 
                  ? (lang === 'ru' ? 'Шторм (+25% наценка)' : lang === 'en' ? 'Storm (+25% Surcharge)' : '风暴（+25% 附加费）') 
                  : weather.status === 'moderate' 
                  ? (lang === 'ru' ? 'Умеренное (+10% наценка)' : lang === 'en' ? 'Moderate (+10% Surcharge)' : '中浪（+10% 附加费）') 
                  : (lang === 'ru' ? 'Штиль' : lang === 'en' ? 'Calm' : '风平浪静')}
              </span>
            </div>

            <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
              <span className="text-[10px] text-slate-400 uppercase font-bold">{lang === 'ru' ? 'Итоговый тариф:' : lang === 'en' ? 'Final Fare:' : '最终租金：'}</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {price.toLocaleString()} ₽
              </span>
            </div>
          </div>

          {/* Weather warning block if stormy */}
          {weather.status === 'stormy' && (
            <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-950/20 text-rose-300 text-[10px] leading-relaxed flex items-start gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                <strong>{lang === 'ru' ? 'Внимание!' : lang === 'en' ? 'Attention!' : '请注意！'}</strong> {lang === 'ru' ? `Высота волны ${weather.waveHeight} м. Время подачи может быть увеличено капитаном. Поездка абсолютно безопасна в закрытых кабинах такси.` : lang === 'en' ? `Wave height ${weather.waveHeight}m. Delivery time may be increased by the captain. The trip is completely safe inside enclosed taxi cabins.` : `浪高 ${weather.waveHeight}米。接船时间可能会由船长适当调整。封闭式水上出租车船舱内绝对安全。`}
              </span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            id="btn-trigger-instant-dispatch"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 text-slate-950 fill-slate-950 rotate-45" />
            <span>
              {lang === 'ru' 
                ? `Вызвать Экспресс-Такси (ETA ${eta} мин)` 
                : lang === 'en' 
                ? `Call Express Taxi (ETA ${eta} min)` 
                : `召集快速水上出租车（预计 ${eta} 分钟到达）`}
            </span>
          </button>
        </div>

      </form>

    </div>
  );
}
