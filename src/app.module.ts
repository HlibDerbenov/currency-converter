import { Module } from '@nestjs/common';
import { CacheModule } from './cache/cache.module';
import { CurrencyController } from './currency/currency.controller';
import { CurrencyService } from './currency/currency.service';

@Module({
  imports: [CacheModule],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class AppModule {}
