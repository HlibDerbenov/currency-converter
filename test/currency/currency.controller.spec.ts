import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from '../../src/currency/currency.controller';
import { CurrencyService } from '../../src/currency/currency.service';
import { Currencies } from '../../src/constants/currencies';

const testAmount = 100,
  testConvertedAmount = testAmount * 42.0;

describe('CurrencyController', () => {
  let controller: CurrencyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        {
          provide: CurrencyService,
          useValue: {
            convertCurrency: jest.fn().mockResolvedValue({
              source: Currencies.USD,
              target: Currencies.UAH,
              amount: testAmount,
              convertedAmount: testConvertedAmount,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<CurrencyController>(CurrencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should convert currency', async () => {
    const result = await controller.convertCurrency({
      source: Currencies.USD,
      target: Currencies.UAH,
      amount: testAmount,
    });

    expect(result).toEqual({
      source: Currencies.USD,
      target: Currencies.UAH,
      amount: testAmount,
      convertedAmount: testConvertedAmount,
    });
  });
});
