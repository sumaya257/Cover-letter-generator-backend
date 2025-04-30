import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeneratorService {
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
  }

  async generateCoverLetters(resume: string, jobDesc: string): Promise<string[]> {
    try {
      // ✅ UPDATED: Optimized and shortened prompt to avoid token limit
     

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct', // or try 'openchat/openchat-3.5'
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000', // for local dev
            'X-Title': 'cover-letter-generator',
          },
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new InternalServerErrorException('No valid content returned from API');
      }

      // ✅ Same as before: splitting based on "2."
      const letters = content.split(/\n?2\.\s/);

      if (letters.length < 2) {
        throw new InternalServerErrorException('Failed to generate two templates');
      }

      return [letters[0].replace(/^1\.\s*/, '').trim(), letters[1]?.trim() ?? ''];
    } catch (error) {
      console.error('❌ OpenRouter Error:', error?.response?.data || error);
      throw new InternalServerErrorException('Failed to generate cover letters');
    }
  }
}
