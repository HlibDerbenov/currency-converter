import { IsString, IsNumber, IsOptional } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export class EnvValidationDto {
  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsOptional()
  @IsNumber()
  CACHE_TTL?: number = 300;
}

export function validateEnv(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvValidationDto, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors}`);
  }

  return validatedConfig;
}
