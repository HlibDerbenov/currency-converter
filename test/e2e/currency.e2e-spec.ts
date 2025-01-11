import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

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
      .send({ source: 'USD', target: 'UAH', amount: 100 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('convertedAmount');
  });

  afterAll(async () => {
    await app.close();
  });
});
