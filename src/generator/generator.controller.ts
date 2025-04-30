import { Controller, Post, Body } from '@nestjs/common';
import { GeneratorService } from './generator.service';


@Controller('generate')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post()
  async generate(@Body() body: { resume: string; jobDescription: string }) {
    const { resume, jobDescription } = body;
    const templates = await this.generatorService.generateCoverLetters(resume, jobDescription);
    return { templates };
  }
}
