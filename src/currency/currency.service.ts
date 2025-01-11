import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../cache/cache.module';
import axios from 'axios';
import { currencyNameToCode } from '../constants/currencies';

@Injectable()
export class CurrencyService {
  private readonly cacheTtl: number;
  private readonly monobankApiUrl = 'https://api.monobank.ua/bank/currency';

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = this.configService.get<number>('CACHE_TTL');
  }

  async getExchangeRates() {
    const client = this.redisService.getClient();
    const cacheKey = 'exchange_rates';

    const cachedRates = await client.get(cacheKey);
    if (cachedRates) {
      return JSON.parse(cachedRates);
    }

    try {
      const response = await axios.get(this.monobankApiUrl);
      const rates = response.data;

      await client.set(cacheKey, JSON.stringify(rates), 'EX', this.cacheTtl);

      const filteredRates = rates.filter(
        (rate) => rate.rateSell || rate.rateCross,
      );
      return filteredRates;
    } catch {
      throw new HttpException(
        'Failed to fetch exchange rates',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async convertCurrency(source: string, target: string, amount: number) {
    const rates = await this.getExchangeRates();

    const sourceCode = currencyNameToCode[source];
    const targetCode = currencyNameToCode[target];

    if (!sourceCode || !targetCode) {
      throw new HttpException('Invalid currency code', HttpStatus.BAD_REQUEST);
    }

    const reverseRate = rates.find((rate) => {
      return (
        rate.currencyCodeA === targetCode &&
        rate.currencyCodeB === sourceCode &&
        (rate.rateSell || rate.rateCross)
      );
    });

    if (reverseRate) {
      const rate = reverseRate.rateSell || reverseRate.rateCross;

      const convertedAmount = amount / rate;
      return { source, target, amount, convertedAmount };
    }

    const directRate = rates.find(
      (rate) =>
        rate.currencyCodeA === sourceCode &&
        rate.currencyCodeB === targetCode &&
        rate.rateBuy,
    );

    if (directRate) {
      const convertedAmount = amount * directRate.rateBuy;
      return { source, target, amount, convertedAmount };
    }

    throw new HttpException(
      'Currency conversion rate not found',
      HttpStatus.BAD_REQUEST,
    );
  }
}
