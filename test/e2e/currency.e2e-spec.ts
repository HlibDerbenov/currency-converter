import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Currencies } from '../../src/constants/currencies';

describe('Currency E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/currency/convert (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/currency/convert')
      .send({ source: Currencies.USD, target: Currencies.UAH, amount: 100 });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveProperty('convertedAmount');
  });

  afterAll(async () => {
    await app.close();
  });
});
