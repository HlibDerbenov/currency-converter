# Currency Converter API

A NestJS-based currency converter API that fetches exchange rates from the Monobank API and caches them using Redis to optimize performance.

## Features
- Fetches real-time exchange rates from Monobank.
- Converts currencies using cached rates.
- Caching mechanism with configurable expiration time.
- Graceful error handling with informative responses.
- Unit, integration, and e2e tests.
- Mocked data in tests for predictable results.

## Requirements
- Node.js (>=16.x)
- Redis (>=6.x)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd currency-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the project root and specify the following variables:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   CACHE_TTL=300
   ```

4. Run Redis server:
   Ensure Redis is running locally or update `REDIS_HOST` and `REDIS_PORT` in `.env` to point to your Redis server.

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start
```

## API Endpoints

### POST `/currency/convert`
Converts an amount from a source currency to a target currency.

#### Request Body
```json
{
  "source": "USD",
  "target": "UAH",
  "amount": 100
}
```

#### Response (200 OK)
```json
{
  "source": "USD",
  "target": "UAH",
  "amount": 100,
  "convertedAmount": 4200
}
```

#### Error Response (400 Bad Request)
```json
{
  "message": "Invalid currency code"
}
```

## Tests

### Run All Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Note on Testing
- Tests use mocked exchange rate data for predictable results.
- Redis interactions are tested with a mocked implementation (ioredis).

## Project Structure
```
currency-converter/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── currency/
│   │   ├── currency.controller.ts
│   │   ├── currency.service.ts
│   │   ├── currency.dto.ts
│   ├── cache/
│   │   ├── cache.module.ts
├── test/
│   ├── currency/
│   │   ├── currency.service.spec.ts
│   │   ├── currency.controller.spec.ts
│   ├── e2e/
│   │   ├── currency.e2e-spec.ts
│   │   ├── setup-e2e.ts
├── .env
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

## Notes
- The Monobank API endpoint used: `https://api.monobank.ua/bank/currency`
- Caching is configured with a TTL (default: 300 seconds). Update `CACHE_TTL` in `.env` as needed.
- Extendable for additional features like rate-limiting or enhanced logging.

## Additional Notes

### Monobank API
- The Monobank API is used to fetch real-time exchange rates.
- Relevant fields:
  - `rateBuy`: Rate for buying currency.
  - `rateSell`: Rate for selling currency.
  - `rateCross`: Cross rate for less common currencies.

### Caching
- Exchange rates are cached using Redis under the key `exchange_rates`.
- To check the cache, use:
  ```
  redis-cli
  GET exchange_rates
  ```

### Error handling
- Invalid requests result in `400 Bad Request`.
- Server errors (e.g., API unavailability) result in `500 Internal Server Error`.

## License
This project is licensed under the MIT License.
