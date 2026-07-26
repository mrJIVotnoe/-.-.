/**
 * Multi-Currency Engine — JIV Global Bridge
 * Handles RUB, USD, CNY conversion and localized formatting
 */

import { SupportedCurrency } from '../types';

export interface CurrencyRate {
  code: SupportedCurrency;
  symbol: string;
  nameRu: string;
  nameEn: string;
  nameZh: string;
  rubRate: number; // How many RUB per 1 unit of this currency
}

export const CURRENCY_RATES: Record<SupportedCurrency, CurrencyRate> = {
  RUB: {
    code: 'RUB',
    symbol: '₽',
    nameRu: 'Российский рубль',
    nameEn: 'Russian Ruble',
    nameZh: '俄罗斯卢布',
    rubRate: 1.0
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    nameRu: 'Китайский юань',
    nameEn: 'Chinese Yuan',
    nameZh: '人民币',
    rubRate: 12.5 // 1 CNY = 12.5 RUB
  },
  USD: {
    code: 'USD',
    symbol: '$',
    nameRu: 'Доллар США',
    nameEn: 'US Dollar',
    nameZh: '美元',
    rubRate: 90.0 // 1 USD = 90.0 RUB
  }
};

/**
 * Converts price from RUB to target currency
 */
export function convertFromRUB(priceInRub: number, targetCurrency: SupportedCurrency): number {
  const rate = CURRENCY_RATES[targetCurrency]?.rubRate || 1.0;
  return Math.round(priceInRub / rate);
}

/**
 * Converts price from source currency to target currency
 */
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency = 'RUB',
  toCurrency: SupportedCurrency = 'RUB'
): number {
  if (fromCurrency === toCurrency) return amount;
  const rubValue = amount * (CURRENCY_RATES[fromCurrency]?.rubRate || 1.0);
  return Math.round(rubValue / (CURRENCY_RATES[toCurrency]?.rubRate || 1.0));
}

/**
 * Formats price with proper symbol and locale spacing
 */
export function formatCurrencyPrice(
  amount: number,
  currency: SupportedCurrency = 'RUB',
  lang: 'ru' | 'en' | 'zh' = 'ru'
): string {
  const symbol = CURRENCY_RATES[currency]?.symbol || '₽';
  const formattedNumber = amount.toLocaleString(
    lang === 'ru' ? 'ru-RU' : lang === 'zh' ? 'zh-CN' : 'en-US'
  );

  if (currency === 'USD') {
    return `${symbol}${formattedNumber}`;
  }
  if (currency === 'CNY') {
    return `${symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${symbol}`;
}
