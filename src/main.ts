import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173', // or 5173 or whatever your frontend dev port is
      'https://cover-letter-generator-frontend-production.up.railway.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Optional: only if you're using cookies/auth
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
