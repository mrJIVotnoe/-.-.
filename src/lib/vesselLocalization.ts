/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vessel, SharedTour, MapPoint } from '../types';

// Transliterate function to guarantee 0% Cyrillic characters in English view
export function transliterateCyrillicToLatin(text: string): string {
  if (!text) return text;
  const cyrillicMap: Record<string, string> = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  return text.replace(/[а-яА-ЯёЁ]/g, (char) => cyrillicMap[char] || char);
}

// Translations for Ports
const PORTS_I18N: Record<string, Record<string, string>> = {
  'Бухта Новик (яхт-клуб)': {
    en: 'Novik Bay (Yacht Club)',
    zh: '诺维克湾（游艇俱乐部）',
    ja: 'ノヴィク湾（ヨットクラブ）',
    ko: '노빅 만 (요트 클럽)'
  },
  'Токаревский маяк (стоянка)': {
    en: 'Tokarevsky Lighthouse Pier',
    zh: '托卡列夫灯塔停泊点',
    ja: 'トカレフスキー灯台（桟橋）',
    ko: '토카레프스키 등대 (선착장)'
  },
  'Токаревский маяк': {
    en: 'Tokarevsky Lighthouse',
    zh: '托卡列夫灯塔',
    ja: 'トカレフスキー灯台',
    ko: '토카레프스키 등대'
  },
  'Бухта Змеинка': {
    en: 'Zmeinka Bay',
    zh: '蛇湾',
    ja: 'ズメインカ湾',
    ko: '즈메인카 만'
  },
  'Бухта Улисс': {
    en: 'Uliss Bay',
    zh: '尤利西斯湾',
    ja: 'ウリス湾',
    ko: '율리시스 만'
  },
  'о. Русский (Поспелово)': {
    en: 'Russky Island (Pospelovo)',
    zh: '俄罗斯岛（波斯佩洛沃）',
    ja: 'ルースキー島（ポスペロボ）',
    ko: '루스키 섬 (포스펠로보)'
  },
  'Бухта Новик (Канал)': {
    en: 'Novik Bay (Channel)',
    zh: '诺维克湾（运河）',
    ja: 'ノヴィク湾（水路）',
    ko: '노빅 만 (운하)'
  },
  'Яхт-клуб «Семь Футов»': {
    en: 'Seven Feet Yacht Club',
    zh: '“七英尺”游艇俱乐部',
    ja: 'セブンフィートヨットクラブ',
    ko: '세븐 피트 요트 클럽'
  }
};

// Translations for Captain Names
const CAPTAINS_I18N: Record<string, Record<string, string>> = {
  'Алексей Бережной': { en: 'Alexey Berezhnoy', zh: '阿列克谢·别列日诺伊' },
  'Виктор Соколов': { en: 'Victor Sokolov', zh: '维克多·索科洛夫' },
  'Дмитрий Мельников': { en: 'Dmitry Melnikov', zh: '德米特里·梅尔尼科夫' },
  'Игорь Кальмаренко': { en: 'Igor Kalmarenko', zh: '伊戈尔·卡尔马伦科' },
  'Константин Морской': { en: 'Konstantin Morskoy', zh: '康斯坦丁·莫尔斯科伊' },
  'Станислав (Инструктор)': { en: 'Stanislav (Instructor)', zh: '斯塔尼斯瓦夫 (教练)' },
  'Михаил (Инструктор)': { en: 'Mikhail (Instructor)', zh: '米哈伊尔 (教练)' },
  'Роман Круглов': { en: 'Roman Kruglov', zh: '罗曼·克鲁格洛夫' },
  'Николай Ветров': { en: 'Nikolai Vetrov', zh: '尼古拉·维特罗夫' },
  'Сергей Волков': { en: 'Sergey Volkov', zh: '谢尔盖·沃尔科夫' },
  'Владислав Ясный': { en: 'Vladislav Yasny', zh: '弗拉迪斯拉夫·亚斯尼' },
  'Артур Кинг': { en: 'Arthur King', zh: '阿瑟·金' },
  'Денис Вэйк': { en: 'Denis Wake', zh: '丹尼斯·韦克' },
  'Руслан (Инструктор)': { en: 'Ruslan (Instructor)', zh: '罗斯兰 (教练)' },
  'Виталий Вест': { en: 'Vitaly West', zh: '维塔利·韦斯特' }
};

