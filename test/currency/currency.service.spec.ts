import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from '../../src/currency/currency.service';
import { RedisService } from '../../src/cache/cache.module';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Currencies, currencyNameToCode } from '../../src/constants/currencies';

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
    currencyCodeA: currencyNameToCode.USD,
    currencyCodeB: currencyNameToCode.UAH,
    rateBuy: usdToUahRateBuy,
    rateSell: usdToUahRateSell,
  },
  {
    currencyCodeA: currencyNameToCode.EUR,
    currencyCodeB: currencyNameToCode.UAH,
    rateBuy: eurToUahRateBuy,
    rateSell: 43.85,
  },
  {
    currencyCodeA: currencyNameToCode.EUR,
    currencyCodeB: currencyNameToCode.USD,
    rateBuy: 1.021,
    rateSell: 1.032,
  },
  {
    currencyCodeA: currencyNameToCode.GBP,
    currencyCodeB: currencyNameToCode.UAH,
    rateCross: 52.6779,
  },
  {
    currencyCodeA: currencyNameToCode.JPY,
    currencyCodeB: currencyNameToCode.UAH,
    rateCross: 0.2716,
  },
  {
    currencyCodeA: currencyNameToCode.CNY,
    currencyCodeB: currencyNameToCode.UAH,
    rateCross: 5.8302,
  },
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

    const result = await service.convertCurrency(
      Currencies.USD,
      Currencies.UAH,
      testAmount,
    );
    expect(result).toEqual({
      source: Currencies.USD,
      target: Currencies.UAH,
      amount: testAmount,
      convertedAmount: testAmount * usdToUahRateBuy,
    });
  });

  it('should convert using reverse rate', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    const result = await service.convertCurrency(
      Currencies.UAH,
      Currencies.USD,
      testAmount,
    );
    expect(result).toEqual({
      source: Currencies.UAH,
      target: Currencies.USD,
      amount: testAmount,
      convertedAmount: testAmount / uahToUsdRateSell,
    });
  });

  it('should handle rateCross for reverse rate', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    const result = await service.convertCurrency(
      Currencies.EUR,
      Currencies.UAH,
      testAmount,
    );
    expect(result).toEqual({
      source: Currencies.EUR,
      target: Currencies.UAH,
      amount: testAmount,
      convertedAmount: testAmount * eurToUahRateCross,
    });
  });

  it('should throw an error for invalid currency code', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    await expect(
      service.convertCurrency(
        Currencies['INVALID'],
        Currencies.UAH,
        testAmount,
      ),
    ).rejects.toThrow('Invalid currency code');
  });

  it('should throw an error if no rate found', async () => {
    jest.spyOn(service, 'getExchangeRates').mockResolvedValue(mockRates);

    await expect(
      service.convertCurrency(Currencies.GBP, Currencies.USD, testAmount),
    ).rejects.toThrow('Currency conversion rate not found');
  });
});
