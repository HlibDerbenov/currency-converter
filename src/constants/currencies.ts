// https://www.npmjs.com/package/currency-codes can be used here
export enum Currencies {
  USD = 'USD',
  UAH = 'UAH',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY',
}
export const currencyNameToCode = {
  [Currencies.USD]: 840,
  [Currencies.UAH]: 980,
  [Currencies.EUR]: 978,
  [Currencies.GBP]: 826,
  [Currencies.JPY]: 392,
  [Currencies.CNY]: 156,
};