// Translations for Vessel Names and Descriptions
const VESSELS_I18N: Record<string, {
  name: Record<string, string>;
  description: Record<string, string>;
}> = {
  'julia-60': {
    name: {
      en: 'Exclusive Yacht "Julia"',
      zh: '“朱莉娅”尊享游艇',
      ja: '高級ヨット「ジュリア」',
      ko: '프리미엄 요트 "줄리아"'
    },
    description: {
      en: 'Luxury 60ft VIP motor yacht. Features an Australian Shark Shield electromagnetic repeller system for maximum swimming safety in open waters of Peter the Great Gulf. Spacious flybridge, leather interior, fully equipped galley, 3 luxury cabins.',
      zh: '60英尺VIP级豪华马达游艇。配备澳大利亚防鲨系统 (Shark Shield)，保障在彼得大帝湾开放水域游泳的安全。宽敞飞桥、真皮内饰、设施齐全的厨房和3间豪华客舱。'
    }
  },
  'nika-yacht': {
    name: {
      en: 'Sailing & Motor Yacht "Nika"',
      zh: '“妮卡”帆船动力游艇'
    },
    description: {
      en: 'Elegant sailing yacht for sea romance and comfort. Great for quiet family cruises in Amur Bay or photo shoots at Tokarevsky Lighthouse. Teak deck, spacious cockpit, experienced captain.',
      zh: '优雅的帆船游艇，兼具海洋浪漫与舒适体验。非常适合在阿穆尔湾进行宁静的家庭帆船巡航，或在托卡列夫灯塔落日下拍照。'
    }
  },
  'princess-yacht': {
    name: {
      en: 'Gliding Flybridge "Princess"',
      zh: '“公主号”飞桥滑行快艇'
    },
    description: {
      en: 'Fast motor yacht from legendary British yard Princess. Combines sport boat dynamics with 5-star villa comfort. Dual diesel engines up to 48 km/h. Ideal for fast runs to Rikord or Zheltukhin islands.',
      zh: '英国传奇造船厂 Princess 生产的高速马达游艇。兼具运动快艇的动力与五星级别墅的舒适度。双柴油发动机最高时速48公里。'
    }
  },
  'tuna-hunter': {
    name: {
      en: 'Trophy Fishing Boat "Tuna Hunter 28"',
      zh: '“金枪鱼猎人 28”战利品钓鱼艇'
    },
    description: {
      en: 'Specialized Japanese boat professionally equipped for sport & trophy fishing for yellowtail, tuna, and squid in open sea. Features 3D Raymarine sonar, outriggers, live bait tank, heated cabin.',
      zh: '日本专业钓鱼艇，装备完善，适合在远海捕捞黄尾鱼、金枪鱼和鱿鱼。配有3D Raymarine声纳、拖钓外侧支架、活饵池和保暖舱。'
    }
  },
  'novik-sea-ranger': {
    name: {
      en: 'Pleasure Boat "Novik Ranger"',
      zh: '“诺维克巡游者”观光艇'
    },
    description: {
      en: 'Reliable closed boat for family cruises around Russky Island, picnics in sheltered bays, and flounder fishing. Heated cabin protects from Vladivostok fog.',
      zh: '可靠灵活的封闭式快艇，非常适合在俄罗斯岛周边进行家庭出游、避风湾野餐以及钓鱼。'
    }
  },
  'pospelovo-jetski-black': {
    name: {
      en: 'Jet Ski Sea-Doo RXT-X 300 RS',
      zh: 'Sea-Doo RXT-X 300 RS 摩托艇'
    },
    description: {
      en: 'Extremely powerful 300 hp jet ski reaching up to 127 km/h in Eastern Bosphorus Strait. Features BRP Premium Audio system, sport seat, VTS trim system.',
      zh: '300马力超强动力摩托艇，在东博斯普鲁斯海峡可达127公里/小时。配备 BRP 顶级蓝牙音响、运动座椅和 VTS 可调系统。'
    }
  },
  'pospelovo-jetski-yamaha': {
    name: {
      en: 'Jet Ski Yamaha FX Cruiser SVHO',
      zh: '雅马哈 FX Cruiser SVHO 摩托艇'
    },
    description: {
      en: 'Premium supercharged cruiser jet ski for dynamic tours around Elena Island & Tokarevsky Lighthouse. Bluetooth sound, cruise control, No-Wake mode.',
      zh: '带有机械增压器的高级巡航摩托艇。在叶莲娜岛和托卡列夫灯塔周围巡航的理想选择。配备蓝牙音响和定速巡航。'
    }
  },
  'sea-taxi-24': {
    name: {
      en: '24/7 Sea Taxi "Amur-2"',
      zh: '“阿穆尔-2” 24小时水上出租车'
    },
    description: {
      en: 'Fast sea taxi for rapid delivery to Russky, Popov, Reyneke, Rikord islands. Heated cabin with soft seats protects from spray. Available 24/7.',
      zh: '高速舒适的水上出租车，可快速送达俄罗斯岛、波波夫岛、雷内克岛、里科尔德岛。加热客舱，24/7随时出发。'
    }
  },
  'sea-taxi-kater': {
    name: {
      en: 'Sea Taxi "Storm Buster"',
      zh: '“风暴克星”水上出租艇'
    },
    description: {
      en: 'High seaworthiness steel-hull boat for rough weather conditions. Continuous dispatcher link, certified safety equipment for every passenger.',
      zh: '钢制船体的高抗浪性水上出租艇。专为复杂天气条件设计，配有全程调度联络与认证救生设备。'
    }
  },
  'bayliner-285': {
    name: {
      en: 'Cruiser Boat "Bayliner 285 Santorini"',
      zh: '“圣托里尼” Bayliner 285 巡航艇'
    },
    description: {
      en: 'Comfortable 9-meter American boat. Spacious cockpit with leather sofas, equipped galley with fridge & microwave, hot water shower. Ideal for Shkota Island trips.',
      zh: '9米长舒适美式快艇。宽敞的真皮沙发 cockpit，配有冰箱、炉灶和微波炉的厨房，以及带热水淋浴的独立卫生间。'
    }
  },
  'searay-240': {
    name: {
      en: 'Sport Boat "Sea Ray 240 Breeze"',
      zh: '“微风” Sea Ray 240 运动艇'
    },
    description: {
      en: 'Agile sport boat for wakeboarding and active trips. Powerful inboard engine, subwoofer audio, wakeboard arch, sun awning.',
      zh: '灵活高速的运动艇，适用于水上运动和激情出游。配备大功率发动机、带低音炮的音响系统和滑水架。'
    }
  },
  'meridian-391': {
    name: {
      en: 'VIP Flybridge Yacht "Meridian 391 Atlantis"',
      zh: '“亚特兰蒂斯” Meridian 391 VIP 飞桥游艇'
    },
    description: {
      en: 'Two-deck 12.5m VIP yacht with huge flybridge, teak dining area, natural wood saloon, 2 staterooms, climate control. Perfect for business meetings and family events.',
      zh: '12.5米长的双层VIP游艇。超大飞桥、天然木质沙龙、2间独立卧室、空调系统和全套厨房。非常适合商务会晤和高端家庭聚会。'
    }
  },
  'crownline-270': {
    name: {
      en: 'Sport Boat "Crownline 270 CR Adrenaline"',
      zh: '“肾上腺素” Crownline 270 CR 运动艇'
    },
    description: {
      en: 'Dynamic American boat with wakeboard tower, JBL underwater acoustics with subwoofer, cockpit fridge. Great acceleration and maneuverability.',
      zh: '美式运动快艇，配备滑水塔架、JBL 防水低音音响和甲板冰箱。加速性能优异，操控敏捷。'
    }
  },
  'tornado-310': {
    name: {
      en: 'Jet Ski Kawasaki Ultra 310LX Tornado',
      zh: '川崎 Ultra 310LX “飓风” 310马力摩托艇'
    },
    description: {
      en: 'Extreme 310 hp flagship supercharged jet ski. Fastest jet ski in Vladivostok. Unique Jetsound audio system with Bluetooth, LXuryseat heat-reflective seat.',
      zh: '310马力旗舰级机械增压摩托艇。符拉迪沃斯托克速度最快的水上摩托。配备 Jetsound 蓝牙音响和隔热座椅。'
    }
  },
  'carver-350': {
    name: {
      en: 'Cruiser Flybridge "Carver 350 Mariner Frigate"',
      zh: '“战舰” Carver 350 Mariner 飞桥游艇'
    },
    description: {
      en: 'Spacious American yacht with single-level saloon and cockpit layout. Huge flybridge accommodates 8 people. Webasto heating, generator, 2 showers for island cruises.',
      zh: '宽敞的美式游艇，客舱与甲板同层设计，空间巨大。飞桥可同时容纳8人。配备 Webasto 采暖、发电机和双淋浴间。'
    }
  }
};

