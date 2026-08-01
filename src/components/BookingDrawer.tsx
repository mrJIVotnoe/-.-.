/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Vessel, SharedTour, Booking } from '../types';
import { X, Calendar, Clock, User, Phone, Check, ArrowRight, ShieldAlert, Award, AlertCircle, Sparkles, Star } from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface BookingDrawerProps {
  vessel: Vessel | null;
  tour: SharedTour | null;
  onClose: () => void;
  onSuccess: (bookingDetails: any) => void;
  weatherStatus: 'calm' | 'moderate' | 'stormy';
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
}

export default function BookingDrawer({
  vessel,
  tour,
  onClose,
  onSuccess,
  weatherStatus,
  bookings,
  onAddBooking
}: BookingDrawerProps) {
  const { lang, t } = useTranslation();

  const [bookingType, setBookingType] = useState<'hour' | 'day'>('hour');
  const [date, setDate] = useState('2026-07-02');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(3);
  const [seatsCount, setSeatsCount] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [coupon, setCoupon] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Wishes about route and conditions
  const [wishesRoute, setWishesRoute] = useState('');
  const [wishesConditions, setWishesConditions] = useState('');

  // Automatically check if a route was drawn on the interactive map
  useEffect(() => {
    const savedRoute = localStorage.getItem('drawn_radar_route_description');
    if (savedRoute && !wishesRoute) {
      setWishesRoute(savedRoute);
    }
  }, [vessel]);

  // Listen to live route drawn events
  useEffect(() => {
    const handleRouteApplied = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setWishesRoute(customEvent.detail);
      }
    };
    window.addEventListener('radar-route-applied', handleRouteApplied);
    return () => window.removeEventListener('radar-route-applied', handleRouteApplied);
  }, []);

  // 6-Month Availability Calendar Month index (0: July, 5: December)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Set default booking type based on available prices
  useEffect(() => {
    if (vessel) {
      if (!vessel.priceHour && vessel.priceDay) {
        setBookingType('day');
      } else {
        setBookingType('hour');
      }
    }
  }, [vessel]);

  if (!vessel && !tour) return null;

  const basePrice = tour 
    ? tour.pricePerSeat 
    : bookingType === 'hour' 
      ? (vessel?.priceHour || 0) 
      : (vessel?.priceDay || 0);

  const extrasList = [
    { 
      name: lang === 'ru' ? 'Прокат Сап-борда (SUP-board)' : lang === 'en' ? 'Rent SUP-board' : '租赁浆板 (SUP-board)', 
      price: 1500, 
      icon: '🏄‍♂️', 
      type: 'equip', 
      desc: lang === 'ru' ? 'Устойчивый премиум сап с веслом и лишем' : lang === 'en' ? 'Stable premium SUP with paddle and leash' : '带浆和脚绳的稳固高档浆板'
    },
    { 
      name: lang === 'ru' ? 'Снасти на тунца/лакедру' : lang === 'en' ? 'Tuna/yellowtail fishing gear' : '金枪鱼/鰤鱼钓具', 
      price: 2000, 
      icon: '🎣', 
      type: 'equip', 
      desc: lang === 'ru' ? 'Профессиональные спиннинги Shimano и катушки' : lang === 'en' ? 'Professional Shimano spinning rods and reels' : '禧玛诺专业路亚鱼竿和线轮'
    },
    { 
      name: lang === 'ru' ? 'Система отпугивания акул (Shark Shield)' : lang === 'en' ? 'Shark Repeller System (Shark Shield)' : '防鲨装置系统 (Shark Shield)', 
      price: 1200, 
      icon: '🛡️', 
      type: 'equip', 
      desc: lang === 'ru' ? 'Австралийский электронный барьер безопасности' : lang === 'en' ? 'Australian electronic safety barrier' : '澳大利亚电子安全隔离保护屏障'
    },
    { 
      name: lang === 'ru' ? 'Гастротур: Свежий краб (1 шт)' : lang === 'en' ? 'Seafood Tour: Fresh crab (1 pc)' : '美食之旅：新鲜螃蟹 (1只)', 
      price: 4500, 
      icon: '🦀', 
      type: 'gastro', 
      desc: lang === 'ru' ? 'Живой камчатский краб, приготовленный на морской воде' : lang === 'en' ? 'Live King Crab cooked in sea water' : '用海水煮熟的鲜活帝王蟹'
    },
    { 
      name: lang === 'ru' ? 'Гастротур: Парной гребешок (1 кг)' : lang === 'en' ? 'Seafood Tour: Steamed scallops (1 kg)' : '美食之旅：鲜蒸扇贝 (1公斤)', 
      price: 3000, 
      icon: '🦪', 
      type: 'gastro', 
      desc: lang === 'ru' ? 'Выловленный водолазами свежий гребешок' : lang === 'en' ? 'Fresh scallops harvested by divers' : '潜水员捕捞的新鲜扇贝'
    },
    { 
      name: lang === 'ru' ? 'Теплая каюта для вечерних прогулок' : lang === 'en' ? 'Warm cabin for evening cruises' : '适合晚间游览的温馨客舱', 
      price: 1000, 
      icon: '☕', 
      type: 'comfort', 
      desc: lang === 'ru' ? 'Комфортный обогрев салона и горячий чай' : lang === 'en' ? 'Comfortable salon heating and hot tea' : '舒适的沙龙暖气 and 热茶'
    },
    { 
      name: lang === 'ru' ? 'Услуги шеф-повара на борту' : lang === 'en' ? 'Onboard chef services' : '船上厨师服务', 
      price: 5000, 
      icon: '👨‍🍳', 
      type: 'comfort', 
      desc: lang === 'ru' ? 'Разделка морепродуктов, сервировка стола' : lang === 'en' ? 'Seafood carving, professional serving' : '海鲜料理制作、餐桌布置服务'
    }
  ];

  const handleExtraToggle = (extraName: string) => {
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(selectedExtras.filter(e => e !== extraName));
    } else {
      setSelectedExtras([...selectedExtras, extraName]);
    }
  };

  const applyCoupon = () => {
    setCouponError('');
    const formatted = coupon.trim().toUpperCase();
    if (formatted === 'LOVI50' || formatted === 'LOVIKUPON' || formatted === 'ФАРПОСТ50') {
      setIsCouponApplied(true);
    } else {
      setCouponError(
        lang === 'ru' 
          ? 'Неверный промокод. Попробуйте LOVI50 (скидка 50% от ЛовиКупон)' 
          : lang === 'en' 
          ? 'Invalid coupon code. Try LOVI50 (50% off)' 
          : '优惠券代码无效。请尝试使用 LOVI50（五折）'
      );
      setIsCouponApplied(false);
    }
  };

  const calculateTotalPrice = () => {
    let sum = 0;
    if (tour) {
      sum = basePrice * seatsCount;
    } else {
      sum = basePrice * (bookingType === 'hour' ? duration : 1);
    }

    // Add extras
    selectedExtras.forEach(extraName => {
      const extra = extrasList.find(e => e.name === extraName);
      if (extra) {
        const isIncludedOnVessel = 
          (extra.name.includes('акул') && vessel?.hasSharkRepeller) ||
          (extra.name.includes('каюта') && vessel?.features.some(f => f.toLowerCase().includes('каюта'))) ||
          (extra.name.includes('снасти') && vessel?.features.some(f => f.toLowerCase().includes('снаст'))) ||
          (extra.name.includes('Сап') && vessel?.features.some(f => f.toLowerCase().includes('sup') || f.toLowerCase().includes('сап')));

        if (!isIncludedOnVessel) {
          sum += extra.price;
        }
      }
    });

    // Apply coupon discount
    if (isCouponApplied) {
      sum = sum * 0.5; // 50% discount
    }

    return sum;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const bookingId = 'B-' + Math.floor(Math.random() * 900 + 100);

    const calculatedPrice = calculateTotalPrice();

    const details = {
      id: bookingId,
      vesselId: vessel?.id || tour?.vesselId || 'custom',
      vesselName: vessel?.name || tour?.vesselName || 'custom',
      bookingType: tour ? 'seat' : bookingType,
      date,
      time: tour ? tour.time : time,
      duration: tour ? tour.durationHours : duration,
      seatsCount: tour ? seatsCount : undefined,
      totalPrice: calculatedPrice,
      captainName: vessel?.captainName || (lang === 'ru' ? 'Дмитрий (Организатор)' : 'Dmitry (Organizer)'),
      captainPhone: vessel?.captainPhone || '+7 (914) 703-44-55'
    };

    const newBooking: Booking = {
      id: bookingId,
      vesselId: vessel?.id || tour?.vesselId || 'custom',
      vesselName: vessel?.name || tour?.vesselName || 'custom',
      bookingType: tour ? 'seat' : bookingType,
      date,
      timeStart: tour ? tour.time : time,
      seatsCount: tour ? seatsCount : undefined,
      selectedExtras,
      couponApplied: isCouponApplied ? coupon : undefined,
      totalPrice: calculatedPrice,
      customerName: name,
      customerPhone: phone,
      status: 'pending',
      wishesRoute,
      wishesConditions,
      requestedAt: lang === 'ru' ? 'Только что' : lang === 'en' ? 'Just now' : '刚刚'
    };

    // Dispatch lead to backend server
    try {
      await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vesselId: newBooking.vesselId,
          vesselTitle: newBooking.vesselName,
          customerName: name,
          customerContact: phone,
          channel: 'web',
          date: newBooking.date,
          guests: tour ? seatsCount : 4,
          totalPrice: calculatedPrice
        })
      });
    } catch (err) {
      console.warn('Backend lead dispatch warning:', err);
    }

    onAddBooking(newBooking);
    setSubmitted(true);
    onSuccess(details);
  };

  const months = lang === 'ru' 
    ? ['Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'] 
    : lang === 'en' 
    ? ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] 
    : ['七月', '八月', '九月', '十月', '十一月', '十二月'];

  const monthTitles = lang === 'ru'
    ? ['Июль 2026', 'Август 2026', 'Сентябрь 2026', 'Октябрь 2026', 'Ноябрь 2026', 'Декабрь 2026']
    : lang === 'en'
    ? ['July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026']
    : ['2026年七月', '2026年八月', '2026年九月', '2026年十月', '2026年十一月', '2026年十二月'];

  const weekdays = lang === 'ru'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : lang === 'en'
    ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    : ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity duration-300" id="booking-drawer-modal">
      {/* Background overlay closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Shell */}
      <div className="relative w-full max-w-lg h-full bg-slate-950 border-l border-white/10 flex flex-col justify-between shadow-2xl overflow-y-auto animate-[slideLeft_0.3s_ease-out]" id="booking-drawer-content">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur-md sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
              {tour 
                ? (lang === 'ru' ? 'Сборный тур (Морской консьерж)' : lang === 'en' ? 'Group Tour (Sea Concierge)' : '拼团旅游（海洋康西尔奇）') 
                : (lang === 'ru' ? 'Аренда судна' : lang === 'en' ? 'Vessel Rental' : '船只租用')}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5 line-clamp-1">
              {vessel ? vessel.name : tour?.title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            id="close-booking-drawer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6">
          
          {/* Weather Alert Trigger */}
          {weatherStatus === 'stormy' && (
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 text-xs space-y-1.5" id="booking-weather-warning">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>{lang === 'ru' ? 'Внимание: Штормовые условия!' : lang === 'en' ? 'Warning: Stormy Conditions!' : '警告：风暴状态！'}</span>
              </div>
              <p className="leading-relaxed">
                {lang === 'ru'
                  ? 'Высокие волны зафиксированы в проливе Босфор Восточный. Рекомендуется перенос времени выхода или швартовка в защищенных бухтах (например, Новик на о. Русском). Наш капитан свяжется с вами для согласования безопасного маршрута.'
                  : lang === 'en'
                  ? 'High waves detected in the Eastern Bosphorus strait. We recommend rescheduling or mooring in sheltered bays (e.g. Novik Bay on Russky Island). Our captain will contact you to plan a safe route.'
                  : '东博斯普鲁斯海峡检测到大浪。建议调整出发时间或选择在避风港湾（如俄罗斯岛的诺维克湾）停泊。我们的船长将与您联系以协调安全航线。'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Date & Time Selection with 6-Month Horizon Availability */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {lang === 'ru' ? '1. Дата и время выхода' : lang === 'en' ? '1. Departure Date & Time' : '1. 出发日期与时间'}
                </h4>
                <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                  {lang === 'ru' ? 'Горизонт 6 мес.' : lang === 'en' ? '6-Month Horizon' : '6个月预约期'}
                </span>
              </div>
              
              {/* Month Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 bg-slate-900/60 p-1 rounded-xl border border-white/5 scrollbar-thin">
                {months.map((mName, mIdx) => (
                  <button
                    key={mIdx}
                    type="button"
                    onClick={() => setCurrentMonthIndex(mIdx)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex-shrink-0 ${
                      currentMonthIndex === mIdx
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {mName}
                  </button>
                ))}
              </div>

              {/* Grid Calendar */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 border-b border-white/5 pb-1">
                  <span className="font-mono text-cyan-400 uppercase tracking-wider">
                    {monthTitles[currentMonthIndex]}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase font-mono">
                    {lang === 'ru' ? 'Живая сетка причалов' : lang === 'en' ? 'Live Berth Grid' : '实时停靠空档表'}
                  </span>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono text-slate-500 uppercase">
                  {weekdays.map(d => <span key={d}>{d}</span>)}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Empty offsets */}
                  {Array(
                    [
                      2, // July (starts on Wed)
                      5, // Aug (starts on Sat)
                      1, // Sept (starts on Tue)
                      3, // Oct (starts on Thu)
                      6, // Nov (starts on Sun)
                      1  // Dec (starts on Tue)
                    ][currentMonthIndex]
                  ).fill(null).map((_, i) => (
                    <div key={`offset-${i}`} className="h-7" />
                  ))}

                  {/* Day cells */}
                  {Array.from(
                    { 
                      length: [
                        31, // July
                        31, // Aug
                        30, // Sept
                        31, // Oct
                        30, // Nov
                        31  // Dec
                      ][currentMonthIndex]
                    }, 
                    (_, i) => i + 1
                  ).map((dayNum) => {
                    const mId = ['07', '08', '09', '10', '11', '12'][currentMonthIndex];
                    const dayStr = `2026-${mId}-${String(dayNum).padStart(2, '0')}`;
                    const vesselId = vessel?.id || 'none';
                    const existingBookingsOnDay = bookings.filter(b => b.vesselId === vesselId && b.date === dayStr);
                    const isBooked = existingBookingsOnDay.length > 0;
                    const isConfirmed = existingBookingsOnDay.some(b => b.status === 'confirmed');
                    const isSelected = date === dayStr;

                    return (
                      <button
                        key={`day-${dayNum}`}
                        type="button"
                        onClick={() => {
                          if (isBooked) {
                            return;
                          }
                          setDate(dayStr);
                        }}
                        className={`h-8 w-full text-[11px] font-bold rounded-lg transition-all flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 scale-105 z-10'
                            : isBooked
                            ? isConfirmed
                              ? 'bg-rose-950/30 text-rose-500/50 line-through cursor-not-allowed border border-rose-950/50'
                              : 'bg-amber-950/20 text-amber-500/50 line-through cursor-not-allowed border border-amber-950/40'
                            : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        title={
                          isBooked 
                            ? isConfirmed 
                              ? `Рейс подтвержден: ${existingBookingsOnDay[0].customerName}`
                              : `Заявка ожидает одобрения: ${existingBookingsOnDay[0].customerName}`
                            : `Свободно`
                        }
                      >
                        <span>{dayNum}</span>
                        {isBooked && (
                          <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                            isConfirmed ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status information */}
              <div className="flex justify-between text-[10px] font-mono px-1">
                <span className="text-slate-400">
                  {lang === 'ru' ? 'Выход запланирован:' : lang === 'en' ? 'Departure planned:' : '计划出发时间：'} <span className="text-cyan-400 font-bold">{date}</span>
                </span>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" /> {lang === 'ru' ? 'Свободно' : lang === 'en' ? 'Available' : '空闲'}
                  </span>
                  <span className="flex items-center gap-1 text-rose-500">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> {lang === 'ru' ? 'Занято' : lang === 'en' ? 'Booked' : '已订满'} ({bookings.filter(b => b.vesselId === vessel?.id).length})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    id="booking-date-input"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                {!tour && (
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      id="booking-time-input"
                      className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}
                {tour && (
                  <div className="bg-slate-900/50 border border-white/5 rounded-xl p-2.5 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{lang === 'ru' ? 'Расписание:' : lang === 'en' ? 'Schedule:' : '船只班次：'}</span>
                    <span className="text-xs font-semibold text-white mt-0.5">{tour.time}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Rental Mode or Seats */}
            {!tour ? (
              vessel?.priceHour && vessel?.priceDay ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    {lang === 'ru' ? '2. Тариф аренды' : lang === 'en' ? '2. Rental Fare Tariff' : '2. 租金价格选择'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-slate-900 rounded-xl p-1 border border-white/5" id="booking-tariff-toggle">
                    <button
                      type="button"
                      onClick={() => setBookingType('hour')}
                      id="tariff-btn-hour"
                      className={`py-2 text-xs font-medium rounded-lg transition-all ${bookingType === 'hour' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                      {lang === 'ru' ? `Почасовой (${vessel.priceHour.toLocaleString()} ₽ / ч)` : lang === 'en' ? `Hourly (${vessel.priceHour.toLocaleString()} RUB / hr)` : `按小时计费 (${vessel.priceHour.toLocaleString()} 卢布/小时)`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('day')}
                      id="tariff-btn-day"
                      className={`py-2 text-xs font-medium rounded-lg transition-all ${bookingType === 'day' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                      {lang === 'ru' ? `Посуточный (${vessel.priceDay.toLocaleString()} ₽ / сут)` : lang === 'en' ? `Daily (${vessel.priceDay.toLocaleString()} RUB / day)` : `按天计费 (${vessel.priceDay.toLocaleString()} 卢布/天)`}
                    </button>
                  </div>
                </div>
              ) : null
            ) : (
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {lang === 'ru' ? '2. Количество мест на катере' : lang === 'en' ? '2. Number of seats' : '2. 船舱座位数量'}
                </h4>
                <div className="flex items-center justify-between bg-slate-900 rounded-xl p-3 border border-white/5" id="booking-seats-selector">
                  <div>
                    <span className="text-xs text-slate-300">
                      {lang === 'ru' ? 'Стоимость одного места:' : lang === 'en' ? 'Price per seat:' : '单座价格：'}
                    </span>
                    <div className="text-sm font-bold text-white mt-0.5">{tour.pricePerSeat.toLocaleString()} ₽</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSeatsCount(prev => Math.max(1, prev - 1))}
                      id="btn-decrement-seats"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-white w-4 text-center">{seatsCount}</span>
                    <button
                      type="button"
                      onClick={() => setSeatsCount(prev => Math.min(tour.availableSeats, prev + 1))}
                      id="btn-increment-seats"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-amber-400 font-mono">
                  {lang === 'ru' 
                    ? `Свободно всего ${tour.availableSeats} из ${tour.totalSeats} мест на этот выход.` 
                    : lang === 'en' 
                    ? `Only ${tour.availableSeats} of ${tour.totalSeats} seats available.` 
                    : `该班次仅剩 ${tour.availableSeats} / ${tour.totalSeats} 个空位。`}
                </div>
              </div>
            )}

            {/* 3. Duration Selector (if hourly) */}
            {!tour && bookingType === 'hour' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    {lang === 'ru' ? '3. Продолжительность выхода' : lang === 'en' ? '3. Departure Duration' : '3. 出发航行时长'}
                  </h4>
                  <span className="text-xs font-bold text-cyan-400">{duration} {lang === 'ru' ? 'ч' : lang === 'en' ? 'hr' : '小时'}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  id="booking-duration-slider"
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>{lang === 'ru' ? '1 час' : lang === 'en' ? '1 hour' : '1小时'}</span>
                  <span>{lang === 'ru' ? '4 часа' : lang === 'en' ? '4 hours' : '4小时'}</span>
                  <span>{lang === 'ru' ? '8 часов' : lang === 'en' ? '8 hours' : '8小时'}</span>
                  <span>{lang === 'ru' ? '12 часов' : lang === 'en' ? '12 hours' : '12小时'}</span>
                </div>
              </div>
            )}

            {/* 4. Extras Checkboxes */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {lang === 'ru' ? '4. Опции и Гастротур Владивостока' : lang === 'en' ? '4. Options & Seafood Gastrotour' : '4. 附加选项与海参崴海鲜美食巡游'}
              </h4>
              
              {/* Group 1: Снаряжение & Комфорт */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  {lang === 'ru' ? 'Снаряжение и комфорт' : lang === 'en' ? 'Equipment & Comfort' : '装备与舒适度'}
                </span>
                <div className="space-y-2">
                  {extrasList.filter(e => e.type !== 'gastro').map((extra) => {
                    const isIncludedOnVessel = 
                      (extra.name.includes('акул') && vessel?.hasSharkRepeller) ||
                      (extra.name.includes('каюта') && vessel?.features.some(f => f.toLowerCase().includes('каюта'))) ||
                      (extra.name.includes('снасти') && vessel?.features.some(f => f.toLowerCase().includes('снаст'))) ||
                      (extra.name.includes('Сап') && vessel?.features.some(f => f.toLowerCase().includes('sup') || f.toLowerCase().includes('сап')));

                    const isChecked = selectedExtras.includes(extra.name) || isIncludedOnVessel;
                    
                    return (
                      <button
                        key={extra.name}
                        type="button"
                        onClick={() => {
                          if (!isIncludedOnVessel) {
                            handleExtraToggle(extra.name);
                          }
                        }}
                        disabled={isIncludedOnVessel}
                        id={`extra-item-${extra.name.slice(0, 10)}`}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                          isIncludedOnVessel
                            ? 'bg-slate-900/20 border-emerald-500/20 opacity-80 cursor-default'
                            : isChecked 
                              ? 'bg-cyan-500/10 border-cyan-500/30' 
                              : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{extra.icon}</span>
                          <div>
                            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                              <span>{extra.name}</span>
                              {isIncludedOnVessel && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 font-mono uppercase font-bold">
                                  {lang === 'ru' ? 'в комплекте' : lang === 'en' ? 'included' : '已包含'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{extra.desc}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-cyan-400">
                            {isIncludedOnVessel ? '0 ₽' : `+${extra.price.toLocaleString()} ₽`}
                          </span>
                          <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                            isChecked 
                              ? isIncludedOnVessel
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-cyan-500 border-cyan-400 text-slate-950' 
                              : 'border-white/20'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Гастротур */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block flex items-center gap-1">
                  <span>{lang === 'ru' ? '🦀 Гастротур (Свежий улов Владивостока)' : lang === 'en' ? '🦀 Seafood Tour (Fresh Vladivostok Catch)' : '🦀 美食巡游（海参崴新鲜海鲜捕捞）'}</span>
                </span>
                <div className="space-y-2">
                  {extrasList.filter(e => e.type === 'gastro').map((extra) => {
                    const isChecked = selectedExtras.includes(extra.name);
                    return (
                      <button
                        key={extra.name}
                        type="button"
                        onClick={() => handleExtraToggle(extra.name)}
                        id={`extra-item-${extra.name.slice(0, 10)}`}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                          isChecked 
                            ? 'bg-amber-500/10 border-amber-500/30' 
                            : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{extra.icon}</span>
                          <div>
                            <div className="text-xs font-semibold text-white">{extra.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{extra.desc}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-400">+{extra.price.toLocaleString()} ₽</span>
                          <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                            isChecked ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-white/20'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. LoviKupon Promo code */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {lang === 'ru' ? '5. Скидки и Промокоды (ЛовиКупон)' : lang === 'en' ? '5. Discounts & Promo Codes' : '5. 折扣与优惠券'}
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'ru' ? 'Код скидки 50% (например, LOVI50)' : lang === 'en' ? '50% discount code (e.g. LOVI50)' : '五折折扣码（如 LOVI50）'}
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  id="booking-coupon-input"
                  className="flex-1 bg-slate-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-white uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  id="btn-apply-coupon"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-white/5 transition-colors"
                >
                  {lang === 'ru' ? 'Применить' : lang === 'en' ? 'Apply' : '应用'}
                </button>
              </div>
              {isCouponApplied && (
                <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>
                    {lang === 'ru' 
                      ? 'Промокод применен: Скидка 50% от ЛовиКупон активна!' 
                      : lang === 'en' 
                      ? 'Coupon applied: 50% discount active!' 
                      : '优惠码已应用：五折优惠生效！'}
                  </span>
                </div>
              )}
              {couponError && (
                <div className="text-xs text-rose-400 font-mono flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* 6. Contact details */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {lang === 'ru' ? '6. Контакты фрахтователя' : lang === 'en' ? '6. Charterer Contact Details' : '6. 承租人联系方式'}
              </h4>
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={lang === 'ru' ? 'Ваше имя' : lang === 'en' ? 'Your Name' : '您的姓名'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    id="booking-name-input"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder={lang === 'ru' ? 'Номер телефона для связи' : lang === 'en' ? 'Phone number' : '电话号码'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    id="booking-phone-input"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* 7. Route and condition wishes */}
            <div className="space-y-3" id="booking-wishes-section">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {lang === 'ru' ? '7. Пожелания к планированию рейса' : lang === 'en' ? '7. Wishes for Trip Planning' : '7. 出发航行特殊需求及偏好'}
              </h4>
              <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">
                    {lang === 'ru' ? '🧭 Маршрут мечты (пожелания)' : lang === 'en' ? '🧭 Dream Route (Wishes)' : '🧭 梦想路线（愿望）'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={lang === 'ru' ? 'Например: подойти к маяку Токаревского для фото, обойти о. Шкота...' : lang === 'en' ? 'E.g. approach Tokarevsky lighthouse for photos, circle Shkot Island...' : '例如：靠近托卡列夫斯基灯塔拍照，绕行什科特岛...'}
                    value={wishesRoute}
                    onChange={(e) => setWishesRoute(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">
                    {lang === 'ru' ? '🍽️ Условия на борту (пожелания)' : lang === 'en' ? '🍽️ Onboard Conditions (Wishes)' : '🍽️ 船上条件需求（愿望）'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={lang === 'ru' ? 'Например: пледы на вечер, бокалы под шампанское, детские жилеты...' : lang === 'en' ? 'E.g. blankets for the evening, champagne glasses, child safety vests...' : '例如：晚间毯子、香槟酒杯、儿童安全救生衣...'}
                    value={wishesConditions}
                    onChange={(e) => setWishesConditions(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Price calculation and book action button */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs text-slate-400 font-mono block">
                    {lang === 'ru' ? 'ИТОГОВАЯ СТОИМОСТЬ' : lang === 'en' ? 'TOTAL RENTAL PRICE' : '最终实付总租金'}
                  </span>
                  <div className="flex items-center gap-2">
                    {isCouponApplied && (
                      <span className="text-xs line-through text-slate-500 font-mono">
                        {(calculateTotalPrice() * 2).toLocaleString()} ₽
                      </span>
                    )}
                    <span className="text-xl font-bold text-white font-mono">
                      {calculateTotalPrice().toLocaleString()} ₽
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  id="btn-confirm-booking"
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/10"
                >
                  <span>{lang === 'ru' ? 'Забронировать' : lang === 'en' ? 'Book Now' : '立即预约'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center leading-relaxed font-sans">
                {lang === 'ru'
                  ? 'Нажимая «Забронировать», вы соглашаетесь с правилами безопасности на воде. На этапе запуска сервисный сбор платформы составляет 0%. Оплата происходит напрямую капитану на борту.'
                  : lang === 'en'
                  ? 'By clicking "Book Now", you agree to the water safety regulations. During the launch phase, platform fee is 0%. Payment is made directly to the captain on board.'
                  : '点击“立即预约”，即表示您同意海参崴海上安全法规。上线初期平台服务费为 0%，费用将在登船时直接支付给船长。'}
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
