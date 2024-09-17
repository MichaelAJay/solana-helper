import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NodeConnectionRefusedFilter } from 'src/exception_filters/node-connection-refused.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new NodeConnectionRefusedFilter());

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Blockchain Helper')
    .setDescription('For helping with blockchain work')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3031);
}
bootstrap();