// Features Dictionary
const FEATURES_I18N: Record<string, Record<string, string>> = {
  'Система отпугивания акул (Shark Shield)': { en: 'Shark Protection System (Shark Shield)', zh: '防鲨系统 (Shark Shield)' },
  'Теплая каюта': { en: 'Heated Cabin', zh: '保暖客舱' },
  'Флайбридж': { en: 'Flybridge', zh: '飞桥甲板' },
  '2 SUP-борда': { en: '2 SUP Boards', zh: '2张 SUP 桨板' },
  'SUP-борд': { en: 'SUP Board', zh: 'SUP 桨板' },
  'Премиум караоке': { en: 'Premium Karaoke', zh: '高级卡拉OK' },
  'Гриль/Мангал': { en: 'BBQ Grill', zh: '烧烤架' },
  'Опреснитель воды': { en: 'Water Desalination', zh: '海水淡化器' },
  'Паруса': { en: 'Sails', zh: '风帆' },
  'Удочки/Снасти': { en: 'Fishing Gear', zh: '钓鱼装备' },
  'Акустика BOSE': { en: 'BOSE Sound System', zh: 'BOSE 音响' },
  'Климат-контроль': { en: 'Climate Control', zh: '恒温空调' },
  'Трап для купания': { en: 'Swim Ladder', zh: '游泳下水梯' },
  'Гидроцикл на борту': { en: 'Jet Ski Onboard', zh: '船载摩托艇' },
  'Профессиональный 3D-эхолот': { en: 'Professional 3D Sonar', zh: '专业 3D 声纳' },
  'Аутригеры для троллинга': { en: 'Trolling Outriggers', zh: '拖钓外侧支架' },
  'Снасти на тунца/лакедру': { en: 'Tuna/Yellowtail Gear', zh: '金枪鱼/黄尾鱼渔具' },
  'Аэратор для наживки': { en: 'Live Bait Tank', zh: '活饵池' },
  'Теплая рубка': { en: 'Heated Wheelhouse', zh: '保暖驾驶室' },
  'Чайник и микроволновка': { en: 'Kettle & Microwave', zh: '水壶与微波炉' },
  'Мини-кухня': { en: 'Kitchenette', zh: '迷你厨房' },
  'Снасти на камбалу': { en: 'Flounder Fishing Gear', zh: '比目鱼钓具' },
  'Аудиосистема': { en: 'Audio System', zh: '音响系统' },
  'Музыка Premium Audio 100W': { en: 'Premium Audio 100W', zh: '100W 顶级音响' },
  'Сумасшедшая скорость (127 км/ч)': { en: 'Top Speed (127 km/h)', zh: '极速航行 (127 km/h)' },
  'Спортивный жилет': { en: 'Sport Life Vest', zh: '运动救生衣' },
  'Обучение/Инструктаж': { en: 'Instructor Guidance', zh: '教练指导' },
  'Влагозащищенный кофр': { en: 'Waterproof Box', zh: '防水储物箱' },
  'Акустика с Bluetooth': { en: 'Bluetooth Audio', zh: '蓝牙音响' },
  'Скорость до 120 км/ч': { en: 'Speed up to 120 km/h', zh: '时速高达 120 km/h' },
  'Эхолот-навигатор': { en: 'Sonar Navigator', zh: '声纳导航仪' },
  'Круиз-контроль': { en: 'Cruise Control', zh: '定速巡航' },
  '2 гидрокостюма в комплекте': { en: '2 Wetsuits Included', zh: '含2套潜水服' },
  'Круглосуточно 24/7': { en: '24/7 Service', zh: '24/7 全天候' },
  'Отопление салона': { en: 'Cabin Heating', zh: '客舱供暖' },
  'Ночной тепловизор': { en: 'Night Thermal Camera', zh: '夜视热成像' },
  'Багажный отсек': { en: 'Luggage Compartment', zh: '行李舱' },
  'Высадка на необорудованный берег': { en: 'Wild Shore Landing', zh: '野外海岸登陆' },
  'Повышенная мореходность': { en: 'High Seaworthiness', zh: '高抗浪能力' },
  'Стальной усиленный корпус': { en: 'Reinforced Steel Hull', zh: '加固钢制船体' },
  'Радар морской проводки': { en: 'Marine Radar', zh: '航海雷达' },
  'Горячая вода': { en: 'Hot Water', zh: '热水供应' },
  'Просторная каюта': { en: 'Spacious Cabin', zh: '宽敞客舱' },
  'Холодильник': { en: 'Refrigerator', zh: '冰箱' },
  'Плита': { en: 'Stove', zh: '炉灶' },
  'Акустика Alpine': { en: 'Alpine Sound System', zh: 'Alpine 音响' },
  'Задний трап для купания': { en: 'Rear Swim Ladder', zh: '船尾游泳梯' },
  'Вейкборд-арка': { en: 'Wakeboard Tower', zh: '滑水塔架' },
  'Мощная аудиосистема': { en: 'Powerful Sound System', zh: '大功率音响' },
  'Тент от солнца': { en: 'Sun Canopy', zh: '遮阳棚' },
  'Съемный столик': { en: 'Removable Table', zh: '可拆卸桌' },
  'Вейкбордическая арка': { en: 'Wakeboard Arch', zh: '滑水弧形架' },
  'Акустика JBL 200W': { en: 'JBL 200W Acoustics', zh: 'JBL 200W 音响' },
  'Холодильник в кокпите': { en: 'Cockpit Fridge', zh: '甲板冰箱' },
  'Мягкий П-образный диван': { en: 'U-shaped Soft Sofa', zh: 'U型软垫沙发' },
  'Большая купальная зона': { en: 'Large Swim Platform', zh: '大型游泳平台' },
  'Суперчарджер 310 л.с.': { en: '310 HP Supercharger', zh: '310马力机械增压' },
  'Акустика Jetsound': { en: 'Jetsound Audio', zh: 'Jetsound 音响' },
  'Защитные неопреновые жилеты': { en: 'Neoprene Life Vests', zh: '氯丁橡胶救生衣' },
  'Спортивная VTS-система': { en: 'Sport VTS Trim', zh: '运动 VTS 调节系统' },
  'Специальные очки в аренду': { en: 'Goggles Rental', zh: '护目镜租赁' },
  'Огромный флайбридж': { en: 'Huge Flybridge', zh: '超大飞桥' },
  'Просторный салон': { en: 'Spacious Saloon', zh: '宽敞沙龙' },
  'Камбуз с плитой и СВЧ': { en: 'Galley with Stove & Microwave', zh: '带炉灶和微波炉的厨房' },
  'Генератор 220V': { en: '220V Generator', zh: '220V 发电机' },
  'Отопление Webasto': { en: 'Webasto Heating', zh: 'Webasto 暖气' },
  'Два душа': { en: 'Two Showers', zh: '双淋浴间' },
  'Снасти на кальмара': { en: 'Squid Tackle', zh: '鱿鱼钓具' },
  'Мощная световая люстра': { en: 'Powerful Lighting Rig', zh: '大功率探照灯' },
  'Инструктор': { en: 'Instructor', zh: '随船教练' },
  'Горячий чай/кофе': { en: 'Hot Tea & Coffee', zh: '热茶与咖啡' },
  'Премиум троллинговые снасти': { en: 'Premium Trolling Gear', zh: '顶级拖钓装备' },
  'Лицензия': { en: 'Fishing License Included', zh: '含钓鱼许可证' },
  'Капитан-чемпион': { en: 'Champion Captain', zh: '冠军船长' },
  'Эхолот Raymarine 3D': { en: 'Raymarine 3D Sonar', zh: 'Raymarine 3D 声纳' },
  'Бинокли на борту': { en: 'Binoculars Onboard', zh: '船载望远镜' },
  'Высадка на песчаную косу': { en: 'Sandbar Landing', zh: '沙洲登陆' },
  'Гид-биолог': { en: 'Marine Biologist Guide', zh: '海洋生物学家导游' },
  'Система Shark Shield': { en: 'Shark Shield Protection', zh: 'Shark Shield 防鲨系统' },
  'Спиннинги Shimano Stella': { en: 'Shimano Stella Rods', zh: 'Shimano Stella 钓竿' },
  'Обед от шефа на борту': { en: 'Onboard Chef Lunch', zh: '船上主厨午餐' }
};

