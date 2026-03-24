import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chat, message } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const sessionUrl = new URL(req.url);
    const sessionReq = new Request(sessionUrl.origin + "/api/auth/get-session", {
      headers: req.headers
    });
    const sessionRes = await auth.handler(sessionReq);
    const sessionData = await sessionRes.json();
    
    if (!sessionData?.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, chatId, appType, techPreference } = await req.json();
    
    let currentChatId = chatId;
    
    if (!currentChatId) {
      currentChatId = `chat_${Date.now()}`;
      await db.insert(chat).values({
        id: currentChatId,
        title: prompt.substring(0, 50) + "...",
        userId: sessionData.user.id
      });
    }

    // Save user message
    await db.insert(message).values({
      id: `msg_${Date.now()}_u`,
      chatId: currentChatId,
      role: "user",
      content: prompt
    });

    const messagesQuery = await db.query.message.findMany({
      where: eq(message.chatId, currentChatId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)]
    });

    let dynamicSystemPrompt = `You are DocForge AI, a world-class Product Manager and Technical Architect. Your sole purpose is to transform user ideas into professional software documentation.

RULES:
1. Every time a user describes a product or feature, you MUST respond by generating a structured Product Requirements Document (PRD).
2. If the user asks for a technical deep dive or has already established a PRD, you MUST follow up with a Product Specification Document (PSD).
3. Use professional, clear, and detailed Markdown.
4. Content should include: h1 title, Executive Summary, Problem Statement, Goals, User Stories, Features, and Technical Stack.
`;

    if (techPreference && techPreference !== 'auto') {
      dynamicSystemPrompt += `\nCRITICAL TECH STACK CONSTRAINT: The user has MANDATED the following technology stack for this project: "${techPreference}". You MUST base all architectural and technical decisions in the PRD/PSD strictly on this stack.\n`;
    }

    if (appType === 'developer') {
      if (messagesQuery.length === 0) {
        dynamicSystemPrompt += `\nDEVELOPER APP DIRECTIVE: The user is planning a Developer Tool/App. DO NOT write the full PRD on your first response. Instead, you MUST ask 2-4 highly specific, clarifying technical questions first to gather necessary architectural context.\n`;
      } else {
        dynamicSystemPrompt += `\nDEVELOPER APP DIRECTIVE: The user provides answers to your technical questions. You MUST now proceed to generate the FULL, structured Product Requirements Document (PRD) incorporating their answers.\n`;
      }
    }

    const ollamaMessages = [
      { role: "system", content: dynamicSystemPrompt },
      ...messagesQuery.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "minimax-m2.5:cloud",
        messages: ollamaMessages,
        stream: true
      })
    });

    if (!response.ok) throw new Error("Ollama connection failed (HTTP " + response.status + ")");

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) return;
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                fullResponse += data.message.content;
                controller.enqueue(encoder.encode(data.message.content));
              }
            } catch (e) {}
          }
        }
        
        // Save assistant message when done
        if (fullResponse) {
          await db.insert(message).values({
            id: `msg_${Date.now()}_a`,
            chatId: currentChatId,
            role: "assistant",
            content: fullResponse
          });
        }
        
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "X-Chat-Id": currentChatId }
    });

  } catch (err: any) {
    console.error("Chat API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
