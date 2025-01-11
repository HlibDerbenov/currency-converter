import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from '../../src/currency/currency.service';
import { RedisService } from '../../src/cache/cache.module';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

class MockRedisService {
  private readonly cache = new Map<string, string>();

  getClient() {
    return {
      get: jest.fn((key: string) => {
        return Promise.resolve(this.cache.get(key) || null);
      }),
      set: jest.fn((key: string, value: string) => {
        this.cache.set(key, value);
        return Promise.resolve('OK');
      }),
    };
  }
}

const testAmount = 100;
const usdToUahRateBuy = 42.22;
const usdToUahRateSell = 42.7204;
const eurToUahRateBuy = 43.22;
const uahToUsdRateSell = 42.7204;
const eurToUahRateCross = 43.22;

const mockRates = [
  {
    currencyCodeA: 840,
    currencyCodeB: 980,
    rateBuy: usdToUahRateBuy,
    rateSell: usdToUahRateSell,
  },
  {
    currencyCodeA: 978,
    currencyCodeB: 980,
    rateBuy: eurToUahRateBuy,
    rateSell: 43.85,
  },
  { currencyCodeA: 978, currencyCodeB: 840, rateBuy: 1.021, rateSell: 1.032 },
  { currencyCodeA: 826, currencyCodeB: 980, rateCross: 52.6779 },
  { currencyCodeA: 392, currencyCodeB: 980, rateCross: 0.2716 },
  { currencyCodeA: 156, currencyCodeB: 980, rateCross: 5.8302 },
];

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: RedisService,
          useClass: MockRedisService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'CACHE_TTL' ? 300 : undefined,
            ),
          },
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  it('should fetch exchange rates and cache them', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockRates });

    const rates = await service.getExchangeRates();
    expect(rates).toEqual(
      mockRates.filter((rate) => rate.rateSell || rate.rateCross),
    );
  });

  it('should convert using direct rate', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    const result = await service.convertCurrency('USD', 'UAH', testAmount);
    expect(result).toEqual({
      source: 'USD',
      target: 'UAH',
      amount: testAmount,
      convertedAmount: testAmount * usdToUahRateBuy,
    });
  });

  it('should convert using reverse rate', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    const result = await service.convertCurrency('UAH', 'USD', testAmount);
    expect(result).toEqual({
      source: 'UAH',
      target: 'USD',
      amount: testAmount,
      convertedAmount: testAmount / uahToUsdRateSell,
    });
  });

  it('should handle rateCross for reverse rate', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    const result = await service.convertCurrency('EUR', 'UAH', testAmount);
    expect(result).toEqual({
      source: 'EUR',
      target: 'UAH',
      amount: testAmount,
      convertedAmount: testAmount * eurToUahRateCross,
    });
  });

  it('should throw an error for invalid currency code', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    await expect(
      service.convertCurrency('INVALID', 'UAH', testAmount),
    ).rejects.toThrow('Invalid currency code');
  });

  it('should throw an error if no rate found', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    await expect(
      service.convertCurrency('GBP', 'USD', testAmount),
    ).rejects.toThrow('Currency conversion rate not found');
  });
});