// Allowed Activities Dictionary
const ACTIVITIES_I18N: Record<string, Record<string, string>> = {
  'VIP-круизы': { en: 'VIP Cruises', zh: 'VIP 尊享巡游' },
  'Праздники': { en: 'Celebrations', zh: '派对庆典' },
  'Купание в море': { en: 'Sea Swimming', zh: '海上游泳' },
  'Обзорные экскурсии': { en: 'Sightseeing Tours', zh: '观光巡游' },
  'Прогулки под парусом': { en: 'Sailing Cruises', zh: '帆船出海' },
  'Фотосессии': { en: 'Photo Shoots', zh: '摄影拍照' },
  'Романтические свидания': { en: 'Romantic Dates', zh: '浪漫约会' },
  'Скоростные переходы': { en: 'High-Speed Transfers', zh: '高速穿梭' },
  'Морской уикенд': { en: 'Sea Weekend', zh: '周末海上出游' },
  'Трофейная рыбалка на тунца': { en: 'Trophy Tuna Fishing', zh: '金枪鱼战利品垂钓' },
  'Кальмарная охота': { en: 'Squid Night Hunting', zh: '夜捕鱿鱼' },
  'Морская рыбалка': { en: 'Sea Fishing', zh: '海上钓鱼' },
  'Прогулки': { en: 'Boat Cruises', zh: '游艇巡游' },
  'Семейные прогулки': { en: 'Family Cruises', zh: '家庭巡游' },
  'Экскурсии по гротам': { en: 'Grotto Tours', zh: '海蚀洞探险' },
  'Скоростной драйв': { en: 'Extreme Speed', zh: '极速驾驶' },
  'Прыжки на волнах': { en: 'Wave Jumping', zh: '乘风破浪' },
  'Адреналин-туры': { en: 'Adrenaline Tours', zh: '刺激体验' },
  'Морские экскурсии': { en: 'Sea Excursions', zh: '海上观光' },
  'Трансфер на острова': { en: 'Island Transfers', zh: '海岛接送' },
  'Рейдовая доставка': { en: 'Offshore Delivery', zh: '锚地送达' },
  'Экстренный выезд': { en: 'Emergency Express', zh: '紧急特快' },
  'Доставка на рейд': { en: 'Roadstead Delivery', zh: '锚地接送' },
  'Заказ диспетчера': { en: 'Dispatcher Order', zh: '调度特快' },
  'Морские пикники': { en: 'Sea Picnics', zh: '海上野餐' },
  'Купание': { en: 'Swimming', zh: '游泳' },
  'Водный спорт': { en: 'Water Sports', zh: '水上运动' },
  'Скоростные трансферы': { en: 'Fast Express Transfers', zh: '快速接送' },
  'Молодежные вечеринки': { en: 'Youth Parties', zh: '青年派对' },
  'Деловые встречи': { en: 'Business Meetings', zh: '商务会晤' },
  'Водный вейкбординг': { en: 'Wakeboarding', zh: '尾波滑水' },
  'Праздники на воде': { en: 'Water Parties', zh: '水上派对' },
  'Скоростные заезды': { en: 'Speed Races', zh: '竞速体验' },
  'Многодневные круизы': { en: 'Multi-Day Cruises', zh: '多日深度游' },
  'Корпоративы': { en: 'Corporate Events', zh: '企业团队活动' }
};

