import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para todas as origens
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Feedback API')
    .setDescription('API para gerenciamento de usuários e avaliações (reviews)')
    .setVersion('1.0')
    .addTag('users', 'Operações relacionadas a usuários')
    .addTag('reviews', 'Operações relacionadas a avaliações')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
