import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CurrencyConversionDto {
  @IsNotEmpty()
  @IsString()
  source: string;

  @IsNotEmpty()
  @IsString()
  target: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