// Helper for single text item translation
export function localizeText(text: string, lang: string): string {
  if (!text) return '';
  if (lang === 'ru') return text;

  // Direct feature match
  if (FEATURES_I18N[text]?.[lang]) return FEATURES_I18N[text][lang];
  // Direct activity match
  if (ACTIVITIES_I18N[text]?.[lang]) return ACTIVITIES_I18N[text][lang];
  // Direct port match
  if (PORTS_I18N[text]?.[lang]) return PORTS_I18N[text][lang];
  // Direct captain match
  if (CAPTAINS_I18N[text]?.[lang]) return CAPTAINS_I18N[text][lang];

  if (lang === 'en') {
    // English fallbacks for features/activities
    return FEATURES_I18N[text]?.en || ACTIVITIES_I18N[text]?.en || PORTS_I18N[text]?.en || CAPTAINS_I18N[text]?.en || transliterateCyrillicToLatin(text);
  }

  if (lang === 'zh') {
    return FEATURES_I18N[text]?.zh || ACTIVITIES_I18N[text]?.zh || PORTS_I18N[text]?.zh || CAPTAINS_I18N[text]?.zh || FEATURES_I18N[text]?.en || ACTIVITIES_I18N[text]?.en || transliterateCyrillicToLatin(text);
  }

  // Fallback transliterate for non-Russian
  return transliterateCyrillicToLatin(text);
}

