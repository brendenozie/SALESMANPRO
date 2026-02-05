import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30; // Allow enough time for complex "Thinking" models

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-pro'), // Or 'gemini-2.0-flash' / 'gemini-3-pro'
    messages,
  });

  return result.toTextStreamResponse();
}