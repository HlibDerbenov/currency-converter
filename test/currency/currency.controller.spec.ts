import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from '../../src/currency/currency.controller';
import { CurrencyService } from '../../src/currency/currency.service';

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
              source: 'USD',
              target: 'UAH',
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
      source: 'USD',
      target: 'UAH',
      amount: testAmount,
    });
    expect(result).toEqual({
      source: 'USD',
      target: 'UAH',
      amount: testAmount,
      convertedAmount: testConvertedAmount,
    });
  });
});