export function getLocalizedVessel(vessel: Vessel, lang: string): Vessel {
  if (lang === 'ru') return vessel;

  const vInfo = VESSELS_I18N[vessel.id];
  const translatedName = vInfo?.name?.[lang] || vInfo?.name?.en || transliterateCyrillicToLatin(vessel.name);
  const translatedDesc = vInfo?.description?.[lang] || vInfo?.description?.en || transliterateCyrillicToLatin(vessel.description);
  const translatedPort = PORTS_I18N[vessel.homeport]?.[lang] || PORTS_I18N[vessel.homeport]?.en || transliterateCyrillicToLatin(vessel.homeport);
  const translatedCaptain = CAPTAINS_I18N[vessel.captainName]?.[lang] || CAPTAINS_I18N[vessel.captainName]?.en || transliterateCyrillicToLatin(vessel.captainName);

  return {
    ...vessel,
    name: translatedName,
    description: translatedDesc,
    homeport: translatedPort,
    captainName: translatedCaptain,
    features: (vessel.features || []).map(f => localizeText(f, lang)),
    allowedActivities: (vessel.allowedActivities || []).map(a => localizeText(a, lang))
  };
}

export function getLocalizedSharedTour(tour: SharedTour, lang: string): SharedTour {
  if (lang === 'ru') return tour;

  const tourTitles: Record<string, Record<string, string>> = {
    'squid-night-tour': {
      en: 'Night Squid Hunting on "Tuna Hunter"',
      zh: '“金枪鱼猎人号”夜捕鱿鱼之旅'
    },
    'tuna-trophy-tour': {
      en: 'Trophy Tuna Fishing in Open Sea',
      zh: '远海金枪鱼战利品垂钓'
    },
    'seal-colony-tour': {
      en: 'Sea Cruise to Spotted Seal Rookery',
      zh: '斑海豹栖息地观光之旅'
    },
    'yellowtail-casting-tour': {
      en: 'Yellowtail Casting & Trophy Fishing',
      zh: '黄尾鱼路亚海钓猎捕'
    }
  };

  const targetActivities: Record<string, Record<string, string>> = {
    'Кальмарная ночная охота': { en: 'Night Squid Hunting', zh: '夜捕鱿鱼' },
    'Рыбалка на тунца': { en: 'Tuna Fishing', zh: '垂钓金枪鱼' },
    'Прогулка к лежбищу нерп': { en: 'Seal Rookery Cruise', zh: '海豹栖息地观光' },
    'Рыбалка на лакедру': { en: 'Yellowtail Fishing', zh: '垂钓黄尾鱼' },
    'Обзорная экскурсия': { en: 'Scenic Tour', zh: '观光巡游' }
  };

  const dates: Record<string, Record<string, string>> = {
    'Сегодня ночью': { en: 'Tonight', zh: '今晚' },
    'Суббота, 4 июля': { en: 'Saturday, July 4', zh: '7月4日 星期六' },
    'Завтра': { en: 'Tomorrow', zh: '明天' },
    'Воскресенье, 5 июля': { en: 'Sunday, July 5', zh: '7月5日 星期日' }
  };

  const tTitle = tourTitles[tour.id]?.[lang] || tourTitles[tour.id]?.en || transliterateCyrillicToLatin(tour.title);
  const tActivity = targetActivities[tour.targetActivity]?.[lang] || targetActivities[tour.targetActivity]?.en || (tour.targetActivity as any);
  const tDate = dates[tour.date]?.[lang] || dates[tour.date]?.en || transliterateCyrillicToLatin(tour.date);
  const tPort = PORTS_I18N[tour.homeport]?.[lang] || PORTS_I18N[tour.homeport]?.en || transliterateCyrillicToLatin(tour.homeport);

  return {
    ...tour,
    title: tTitle,
    targetActivity: tActivity as any,
    date: tDate,
    homeport: tPort,
    features: (tour.features || []).map(f => localizeText(f, lang))
  };
}

