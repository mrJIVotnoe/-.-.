import React, { useState } from 'react';
import { Vessel, Booking } from '../types';
import { 
  User, 
  Star, 
  Camera, 
  Sparkles, 
  Clock, 
  Anchor, 
  ShieldCheck, 
  Check, 
  FileText, 
  Image as ImageIcon, 
  Tag, 
  ChevronRight, 
  CreditCard, 
  ArrowUpRight, 
  Plus, 
  MessageSquare,
  Sparkle,
  Video,
  UploadCloud,
  Heart,
  Compass,
  Building2
} from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface Review {
  id: string;
  vesselId: string;
  vesselName: string;
  captainName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

interface PassengerCabinProps {
  vessels: Vessel[];
  setVessels: React.Dispatch<React.SetStateAction<Vessel[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  activeRole?: 'client' | 'captain' | 'partner';
  onRoleChange?: (role: 'client' | 'captain' | 'partner') => void;
  onNavigateSection?: (section: string) => void;
}

export default function PassengerCabin({
  vessels,
  setVessels,
  bookings,
  setBookings,
  reviews,
  setReviews,
  activeRole = 'client',
  onRoleChange,
  onNavigateSection
}: PassengerCabinProps) {
  const { lang, t } = useTranslation();

  const tLocal = (ru: string, en: string, zh: string, ja: string, ko: string) => {
    if (lang === 'ru') return ru;
    if (lang === 'en') return en;
    if (lang === 'zh') return zh;
    if (lang === 'ja') return ja;
    if (lang === 'ko') return ko;
    return ru; // Fallback to Russian so Google Translate has clean text to translate
  };

  // Hardcoded active user profile details
  const userName = tLocal('Евгений Крафт', 'Eugene Kraft', '尤金·克拉夫特', 'エフゲニー・クラフト', '예브게니 크라프트');
  const userPhone = '+7 (902) 555-12-34';
  
  // States for interactive photo gallery
  const [userPhotos, setUserPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80', // Рыбалка
    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=600&q=80', // Закат
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', // Шампанское на корме
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'  // Остров Русский лагуна
  ]);

  // States for drag-and-drop file upload simulation
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // States for review form
  const [selectedVesselId, setSelectedVesselId] = useState<string>(vessels[0]?.id || 'julia-60');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Stats
  const completedTripsCount = 3;
  const totalNauticalMiles = 54.6;

  // Filter user bookings based on default user name
  const userBookings = bookings.filter(b => b.customerName === userName || b.customerPhone === userPhone);

  // Filter reviews written by this user
  const userReviews = reviews.filter(r => r.customerName === userName || r.customerName.includes('Евгений') || r.customerName.includes('Eugene'));

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateFileUpload();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateFileUpload();
    }
  };

  const simulateFileUpload = () => {
    setIsUploading(true);
    setUploadSuccess(false);
    
    // Simulate server upload lag
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Add a randomized beautiful sea photo to the gallery
      const pool = [
        'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=600&q=80'
      ];
      const randomUrl = pool[Math.floor(Math.random() * pool.length)];
      setUserPhotos(prev => [randomUrl, ...prev]);

      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1500);
  };

  // Submit new review from the passenger cabin
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const vessel = vessels.find(v => v.id === selectedVesselId) || vessels[0];
    
    const newReview: Review = {
      id: `R-CAB-${Date.now()}`,
      vesselId: selectedVesselId,
      vesselName: vessel.name,
      captainName: vessel.captainName,
      customerName: userName,
      rating,
      comment: comment.trim(),
      date: lang === 'ru' ? 'Сегодня' : lang === 'en' ? 'Today' : '今天',
      photos: [userPhotos[0]] // Attach first memory photo as feedback photo!
    };

    setReviews(prev => [newReview, ...prev]);

    // Recalculate vessel ratings inside global state
    setVessels(prev => prev.map(v => {
      if (v.id === selectedVesselId) {
        const previousReviews = reviews.filter(r => r.vesselId === selectedVesselId);
        const totalRating = previousReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
        const newCount = previousReviews.length + 1;
        const newRating = parseFloat((totalRating / newCount).toFixed(2));
        return {
          ...v,
          rating: newRating,
          reviewsCount: newCount
        };
      }
      return v;
    }));

    setComment('');
    setRating(5);
    setReviewSuccessMsg(
      lang === 'ru'
        ? '✨ Отзыв опубликован в судовом журнале! Капитан выражает вам искреннюю благодарность.'
        : lang === 'en'
        ? '✨ Review published in the logbook! The captain expresses sincere gratitude.'
        : '✨ 评价已成功载入航行日志！船长对您的客观评价表示由衷感谢。'
    );
    setTimeout(() => setReviewSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left" id="passenger-cabin-view">
      
      {/* Role Switcher Toolbar Banner if logged in or selecting role */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl" id="cabin-role-selector-bar">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            {lang === 'ru' ? 'Режим личного кабинета JIV:' : 'JIV Account Mode:'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              if (onRoleChange) onRoleChange('client');
              if (onNavigateSection) onNavigateSection('cabin');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              activeRole === 'client'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'ru' ? 'Пассажир' : 'Passenger'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onRoleChange) onRoleChange('captain');
              if (onNavigateSection) onNavigateSection('captain');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              activeRole === 'captain'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Anchor className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ru' ? 'Капитан' : 'Captain'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onRoleChange) onRoleChange('partner');
              if (onNavigateSection) onNavigateSection('partner');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              activeRole === 'partner'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ru' ? 'Партнёр' : 'Partner'}</span>
          </button>
        </div>
      </div>

      {/* 1. PROFILE HEADER BOARD WITH DUAL RATINGS */}
      <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 overflow-hidden shadow-2xl" id="passenger-profile-board">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Elegant Captain Hat User Avatar */}
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/10 border border-white/20">
                <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-extrabold tracking-wider border border-slate-900 animate-pulse">
                {lang === 'ru' ? 'VIP ГОСТЬ' : lang === 'en' ? 'VIP GUEST' : 'VIP 贵宾'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                {lang === 'ru' ? 'ЛИЧНЫЙ КАБИНЕТ ПАССАЖИРА' : lang === 'en' ? 'PASSENGER PERSONAL CABIN' : '乘客个人中心'}
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">{userName}</h2>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{lang === 'ru' ? 'Зарегистрирован' : lang === 'en' ? 'Registered' : '已注册'} • {userPhone}</span>
              </p>
            </div>
          </div>

          {/* Dual Rating Badges */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto" id="passenger-rating-grid">
            {/* Passenger Rating - Set by Captain */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)] flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-extrabold block">
                  {lang === 'ru' ? 'Ваш рейтинг пассажира' : lang === 'en' ? 'Your Passenger Rating' : '您的乘客信用评级'}
                </span>
                <span className="text-2xl font-extrabold text-white font-mono flex items-center gap-1.5 mt-1">
                  4.98 <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {lang === 'ru' ? 'Присвоен Капитанами' : lang === 'en' ? 'Assigned by Captains' : '船长授予的分数'}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                  {lang === 'ru' ? '🕒 Пунктуальный' : lang === 'en' ? '🕒 Punctual' : '🕒 准时'}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-semibold">
                  {lang === 'ru' ? '⚓ Вежливый' : lang === 'en' ? '⚓ Polite' : '⚓ 礼貌'}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-semibold">
                  {lang === 'ru' ? '🧹 Аккуратный' : lang === 'en' ? '🧹 Tidy' : '🧹 整洁'}
                </span>
              </div>
            </div>

            {/* Captains Rated - Set by Passenger */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.05)] flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-extrabold block">
                  {lang === 'ru' ? 'Средняя оценка капитанам' : lang === 'en' ? 'Average Captain Rating' : '给船长的平均评分'}
                </span>
                <span className="text-2xl font-extrabold text-white font-mono flex items-center gap-1.5 mt-1">
                  5.00 <Star className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {lang === 'ru' ? `На основе ${userReviews.length + 2} отзывов` : lang === 'en' ? `Based on ${userReviews.length + 2} reviews` : `基于 ${userReviews.length + 2} 条评价`}
                </span>
              </div>
              <div className="mt-3 text-[10px] text-slate-300 font-medium">
                {lang === 'ru' ? '🥇 Золотой статус гостя' : lang === 'en' ? '🥇 Gold Guest Status' : '🥇 金卡贵宾会员'}
              </div>
            </div>
          </div>
        </div>

        {/* Nautical Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5 text-center" id="passenger-stats-grid">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === 'ru' ? 'Пройдено по морю' : lang === 'en' ? 'Nautical Distance' : '航行海里'}</span>
            <span className="text-lg md:text-xl font-extrabold text-white font-mono block mt-1">
              {totalNauticalMiles} {lang === 'ru' ? 'миль' : lang === 'en' ? 'miles' : '海里'}
            </span>
            <span className="text-[10px] text-slate-400">{lang === 'ru' ? '~101.1 км в пути' : lang === 'en' ? '~101.1 km total' : '累计航行约101.1公里'}</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === 'ru' ? 'Завершенные выходы' : lang === 'en' ? 'Completed Trips' : '完成班次'}</span>
            <span className="text-lg md:text-xl font-extrabold text-cyan-400 font-mono block mt-1">{completedTripsCount}</span>
            <span className="text-[10px] text-slate-400">{lang === 'ru' ? 'Без инцидентов' : lang === 'en' ? 'No Incidents' : '零安全事故'}</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === 'ru' ? 'Заказано катеров' : lang === 'en' ? 'Boats Booked' : '已定船只'}</span>
            <span className="text-lg md:text-xl font-extrabold text-amber-400 font-mono block mt-1">{userBookings.length}</span>
            <span className="text-[10px] text-slate-400">{lang === 'ru' ? 'Всего броней в базе' : lang === 'en' ? 'Total system bookings' : '系统内累计订单'}</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === 'ru' ? 'Любимая локация' : lang === 'en' ? 'Favorite Location' : '最爱航线目的地'}</span>
            <span className="text-lg md:text-xl font-extrabold text-purple-400 font-mono block mt-1">
              {lang === 'ru' ? 'о. Русский' : lang === 'en' ? 'Russky Island' : '俄罗斯岛'}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === 'ru' ? 'б. Новик / Старка' : lang === 'en' ? 'Novik Bay / Stark' : '诺维克湾/斯塔克'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC BOOKINGS & PAYMENT STATUSES */}
      <div className="space-y-4" id="passenger-active-bookings-section text-left">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          <span>{lang === 'ru' ? 'Текущие бронирования и статус оплаты' : lang === 'en' ? 'Active Bookings & Payment Status' : '当前订单与支付状态'}</span>
        </h3>

        {userBookings.length === 0 ? (
          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/30 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-slate-400 text-xs">
              {lang === 'ru' ? 'У вас нет активных запланированных рейсов.' : lang === 'en' ? 'You have no active scheduled voyages.' : '您当前没有进行中的计划航行。'}
            </p>
            <p className="text-[11px] text-slate-500">
              {lang === 'ru' 
                ? 'Выберите яхту в разделе «Аренда флота» или место в «Морском консьерже» для старта!' 
                : lang === 'en'
                ? 'Choose a yacht in "Vessel Rental" or a seat in "Sea Concierge" to start!'
                : '在“舰队租赁”中选择游艇，或在“海洋康西尔奇”中预订席位开始！'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {userBookings.map((b) => (
              <div key={b.id} className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-lg flex flex-col justify-between text-left" id={`user-booking-${b.id}`}>
                {/* Header */}
                <div className="p-4 bg-slate-950/60 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">{lang === 'ru' ? 'НОМЕР ЗАКАЗА' : lang === 'en' ? 'ORDER NUMBER' : '订单编号'}</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">#{b.id}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                    b.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                    b.status === 'declined' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' :
                    'bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse'
                  }`}>
                    {b.status === 'confirmed' 
                      ? (lang === 'ru' ? 'Подтвержден' : lang === 'en' ? 'Confirmed' : '已确认') 
                      : b.status === 'declined' 
                      ? (lang === 'ru' ? 'Отклонен' : lang === 'en' ? 'Declined' : '已拒绝') 
                      : (lang === 'ru' ? 'Ожидает одобрения' : lang === 'en' ? 'Pending Approval' : '待批准')}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{b.vesselName}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5 font-mono">📅 {b.date} • {b.timeStart}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">{lang === 'ru' ? 'Тип аренды' : lang === 'en' ? 'Rental Type' : '租赁类型'}</span>
                      <span className="font-semibold text-slate-300 font-mono">
                        {b.bookingType === 'hour' 
                          ? (lang === 'ru' ? 'Почасовой' : lang === 'en' ? 'Hourly' : '按小时计费') 
                          : b.bookingType === 'day' 
                          ? (lang === 'ru' ? 'Посуточный' : lang === 'en' ? 'Daily' : '按天计费') 
                          : (lang === 'ru' ? 'По местам' : lang === 'en' ? 'Shared Seat' : '拼单/席位')}
                      </span>
                    </div>
                  </div>

                  {/* Route & conditions wishes */}
                  {(b.wishesRoute || b.wishesConditions) && (
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-white/5 space-y-1 text-[11px] text-left">
                      {b.wishesRoute && (
                        <p className="text-slate-300 leading-relaxed">
                          <strong className="text-cyan-400">{lang === 'ru' ? 'Маршрут:' : lang === 'en' ? 'Route:' : '路线：'}</strong> {b.wishesRoute}
                        </p>
                      )}
                      {b.wishesConditions && (
                        <p className="text-slate-300 leading-relaxed">
                          <strong className="text-amber-400">{lang === 'ru' ? 'Условия:' : lang === 'en' ? 'Onboard:' : '船上需求：'}</strong> {b.wishesConditions}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Details */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-left">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">{lang === 'ru' ? 'Полная стоимость:' : lang === 'en' ? 'Total cost:' : '订单总额：'}</span>
                      <span className="font-bold text-white font-mono">{b.totalPrice.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">{lang === 'ru' ? 'Статус оплаты:' : lang === 'en' ? 'Payment status:' : '支付状态：'}</span>
                      <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Оплачено 100% (SberPay)' : lang === 'en' ? '100% Paid (SberPay)' : '已100%支付 (SberPay)'}
                      </span>
                    </div>

                    {/* Progress visual */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-full rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-3 bg-slate-950/40 border-t border-white/5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert(
                        lang === 'ru'
                          ? `Электронный посадочный талон для рейса #${b.id} сохранен в кэш мобильного телефона! Пожалуйста, покажите его Капитану на причале.`
                          : lang === 'en'
                          ? `Digital boarding ticket for voyage #${b.id} is saved! Please present it to the Captain at the boarding pier.`
                          : `已生成并保存航次 #${b.id} 的电子登船牌凭证。请在码头向船长展示该二维码凭证。`
                      );
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Билет (PDF)' : lang === 'en' ? 'Ticket (PDF)' : '电子客票 (PDF)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const shareText = 
                        lang === 'ru' 
                          ? `Привет! Мы забронировали морскую прогулку во Владивостоке на яхте "${b.vesselName}" на ${b.date} в ${b.timeStart}. Маршрут согласован с Капитаном. Жду тебя на пирсе!`
                          : lang === 'en'
                          ? `Hi! We've booked a sea cruise in Vladivostok on the yacht "${b.vesselName}" for ${b.date} at ${b.timeStart}. The route is confirmed with the Captain. See you at the pier!`
                          : `嗨！我们已经成功预约了海参崴的游艇海上巡航活动，船名：“${b.vesselName}”，时间：${b.date} ${b.timeStart}。航线已由船长确认，码头见！`;
                      navigator.clipboard.writeText(shareText);
                      alert(
                        lang === 'ru'
                          ? 'Ссылка и приглашение скопированы в буфер обмена! Отправьте его друзьям.'
                          : lang === 'en'
                          ? 'Link and invitation copied to clipboard! Share it with your friends.'
                          : '专属海上海参崴邀请链接已复制到剪贴板！可以直接发送分享给朋友。'
                      );
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Поделиться' : lang === 'en' ? 'Share' : '分享邀请'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. MEDIA MEMORIES VAULT & DRAG-AND-DROP UPLOADER */}
      <div className="grid lg:grid-cols-3 gap-6" id="passenger-media-and-promotions-row">
        {/* Memory Gallery Column */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-400" />
              <span>{lang === 'ru' ? 'Архив воспоминаний пассажира (Медиа)' : lang === 'en' ? 'Passenger Media Memories Archive' : '乘客精彩出行多媒体档案'}</span>
            </h3>
            <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full font-bold">
              {userPhotos.length} {lang === 'ru' ? 'ФОТО / ВИДЕО' : lang === 'en' ? 'PHOTOS / VIDEOS' : '图片与视频'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed text-left">
            {lang === 'ru'
              ? 'Здесь хранятся ваши памятные снимки и видеоролики с прошедших выходов в море. Вы можете в любой момент скачать оригиналы в исходном качестве или прикрепить новые воспоминания к будущему отзыву.'
              : lang === 'en'
              ? 'Your memorable photos and videos from past boat trips are stored here. Download high-res originals anytime or attach new media memories to your upcoming feedback.'
              : '此处保存了您往期出海的珍贵照片和视频。您可以随时下载高分辨率原始文件，或将新的精彩记忆附加到接下来的行程评价中。'}
          </p>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="passenger-photos-grid">
            {userPhotos.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 bg-slate-900 group shadow-md">
                <img 
                  src={url} 
                  alt={`Memory ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 justify-between">
                  <span className="text-[9px] text-slate-300 font-mono text-left">
                    {idx === 0 
                      ? (lang === 'ru' ? '🐟 Рыбалка' : lang === 'en' ? '🐟 Fishing' : '🐟 钓鱼体验') 
                      : idx === 1 
                      ? (lang === 'ru' ? '🌅 Закат' : lang === 'en' ? '🌅 Sunset' : '🌅 海上落日') 
                      : idx === 2 
                      ? (lang === 'ru' ? '🍾 Праздник' : lang === 'en' ? '🍾 Celebration' : '🍾 甲板派对') 
                      : (lang === 'ru' ? 'о. Русский' : lang === 'en' ? 'Russky Island' : '俄罗斯岛')}
                  </span>
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 cursor-pointer hover:scale-125 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* DRAG AND DROP FILE UPLOADER */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 cursor-pointer ${
              dragActive 
                ? 'border-cyan-400 bg-cyan-950/20' 
                : 'border-white/10 bg-slate-900/20 hover:bg-slate-900/40 hover:border-white/20'
            }`}
            id="drag-and-drop-uploader"
          >
            <input 
              type="file" 
              id="file-upload-input" 
              multiple 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload-input" className="cursor-pointer block space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/5 flex items-center justify-center mx-auto shadow-md">
                {isUploading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200">
                  {isUploading 
                    ? (lang === 'ru' ? 'Загрузка ваших медиафайлов...' : lang === 'en' ? 'Uploading your media files...' : '正在上传多媒体档案文件...') 
                    : (lang === 'ru' ? 'Перетащите сюда новые фото и видео или нажмите для выбора' : lang === 'en' ? 'Drag and drop new photos & videos here, or click to select' : '拖拽新的照片和视频至此处，或点击手动选择文件')}
                </p>
                <p className="text-[10px] text-slate-500 font-mono uppercase">
                  {lang === 'ru' ? 'Поддержка Drag & Drop, PNG, JPG, MP4 до 100 МБ' : lang === 'en' ? 'Supports Drag & Drop, PNG, JPG, MP4 up to 100MB' : '支持拖拽，支持 PNG, JPG, MP4 格式且大小不超过 100MB'}
                </p>
              </div>
            </label>

            {uploadSuccess && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono inline-block animate-bounce">
                {lang === 'ru'
                  ? '✨ Медиафайл успешно загружен в облачное хранилище рейса! Снимки добавлены в галерею.'
                  : lang === 'en'
                  ? '✨ Media successfully uploaded to the cruise cloud storage! Photos added to the gallery.'
                  : '✨ 媒体文件已成功上传至航线云端存储空间！照片已同步添加至相册。'}
              </div>
            )}
          </div>
        </div>

        {/* PERSONALIZED PROMOTIONS & VIP CLUB */}
        <div className="space-y-4 text-left">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-amber-400" />
            <span>{lang === 'ru' ? 'Персональные спецпредложения' : lang === 'en' ? 'Personalized Special Offers' : '个性化贵宾特惠方案'}</span>
          </h3>

          <div className="space-y-3" id="personalized-promo-cards">
            {/* VIP Promo Card 1 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/20 shadow-md relative overflow-hidden group text-left">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
              <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full uppercase font-bold">
                {lang === 'ru' ? 'КЛУБНАЯ КАРТА VIP' : lang === 'en' ? 'VIP CLUB CARD' : 'VIP 俱乐部专享'}
              </span>
              <h4 className="text-sm font-extrabold text-white mt-2">
                {lang === 'ru' ? 'Трофейный рыболовный клуб' : lang === 'en' ? 'Trophy Fishing Club' : '顶级钓鱼俱乐部'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {lang === 'ru'
                  ? 'Поскольку вы увлекаетесь морской охотой на лакедру, мы дарим вам эксклюзивный промокод со скидкой 15% на любой катер с Raymarine 3D эхолотом!'
                  : lang === 'en'
                  ? 'Since you love yellowtail kingfish hunting, we present you an exclusive 15% discount promo code for any boat with a Raymarine 3D sonar!'
                  : '鉴于您对捕捞鰤鱼（黄尾鲹）的热爱，我们特为您提供 85 折专属折扣码，适用于任何配备 Raymarine 3D 探鱼仪的船只！'}
              </p>
              <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-amber-500/30 flex justify-between items-center font-mono">
                <span className="text-xs text-amber-400 font-bold select-all">TUNA_VIP_15</span>
                <span className="text-[9px] text-slate-500 uppercase">{lang === 'ru' ? 'Скидка 15%' : lang === 'en' ? '15% Off' : '85折优惠'}</span>
              </div>
            </div>

            {/* VIP Promo Card 2 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20 shadow-md relative overflow-hidden group text-left">
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
              <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full uppercase font-bold">
                {lang === 'ru' ? 'СЕЗОННЫЙ КРУИЗ' : lang === 'en' ? 'SEASONAL CRUISE' : '季节性巡游'}
              </span>
              <h4 className="text-sm font-extrabold text-white mt-2">
                {lang === 'ru' ? 'Романтический ужин у маяка' : lang === 'en' ? 'Romantic Dinner at the Lighthouse' : '灯塔畔浪漫晚餐'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {lang === 'ru'
                  ? 'Спланируйте незабываемый вечер на палубе белоснежной яхты «Джулия». Подача свежайших устриц от шеф-повара и авторское игристое шампанское включены!'
                  : lang === 'en'
                  ? 'Plan an unforgettable evening on the deck of the pure-white yacht "Julia". Serving of fresh chef scallops and signature sparkling champagne included!'
                  : '在纯白游艇“朱莉娅”的甲板上度过难忘的夜晚。赠送主厨烹制的精选扇贝和招牌香槟起泡酒！'}
              </p>
              <button
                type="button"
                onClick={() => {
                  alert(
                    lang === 'ru'
                      ? 'Спецпредложение активировано! При бронировании яхты «Джулия» на закатные часы вам будет предложена опция ужина в подарок.'
                      : lang === 'en'
                      ? 'Special offer activated! When booking the yacht "Julia" for sunset hours, the gift dinner option will be provided.'
                      : '特惠已成功激活！当预订“朱莉娅”号落日晚霞航次时，将免费为您赠送奢华晚餐。'
                  );
                }}
                className="w-full mt-3 py-2 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1"
              >
                <span>{lang === 'ru' ? 'Забронировать со скидкой 10%' : lang === 'en' ? 'Book with 10% discount' : '享受九折预订特惠'}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* VIP Promo Card 3 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/20 shadow-md relative overflow-hidden group text-left">
              <span className="text-[9px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full uppercase font-bold">
                {lang === 'ru' ? 'ОСТРОВНОЙ ДРАЙВ' : lang === 'en' ? 'ISLAND ADVENTURE' : '海岛极速探险'}
              </span>
              <h4 className="text-sm font-extrabold text-white mt-2">
                {lang === 'ru' ? 'Экстрим-Тур на гидроциклах' : lang === 'en' ? 'Jet Ski Extreme Tour' : '摩托艇极限越海巡航'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {lang === 'ru'
                  ? 'Скоростной заезд группой до острова Рейнеке с пикником у дикого песчаного пляжа.'
                  : lang === 'en'
                  ? 'High-speed group run to Reineke Island with a picnic on a wild sand beach.'
                  : '组团高速驾驶摩托艇前往雷内克岛，并在原始沙滩举行户外烧烤。'}
              </p>
              <div className="mt-2.5 text-[10px] text-purple-400 font-bold">
                {lang === 'ru' ? '🔥 Свободно мест на воскресенье: 2 из 8' : lang === 'en' ? '🔥 Seats left for Sunday: 2 of 8' : '🔥 星期日剩余名额：2 / 8'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PAST VOYAGES TIMELINE */}
      <div className="space-y-4 text-left font-sans" id="passenger-voyages-history">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <span>{lang === 'ru' ? 'История прошлых плаваний (Завершенные выходы)' : lang === 'en' ? 'Past Voyages History (Completed Trips)' : '往期航行日志（已安全靠岸班次）'}</span>
        </h3>

        <div className="relative border-l border-white/10 pl-5 ml-2.5 space-y-6 text-left">
          {/* Timeline Item 1 */}
          <div className="relative">
            <span className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    {lang === 'ru' ? 'Эксклюзивная яхта «Джулия»' : lang === 'en' ? 'Exclusive Yacht "Julia"' : '“朱莉娅”尊享游艇'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase">
                    {lang === 'ru' ? 'Рейс выполнен успешно' : lang === 'en' ? 'Trip Completed' : '已顺利靠岸'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{lang === 'ru' ? '28 июня 2026' : lang === 'en' ? 'June 28, 2026' : '2026年6月28日'}</span>
              </div>
              <p className="text-xs text-slate-300">
                {lang === 'ru'
                  ? 'Маршрут: Выход от пирса Токаревского маяка ➔ круиз вдоль бухты Золотой Рог ➔ стоянка в бухте Новик. Капитан Алексей Бережной.'
                  : lang === 'en'
                  ? 'Route: Departure from Tokarevsky Lighthouse pier ➔ cruise along Golden Horn Bay ➔ mooring in Novik Bay. Captain Alexey Berezhnoy.'
                  : '航线：托卡列夫斯基灯塔码头起航 ➔ 金角湾巡航 ➔ 俄罗斯岛诺维克湾下锚。船长：阿列克谢·别列日诺伊。'}
              </p>
              <div className="text-[11px] text-slate-400 flex gap-4 font-mono">
                <span>{lang === 'ru' ? '⏱️ Время: 4 часа' : lang === 'en' ? '⏱️ Duration: 4 hours' : '⏱️ 时长：4小时'}</span>
                <span>{lang === 'ru' ? '⚓ Дистанция: 12.5 миль' : lang === 'en' ? '⚓ Distance: 12.5 NM' : '⚓ 距离：12.5 海里'}</span>
                <span>{lang === 'ru' ? '👨‍✈️ Оценка: 5/5 ★' : lang === 'en' ? '👨‍✈️ Rating: 5/5 ★' : '👨‍✈️ 评分：5/5 ★'}</span>
              </div>
            </div>
          </div>

          {/* Timeline Item 2 */}
          <div className="relative">
            <span className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    {lang === 'ru' ? 'Трофейный катер «Tuna Hunter 28»' : lang === 'en' ? 'Trophy Boat "Tuna Hunter 28"' : '“金枪鱼猎手 28”重型垂钓艇'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase">
                    {lang === 'ru' ? 'Рейс выполнен успешно' : lang === 'en' ? 'Trip Completed' : '已顺利靠岸'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{lang === 'ru' ? '15 июня 2026' : lang === 'en' ? 'June 15, 2026' : '2026年6月15日'}</span>
              </div>
              <p className="text-xs text-slate-300 text-left">
                {lang === 'ru'
                  ? 'Маршрут: Выход из бухты Улисс ➔ глубоководная рыбалка на лакедру на юге Амурского залива. Капитан Игорь Кальмаренко.'
                  : lang === 'en'
                  ? 'Route: Departure from Ulysses Bay ➔ deep sea fishing for yellowtail in the south of the Amur Gulf. Captain Igor Kalmarenko.'
                  : '航线：从尤利西斯湾起航 ➔ 驶往阿穆尔湾南部深海区域捕捞鰤鱼。船长：伊戈尔·卡尔马连科。'}
              </p>
              <div className="text-[11px] text-slate-400 flex gap-4 font-mono">
                <span>{lang === 'ru' ? '⏱️ Время: 8 часов' : lang === 'en' ? '⏱️ Duration: 8 hours' : '⏱️ 时长：8小时'}</span>
                <span>{lang === 'ru' ? '⚓ Дистанция: 18.0 миль' : lang === 'en' ? '⚓ Distance: 18.0 NM' : '⚓ 距离：18.0 海里'}</span>
                <span>{lang === 'ru' ? '🐟 Улов: 3 крупные лакедры' : lang === 'en' ? '🐟 Catch: 3 large yellowtails' : '🐟 战利品：3条超大黄尾鰤鱼'}</span>
              </div>
            </div>
          </div>

          {/* Timeline Item 3 */}
          <div className="relative">
            <span className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    {lang === 'ru' ? 'РИБ-катер «Буревестник»' : lang === 'en' ? 'RIB Boat "Burevestnik"' : '“海燕”硬壳充气橡皮艇 (RIB)'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase">
                    {lang === 'ru' ? 'Рейс выполнен успешно' : lang === 'en' ? 'Trip Completed' : '已顺利靠岸'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{lang === 'ru' ? '01 июня 2026' : lang === 'en' ? 'June 1, 2026' : '2026年6月1日'}</span>
              </div>
              <p className="text-xs text-slate-300">
                {lang === 'ru'
                  ? 'Маршрут: Экскурсия на остров Шкота, наблюдение за лежбищем пятнистых нерп (ларг), возвращение через Канал. Капитан Максим Ветров.'
                  : lang === 'en'
                  ? 'Route: Excursion to Shkot Island, observation of spotted seals (larga) colony, return via Canal. Captain Maxim Vetrov.'
                  : '航线：什科特岛游览、观赏野生斑海豹栖息地、经运河返航。船长：马克西姆·维特罗夫。'}
              </p>
              <div className="text-[11px] text-slate-400 flex gap-4 font-mono">
                <span>{lang === 'ru' ? '⏱️ Время: 6 часов' : lang === 'en' ? '⏱️ Duration: 6 hours' : '⏱️ 时长：6小时'}</span>
                <span>{lang === 'ru' ? '⚓ Дистанция: 24.1 миль' : lang === 'en' ? '⚓ Distance: 24.1 NM' : '⚓ 距离：24.1 海里'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE MY REVIEWS LOG & REVIEW COMPOSER */}
      <div className="grid lg:grid-cols-2 gap-6 text-left" id="passenger-reviews-section-composer">
        {/* Review Composer Form */}
        <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl space-y-4 text-left">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ru' ? 'Оставить отзыв капитану или суду' : lang === 'en' ? 'Leave a Review for Captain or Vessel' : '给船长或船只撰写航行评价'}</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed text-left">
            {lang === 'ru'
              ? 'Поделитесь своими впечатлениями о недавнем морском выходе. Ваша оценка напрямую повлияет на позицию Капитана в поисковой выдаче JIV.'
              : lang === 'en'
              ? 'Share your impressions of the recent sea voyage. Your rating directly affects the Captain\'s position in the JIV search rankings.'
              : '分享您近期的出海感受。您的真实打分将直接影响该船长在 JIV 搜索结果中的信誉排名。'}
          </p>

          <form onSubmit={handleAddReview} className="space-y-4 text-left">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Vessel Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">{lang === 'ru' ? 'Судно и Капитан' : lang === 'en' ? 'Vessel & Captain' : '船只与船长'}</label>
                <select
                  value={selectedVesselId}
                  onChange={(e) => setSelectedVesselId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({lang === 'ru' ? 'кап.' : 'capt.'} {v.captainName})</option>
                  ))}
                </select>
              </div>

              {/* Stars selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">{lang === 'ru' ? 'Оценка (Звезды)' : lang === 'en' ? 'Rating (Stars)' : '综合打分（星级）'}</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-amber-400 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-300 font-mono ml-2">({rating}/5)</span>
                </div>
              </div>
            </div>

            {/* Comment field */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">{lang === 'ru' ? 'Ваш подробный комментарий' : lang === 'en' ? 'Your Detailed Comment' : '您的详细评价内容'}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={lang === 'ru' ? 'Как прошел выход? Понравилась ли уха на борту, как показала себя система защиты от акул...' : lang === 'en' ? 'How was the trip? Did you like the fish soup, how did the shark repeller perform...' : '这次出海体验如何？船上的鲜鱼汤味道怎样？防鲨电子安全屏障表现如何...'}
                rows={4}
                required
                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Quick helper photo attachment */}
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              <span>
                {lang === 'ru'
                  ? 'К отзыву будет прикреплен ваш последний снимок из архива воспоминаний'
                  : lang === 'en'
                  ? 'Your latest memory photo will be attached to the review'
                  : '您多媒体档案中的最新一张照片将作为配图附加到该评价中'}
              </span>
            </div>

            {reviewSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-fade-in">
                {reviewSuccessMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-extrabold text-xs tracking-wider rounded-xl uppercase transition-all shadow-md hover:shadow-cyan-400/20"
            >
              {lang === 'ru' ? 'Опубликовать в Бортжурнал' : lang === 'en' ? 'Publish in Logbook' : '发布到航海日志'}
            </button>
          </form>
        </div>

        {/* Written reviews log */}
        <div className="space-y-4 text-left">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ru' ? `Ваши отзывы (${userReviews.length})` : lang === 'en' ? `Your Reviews (${userReviews.length})` : `您的往期评价 (${userReviews.length})`}</span>
          </h3>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
            {userReviews.length === 0 ? (
              <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/30 text-center text-slate-400 text-xs">
                {lang === 'ru' ? 'Вы еще не оставляли отзывы через систему. Заполните форму слева!' : lang === 'en' ? 'You have not submitted any reviews yet. Complete the form on the left!' : '您在系统内尚无任何评价记录。请填写左侧表单发表首个评价！'}
              </div>
            ) : (
              userReviews.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-white/5 bg-slate-900/30 space-y-2 animate-fade-in text-left">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-xs">{r.vesselName}</h4>
                      <p className="text-[10px] text-slate-500">{lang === 'ru' ? 'Капитан:' : 'Captain:'} {r.captainName}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    «{r.comment}»
                  </p>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>{r.date}</span>
                    <span className="text-cyan-400 font-semibold">{lang === 'ru' ? 'Опубликован' : lang === 'en' ? 'Published' : '已发布'}</span>
                  </div>

                  {r.photos && r.photos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {r.photos.map((ph, idx) => (
                        <img 
                           key={idx} 
                           src={ph} 
                           alt="Attached" 
                           className="w-12 h-12 rounded-lg object-cover border border-white/10"
                           referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
