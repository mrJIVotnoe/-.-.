/**
 * Regional Market Engine — JIV Global Bridge
 * Environment-based configuration & 3 Market Profiles:
 * 1. ru-vladivostok (РФ / Yandex Cloud)
 * 2. asia-hub (Азиатский марина-хаб / Китай)
 * 3. global-marina (Глобал / США & Европа)
 */

import { SupportedCurrency, VesselSourceType } from '../types';

export type MarketRegionId = 'ru-vladivostok' | 'asia-hub' | 'global-marina';

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  iconName: string;
  isNfcOrQr: boolean;
}

export interface MarketRegionProfile {
  id: MarketRegionId;
  nameRu: string;
  nameEn: string;
  nameZh: string;
  flag: string;
  defaultCurrency: SupportedCurrency;
  defaultLanguage: 'ru' | 'en' | 'zh';
  mapProviderName: string;
  paymentGateways: PaymentGatewayConfig[];
  primaryPartners: {
    sourceType: VesselSourceType;
    name: string;
    badge: string;
  }[];
  legalInfo: {
    governingLaw: string;
    registryNote: string;
  };
}

export const MARKET_REGION_PROFILES: Record<MarketRegionId, MarketRegionProfile> = {
  'ru-vladivostok': {
    id: 'ru-vladivostok',
    nameRu: 'Владивосток • РФ',
    nameEn: 'Vladivostok • RU',
    nameZh: '符拉迪沃斯托克 • 俄罗斯',
    flag: '🇷🇺',
    defaultCurrency: 'RUB',
    defaultLanguage: 'ru',
    mapProviderName: 'Яндекс.Карты Морская Навигация',
    paymentGateways: [
      { id: 'nspk', name: 'НСПК / Карта МИР', iconName: 'credit-card', isNfcOrQr: false },
      { id: 'sbp', name: 'СБП (Система Быстрых Платежей)', iconName: 'qr-code', isNfcOrQr: true },
      { id: 'tpay', name: 'Т-Пэй / СберПэй', iconName: 'smartphone', isNfcOrQr: true }
    ],
    primaryPartners: [
      { sourceType: 'internal', name: 'JIV Флот', badge: 'Прямой реестр' },
      { sourceType: 'farpost', name: 'FarPost.ru', badge: 'API Партнер' },
      { sourceType: 'yandex', name: 'Яндекс Путешествия', badge: 'Официальный хаб' }
    ],
    legalInfo: {
      governingLaw: 'Федеральный закон РФ № 36-ФЗ "О торговом мореплавании"',
      registryNote: 'Лицензировано ГИМС МЧС России по Приморскому краю'
    }
  },
  'asia-hub': {
    id: 'asia-hub',
    nameRu: 'Азиатский Хаб • КНР',
    nameEn: 'Asia Hub • China',
    nameZh: '亚太海事枢纽 • 中国',
    flag: '🇨🇳',
    defaultCurrency: 'CNY',
    defaultLanguage: 'zh',
    mapProviderName: 'Baidu Pacific Maritime Chart',
    paymentGateways: [
      { id: 'wechat', name: 'WeChat Pay (微信支付)', iconName: 'smartphone', isNfcOrQr: true },
      { id: 'alipay', name: 'Alipay (支付宝)', iconName: 'qr-code', isNfcOrQr: true },
      { id: 'unionpay', name: 'UnionPay (银联)', iconName: 'credit-card', isNfcOrQr: false }
    ],
    primaryPartners: [
      { sourceType: 'yandex', name: 'Ctrip Maritime', badge: '携程合作' },
      { sourceType: 'airbnb', name: 'Fliggy Yachting', badge: '飞猪游艇' },
      { sourceType: 'internal', name: 'JIV 亚太旗舰', badge: '直营船队' }
    ],
    legalInfo: {
      governingLaw: 'Maritime Code of the People’s Republic of China',
      registryNote: 'Certified by China MSA (Maritime Safety Administration)'
    }
  },
  'global-marina': {
    id: 'global-marina',
    nameRu: 'Глобальный Марино-хаб',
    nameEn: 'Global Marina Hub',
    nameZh: '全球游艇综合枢纽',
    flag: '🌐',
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    mapProviderName: 'OpenSeaMap / NOAA Nautical Charts',
    paymentGateways: [
      { id: 'stripe', name: 'Stripe Corporate Global', iconName: 'credit-card', isNfcOrQr: false },
      { id: 'applepay', name: 'Apple Pay / Google Pay', iconName: 'smartphone', isNfcOrQr: true },
      { id: 'paypal', name: 'PayPal Marine Express', iconName: 'shield', isNfcOrQr: false }
    ],
    primaryPartners: [
      { sourceType: 'airbnb', name: 'Airbnb Luxe Marine', badge: 'Superhost Verified' },
      { sourceType: 'farpost', name: 'BoatSetter Network', badge: 'Global API' },
      { sourceType: 'internal', name: 'JIV Global Fleet', badge: 'Verified Captains' }
    ],
    legalInfo: {
      governingLaw: 'International Maritime Organization (IMO) SOLAS Rules',
      registryNote: 'Verified under ISO 12217 Small Craft Standard'
    }
  }
};

/**
 * Detect current market region from environment variable or fallback to 'ru-vladivostok'
 */
export function getInitialMarketRegion(): MarketRegionId {
  const envRegion = (import.meta as any).env?.VITE_MARKET_REGION || (process.env as any).MARKET_REGION;
  if (envRegion === 'asia-hub' || envRegion === 'global-marina' || envRegion === 'ru-vladivostok') {
    return envRegion;
  }
  const saved = localStorage.getItem('jiv_market_region');
  if (saved === 'asia-hub' || saved === 'global-marina' || saved === 'ru-vladivostok') {
    return saved;
  }
  return 'ru-vladivostok';
}
