/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = string;

export interface LanguageOption {
  id: string;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺' },
  { id: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { id: 'zh', label: 'Chinese (Simplified)', nativeLabel: '简体中文', flag: '🇨🇳' },
  { id: 'zh-TW', label: 'Chinese (Traditional)', nativeLabel: '繁體中文', flag: '🇭🇰' },
  { id: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵' },
  { id: 'ko', label: 'Korean', nativeLabel: '한국어', flag: '🇰🇷' },
  { id: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { id: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { id: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { id: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹' },
  { id: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', flag: '🇹🇷' },
  { id: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇦🇪' },
  { id: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇵🇹' },
  { id: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'th', label: 'Thai', nativeLabel: 'ภาษาไทย', flag: '🇹🇭' },
  { id: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { id: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', flag: '🇳🇱' },
  { id: 'pl', label: 'Polish', nativeLabel: 'Polski', flag: '🇵🇱' },
  { id: 'sv', label: 'Swedish', nativeLabel: 'Svenska', flag: '🇸🇪' },
  { id: 'no', label: 'Norwegian', nativeLabel: 'Norsk', flag: '🇳🇴' },
  { id: 'da', label: 'Danish', nativeLabel: 'Dansk', flag: '🇩🇰' },
  { id: 'fi', label: 'Finnish', nativeLabel: 'Suomi', flag: '🇫🇮' },
  { id: 'el', label: 'Greek', nativeLabel: 'Ελληνικά', flag: '🇬🇷' },
  { id: 'cs', label: 'Czech', nativeLabel: 'Čeština', flag: '🇨🇿' },
  { id: 'bg', label: 'Bulgarian', nativeLabel: 'Български', flag: '🇧🇬' },
  { id: 'uk', label: 'Ukrainian', nativeLabel: 'Українська', flag: '🇺🇦' },
  { id: 'he', label: 'Hebrew', nativeLabel: 'עברית', flag: '🇮🇱' },
  { id: 'ro', label: 'Romanian', nativeLabel: 'Română', flag: '🇷🇴' },
  { id: 'hu', label: 'Hungarian', nativeLabel: 'Magyar', flag: '🇭🇺' },
  { id: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', flag: '🇮🇩' },
  { id: 'ms', label: 'Malay', nativeLabel: 'Bahasa Melayu', flag: '🇲🇾' },
  { id: 'tl', label: 'Filipino', nativeLabel: 'Tagalog', flag: '🇵🇭' }
];

interface LanguageContextType {
  lang: 'ru' | 'en' | 'zh' | 'ja' | 'ko';
  selectedLang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, section?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  ru: {
    common: {
      brand: 'ФАРВАТЕР',
      subtitle: 'Единая цифровая платформа маломерного флота Владивостока',
      login: 'Войти',
      logout: 'Выйти',
      latitude: 'ШИРОТА',
      longitude: 'ДОЛГОТА',
      search_placeholder: 'Поиск судна, капитана, бухты или опций...',
      persons: 'чел.',
      kmh: 'км/ч',
      rub_hour: '₽/час',
      rub_day: '₽/день',
      homeport: 'Порт приписки',
      captain: 'Капитан',
      rating: 'Рейтинг',
      reviews: 'отзывов',
      features: 'Особенности судна',
      activities: 'Разрешенные активности',
      book: 'Забронировать судно',
      available: 'Свободен',
      busy: 'На рейсе',
      maintenance: 'Обслуживание',
      apply: 'Применить',
      cancel: 'Отмена',
      save: 'Сохранить',
      send: 'Отправить',
      close: 'Закрыть',
      loading: 'Загрузка...',
      success: 'Успешно!',
      error: 'Ошибка',
      back: 'Назад',
      or: 'или'
    },
    nav: {
      rent: 'Аренда флота',
      concierge: 'Морской консьерж',
      captain_hub: 'Цифровой Капитан',
      bridge: 'Мостик',
      cabin: 'Каюта',
      auth: 'Войти'
    },
    storm: {
      title: 'Штормовой режим: Пролив Босфор Восточный',
      desc: 'Высокое волнение моря. Прогулки в открытых водах ограничены капитанами в целях безопасности.',
      recommend: 'Рекомендуем защищенные бухты острова Русский'
    },
    themes: {
      day: '☀️ Солнечный день',
      sunset: '🌅 Вечерний закат',
      night: '🌕 Полнолунная ночь',
      auto: '🕒 Авто (Время)',
      manual: '🛠️ Ручной режим'
    },
    categories: {
      all: 'Весь флот',
      yacht: 'Парусные и моторные яхты',
      boat: 'Скоростные катера',
      jetski: 'Гидроциклы',
      taxi: 'Морское такси 24/7'
    },
    filters: {
      title: 'Параметры поиска и фильтры',
      storm_safe_only: '🛡️ Только безопасные при шторме (бухта Новик)',
      free_now: '⚡ Свободны прямо сейчас',
      shark_repeller: '🦈 Электромагнитный отпугиватель акул',
      music: '🎵 Акустическая система высокого класса',
      echo_sounder: '🐟 Профессиональный эхолот для рыбалки',
      max_price: 'Предел стоимости',
      sort_by: 'Сортировка списка',
      sort_rating: 'По рейтингу и отзывам',
      sort_price_asc: 'Сначала доступные',
      sort_price_desc: 'Сначала премиальные'
    },
    map_tools: {
      title: 'Точное указание места посадки',
      desc: 'Кликните по интерактивной карте или введите координаты, чтобы установить индивидуальную точку подачи судна.',
      my_position: 'Моя позиция',
      set_point: 'Установить точку',
      point_fixed: 'Координаты посадки зафиксированы',
      projection_title: 'Проекция и экспорт маршрута',
      projection_desc: 'Проецируйте готовые живописные экскурсии на карту или экспортируйте активную траекторию в файлы для судовых картплоттеров.',
      preset_title: 'Живописные маршруты залива:',
      export_title: 'Скачать файл для судового навигатора:',
      export_gpx: 'GPX формат',
      export_kml: 'KML формат',
      export_json: 'GeoJSON формат',
      privacy_title: 'Конфиденциальность:',
      share_captain: 'Капитану',
      share_public: 'Поделиться',
      no_route: 'Маршрут пуст. Постройте маршрут кликами по карте или выберите один из пресетов выше для доступа к экспорту.'
    },
    sponsors: {
      club_offers: 'КЛУБНЫЕ ПРЕДЛОЖЕНИЯ',
      title: 'Специальные предложения и скидки',
      desc: 'Эксклюзивные привилегии от наших морских и гастрономических партнеров во Владивостоке для пользователей платформы.',
      zuma_name: 'Паназиатский ресторан «Zuma»',
      zuma_cat: 'Гастрономический партнер',
      zuma_desc: 'Легендарный ресторан паназиатской кухни во Владивостоке. Попробуйте свежие гребешки и камчатского краба перед выходом в море или закажите кейтеринг прямо на борт.',
      zuma_promo: 'Применяется по промокоду при бронировании яхты',
      zuma_action: 'Активировать скидку 15%',
      seven_feet_name: 'Яхт-клуб «Семь Футов»',
      seven_feet_cat: 'Официальная марина',
      seven_feet_desc: 'Крупнейшая гавань на Дальнем Востоке. Гостям платформы доступны услуги безопасной швартовки, заправки пресной водой, подзарядки и ресторан на берегу.',
      seven_feet_promo: 'Бухта Федорова • Круглосуточный диспетчер',
      seven_feet_action: 'Связаться с мариной',
      vodnik_name: 'Водник • Морской супермаркет',
      vodnik_cat: 'Снаряжение и оптика',
      vodnik_desc: 'Всё необходимое для катеров и яхт: от надежных спасательных жилетов и сигнальных ракет до профессиональных эхолотов. Экспресс-доставка прямо к вашему пирсу.',
      vodnik_promo: 'Промокод на экипировку и аксессуары',
      vodnik_action: 'Скопировать промокод 10%',
      lovi_name: 'Купонный сервис «ЛовиКупон»',
      lovi_cat: 'Официальный партнер',
      lovi_desc: 'Популярный скидочный сервис Приморского края. Активируйте эксклюзивный купон для моментального получения скидки 50% при бронировании катеров.',
      lovi_promo: 'Промокод LOVI50 • Скидка на аренду',
      lovi_action: 'Активировать скидку 50%',
      verification_text: 'Все партнеры проходят обязательную верификацию Капитанской Гильдией Владивостока. Платформа гарантирует оригинальность предложений и экологическую безопасность всех маршрутов.'
    },
    auth: {
      title: 'Вход в Единую Систему Морского Транспорта',
      subtitle: 'Авторизация & Безопасность',
      role_label: 'Выберите тип учетной записи:',
      role_client: 'Пассажир',
      role_client_desc: 'Конфиденциальный круиз',
      role_captain: 'Капитан',
      role_captain_desc: 'Регистрация в ГИМС',
      client_id_title: 'Идентификация Пассажира',
      client_id_desc: 'Посадка на маломерное судно во Владивостоке требует регистрации. Пройдите безопасный вход через аккаунт для автоматической валидации страховки пассажира.',
      yandex_login: 'Войти быстро через Яндекс ID',
      yandex_success: 'Вход выполнен: Воронов В. И.',
      incognito_title: 'Частичное Инкогнито',
      incognito_desc: 'Скрывать мой телефон за маской',
      incognito_active: 'АКТИВЕН',
      incognito_disabled: 'ОТКЛЮЧЕН',
      captain_title: 'Сертификация Капитана',
      gims_label: 'Номер удостоверения ГИМС:',
      vessel_select_label: 'Закрепленное судно:',
      gims_success: 'Лицензия ГИМС верифицирована. Судовой GPS-трекер активирован.',
      auth_success: 'Авторизация пройдена успешно!'
    },
    weather: {
      title: 'Гидрометцентр • Порт Владивосток',
      status_calm: 'ШТИЛЬ • БЕЗОПАСНО',
      status_moderate: 'УМЕРЕННО • ВНИМАНИЕ',
      status_stormy: 'ШТОРМ • ОПАСНО',
      temp_air: 'Воздух',
      temp_water: 'Вода',
      wind: 'Ветер',
      waves: 'Волнение',
      warning: 'Официальное предупреждение:',
      bay_tip: 'Рекомендация по укрытию:'
    }
  },
  en: {
    common: {
      brand: 'FARVATER',
      subtitle: 'Unified Digital Platform of Vladivostok Light Fleet',
      login: 'Login',
      logout: 'Logout',
      latitude: 'LATITUDE',
      longitude: 'LONGITUDE',
      search_placeholder: 'Search vessel, captain, bay or options...',
      persons: 'pers.',
      kmh: 'km/h',
      rub_hour: '₽/hour',
      rub_day: '₽/day',
      homeport: 'Homeport',
      captain: 'Captain',
      rating: 'Rating',
      reviews: 'reviews',
      features: 'Vessel Features',
      activities: 'Allowed Activities',
      book: 'Book Vessel',
      available: 'Available',
      busy: 'On Trip',
      maintenance: 'Maintenance',
      apply: 'Apply',
      cancel: 'Cancel',
      save: 'Save',
      send: 'Send',
      close: 'Close',
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error',
      back: 'Back',
      or: 'or'
    },
    nav: {
      rent: 'Fleet Rental',
      concierge: 'Sea Concierge',
      captain_hub: 'Digital Captain',
      bridge: 'Bridge',
      cabin: 'Cabin',
      auth: 'Login'
    },
    storm: {
      title: 'Storm Alert: Eastern Bosphorus Strait',
      desc: 'High wave warning. Cruises in open waters are restricted by captains for safety reasons.',
      recommend: 'We recommend sheltered bays of Russky Island'
    },
    themes: {
      day: '☀️ Sunny Day',
      sunset: '🌅 Evening Sunset',
      night: '🌕 Full Moon Night',
      auto: '🕒 Auto (Time)',
      manual: '🛠️ Manual Mode'
    },
    categories: {
      all: 'All Fleet',
      yacht: 'Sailing & Motor Yachts',
      boat: 'Speed Boats',
      jetski: 'Jet Skis',
      taxi: 'Sea Taxi 24/7'
    },
    filters: {
      title: 'Search Options & Filters',
      storm_safe_only: '🛡️ Storm safe only (Novik Bay)',
      free_now: '⚡ Available right now',
      shark_repeller: '🦈 Electromagnetic shark repeller',
      music: '🎵 High-end sound system',
      echo_sounder: '🐟 Professional fishing sonar',
      max_price: 'Price limit',
      sort_by: 'Sort List',
      sort_rating: 'By rating & reviews',
      sort_price_asc: 'Price: low to high',
      sort_price_desc: 'Price: high to low'
    },
    map_tools: {
      title: 'Precise Boarding Location',
      desc: 'Click on the interactive map or enter coordinates to set an individual vessel pickup point.',
      my_position: 'My Position',
      set_point: 'Set Point',
      point_fixed: 'Boarding coordinates fixed',
      projection_title: 'Route Projection & Export',
      projection_desc: 'Project ready-made scenic tours on the map or export the active path into files for marine chartplotters.',
      preset_title: 'Scenic Bay Routes:',
      export_title: 'Download file for marine navigator:',
      export_gpx: 'GPX format',
      export_kml: 'KML format',
      export_json: 'GeoJSON format',
      privacy_title: 'Privacy:',
      share_captain: 'To Captain',
      share_public: 'Share Link',
      no_route: 'Route is empty. Draw a route on the map or select a preset above to access export.'
    },
    sponsors: {
      club_offers: 'CLUB OFFERS',
      title: 'Special Offers & Discounts',
      desc: 'Exclusive privileges from our maritime and gastronomic partners in Vladivostok for platform users.',
      zuma_name: 'Pan-Asian Restaurant "Zuma"',
      zuma_cat: 'Gastronomic Partner',
      zuma_desc: 'Legendary pan-Asian restaurant in Vladivostok. Try fresh scallops and Kamchatka crab before heading out to sea or order catering directly on board.',
      zuma_promo: 'Applied via promo code during yacht booking',
      zuma_action: 'Activate 15% discount',
      seven_feet_name: 'Yacht Club "Seven Feet"',
      seven_feet_cat: 'Official Marina',
      seven_feet_desc: 'The largest harbor in the Russian Far East. Platform guests have access to safe mooring, fresh water refilling, recharging, and a restaurant on shore.',
      seven_feet_promo: 'Fedorov Bay • 24/7 dispatcher',
      seven_feet_action: 'Contact Marina',
      vodnik_name: 'Vodnik • Marine Supermarket',
      vodnik_cat: 'Gear & Marine Optics',
      vodnik_desc: 'Everything you need for boats and yachts: from reliable life jackets and flares to professional fishfinders. Express delivery right to your pier.',
      vodnik_promo: 'Promo code for gear and accessories',
      vodnik_action: 'Copy 10% promo code',
      lovi_name: 'Coupon Service "LoviKupon"',
      lovi_cat: 'Official Partner',
      lovi_desc: 'Popular discount service in Primorsky Krai. Activate the exclusive coupon for an instant 50% discount when booking boats.',
      lovi_promo: 'LOVI50 promo code • Rental discount',
      lovi_action: 'Activate 50% discount',
      verification_text: 'All partners undergo mandatory verification by the Captain Guild of Vladivostok. The platform guarantees the originality of offers and environmental safety of all routes.'
    },
    auth: {
      title: 'Login to Unified Maritime Transport System',
      subtitle: 'Authorization & Security',
      role_label: 'Choose account type:',
      role_client: 'Passenger',
      role_client_desc: 'Confidential Cruise',
      role_captain: 'Captain',
      role_captain_desc: 'GIMS Registration',
      client_id_title: 'Passenger Identification',
      client_id_desc: 'Boarding a small vessel in Vladivostok requires registration. Sign in securely via your account for automatic passenger insurance validation.',
      yandex_login: 'Quick Sign In with Yandex ID',
      yandex_success: 'Signed in as: Voronov V. I.',
      incognito_title: 'Partial Incognito',
      incognito_desc: 'Hide my phone number with a mask',
      incognito_active: 'ACTIVE',
      incognito_disabled: 'DISABLED',
      captain_title: 'Captain Certification',
      gims_label: 'GIMS License Number:',
      vessel_select_label: 'Assigned Vessel:',
      gims_success: 'GIMS License verified. Shipborne GPS tracker activated.',
      auth_success: 'Authorization completed successfully!'
    },
    weather: {
      title: 'Hydrometeorological Center • Port of Vladivostok',
      status_calm: 'CALM • SAFE',
      status_moderate: 'MODERATE • WARNING',
      status_stormy: 'STORM • DANGEROUS',
      temp_air: 'Air Temp',
      temp_water: 'Water Temp',
      wind: 'Wind',
      waves: 'Waves',
      warning: 'Official warning:',
      bay_tip: 'Sheltered bay suggestion:'
    }
  },
  zh: {
    common: {
      brand: '航道平台',
      subtitle: '海参崴小轮船队统一数字服务平台',
      login: '登录',
      logout: '退出',
      latitude: '纬度',
      longitude: '经度',
      search_placeholder: '搜索船只、船长、海湾或配置...',
      persons: '人',
      kmh: '公里/小时',
      rub_hour: '卢布/小时',
      rub_day: '卢布/天',
      homeport: '母港',
      captain: '船长',
      rating: '评分',
      reviews: '条评价',
      features: '船只配置',
      activities: '许可活动',
      book: '预订船只',
      available: '空闲',
      busy: '航行中',
      maintenance: '维护中',
      apply: '应用',
      cancel: '取消',
      save: '保存',
      send: '发送',
      close: '关闭',
      loading: '加载中...',
      success: '成功！',
      error: '错误',
      back: '返回',
      or: '或'
    },
    nav: {
      rent: '船队租赁',
      concierge: '海上礼宾',
      captain_hub: '数字船长',
      bridge: '船长驾驶台',
      cabin: '客舱',
      auth: '登录'
    },
    storm: {
      title: '风暴预警：东博斯普鲁斯海峡',
      desc: '风浪较大。为了安全起见，船长已限制外海航行。',
      recommend: '建议选择符拉迪沃斯托克俄罗斯岛的避风海湾'
    },
    themes: {
      day: '☀️ 晴朗白天',
      sunset: '🌅 傍晚晚霞',
      night: '🌕 满月夜晚',
      auto: '🕒 自动 (时间)',
      manual: '🛠️ 手动模式'
    },
    categories: {
      all: '全部船队',
      yacht: '帆船和动力游艇',
      boat: '高速快艇',
      jetski: '摩托艇',
      taxi: '水上出租车 24/7'
    },
    filters: {
      title: '搜索参数与筛选',
      storm_safe_only: '🛡️ 仅限风暴安全海域（诺维克湾）',
      free_now: '⚡ 当前空闲',
      shark_repeller: '🦈 电磁驱鲨器',
      music: '🎵 顶级音响系统',
      echo_sounder: '🐟 专业钓鱼探鱼器',
      max_price: '价格上限',
      sort_by: '列表排序',
      sort_rating: '按评分和评价数量',
      sort_price_asc: '价格低到高',
      sort_price_desc: '价格高到低'
    },
    map_tools: {
      title: '精准乘船地点',
      desc: '点击互动地图或输入坐标以设置您的专属接送点。',
      my_position: '我的位置',
      set_point: '确认位置',
      point_fixed: '接送点坐标已锁定',
      projection_title: '航线规划与导出',
      projection_desc: '在地图上规划好风景秀丽的游览路线，或者将活动轨迹导出为船载导航仪文件。',
      preset_title: '海湾推荐航线：',
      export_title: '下载船载导航仪文件：',
      export_gpx: 'GPX 格式',
      export_kml: 'KML 格式',
      export_json: 'GeoJSON 格式',
      privacy_title: '隐私设置：',
      share_captain: '发送至船长',
      share_public: '分享链接',
      no_route: '路线为空。请在地图上点击绘制路线或在上方选择推荐航线以进行导出。'
    },
    sponsors: {
      club_offers: '俱乐部特惠',
      title: '特别优惠与折扣',
      desc: '专为海参崴「航道」平台用户提供的海上与美食合作伙伴特权。',
      zuma_name: 'Zuma 帕纳亚餐厅',
      zuma_cat: '美食合作伙伴',
      zuma_desc: '海参崴传奇的帕纳亚风味餐厅。在出海前品尝新鲜的扇贝和堪察加帝王蟹，或者直接订购送餐到船服务。',
      zuma_promo: '预订船只时输入优惠码即可享受',
      zuma_action: '激活 15% 折扣',
      seven_feet_name: '"七英尺" 游艇俱乐部',
      seven_feet_cat: '官方码头',
      seven_feet_desc: '俄罗斯远东地区最大的港湾。为本平台宾客提供安全停靠、淡水加注、充电以及岸边餐厅服务。',
      seven_feet_promo: '费多罗夫湾 • 24小时调度员',
      seven_feet_action: '联系码头',
      vodnik_name: 'Vodnik 航海超市',
      vodnik_cat: '航海装备与光学仪器',
      vodnik_desc: '满足快艇和游艇的一切需求：从可靠的救生衣、信号弹到专业探鱼器。可直接送货至您的停靠码头。',
      vodnik_promo: '装备与配件专享优惠码',
      vodnik_action: '复制 10% 优惠码',
      lovi_name: 'LoviKupon 优惠券平台',
      lovi_cat: '官方合作伙伴',
      lovi_desc: '滨海边疆区受欢迎的折扣服务。激活「航道」平台专属优惠券，预订快艇立享半价优惠。',
      lovi_promo: '优惠码 LOVI50 • 租船折扣',
      lovi_action: '激活 50% 折扣',
      verification_text: '所有合作伙伴均通过海参崴船长协会的严格审核。「航道」平台确保提供真实优惠以及环保航线。'
    },
    auth: {
      title: '登录符拉迪沃斯托克海上交通统一系统',
      subtitle: '授权与安全管理',
      role_label: '选择账户类型：',
      role_client: '乘客',
      role_client_desc: '机密乘船航行',
      role_captain: '船长',
      role_captain_desc: '国家小轮注册认证',
      client_id_title: '乘客身份登记',
      client_id_desc: '根据当地海事规定，在海参崴乘坐小轮船只前须进行身份登记。安全登录您的账户以自动激活乘客人身保险。',
      yandex_login: '使用 Yandex ID 快速登录',
      yandex_success: '已登录为：Voronov V. I.',
      incognito_title: '部分匿名保护',
      incognito_desc: '使用虚拟电话遮罩保护隐私',
      incognito_active: '已启用',
      incognito_disabled: '已禁用',
      captain_title: '船长资质验证',
      gims_label: '小轮驾驶证号 (GIMS)：',
      vessel_select_label: '绑定的船只：',
      gims_success: '国家小轮驾驶证已通过验证，船载 GPS 追踪器已上线。',
      auth_success: '身份授权成功！'
    },
    weather: {
      title: '海参崴港口 • 气象与水文中心',
      status_calm: '风平浪静 • 适合航行',
      status_moderate: '中等风浪 • 谨慎出海',
      status_stormy: '风暴预警 • 禁止出海',
      temp_air: '气温',
      temp_water: '水温',
      wind: '风速',
      waves: '浪高',
      warning: '官方警报信息：',
      bay_tip: '推荐避风海湾：'
    }
  },
  ja: {
    common: {
      brand: 'FARVATER',
      subtitle: 'ウラジオストк小型船隊統合デジタルプラットフォーム',
      login: 'ログイン',
      logout: 'ログアウト',
      latitude: '緯度',
      longitude: '経度',
      search_placeholder: '船、船長、湾、またはオプションを検索...',
      persons: '人',
      kmh: 'km/h',
      rub_hour: '₽/時間',
      rub_day: '₽/日',
      homeport: '母港',
      captain: '船長',
      rating: '評価',
      reviews: '件のレビュー',
      features: '船の設備',
      activities: '許可されたアクティビティ',
      book: '船を予約する',
      available: '空きあり',
      busy: '航行中',
      maintenance: 'メンテナンス中',
      apply: '適用',
      cancel: 'キャンセル',
      save: '保存',
      send: '送信',
      close: '閉じる',
      loading: '読み込み中...',
      success: '成功！',
      error: 'エラー',
      back: '戻る',
      or: 'または'
    },
    nav: {
      rent: '船隊レンタル',
      concierge: 'コンシェルジュ',
      captain_hub: 'デジタル船長',
      bridge: 'ブリッジ',
      cabin: 'キャビン',
      auth: 'ログイン'
    },
    storm: {
      title: '暴風雨警告：東ボスポラス海峡',
      desc: '高波警報。安全のため、オープンウォーターでのクルーズは船長によって制限されています。',
      recommend: 'ルースキー島の安全な湾をお勧めします'
    },
    themes: {
      midnight: 'ミッドナイト',
      pearl: 'パール',
      sunset: 'サンセット'
    },
    categories: {
      all: 'すべての船',
      yacht: 'セーリング＆モーターヨット',
      boat: 'スピードボート',
      jetski: 'ジェットスキー',
      taxi: '海上タクシー 24/7'
    },
    filters: {
      title: '検索オプションとフィルター',
      storm_safe_only: '🛡️ 嵐でも安全（ノヴィк湾）',
      free_now: '⚡ 今すぐ利用可能',
      shark_repeller: '🦈 電磁サメ除け装置',
      music: '🎵 ハイエンド音響システム',
      echo_sounder: '🐟 プロ仕様の魚群探知機',
      max_price: '上限価格',
      sort_by: '並べ替え',
      sort_rating: '評価とレビュー順',
      sort_price_asc: '価格の安い順',
      sort_price_desc: '価格の高い順'
    },
    map_tools: {
      title: '正確な乗船場所',
      desc: 'インタラクティブマップをクリックするか、座標を入力して、船の個別のお迎え場所を設定します。',
      my_position: '現在地',
      set_point: 'ポイントを設定',
      point_fixed: '乗船座標が固定されました',
      projection_title: 'ルート投影とエクスポート',
      projection_desc: 'マップ上に景勝ルートを投影するか、航海用プロッター用のファイルとしてエクスポートします。',
      preset_title: '美しい湾のルート：',
      export_title: '航海用ナビゲーター用ファイルのダウンロード：',
      export_gpx: 'GPXフォーマット',
      export_kml: 'KMLフォーマット',
      export_json: 'GeoJSONフォーマット',
      privacy_title: 'プライバシー：',
      share_captain: '船長に送信',
      share_public: 'リンクを共有',
      no_route: 'ルートが空です。マップ上にルートを描くか、プリセットを選択してください。'
    },
    sponsors: {
      club_offers: 'クラブ特典',
      title: '特別オファー＆割引',
      desc: 'ウラジオストкの海洋・グルメパートナーがプラットフォーム利用者に提供する限定特典。',
      zuma_name: 'アジア料理レストラン「Zuma」',
      zuma_cat: 'グルメパートナー',
      zuma_desc: 'ウラジオストкの伝説的なアジア料理レストラン。新鮮なホタテやタラバガニを乗船前にお楽しみいただくか、船上デリバリーをご注文ください。',
      zuma_promo: 'ヨット予約時のプロモコードで適用',
      zuma_action: '15%割引を有効化',
      seven_feet_name: 'ヨットクラブ「セブンフィート」',
      seven_feet_cat: '公認マリーナ',
      seven_feet_desc: 'ロシア極東最大の港。安全な係留、真水補給、充電、陸上レストランが利用可能です。',
      seven_feet_promo: 'フェドロフ湾 • 24時間対応',
      seven_feet_action: 'マリーナに連絡',
      vodnik_name: 'Vodnik • マリンスーパーマーケット',
      vodnik_cat: 'マリン用品＆光学機器',
      vodnik_desc: '信頼性の高いライフジャケットからプロ仕様の魚群探知機まで、ボートやヨットに必要なものがすべて揃います。ピールへエクスプレス配送。',
      vodnik_promo: 'ギア＆アクセサリー用プロモコード',
      vodnik_action: '10%割引コードをコピー',
      lovi_name: 'クーポンサービス「LoviKupon」',
      lovi_cat: '公式パートナー',
      lovi_desc: '沿海地方で人気の割引サービス。ボート予約時に使える50%即時割引クーポンを有効化します。',
      lovi_promo: 'プロモコード LOVI50 • レンタル割引',
      lovi_action: '50%割引を有効化',
      verification_text: 'すべてのパートナーはウラジオストк船長ギルドによる審査を受けています。環境安全性を保証します。'
    },
    auth: {
      title: '統合海上輸送システムへのログイン',
      subtitle: '認証とセキュリティ',
      role_label: 'アカウントタイプを選択してください：',
      role_client: '乗客',
      role_client_desc: '機密クルーズ',
      role_captain: '船長',
      role_captain_desc: 'GIMS登録',
      client_id_title: '乗客の識別',
      client_id_desc: 'ウラジオストкでの小型船への乗船には登録が必要です。安全にログインして自動乗客保険を適用します。',
      yandex_login: 'Yandex IDで簡単ログイン',
      yandex_success: 'ログイン中: Voronov V. I.',
      incognito_title: '一部非公開',
      incognito_desc: '電話番号をマスクして非表示にする',
      incognito_active: '有効',
      incognito_disabled: '無効',
      captain_title: '船長資格証明',
      gims_label: 'GIMSライセンス番号：',
      vessel_select_label: '割り当てられた船：',
      gims_success: 'GIMSライセンスが確認されました。船載GPSトラッカーが起動しました。',
      auth_success: '認証が正常に完了しました！'
    },
    weather: {
      title: 'ウラジオストк港 • 気象水文センター',
      status_calm: '穏やか • 安全',
      status_moderate: '波あり • 注意',
      status_stormy: '嵐 • 危険',
      temp_air: '気温',
      temp_water: '水温',
      wind: '風速',
      waves: '波の高さ',
      warning: '公式警告：',
      bay_tip: 'おすすめの避風湾：'
    }
  },
  ko: {
    common: {
      brand: 'FARVATER',
      subtitle: '블라디보스토크 소형 선박 통합 디지털 플랫폼',
      login: '로그인',
      logout: '로그아웃',
      latitude: '위도',
      longitude: '경도',
      search_placeholder: '선박, 선장, 만 또는 옵션 검색...',
      persons: '명',
      kmh: 'km/h',
      rub_hour: '₽/시간',
      rub_day: '₽/일',
      homeport: '모항',
      captain: '선장',
      rating: '평점',
      reviews: '개의 평가',
      features: '선박 특징',
      activities: '허용된 활동',
      book: '선박 예약하기',
      available: '예약 가능',
      busy: '운항 중',
      maintenance: '정비 중',
      apply: '적용',
      cancel: '취소',
      save: '저장',
      send: '전송',
      close: '닫기',
      loading: '로딩 중...',
      success: '성공!',
      error: '오류',
      back: '뒤로',
      or: '또는'
    },
    nav: {
      rent: '선박 대여',
      concierge: '해양 컨시어지',
      captain_hub: '디지털 선장',
      bridge: '조타실',
      cabin: '객실',
      auth: '로그인'
    },
    storm: {
      title: '폭풍 경보: 동보스포루스 해협',
      desc: '높은 파도 경보. 안전을 위해 오픈 워터 크루즈는 선장에 의해 제한됩니다.',
      recommend: '루스키 섬의 안전한 만을 추천합니다'
    },
    themes: {
      midnight: '미드나잇',
      pearl: '펄',
      sunset: '선셋'
    },
    categories: {
      all: '전체 선박',
      yacht: '세일링 & 모터 요트',
      boat: '스피드 보트',
      jetski: '제트스키',
      taxi: '수상 택시 24/7'
    },
    filters: {
      title: '검색 옵션 및 필터',
      storm_safe_only: '🛡️ 안전 구역 전용 (노빅 만)',
      free_now: '⚡ 지금 이용 가능',
      shark_repeller: '🦈 전자기 상어 퇴치기',
      music: '🎵 고급 음향 시스템',
      echo_sounder: '🐟 전문 어군 탐지기',
      max_price: '최대 요금',
      sort_by: '정렬 기준',
      sort_rating: '평점 및 리뷰순',
      sort_price_asc: '가격 낮은순',
      sort_price_desc: '가격 높은순'
    },
    map_tools: {
      title: '정확한 탑승 위치',
      desc: '지도 위를 클릭하거나 좌표를 입력하여 개별 선박 픽업 지점을 설정하세요.',
      my_position: '내 위치',
      set_point: '위치 설정',
      point_fixed: '탑승 좌표가 설정되었습니다',
      projection_title: '경로 투영 및 내보내기',
      projection_desc: '지도에 관광 경로를 투영하거나 선박용 차트플로터용 파일로 내보냅니다.',
      preset_title: '아름다운 만 추천 경로:',
      export_title: '네비게이터용 파일 다운로드:',
      export_gpx: 'GPX 형식',
      export_kml: 'KML 형식',
      export_json: 'GeoJSON 형식',
      privacy_title: '개인정보 보호:',
      share_captain: '선장에게 전송',
      share_public: '링크 공유',
      no_route: '경로가 비어 있습니다. 지도에 경로를 그리거나 위의 추천 경로를 선택하세요.'
    },
    sponsors: {
      club_offers: '클럽 혜택',
      title: '특별 제공 및 할인',
      desc: '플랫폼 사용자를 위한 블라디보스토크 해양 및 미식 파트너의 독점 혜택.',
      zuma_name: '아시안 레스토랑 "Zuma"',
      zuma_cat: '미식 파트너',
      zuma_desc: '블라디보스토크의 전설적인 아시안 레스토랑. 출항 전 신선한 가리비와 킹크랩을 즐기거나 선상으로 직접 배달을 주문하세요.',
      zuma_promo: '요트 예약 시 프로모션 코드로 적용',
      zuma_action: '15% 할인 활성화',
      seven_feet_name: '요트 클럽 "Seven Feet"',
      seven_feet_cat: '공식 마리나',
      seven_feet_desc: '러시아 극동 최대의 항구. 안전한 계류, 깨끗한 물 공급, 충전 및 육상 레스토랑을 이용하실 수 있습니다.',
      seven_feet_promo: '페도로프 만 • 24시간 대응',
      seven_feet_action: '마리나에 문의',
      vodnik_name: 'Vodnik • 해양 슈퍼마켓',
      vodnik_cat: '장비 및 해양 광학',
      vodnik_desc: '구명조끼부터 전문 어탐기까지 보트와 요트에 필요한 모든 것. 선착장으로 즉시 특송 배송.',
      vodnik_promo: '장비 및 액세서리 프로모션 코드',
      vodnik_action: '10% 할인 코드 복사',
      lovi_name: '쿠폰 서비스 "LoviKupon"',
      lovi_cat: '공식 파트너',
      lovi_desc: '프리모르스키 주 인기 할인 서비스. 보트 예약 시 즉시 50% 할인을 받을 수 있는 쿠폰을 활성화하세요.',
      lovi_promo: '프로모션 코드 LOVI50 • 대여 할인',
      lovi_action: '50% 할인 활성화',
      verification_text: '모든 파트너사는 블라디보스토크 선장 협회의 검증을 통과했습니다. 안전을 보장합니다.'
    },
    auth: {
      title: '통합 해상 교통 시스템 로그인',
      subtitle: '인증 및 보안',
      role_label: '계정 유형 선택:',
      role_client: '승객',
      role_client_desc: '기밀 크루즈',
      role_captain: '선장',
      role_captain_desc: 'GIMS 등록',
      client_id_title: '승객 식별',
      client_id_desc: '블라디보스토크에서 소형 선박 탑승 시 등록이 필요합니다. 안전하게 로그인하여 승객 보험을 자동으로 갱신하세요.',
      yandex_login: 'Yandex ID로 빠른 로그인',
      yandex_success: '로그인됨: Voronov V. I.',
      incognito_title: '일부 익명',
      incognito_desc: '전화번호를 마스킹하여 숨기기',
      incognito_active: '활성화',
      incognito_disabled: '비활성화',
      captain_title: '선장 자격 증명',
      gims_label: 'GIMS 면허 번호:',
      vessel_select_label: '배정된 선박:',
      gims_success: 'GIMS 면허가 확인되었습니다. 선박 내 GPS 추적기가 활성화되었습니다.',
      auth_success: '인증이 성공적으로 완료되었습니다!'
    },
    weather: {
      title: '기상 수문 센터 • 블라디보스토크 항',
      status_calm: '잔잔함 • 안전',
      status_moderate: '보통 파도 • 주의',
      status_stormy: '폭풍 경보 • 위험',
      temp_air: '기온',
      temp_water: '수온',
      wind: '풍속',
      waves: '파고',
      warning: '공식 경보:',
      bay_tip: '대피 추천 만:'
    }
  }
};

const setGoogleTranslateCookie = (langCode: string) => {
  try {
    const domains = [
      window.location.hostname,
      '.' + window.location.hostname,
      window.location.hostname.split('.').slice(-2).join('.'),
      '.' + window.location.hostname.split('.').slice(-2).join('.'),
      ''
    ];
    
    domains.forEach(domain => {
      const domainAttr = domain ? `; domain=${domain}` : '';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainAttr}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${domainAttr}`;
    });

    if (langCode) {
      const cookieValue = `/ru/${langCode}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      const host = window.location.hostname;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${host};`;
      if (host.includes('.')) {
        document.cookie = `googtrans=${cookieValue}; path=/; domain=.${host};`;
      }
    }
  } catch (e) {
    console.error('Failed to set google translate cookie', e);
  }
};

const applyGoogleTranslate = (langCode: string, retries = 30) => {
  try {
    const valueToSet = ['ru', 'en', 'zh'].includes(langCode) ? '' : langCode;
    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectEl) {
      if (selectEl.value !== valueToSet) {
        selectEl.value = valueToSet;
        selectEl.dispatchEvent(new Event('change'));
      }
    } else if (retries > 0) {
      setTimeout(() => {
        applyGoogleTranslate(langCode, retries - 1);
      }, 200);
    }
  } catch (err) {
    console.error('Error applying Google Translate', err);
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('vlad_sea_lang');
    return (saved as Language) || 'ru';
  });

  useEffect(() => {
    // Insert style tag to hide Google Translate's native top bar and widget elements
    const styleId = 'google-translate-custom-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        /* Hide Google Translate top frame banner and tooltip */
        iframe.goog-te-banner-frame,
        .goog-te-banner-frame,
        .goog-te-banner,
        .goog-te-balloon-frame,
        #goog-gt-tt {
          display: none !important;
          visibility: hidden !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        .goog-tooltip, .goog-tooltip:hover {
          display: none !important;
          visibility: hidden !important;
        }
        #google_translate_element {
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
          width: 1px !important;
          height: 1px !important;
          overflow: hidden !important;
          display: block !important;
          visibility: visible !important;
        }
      `;
      document.head.appendChild(style);
    }

    const savedLang = localStorage.getItem('vlad_sea_lang') || 'ru';
    // Pre-emptively start polling for Google Translate elements if already loaded
    applyGoogleTranslate(savedLang);

    // Load google translate widget script dynamically
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      // Create google translate container
      const containerId = 'google_translate_element';
      if (!document.getElementById(containerId)) {
        const div = document.createElement('div');
        div.id = containerId;
        div.style.position = 'absolute';
        div.style.top = '-9999px';
        div.style.left = '-9999px';
        div.style.width = '1px';
        div.style.height = '1px';
        div.style.overflow = 'hidden';
        document.body.appendChild(div);
      }

      // Assign the global init callback
      (window as any).googleTranslateElementInit = () => {
        try {
          new (window as any).google.translate.TranslateElement({
            pageLanguage: 'ru',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
        } catch (e) {
          console.error('TranslateElement init failed', e);
        }

        const currentLang = localStorage.getItem('vlad_sea_lang') || 'ru';
        setGoogleTranslateCookie(['ru', 'en', 'zh'].includes(currentLang) ? '' : currentLang);
        applyGoogleTranslate(currentLang);
      };

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('vlad_sea_lang', newLang);

    const isGT = !['ru', 'en', 'zh', 'ja', 'ko'].includes(newLang);
    setGoogleTranslateCookie(isGT ? newLang : '');
    applyGoogleTranslate(newLang);
  };

  const resolvedLang = (lang.startsWith('zh') ? 'zh' : ['ru', 'en', 'ja', 'ko'].includes(lang) ? lang : 'ru') as 'ru' | 'en' | 'zh' | 'ja' | 'ko';

  const t = (key: string, section = 'common'): string => {
    const langDict = translations[resolvedLang] || translations.ru;
    const sectDict = (langDict as any)[section] || (translations.ru as any)[section] || {};
    return sectDict[key] || (translations.ru as any)[section]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang: resolvedLang, selectedLang: lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