export function getLocalizedHomeport(port: string, lang: string): string {
  if (lang === 'ru') return port;
  return PORTS_I18N[port]?.[lang] || PORTS_I18N[port]?.en || transliterateCyrillicToLatin(port);
}

export function getLocalizedMapPoint(point: MapPoint, lang: string): MapPoint {
  if (lang === 'ru') return point;

  const mapPointsI18n: Record<string, { name: Record<string, string>; description: Record<string, string> }> = {
    'tokarevsky-light': {
      name: { en: 'Tokarevsky Lighthouse', zh: '托卡列夫灯塔' },
      description: {
        en: 'One of the oldest operating lighthouses in the Russian Far East, founded in 1876. Marks the entrance to Eastern Bosphorus Strait. Spotted seals are often seen here.',
        zh: '俄罗斯远东地区最古老的现役灯塔之一，建于1876年。标志着东博斯普鲁斯海峡的入口。这里常有斑海豹出没。'
      }
    },
    'novik-bay-club': {
      name: { en: 'Novik Bay (Yacht Club)', zh: '诺维克湾（游艇俱乐部）' },
      description: {
        en: 'A deep, elongated bay on Russky Island. Sheltered from storms and southern winds. VIP yacht berth, seafood restaurants, and calm water.',
        zh: '俄罗斯岛上深而狭长的海湾。最能躲避风暴和南风。VIP游艇停泊地、海鲜餐厅和风平浪静的水域。'
      }
    },
    'zmeinka-bay': {
      name: { en: 'Zmeinka Bay', zh: '蛇湾' },
      description: {
        en: 'A major boat mooring area in Vladivostok. Convenient starting point towards Amur or Ussuri bays. Jet ski slips available.',
        zh: '符拉迪沃斯托克大型船只停泊区。由此方便前往阿穆尔湾或乌苏里湾。设有水上摩托艇滑道。'
      }
    },
    'uliss-bay': {
      name: { en: 'Uliss Bay', zh: '尤利西斯湾' },
      description: {
        en: 'Traditional home base for fishing and high-speed boats. Ideal starting point for trophy fishing thanks to fast access to Eastern Bosphorus Strait.',
        zh: '渔船和高速快艇的传统停泊基地。因能快速驶入东博斯普鲁斯海峡，是战利品海钓的理想起点。'
      }
    },
    'pospelovo-rusky': {
      name: { en: 'Russky Island (Pospelovo)', zh: '俄罗斯岛（波斯佩洛沃）' },
      description: {
        en: 'Russky Island coast right past the Russky Bridge. A favorite starting point for jet ski and water ski enthusiasts with open views of the strait and city.',
        zh: '紧邻俄罗斯大桥的俄罗斯岛海岸。水上摩托艇和滑水爱好者最喜欢的出发点，可远眺海峡和城市全景。'
      }
    }
  };

  const pInfo = mapPointsI18n[point.id];
  return {
    ...point,
    name: pInfo?.name?.[lang] || pInfo?.name?.en || transliterateCyrillicToLatin(point.name),
    description: pInfo?.description?.[lang] || pInfo?.description?.en || transliterateCyrillicToLatin(point.description)
  };
}
