'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import MarkdownPreview from '@/components/MarkdownPreview';

export default function ChatPage() {
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  
  // Customization Options
  const [appType, setAppType] = useState('general');
  const [techPreference, setTechPreference] = useState('auto');
  const [customTech, setCustomTech] = useState('');

  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push('/login');
      } else {
        setSession(data);
      }
    });
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setIsLoading(true);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: text, 
          chatId,
          appType,
          techPreference: techPreference === 'custom' ? customTech : 'auto'
        }),
      });

      if (!res.ok) throw new Error('API Error');
      if (!res.body) throw new Error('No body');

      const returnedChatId = res.headers.get("X-Chat-Id");
      if (returnedChatId && !chatId) {
        setChatId(returnedChatId);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';

      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        assistantMsg += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: 'assistant', content: assistantMsg }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Connection error or generation failed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSimpleFilename = (content: string, ext: string) => {
    const match = content.match(/^#+\s+(.+)$/m);
    let title = match ? match[1].trim() : 'DocForge_Document';
    title = title.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
    // Pastikan tidak ada karakter double underscore, dan judul tidak kosong
    title = title.replace(/__+/g, '_').replace(/^_|_$/g, '');
    if (!title || title.length < 2) title = 'DocForge_Document';
    return `${title}.${ext}`;
  };

  const downloadPdf = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Hide buttons temporarily to clean up PDF
    const buttons = element.querySelector('.border-t');
    if (buttons) (buttons as HTMLElement).style.display = 'none';
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       10,
        filename:     filename,
        image:        { type: 'jpeg' as const, quality: 0.95 },
        html2canvas:  { 
          scale: 1, 
          useCORS: true, 
          backgroundColor: '#0f0f11',
          logging: false,
          letterRendering: true
        },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
      alert("PDF Error: Content might be too large for a single canvas. Try downloading as .MD instead.");
    } finally {
      if (buttons) (buttons as HTMLElement).style.display = 'flex';
    }
  };

  const downloadMd = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (e) {
      console.error(e);
      alert("Failed to download Markdown");
    }
  };

  const placeholders = [
    "Create a detailed PRD for a mobile e-commerce app...",
    "Draft a PSD based on the PRD we just discussed...",
    "Generate requirements for an AI-powered fitness tracker...",
    "Outline the database schema for a real-time chat platform..."
  ];

  if (!session) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f11]">
      {/* Sidebar */}
      <div className="w-64 bg-[#18181b] border-r border-[#27272a] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#27272a] flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            DF
          </div>
          <h1 className="font-semibold text-zinc-100">DocForge AI</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button 
            onClick={() => { setChatId(null); setMessages([]); }}
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-[#27272a] rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>
        <div className="p-4 border-t border-[#27272a]">
          <div className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
              {session.user.name[0]}
            </div>
            <div className="flex-1 truncate">{session.user.name}</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full min-w-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 shrink-0">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-8 text-zinc-100 text-center">How can I help you design today?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
              {placeholders.map((ph, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(ph)}
                  className="text-left p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] transition-all group"
                >
                  <p className="text-sm text-zinc-300 group-hover:text-indigo-400 transition-colors">{ph}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto w-full">
            <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                      DF
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[#27272a] text-zinc-100' : 'bg-transparent text-zinc-300 overflow-hidden relative'}`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <>
                        <div id={`msg-${idx}`} className={`prose prose-invert max-w-full overflow-hidden break-words ${isLoading && idx === messages.length - 1 ? 'typing-indicator' : ''}`}>
                          <MarkdownPreview content={msg.content} />
                        </div>
                        {/* Download Buttons Only for Assistant After Processing */}
                        {!isLoading && msg.content.length > 50 && (
                          <div className="flex gap-4 mt-6 pt-4 border-t border-[#27272a]">
                            <button 
                              onClick={() => downloadMd(msg.content, getSimpleFilename(msg.content, 'md'))} 
                              className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-indigo-400 transition-colors bg-[#18181b] px-3 py-1.5 rounded-lg border border-[#27272a] hover:border-indigo-500/50 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              Download .MD
                            </button>
                            <button 
                              onClick={() => downloadPdf(`msg-${idx}`, getSimpleFilename(msg.content, 'pdf'))} 
                              className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-indigo-400 transition-colors bg-[#18181b] px-3 py-1.5 rounded-lg border border-[#27272a] hover:border-indigo-500/50 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              Download .PDF
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} className="h-4" />
            </div>
          </div>
        )}

        {/* Customization Options & Input Area */}
        <div className="p-4 w-full bg-gradient-to-t from-[#0f0f11] via-[#0f0f11] to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Options Row */}
            <div className="flex flex-wrap items-center gap-4 mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">App Type:</span>
                <select 
                  value={appType} 
                  onChange={(e) => setAppType(e.target.value)}
                  className="bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs rounded-md px-2 py-1 outline-none focus:border-indigo-500"
                >
                  <option value="general">Standard App</option>
                  <option value="developer">Developer App</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tech Stack:</span>
                <select 
                  value={techPreference} 
                  onChange={(e) => setTechPreference(e.target.value)}
                  className="bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs rounded-md px-2 py-1 outline-none focus:border-indigo-500"
                >
                  <option value="auto">Let AI Choose</option>
                  <option value="custom">Custom Tech Stack</option>
                </select>
                {techPreference === 'custom' && (
                  <input
                    type="text"
                    value={customTech}
                    onChange={(e) => setCustomTech(e.target.value)}
                    placeholder="e.g. Next.js, Postgres"
                    className="bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs rounded-md px-2 py-1 outline-none focus:border-indigo-500 w-40"
                  />
                )}
              </div>
            </div>

            <div className="relative group">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Ask DocForge AI to draft PRD or PSD..."
                className="w-full bg-[#18181b] border border-[#27272a] group-hover:border-[#3f3f46] focus:border-indigo-500 rounded-2xl pl-4 pr-12 py-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none max-h-48 overflow-y-auto"
                rows={1}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-indigo-500 text-white disabled:opacity-50 disabled:bg-zinc-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-zinc-600 mt-2">
              DocForge AI runs on local Ollama models. Output accuracy varies by model.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
