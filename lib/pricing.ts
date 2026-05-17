/**
 * Currency-aware pricing config.
 * Prices are shown in the visitor's local currency.
 * Payments are always processed in INR via Razorpay (for now).
 */

export interface CurrencyConfig {
  code: string       // ISO 4217 — e.g. 'USD'
  symbol: string     // e.g. '$'
  reportUnlock: string  // display price for ₹19 unlock
  proMonthly: string    // display price for ₹199/mo Pro
  locale: string        // for Intl.NumberFormat
}

// Approximate conversions (display only — actual charge is always INR via Razorpay)
// 1 INR ≈ 0.012 USD, 0.011 EUR, 0.0095 GBP, 0.0016 JPY, etc.
const CURRENCIES: Record<string, CurrencyConfig> = {
  // South Asia
  IN: { code: 'INR', symbol: '₹',  reportUnlock: '₹19',    proMonthly: '₹199/mo',   locale: 'en-IN' },
  BD: { code: 'BDT', symbol: '৳',  reportUnlock: '৳25',    proMonthly: '৳260/mo',   locale: 'bn-BD' },
  PK: { code: 'PKR', symbol: '₨',  reportUnlock: '₨5',     proMonthly: '₨55/mo',    locale: 'ur-PK' },
  LK: { code: 'LKR', symbol: 'Rs', reportUnlock: 'Rs 6',   proMonthly: 'Rs 60/mo',  locale: 'si-LK' },
  NP: { code: 'NPR', symbol: 'Rs', reportUnlock: 'Rs 25',  proMonthly: 'Rs 260/mo', locale: 'ne-NP' },

  // North America
  US: { code: 'USD', symbol: '$',  reportUnlock: '$0.23',  proMonthly: '$2.39/mo',  locale: 'en-US' },
  CA: { code: 'CAD', symbol: 'C$', reportUnlock: 'C$0.31', proMonthly: 'C$3.25/mo', locale: 'en-CA' },
  MX: { code: 'MXN', symbol: '$',  reportUnlock: '$4',     proMonthly: '$40/mo',    locale: 'es-MX' },

  // Europe
  GB: { code: 'GBP', symbol: '£',  reportUnlock: '£0.18',  proMonthly: '£1.89/mo',  locale: 'en-GB' },
  DE: { code: 'EUR', symbol: '€',  reportUnlock: '€0.21',  proMonthly: '€2.19/mo',  locale: 'de-DE' },
  FR: { code: 'EUR', symbol: '€',  reportUnlock: '€0.21',  proMonthly: '€2.19/mo',  locale: 'fr-FR' },
  IT: { code: 'EUR', symbol: '€',  reportUnlock: '€0.21',  proMonthly: '€2.19/mo',  locale: 'it-IT' },
  ES: { code: 'EUR', symbol: '€',  reportUnlock: '€0.21',  proMonthly: '€2.19/mo',  locale: 'es-ES' },
  NL: { code: 'EUR', symbol: '€',  reportUnlock: '€0.21',  proMonthly: '€2.19/mo',  locale: 'nl-NL' },
  PL: { code: 'PLN', symbol: 'zł', reportUnlock: 'zł0.95', proMonthly: 'zł9.90/mo', locale: 'pl-PL' },
  RU: { code: 'RUB', symbol: '₽',  reportUnlock: '₽21',    proMonthly: '₽220/mo',   locale: 'ru-RU' },

  // Middle East & Africa
  AE: { code: 'AED', symbol: 'د.إ', reportUnlock: 'د.إ0.85', proMonthly: 'د.إ8.75/mo', locale: 'ar-AE' },
  SA: { code: 'SAR', symbol: '﷼',  reportUnlock: '﷼0.87',  proMonthly: '﷼8.95/mo',  locale: 'ar-SA' },
  NG: { code: 'NGN', symbol: '₦',  reportUnlock: '₦35',    proMonthly: '₦360/mo',   locale: 'en-NG' },
  KE: { code: 'KES', symbol: 'KSh', reportUnlock: 'KSh30',  proMonthly: 'KSh310/mo', locale: 'sw-KE' },
  ZA: { code: 'ZAR', symbol: 'R',  reportUnlock: 'R0.43',  proMonthly: 'R4.45/mo',  locale: 'en-ZA' },
  EG: { code: 'EGP', symbol: 'E£', reportUnlock: 'E£1.15', proMonthly: 'E£12/mo',   locale: 'ar-EG' },

  // Asia Pacific
  AU: { code: 'AUD', symbol: 'A$', reportUnlock: 'A$0.35', proMonthly: 'A$3.65/mo', locale: 'en-AU' },
  SG: { code: 'SGD', symbol: 'S$', reportUnlock: 'S$0.31', proMonthly: 'S$3.20/mo', locale: 'en-SG' },
  PH: { code: 'PHP', symbol: '₱',  reportUnlock: '₱13',    proMonthly: '₱135/mo',   locale: 'fil-PH' },
  ID: { code: 'IDR', symbol: 'Rp', reportUnlock: 'Rp370',  proMonthly: 'Rp3,850/mo', locale: 'id-ID' },
  MY: { code: 'MYR', symbol: 'RM', reportUnlock: 'RM1.07', proMonthly: 'RM11.10/mo', locale: 'ms-MY' },
  TH: { code: 'THB', symbol: '฿',  reportUnlock: '฿8.50',  proMonthly: '฿88/mo',    locale: 'th-TH' },
  VN: { code: 'VND', symbol: '₫',  reportUnlock: '₫5,900', proMonthly: '₫61,000/mo', locale: 'vi-VN' },
  JP: { code: 'JPY', symbol: '¥',  reportUnlock: '¥35',    proMonthly: '¥360/mo',   locale: 'ja-JP' },
  KR: { code: 'KRW', symbol: '₩',  reportUnlock: '₩310',   proMonthly: '₩3,200/mo', locale: 'ko-KR' },
  CN: { code: 'CNY', symbol: '¥',  reportUnlock: '¥1.65',  proMonthly: '¥17.20/mo', locale: 'zh-CN' },
  HK: { code: 'HKD', symbol: 'HK$', reportUnlock: 'HK$1.80', proMonthly: 'HK$18.60/mo', locale: 'zh-HK' },

  // Latin America
  BR: { code: 'BRL', symbol: 'R$', reportUnlock: 'R$1.20', proMonthly: 'R$12.50/mo', locale: 'pt-BR' },
  AR: { code: 'ARS', symbol: '$',  reportUnlock: '$22',    proMonthly: '$230/mo',    locale: 'es-AR' },
  CO: { code: 'COP', symbol: '$',  reportUnlock: '$95',    proMonthly: '$980/mo',    locale: 'es-CO' },
}

// Default fallback — INR
const DEFAULT: CurrencyConfig = CURRENCIES['IN']

export function getCurrencyConfig(countryCode: string): CurrencyConfig {
  return CURRENCIES[countryCode?.toUpperCase()] ?? DEFAULT
}

export function isIndianUser(countryCode: string): boolean {
  return countryCode?.toUpperCase() === 'IN'
}
