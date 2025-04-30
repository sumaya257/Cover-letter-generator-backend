import { Module } from '@nestjs/common';

import { GeneratorService } from './generator.service';
import { GeneratorController } from './generator.controller';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule],  // Add ConfigModule to imports
  controllers: [GeneratorController],
  providers: [GeneratorService],
})
export class GeneratorModule {}
