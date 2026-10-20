import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configuredOrigins = process.env.WEB_APP_ORIGIN
    ? process.env.WEB_APP_ORIGIN.split(',').map((o) => o.trim())
    : [];

  app.enableCors({
    origin: [
      ...configuredOrigins,
      'http://localhost:3001',
      'http://localhost:8081',
      'http://localhost:19006',
      'http://localhost:3000',
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('BTP API')
    .setDescription('API de gestion de chantier et pointage')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
