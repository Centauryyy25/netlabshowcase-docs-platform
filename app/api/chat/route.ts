import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { db } from '@/db';
import { labs, labFiles } from '@/db';
import { eq } from 'drizzle-orm';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const promptTemplates = {
  explain: "Explain this network topology and configuration in detail:",
  summarize: "Summarize the key concepts and learning objectives of this lab:",
  troubleshoot: "Help me troubleshoot potential issues in this network configuration:",
  improve: "Suggest improvements or best practices for this network topology:",
  general: "I'm here to help you understand this networking lab. What would you like to know?",
};

export async function POST(request: NextRequest) {
  try {
    const { messages, labId, promptType = 'general' } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Valid messages array is required' },
        { status: 400 }
      );
    }

    let labContext = '';
    let labTitle = '';

    // Fetch lab context if labId is provided
    if (labId) {
      try {
        const [labData] = await db
          .select({
            title: labs.title,
            description: labs.description,
            category: labs.category,
            difficulty: labs.difficulty,
            tags: labs.tags,
          })
          .from(labs)
          .where(eq(labs.id, labId));

        if (labData) {
          labTitle = labData.title;
          const files = await db
            .select({
              fileName: labFiles.fileName,
              fileType: labFiles.fileType,
              description: labFiles.description,
            })
            .from(labFiles)
            .where(eq(labFiles.labId, labId));

          labContext = `
Lab Context:
- Title: ${labData.title}
- Description: ${labData.description}
- Category: ${labData.category}
- Difficulty Level: ${labData.difficulty}
- Tags: ${labData.tags?.join(', ') || 'None'}
- Available Files: ${files.map(f => `${f.fileName} (${f.fileType})`).join(', ') || 'None'}

You are a networking expert assistant helping students understand this lab. Provide clear, educational responses that help with learning network concepts, configurations, and troubleshooting. Be encouraging and thorough in your explanations.
          `.trim();
        }
      } catch (error) {
        console.error('Error fetching lab context:', error);
        // Continue without lab context if there's an error
      }
    }

    // Get the appropriate system prompt
    const systemPrompt = promptType && promptTemplates[promptType as keyof typeof promptTemplates]
      ? `${promptTemplates[promptType as keyof typeof promptTemplates]}\n\n${labContext}`
      : `${promptTemplates.general}\n\n${labContext}`;

    const result = await streamText({
      model: openai('gpt-4-turbo-preview'),
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'AI Chat API is working',
    availablePrompts: Object.keys(promptTemplates),
    usage: 'POST with { messages: [...], labId?: string, promptType?: string }',
  });
}