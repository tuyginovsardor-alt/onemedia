import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sliders, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Terminal, 
  Database, 
  Code2, 
  Sparkles,
  Cpu,
  Wrench,
  Check,
  Copy,
  RotateCcw
} from 'lucide-react';
import { ChatMessage, AgentConfig } from '../types';

interface AgentPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  config: AgentConfig;
  onChangeConfig: (newConfig: Partial<AgentConfig>) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  messages,
  loading,
  onSendMessage,
  onClearChat,
  config,
  onChangeConfig,
}) => {
  const [inputText, setInputText] = useState('');
  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'Salom, bot holatini tekshir',
    'setup.py qanday ishga tushadi?',
    'SQLite bazadagi jadvallarni ko‘rsat',
    'Windows GUI da qanday ishlaydi?'
  ];

  return (
    <div className="flex flex-col h-full bg-[#111622] border-r border-[#21283b] overflow-hidden select-none">
      {/* Top Config Header */}
      <div className="p-3 border-b border-[#21283b] bg-[#141b2a] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Model & Parametrlar
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsParamsOpen(!isParamsOpen)}
              className="px-2 py-1 rounded text-[11px] font-medium text-slate-300 hover:text-white bg-[#1c2538] hover:bg-[#25324c] border border-[#2b3a55] flex items-center gap-1 transition-colors"
            >
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span>Sozlash</span>
              {isParamsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            <button
              onClick={onClearChat}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#25324c] transition-colors"
              title="Suhbatni tozalash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
              Asosiy Model
            </label>
            <select
              value={config.model}
              onChange={(e) => onChangeConfig({ model: e.target.value })}
              className="w-full bg-[#1a2336] text-xs font-medium text-slate-200 border border-[#2d3d5a] rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Tavsiya)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
              <option value="local-engine">Local Offline Engine</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => onChangeConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Collapsible System Instruction */}
        <div>
          <button
            onClick={() => setIsSystemOpen(!isSystemOpen)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-300 py-1 hover:text-cyan-400 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>System Instructions (Persona)</span>
            </span>
            {isSystemOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {isSystemOpen && (
            <textarea
              rows={2}
              value={config.systemInstruction}
              onChange={(e) => onChangeConfig({ systemInstruction: e.target.value })}
              className="w-full mt-1.5 bg-[#0e1420] border border-[#2b3a55] rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none select-text"
              placeholder="Agentning yo'riqnomasi va xulq-atvori..."
            />
          )}
        </div>

        {/* Expanded Parameters Panel */}
        {isParamsOpen && (
          <div className="pt-2 border-t border-[#25324c] flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-cyan-400" />
              <span>Faollashtirilgan Vositalar (Tools)</span>
            </span>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 bg-[#172033] p-1.5 rounded border border-[#273652] cursor-pointer hover:border-cyan-600 transition-colors">
                <input
                  type="checkbox"
                  checked={config.tools.codeRunner}
                  onChange={(e) =>
                    onChangeConfig({
                      tools: { ...config.tools, codeRunner: e.target.checked }
                    })
                  }
                  className="rounded text-cyan-500 accent-cyan-500"
                />
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px]">Code Runner</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 bg-[#172033] p-1.5 rounded border border-[#273652] cursor-pointer hover:border-cyan-600 transition-colors">
                <input
                  type="checkbox"
                  checked={config.tools.sqliteDb}
                  onChange={(e) =>
                    onChangeConfig({
                      tools: { ...config.tools, sqliteDb: e.target.checked }
                    })
                  }
                  className="rounded text-cyan-500 accent-cyan-500"
                />
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">SQLite DB</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 select-text">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 select-none">
            <div className="w-12 h-12 rounded-2xl bg-[#172134] border border-[#2b3a55] flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">
              Local AI Agent Bot Tayyor
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
              Agent bilan suhbatlashing, Python kodlarini boshqaring yoki o‘ng paneldagi sahifalarni oching.
            </p>

            <div className="w-full flex flex-col gap-1.5 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tezkor sinov savollari:
              </span>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(p)}
                  className="text-left text-xs bg-[#172134] hover:bg-[#202d47] text-slate-300 hover:text-cyan-300 border border-[#26344d] rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  💬 {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`flex gap-2 max-w-[92%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                      : 'bg-[#1e293e] border border-[#314264] text-cyan-400'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Content Bubble */}
                <div
                  className={`rounded-xl px-3 py-2 text-xs leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-[#182133] border border-[#2b3a55] text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Tool Call Badges if any */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {msg.toolCalls.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#101724] border border-[#2b3a55] text-[10px] text-cyan-300 font-mono"
                        >
                          <Wrench className="w-2.5 h-2.5" />
                          <span>{t.tool}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-wrap font-sans break-words">
                    {msg.content}
                  </div>

                  {/* Bubble Footer */}
                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-400 select-none">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                      title="Nusxalash"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-[#162032] border border-[#2b3a55] rounded-xl px-3 py-2 w-fit animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Agent o‘ylamoqda va natija hosil qilmoqda...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bottom */}
      <div className="p-3 bg-[#141b2a] border-t border-[#21283b] select-none">
        <div className="relative bg-[#0d121c] border border-[#2a3852] focus-within:border-cyan-500 rounded-xl transition-all shadow-inner">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Agentga topshiriq bering yoki savol so'rang (Enter: yuborish)..."
            className="w-full bg-transparent text-xs text-slate-100 p-2.5 pb-8 focus:outline-none resize-none select-text"
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Shift + Enter: yangi qator
            </span>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || loading}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                inputText.trim() && !loading
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40 hover:scale-105'
                  : 'bg-[#1e283b] text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
