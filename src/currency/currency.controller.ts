import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyConversionDto } from './currency.dto';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  async convertCurrency(@Body() body: CurrencyConversionDto) {
    const { source, target, amount } = body;
    return await this.currencyService.convertCurrency(source, target, amount);
  }
}
