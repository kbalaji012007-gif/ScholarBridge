import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, User, Sparkles, MessageSquare, Trash2,
  GraduationCap, FileText, Briefcase, Map, Trophy,
  RotateCcw, Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chat';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: Date;
}

const quickPrompts = [
  { icon: GraduationCap, text: 'Which scholarships am I eligible for?' },
  { icon: FileText, text: 'How can I improve my resume?' },
  { icon: Briefcase, text: 'What career path suits my skills?' },
  { icon: Map, text: 'Build me a 60-day learning roadmap for Data Science' },
  { icon: Trophy, text: 'Help me prepare for a technical interview' },
];

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-primary-600 to-secondary-600'
          : 'bg-gradient-to-br from-secondary-600 to-accent-500'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-gradient-to-br from-primary-700 to-secondary-700 text-white rounded-br-sm'
          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
      }`}>
        {/* Render markdown-ish formatting */}
        {msg.message.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="font-bold mt-2 first:mt-0">{line.slice(2, -2)}</p>;
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return <p key={i} className="ml-2">• {line.slice(2)}</p>;
          }
          if (line.match(/^\d+\./)) {
            return <p key={i} className="ml-2">{line}</p>;
          }
          return line ? <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p> : <br key={i} />;
        })}
      </div>
    </motion.div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string = input) => {
    if (!text.trim() || loading) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      message: text.trim(),
      created_at: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatService.sendMessage(text.trim(), sessionId);
      setSessionId(res.session_id);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        message: res.response,
        created_at: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    if (!sessionId) { setMessages([]); return; }
    await chatService.clearHistory(sessionId);
    setMessages([]);
    setSessionId(undefined);
    toast.success('Chat cleared');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-600 to-accent-500 flex items-center justify-center shadow-glow-violet">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>AI Career Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs text-slate-400">Powered by Gemini AI · Personalized for {user?.full_name?.split(' ')[0] || 'you'}</p>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost text-xs text-slate-500 gap-1.5">
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-900/50 border border-slate-800 p-4 space-y-4">
        {/* Welcome */}
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary-600/30 to-primary-600/30 flex items-center justify-center animate-glow-pulse">
              <Sparkles size={32} className="text-secondary-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Hi {user?.full_name?.split(' ')[0] || 'there'}! 👋
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              I'm your personal AI career guide. I know your profile and can help with scholarships, career advice, resume tips, and more.
            </p>
            {/* Quick prompts */}
            <div className="grid gap-2 max-w-sm mx-auto">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => sendMessage(prompt.text)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-secondary-700/50 text-left text-sm text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <prompt.icon size={15} className="text-secondary-400 shrink-0" />
                  {prompt.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-600 to-accent-500 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3">
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2 bg-slate-900 rounded-2xl border border-slate-700 focus-within:border-secondary-700/60 transition-colors px-4 py-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about scholarships, career paths, resume tips..."
            className="flex-1 bg-transparent text-slate-200 text-sm outline-none placeholder-slate-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary-600 to-primary-600 flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send size={15} className="text-white" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-600 mt-2">CareerBridge AI · Personalized to your profile</p>
      </div>
    </div>
  );
}
