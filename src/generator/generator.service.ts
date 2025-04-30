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
      const prompt = `
You are an expert cover letter writer.

Generate two distinct, concise (≤250 words each) professional cover letters based only on:
1. This Job Description (including job title + company name)
2. This Resume

Strict Instructions:
- Use exact job title and company name from job description.
- Include only qualifications, degrees, skills, and experience found in the resume.
- If experience exists, focus on relevant achievements.
- If no experience, emphasize education and projects (exactly as written).
- Include today's date and candidate's location (if mentioned in resume).
- No placeholders like [Your Name], [Company Name], etc.
- Output ONLY the two final letters, no extra commentary.
- Do NOT use any placeholders such as [Job Title], [Company Name], [Your Name], etc. Use only the actual values found in the inputs. If don't find input then use placeholder.


Format:
1. First Cover Letter:
[Letter]

2. Second Cover Letter:
[Letter]

Job Description:
${jobDesc}

Resume:
${resume}
`;

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
