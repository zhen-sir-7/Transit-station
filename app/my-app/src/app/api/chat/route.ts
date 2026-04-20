import { NextRequest, NextResponse } from 'next/server';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText, convertToCoreMessages } from 'ai';

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const modelMessages = convertToCoreMessages(messages);

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
