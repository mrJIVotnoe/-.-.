import React, { useState } from 'react';
import { Vessel } from '../types';
import { Star, Camera, MessageSquare, Check, Sparkles, Image as ImageIcon, X } from 'lucide-react';
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

interface ReviewsLogbookProps {
  vessels: Vessel[];
  setVessels: React.Dispatch<React.SetStateAction<Vessel[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

export default function ReviewsLogbook({ vessels, setVessels, reviews, setReviews }: ReviewsLogbookProps) {
  const { lang, t } = useTranslation();
  const [selectedVesselId, setSelectedVesselId] = useState<string>(vessels[0]?.id || 'julia-60');
  const [customerName, setCustomerName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  
  // Photo selection state
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [showPhotoSelector, setShowPhotoSelector] = useState<boolean>(false);
  
  // Feedback notification
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const presetPhotos = [
    {
      id: 'p1',
      label: lang === 'ru' ? '🐟 Трофейная рыбалка' : lang === 'en' ? '🐟 Trophy Fishing' : '🐟 顶级捕鱼',
      url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'p2',
      label: lang === 'ru' ? '🌅 Закат на маяке' : lang === 'en' ? '🌅 Lighthouse Sunset' : '🌅 灯塔落日',
      url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'p3',
      label: lang === 'ru' ? '🥂 Вечерний фуршет' : lang === 'en' ? '🥂 Evening Buffet' : '🥂 晚间自助餐',
      url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'p4',
      label: lang === 'ru' ? '⚓️ Красивый причал' : lang === 'en' ? '⚓️ Scenic Pier' : '⚓️ 景致码头',
      url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const handleTogglePhoto = (url: string) => {
    setSelectedPhotos(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const handleAddCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPhotoUrl.trim()) {
      setSelectedPhotos(prev => [...prev, customPhotoUrl.trim()]);
      setCustomPhotoUrl('');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    const vessel = vessels.find(v => v.id === selectedVesselId) || vessels[0];
    
    const newReview: Review = {
      id: `R-${Date.now()}`,
      vesselId: selectedVesselId,
      vesselName: vessel.name,
      captainName: vessel.captainName,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
      date: lang === 'ru' ? 'Сегодня' : lang === 'en' ? 'Today' : '今天',
      photos: selectedPhotos.length > 0 ? selectedPhotos : undefined
    };

    // Add to reviews feed
    setReviews(prev => [newReview, ...prev]);

    // Dynamically recalculate vessel ratings inside state!
    setVessels(prev => prev.map(v => {
      if (v.id === selectedVesselId) {
        // Calculate new rating based on previous reviews + this new one
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

    // Reset form
    setCustomerName('');
    setComment('');
    setSelectedPhotos([]);
    setRating(5);
    setSuccessMsg(
      lang === 'ru' 
        ? '✨ Ваш отзыв успешно занесен в Бортжурнал! Рейтинг капитана обновлен.'
        : lang === 'en'
        ? '✨ Review recorded in the Logbook! Captain rating updated.'
        : '✨ 您的评价已存入航海日志！船长评分已更新。'
    );
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-8" id="reviews-logbook-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-400" />
            <span>{lang === 'ru' ? 'Судовой Бортжурнал & Отзывы рейсов' : lang === 'en' ? 'Ship Logbook & Trip Reviews' : '航海日志与航次评价'}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {lang === 'ru' ? 'Отзывы реальных фрахтователей, отчеты об уловах и оценки профессионализма капитанов' : lang === 'en' ? 'Verified charterer reviews, catch reports, and captain professionalism scores' : '真实的租船客户评价、渔获报告与船长专业评分'}
          </p>
        </div>
        <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider">
          ★ {reviews.length} {lang === 'ru' ? 'успешных рейсов' : lang === 'en' ? 'successful voyages' : '次成功航程'}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-3 animate-slide-in">
          <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Add review form (45%) */}
        <form onSubmit={handleSubmitReview} className="lg:col-span-5 space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-white/5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <span>📝 {lang === 'ru' ? 'Оставить отзыв о рейсе' : lang === 'en' ? 'Post Trip Review' : '发表出海评价'}</span>
          </h4>

          {/* Vessel select */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Выберите судно и капитана' : lang === 'en' ? 'Select Vessel & Captain' : '选择船只与船长'}</label>
            <select
              value={selectedVesselId}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
            >
              {vessels.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({lang === 'ru' ? 'кап.' : 'Capt.'} {v.captainName})
                </option>
              ))}
            </select>
          </div>

          {/* Passenger name */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Ваше имя' : lang === 'en' ? 'Your Name' : '您的姓名'}</label>
            <input
              type="text"
              placeholder={lang === 'ru' ? 'Александр' : lang === 'en' ? 'Alexander' : '亚历山大'}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Star rating selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Оценка работы капитана' : lang === 'en' ? 'Captain Rating' : '船长服务评分'}</label>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-3 rounded-xl border border-white/5">
              {[1, 2, 3, 4, 5].map((val) => {
                const isLit = hoveredRating !== null ? val <= hoveredRating : val <= rating;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    onMouseEnter={() => setHoveredRating(val)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 focus:outline-none transition-transform active:scale-95"
                  >
                    <Star 
                      className={`w-6 h-6 transition-all ${
                        isLit 
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' 
                          : 'text-slate-600'
                      }`} 
                    />
                  </button>
                );
              })}
              <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                ({rating} / 5)
              </span>
            </div>
          </div>

          {/* Review text */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Отзыв о рейсе' : lang === 'en' ? 'Review Details' : '出海体验评价'}</label>
            <textarea
              rows={3}
              placeholder={lang === 'ru' ? 'Расскажите как прошел рейс, довольны ли вы маршрутом, работой команды и комфортом на борту...' : lang === 'en' ? 'Describe your trip, captain performance, gear, and onboard experience...' : '请分享您的航行感受、对路线、船员服务及船上设施的满意度...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400 font-sans"
            />
          </div>

          {/* Pre-uploaded Photo Reports Picker */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-slate-400 font-mono uppercase block">📸 {lang === 'ru' ? 'Фотоотчет об успешном рейсе' : lang === 'en' ? 'Voyage Photos' : '出海照片报告'}</label>
              <button
                type="button"
                onClick={() => setShowPhotoSelector(!showPhotoSelector)}
                className="text-[9px] font-mono font-bold text-rose-400 hover:underline uppercase"
              >
                {showPhotoSelector ? (lang === 'ru' ? 'Скрыть выбор' : lang === 'en' ? 'Hide' : '隐藏') : (lang === 'ru' ? 'Выбрать фото улова/заката' : lang === 'en' ? 'Choose Preset Photos' : '选择示例照片')}
              </button>
            </div>

            {showPhotoSelector && (
              <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-white/5 animate-fade-in">
                <p className="text-[9px] text-slate-500 font-sans">{lang === 'ru' ? 'Выберите готовые фотоотчеты для быстрой демонстрации:' : lang === 'en' ? 'Select sample photos to attach:' : '选择示例照片进行关联：'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {presetPhotos.map(p => {
                    const isSelected = selectedPhotos.includes(p.url);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleTogglePhoto(p.url)}
                        className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all overflow-hidden ${
                          isSelected 
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' 
                            : 'bg-slate-900 border-white/5 hover:border-white/10 text-slate-400'
                        }`}
                      >
                        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                          <img src={p.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-medium truncate">{p.label}</span>
                        {isSelected && <Check className="w-3 h-3 ml-auto text-rose-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Image URL input & Local File Upload */}
                <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={lang === 'ru' ? 'Вставить ссылку на ваше фото...' : lang === 'en' ? 'Paste photo URL...' : '粘贴照片链接...'}
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      className="flex-1 bg-slate-900 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-rose-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPhoto}
                      className="px-2.5 py-1 bg-rose-500 text-slate-950 font-bold text-[9px] uppercase rounded-lg hover:bg-rose-600 transition-colors font-mono"
                    >
                      {lang === 'ru' ? 'Добавить' : lang === 'en' ? 'Add' : '添加'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer py-1.5 px-3 rounded-lg bg-slate-900 border border-dashed border-rose-500/30 hover:border-rose-400 text-rose-300 text-[10px] font-mono flex items-center justify-center gap-1.5 transition-all">
                      <Camera className="w-3.5 h-3.5 text-rose-400" />
                      <span>{lang === 'ru' ? '📁 Загрузить фото с устройства' : lang === 'en' ? '📁 Upload photo from device' : '📁 从设备上传照片'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setSelectedPhotos(prev => [...prev, event.target!.result as string]);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Displaying selected photos preview */}
            {selectedPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-slate-900 rounded-xl border border-white/5">
                {selectedPhotos.map((url, i) => (
                  <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                    <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => handleTogglePhoto(url)}
                      className="absolute top-0 right-0 p-0.5 bg-black/70 text-rose-400 hover:text-rose-500 rounded-bl"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(244,63,94,0.15)] flex items-center justify-center gap-1.5"
          >
            <span>🚢 {lang === 'ru' ? 'Занести в бортжурнал' : lang === 'en' ? 'Submit to Logbook' : '登记入航海日志'}</span>
          </button>
        </form>

        {/* Right column: Active reviews list (55%) */}
        <div className="lg:col-span-7 space-y-4 max-h-[580px] overflow-y-auto pr-1">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>📖 {lang === 'ru' ? 'История плаваний и отзывы' : lang === 'en' ? 'Voyage History & Logbook Entries' : '航行记录与用户评价'}</span>
          </h4>

          {reviews.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-white/5 bg-slate-950/20 text-slate-500">
              <ImageIcon className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-xs">{lang === 'ru' ? 'Записей в бортжурнале пока нет. Станьте первым!' : lang === 'en' ? 'No logbook entries yet. Be the first!' : '暂无航海日志记录，快来发表第一条吧！'}</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-colors animate-fade-in">
                
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="font-bold text-white text-xs block">{r.customerName}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {lang === 'ru' ? 'Рейс на:' : lang === 'en' ? 'Charter:' : '出海船只:'} <span className="text-rose-400 font-medium">{r.vesselName}</span> ({lang === 'ru' ? 'кап.' : 'Capt.'} {r.captainName})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5 justify-end">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-3.5 h-3.5 ${
                            s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">{r.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">{r.comment}</p>

                {/* Displaying photo attachments of successful voyage */}
                {r.photos && r.photos.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Camera className="w-3 h-3 text-rose-400" />
                      <span>{lang === 'ru' ? 'Фотоотчет улова & путешествия' : lang === 'en' ? 'Catch & Voyage Photos' : '出海捕捞与游览照片'}</span>
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {r.photos.map((ph, idx) => (
                        <div key={idx} className="relative w-28 h-20 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 group/img">
                          <img src={ph} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

