/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SharedTour } from '../types';
import { SHARED_TOURS_DATA } from '../data/vessels';
import { Users, Anchor, Calendar, Clock, Sparkles, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface SeaConciergeProps {
  onBookSeat: (tour: SharedTour) => void;
}

export default function SeaConcierge({ onBookSeat }: SeaConciergeProps) {
  const { lang, t } = useTranslation();
  const [tours, setTours] = useState<SharedTour[]>(SHARED_TOURS_DATA);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  
  // Custom request state
  const [customName, setCustomName] = useState('');
  const [customActivity, setCustomActivity] = useState('Кальмары');
  const [customDate, setCustomDate] = useState('');
  const [customSeats, setCustomSeats] = useState(2);
  const [customPhone, setCustomPhone] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const filteredTours = activityFilter === 'all' 
    ? tours 
    : tours.filter(t => t.targetActivity.includes(activityFilter));

  const handleCreateCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customPhone || !customDate) return;
    
    setRequestSubmitted(true);
    // Simulation: Reset form after delay
    setTimeout(() => {
      setCustomName('');
      setCustomPhone('');
      setCustomDate('');
      setRequestSubmitted(false);
    }, 5000);
  };

  const getTourTitle = (title: string) => {
    if (lang === 'ru') return title;
    if (lang === 'en') {
      if (title.includes('Ночной лов кальмара')) return 'Night Squid Jigging on Ulysses';
      if (title.includes('Трофейный лов тунца')) return 'Trophy Tuna Hunting in Peter the Great Gulf';
      if (title.includes('Экскурсия к лежбищам')) return 'Excursion to Spotted Seal Rookeries (Rimsky-Korsakov)';
      return title;
    }
    // Chinese
    if (title.includes('Ночной лов кальмара')) return '尤利西斯湾夜钓鱿鱼';
    if (title.includes('Трофейный лов тунца')) return '彼得大帝湾顶级金枪鱼捕捞';
    if (title.includes('Экскурсия к лежбищам')) return '里姆斯基-科萨科夫群岛斑海豹栖息地观光';
    return title;
  };

  const getTourHomeport = (port: string) => {
    if (lang === 'ru') return port;
    if (lang === 'en') {
      if (port.includes('Улисс')) return 'Ulysses Bay';
      if (port.includes('Золотой Рог')) return 'Golden Horn Bay';
      return port;
    }
    // Chinese
    if (port.includes('Улисс')) return '尤利西斯湾';
    if (port.includes('Золотой Рог')) return '金角湾';
    return port;
  };

  const getTourActivity = (activity: string) => {
    if (lang === 'ru') return activity;
    if (lang === 'en') {
      if (activity.toLowerCase().includes('кальмар')) return 'Squid Jigging';
      if (activity.toLowerCase().includes('тунец')) return 'Tuna Fishing';
      if (activity.toLowerCase().includes('нерп')) return 'Seal Rookery';
      return activity;
    }
    // Chinese
    if (activity.toLowerCase().includes('кальмар')) return '夜钓鱿鱼';
    if (activity.toLowerCase().includes('тунец')) return '金枪鱼捕捞';
    if (activity.toLowerCase().includes('нерп')) return '海豹观光';
    return activity;
  };

  const getTourFeature = (feat: string) => {
    if (lang === 'ru') return feat;
    if (lang === 'en') {
      if (feat.includes('Снасти включены')) return 'Tackle Included';
      if (feat.includes('Эхолот 3D')) return '3D Sonar';
      if (feat.includes('Горячий чай')) return 'Hot Tea';
      if (feat.includes('Пояс для вываживания')) return 'Fighting Belt';
      if (feat.includes('Инструктаж гида')) return 'Guide Briefing';
      if (feat.includes('Обед включен')) return 'Lunch Included';
      if (feat.includes('Фотограф')) return 'Photographer';
      if (feat.includes('Бинокли')) return 'Binoculars';
      return feat;
    }
    // Chinese
    if (feat.includes('Снасти включены')) return '包含钓具';
    if (feat.includes('Эхолот 3D')) return '3D声纳探鱼器';
    if (feat.includes('Горячий чай')) return '提供热茶';
    if (feat.includes('Пояс для вываживания')) return '钓鱼格斗腰带';
    if (feat.includes('Инструктаж гида')) return '向导指导';
    if (feat.includes('Обед включен')) return '包含午餐';
    if (feat.includes('Фотограф')) return '随船摄影';
    if (feat.includes('Бинокли')) return '专业双筒望远镜';
    return feat;
  };

  return (
    <div className="space-y-8" id="sea-concierge-section">
      
      {/* Intro Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-radial-[circle_at_top_right,rgba(34,211,238,0.15)_0%,transparent_60%] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            <span>{lang === 'ru' ? 'Новый сервис «Морской консьерж»' : lang === 'en' ? 'New Service "Sea Concierge"' : '全新服务“海洋康西尔奇”'}</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight text-left">
            {lang === 'ru' ? 'Сборные выходы и рыбалка в группах' : lang === 'en' ? 'Group Tours & Shared Fishing Trips' : '拼船出海与拼团钓鱼'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed text-left">
            {lang === 'ru'
              ? 'Не нужно переплачивать за аренду целого катера. Бронируйте одно или несколько мест в сборных турах профессиональных капитанов. Выходите на трофейного тунца, ночной лов кальмара или экскурсии к лежбищам нерп с единомышленниками.'
              : lang === 'en'
              ? 'No need to overpay for renting a whole boat. Book one or multiple seats in group tours organized by professional captains. Go out for trophy tuna, night squid jigging, or seal rookery tours with like-minded sea lovers.'
              : '无需承担整条船的租赁高额费用。可直接预订由专业船长组织的拼船行程中的一个或多个席位。与其他海洋爱好者一起捕捞帝王金枪鱼、夜钓鱿鱼，或前往海豹栖息地观光。'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'кальмар', 'тунец', 'нерп'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActivityFilter(filter)}
              id={`concierge-filter-${filter}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activityFilter === filter
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {filter === 'all' 
                ? (lang === 'ru' ? 'Все выходы' : lang === 'en' ? 'All Tours' : '全部行程') 
                : filter === 'кальмар' 
                ? (lang === 'ru' ? 'Кальмар' : lang === 'en' ? 'Squid' : '夜钓鱿鱼') 
                : filter === 'тунец' 
                ? (lang === 'ru' ? 'Тунец' : lang === 'en' ? 'Tuna' : '金枪鱼') 
                : (lang === 'ru' ? 'Нерпы' : lang === 'en' ? 'Seals' : '斑海豹')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Shared Excursions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="shared-tours-grid">
        {filteredTours.map((tour) => {
          const occupancyPercentage = ((tour.totalSeats - tour.availableSeats) / tour.totalSeats) * 100;
          return (
            <div 
              key={tour.id}
              id={`tour-card-${tour.id}`}
              className="group relative rounded-2xl border border-white/10 bg-slate-950/40 hover:bg-slate-950/70 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Image and activity chip */}
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={tour.vesselImage} 
                  alt={tour.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider rounded-md bg-cyan-500 text-slate-950">
                  {getTourActivity(tour.targetActivity)}
                </span>
                
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-cyan-300 uppercase block">{getTourHomeport(tour.homeport)}</span>
                    <h4 className="text-sm font-bold text-white tracking-tight">{getTourTitle(tour.title)}</h4>
                  </div>
                </div>
              </div>

              {/* Core Info Body */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>{tour.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{tour.time}</span>
                  </div>
                </div>

                {/* Extras/Features Bullets */}
                <div className="flex flex-wrap gap-1.5">
                  {tour.features.map((feat) => (
                    <span key={feat} className="text-[10px] bg-slate-900 border border-white/5 text-slate-400 px-2 py-0.5 rounded-md">
                      {getTourFeature(feat)}
                    </span>
                  ))}
                </div>

                {/* Seats progress bar */}
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {lang === 'ru' 
                        ? `Занято мест: ${tour.totalSeats - tour.availableSeats} из ${tour.totalSeats}` 
                        : lang === 'en' 
                        ? `Seats taken: ${tour.totalSeats - tour.availableSeats} of ${tour.totalSeats}` 
                        : `已定座位：${tour.totalSeats - tour.availableSeats} / ${tour.totalSeats}`}
                    </span>
                    <span className="font-semibold text-white">
                      {lang === 'ru' ? `Осталось: ${tour.availableSeats}` : lang === 'en' ? `Left: ${tour.availableSeats}` : `剩余：${tour.availableSeats}`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                      style={{ width: `${occupancyPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Price and Action row */}
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-mono block">{lang === 'ru' ? 'ЦЕНА ЗА МЕСТО' : lang === 'en' ? 'PRICE PER SEAT' : '单座价格'}</span>
                    <span className="text-base font-bold text-white font-mono">{tour.pricePerSeat.toLocaleString()} ₽</span>
                  </div>
                  <button
                    onClick={() => onBookSeat(tour)}
                    id={`btn-book-seat-${tour.id}`}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>{lang === 'ru' ? 'Занять место' : lang === 'en' ? 'Book Seat' : '加入拼船'}</span>
                    <Anchor className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Active Captain / Captain Form Request submission */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-6 flex flex-col lg:flex-row gap-8 items-center animate-fade-in" id="custom-tour-proposal-container">
        
        <div className="space-y-3 flex-1 text-left">
          <h4 className="text-base font-bold text-white">
            {lang === 'ru' ? 'Не нашли подходящий групповой выход?' : lang === 'en' ? 'Didn\'t find a suitable group tour?' : '没有找到合适的拼船出海行程？'}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'ru'
              ? 'Оставьте заявку на сборный выход! Мы опубликуем вашу идею в системе и в закрытых капитанских чатах Владивостока. Как только соберется нужный кворум или свободный катер выразит готовность, мы свяжемся с вами.'
              : lang === 'en'
              ? 'Submit a request for a shared tour! We will post your request in the platform and in private Vladivostok captains chats. As soon as a quorum is gathered or a free vessel becomes available, we will contact you.'
              : '提交您的拼船需求！我们将在平台及海参崴内部船长社群中发布您的出海想法。一旦人员攒齐或有空闲船只响应，我们将立即与您取得联系。'}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{lang === 'ru' ? 'База из 120+ капитанов' : lang === 'en' ? 'Database of 120+ captains' : '120位以上签约船长储备'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{lang === 'ru' ? 'Среднее время ответа: 25 мин' : lang === 'en' ? 'Average reply time: 25 min' : '平均回复时间：25分钟'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Request Submission form */}
        <div className="w-full lg:max-w-sm bg-slate-900/60 border border-white/5 p-5 rounded-xl">
          {requestSubmitted ? (
            <div className="text-center py-8 space-y-3" id="proposal-success-box">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h5 className="text-sm font-bold text-white">{lang === 'ru' ? 'Заявка успешно отправлена!' : lang === 'en' ? 'Request successfully sent!' : '拼船申请已成功提交！'}</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'ru' 
                  ? `Вы отправили запрос на сборный тур: ${customActivity} на дату ${customDate}. Капитаны Улисса и Змеинки уже получили уведомление.`
                  : lang === 'en'
                  ? `You submitted a request for group tour: ${customActivity} on ${customDate}. Captains of Ulysses and Zmeinka have already been notified.`
                  : `您已成功提交拼船需求：计划于 ${customDate} 体验 ${customActivity}。乌利斯湾和兹梅因卡湾的船长们已收到实时通知。`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateCustomRequest} className="space-y-3 text-left" id="custom-tour-form">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    {lang === 'ru' ? 'Что ловим/Ищем' : lang === 'en' ? 'Target Activity' : '出海体验项目'}
                  </label>
                  <select
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    id="custom-tour-activity"
                    className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Кальмары">{lang === 'ru' ? '🦑 Кальмар (ночь)' : lang === 'en' ? '🦑 Squid (night)' : '🦑 夜钓鱿鱼（夜间）'}</option>
                    <option value="Тунец">{lang === 'ru' ? '🐟 Трофейный тунец' : lang === 'en' ? '🐟 Trophy Tuna' : '🐟 捕捞大金枪鱼'}</option>
                    <option value="Лакедра">{lang === 'ru' ? '🎣 Лакедра (желтохвост)' : lang === 'en' ? '🎣 Yellowtail Kingfish' : '🎣 捕捞鰤鱼（黄尾鲹）'}</option>
                    <option value="Нерпы">{lang === 'ru' ? '🦭 Нерпы (экскурсия)' : lang === 'en' ? '🦭 Spotted Seals (excursion)' : '🦭 斑海豹（观光）'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    {lang === 'ru' ? 'Желаемая дата' : lang === 'en' ? 'Preferred Date' : '期望出海日期'}
                  </label>
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    id="custom-tour-date"
                    className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    {lang === 'ru' ? 'Мест с вами' : lang === 'en' ? 'Seats Needed' : '同行人数（座位）'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={customSeats}
                    onChange={(e) => setCustomSeats(parseInt(e.target.value))}
                    id="custom-tour-seats"
                    className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    {lang === 'ru' ? 'Ваше имя' : lang === 'en' ? 'Your Name' : '您的姓名'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'ru' ? 'Александр' : lang === 'en' ? 'Alexander' : '亚历山大'}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    id="custom-tour-name"
                    className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  {lang === 'ru' ? 'Номер телефона' : lang === 'en' ? 'Phone Number' : '电话号码'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (999) 111-22-33"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  id="custom-tour-phone"
                  className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-proposal"
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
              >
                <span>{lang === 'ru' ? 'Разместить заявку' : lang === 'en' ? 'Submit Proposal' : '发布拼船需求'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
