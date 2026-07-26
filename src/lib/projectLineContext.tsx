/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ProjectLine = 'ru' | 'cn' | 'intl';

export interface ProjectLineDetails {
  id: ProjectLine;
  name: string;
  flag: string;
  title: string;
  desc: string;
  mapProvider: 'yandex' | 'baidu' | 'google';
  paymentSystem: 'yandex_pay' | 'wechat_pay' | 'stripe';
  authSystem: 'yandex_id' | 'wechat_auth' | 'google_id';
  complianceName: string;
  complianceLaw: string;
  complianceShort: string;
  complianceDocPlaceholder: string;
  complianceRequiredFields: string[];
  features: string[];
}

interface ProjectLineContextType {
  projectLine: ProjectLine;
  setProjectLine: (line: ProjectLine) => void;
  details: ProjectLineDetails;
  isRu: boolean;
  isCn: boolean;
  isIntl: boolean;
}

const ProjectLineContext = createContext<ProjectLineContextType | undefined>(undefined);

export const PROJECT_LINES: Record<ProjectLine, ProjectLineDetails> = {
  ru: {
    id: 'ru',
    name: 'Российская линия (RU)',
    flag: '🇷🇺',
    title: 'Яндекс Стек & Законодательство РФ',
    desc: 'Интеграция с сервисами Яндекса (Карты, Погода, Яндекс ID), платежами Yandex Pay и строгое соблюдение ФЗ-152 «О персональных данных» и закона о кредитных историях.',
    mapProvider: 'yandex',
    paymentSystem: 'yandex_pay',
    authSystem: 'yandex_id',
    complianceName: 'ФЗ-152 «О персональных данных»',
    complianceLaw: 'ФЗ-152 РФ / ФЗ-218 «О кредитных историях»',
    complianceShort: 'Согласие на обработку ПД и проверку кредитной истории судовладельцев по ФЗ-218.',
    complianceDocPlaceholder: 'Паспорт РФ (серия, номер) / СНИЛС',
    complianceRequiredFields: ['ФИО', 'Паспорт РФ', 'Телефон (+7)'],
    features: [
      'Яндекс.Карты API (слой глубин Амурского залива)',
      'Служба погоды Яндекс.Погода морской прогноз',
      'Вход через Яндекс ID (единый паспорт)',
      'Yandex Pay & СБП симуляция терминала оплаты',
      'Закон РФ о кредитных данных (проверка кредитных рисков капитанов при аренде судов)'
    ]
  },
  cn: {
    id: 'cn',
    name: 'Китайская линия (CN)',
    flag: '🇨🇳',
    title: 'WeChat Стек & Стандарты КНР',
    desc: 'Глубокая интеграция с WeChat JS-SDK, оплатой WeChat Pay, китайскими картами (Baidu / Tencent) и соответствие Закону КНР об охране персональной информации (PIPL).',
    mapProvider: 'baidu',
    paymentSystem: 'wechat_pay',
    authSystem: 'wechat_auth',
    complianceName: 'PIPL (Закон КНР о защите личной информации)',
    complianceLaw: 'PIPL (Personal Information Protection Law) КНР',
    complianceShort: 'Соответствие государственному китайскому стандарту GB/T 35273 по сбору биометрии и личной информации.',
    complianceDocPlaceholder: 'Паспорт КНР (Китай) / Resident ID / СНИЛС',
    complianceRequiredFields: ['ФИО полностью', 'Паспорт КНР / ID', 'WeChat ID'],
    features: [
      'Tencent / Baidu Maps стилизация и навигационная сетка',
      'WeChat JS-SDK & Mini-Program окружение (симуляция)',
      'WeChat Pay QR-код моментальный расчет',
      'Соответствие правилам PIPL (трансграничная передача шифрованных логов)',
      'Интегрированный переводчик Юань (CNY) с учетом курса ЦБ'
    ]
  },
  intl: {
    id: 'intl',
    name: 'Международная линия (INTL)',
    flag: '🌐',
    title: 'Google Стек & Глобальные Стандарты',
    desc: 'Ориентировано на сервисы Google (Maps Platform, Calendar Sync, Google Sign-In), платежную систему Stripe / Apple Pay и строгое соблюдение европейского GDPR и калифорнийского CCPA.',
    mapProvider: 'google',
    paymentSystem: 'stripe',
    authSystem: 'google_id',
    complianceName: 'GDPR / CCPA Compliance',
    complianceLaw: 'EU GDPR (General Data Protection Regulation) / California CCPA',
    complianceShort: 'Политика согласия на Cookies, право на забвение, экспорт личных треков в JSON.',
    complianceDocPlaceholder: 'Passport / International ID Number',
    complianceRequiredFields: ['Full Name', 'Passport / Int ID', 'Email / Phone'],
    features: [
      'Google Maps Platform (Спутниковые слои, морские изобаты)',
      'Google Calendar API (синхронизация чартеров и туров)',
      'Google Sign-In Auth (микросервис OAuth)',
      'Stripe & Apple Pay симуляция многовалютного шлюза',
      'Согласие на Cookies & GDPR экспорт профиля'
    ]
  }
};

export function ProjectLineProvider({ children }: { children: React.ReactNode }) {
  const [projectLine, setProjectLineState] = useState<ProjectLine>(() => {
    const saved = localStorage.getItem('vlad_sea_project_line');
    return (saved as ProjectLine) || 'intl'; // Default to International line for general use, highly customizable
  });

  const setProjectLine = (line: ProjectLine) => {
    setProjectLineState(line);
    localStorage.setItem('vlad_sea_project_line', line);
  };

  const details = PROJECT_LINES[projectLine];

  const isRu = projectLine === 'ru';
  const isCn = projectLine === 'cn';
  const isIntl = projectLine === 'intl';

  return (
    <ProjectLineContext.Provider value={{ projectLine, setProjectLine, details, isRu, isCn, isIntl }}>
      {children}
    </ProjectLineContext.Provider>
  );
}

export function useProjectLine() {
  const context = useContext(ProjectLineContext);
  if (!context) {
    throw new Error('useProjectLine must be used within a ProjectLineProvider');
  }
  return context;
}
