import React, { useState, useRef, useEffect } from 'react';
import {
  MessagesSquare,
  Send,
  HardHat,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  BookOpen,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';
import { ChatMessage, ChatResponse } from '../types';

export const DailyAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am SiteMate AI, your construction field assistant. Ask me anything about concrete curing, slump tests, formwork stripping, waterproofing membranes, or morning toolbox safety talks."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponseMeta, setLastResponseMeta] = useState<ChatResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiService.chatAssistant({
        message: textToSend,
        conversation_history: messages
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.reply
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLastResponseMeta(res);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content:
          "⚠️ Communication error: Unable to reach the assistant service. Please check your backend connection."
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat history cleared. How can I assist with your site operations today?"
      }
    ]);
    setLastResponseMeta(null);
  };

  const suggestedQuestions = [
    "What is the permissible concrete slump for pumped slabs?",
    "When can vertical column formwork be stripped safely?",
    "How to prepare basement joints for waterproofing?",
    "What safety checks are required before tower crane lifts?"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-construction-100 text-construction-700 rounded-lg">
              <MessagesSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
              Daily Site Assistant (SiteMate)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time conversational field intelligence for site superintendents, foremen, and QA/QC engineers.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="inline-flex items-center px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          Clear Chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Stream Window */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white ${
                      isUser ? 'bg-navy-900' : 'bg-construction-500'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                      isUser
                        ? 'bg-navy-900 text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-construction-500 text-white flex items-center justify-center flex-shrink-0">
                  <HardHat className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-construction-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-construction-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-construction-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Consulting civil field codes...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Pills */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
              Suggestions:
            </span>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about curing times, slump, waterproofing, or crane safety..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-construction-500 hover:bg-construction-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-md shadow-construction-500/20 flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Toolbox Safety Tips & Relevant Standards */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Field Standards Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-construction-500" />
              Standard Reference Cited
            </h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-150">
              {lastResponseMeta?.relevant_standards_hint ||
                "ACI 308R Curing Concrete / OSHA 1926 Safety Standard"}
            </p>
          </div>

          {/* Quick Safety Toolbox Talk Tips */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-500" />
              Morning Toolbox Safety Checklist
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {(lastResponseMeta?.safety_tips?.length
                ? lastResponseMeta.safety_tips
                : [
                    "Inspect full-body harnesses before any work above 6 feet.",
                    "Verify daily crane rigging inspection tag and anemometer wind speed.",
                    "Ensure wet curing zones have anti-slip footpaths for labor crews."
                  ]
              ).map((tip, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 mr-2 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Field Engineer Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700 block mb-0.5">Civil Engineering Disclaimer:</span>
            SiteMate AI provides general construction operational guidelines. Project-specific structural drawings, mix designs, and Resident Engineer tolerances legally supersede AI guidance.
          </div>
        </div>
      </div>
    </div>
  );
};
