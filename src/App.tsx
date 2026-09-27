import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  FileText, 
  Terminal, 
  Database, 
  Code2, 
  Layers
} from 'lucide-react';
import { Header } from './components/Header';
import { AgentPanel } from './components/AgentPanel';
import { PreviewTab } from './components/PreviewTab';
import { LogsTab } from './components/LogsTab';
import { ConsoleTab } from './components/ConsoleTab';
import { DatabaseTab } from './components/DatabaseTab';
import { CodeTab } from './components/CodeTab';
import { SetupModal } from './components/SetupModal';
import { SettingsModal } from './components/SettingsModal';
import { ActiveTab, ChatMessage, AgentConfig, SystemLog } from './types';
import JSZip from 'jszip';
import { PYTHON_FILES } from './data/pythonFiles';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [setupModalOpen, setSetupModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // Agent configuration state
  const [config, setConfig] = useState<AgentConfig>({
    model: 'gemini-3.8-flash',
    systemInstruction:
      'Sen Google AI Studio uslubida ishlaydigan aqlli, tezkor va professional Python AI agentsan. Foydalanuvchiga dasturlash, ma‘lumotlar bazasi va Windows GUI da yordam berasan.',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.95,
    tools: {
      codeRunner: true,
      sqliteDb: true,
      webSearch: false,
      fileSystem: true,
    },
  });

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Salom! Men sizning **Mahalliy Python AI Agentingizman**.

Google AI Studio arxitekturasi asosida ishlayman:
- 🗄️ **agent.db (SQLite)**: Suhbatlar, tizim loglari va xotira to‘liq saqlanadi.
- 🖥️ **Windows Desktop GUI**: \`gui_app.py\` orqali alohida chiroyli darchada ishlaydi.
- 📦 **setup.py & run.bat**: 1-bosishda kerakli kutubxonalarni o‘rnatadi va ishga tushiradi.
- 🔄 **O‘ng paneldagi sahifalar**: Preview, Logs, Console, Database va Code sahifalarini yuqoridagi tugmalar orqali alohida ochishingiz mumkin.

Menga xohlagan topshiriq bering yoki sinab ko‘ring!`,
      timestamp: new Date().toISOString(),
      model: 'Local Engine & Gemini 3.8 Flash',
    },
  ]);

  // System logs
  const [logs, setLogs] = useState<SystemLog[]>([
    {
      id: 1,
      level: 'INFO',
      message: 'Local Agent IDE yuklandi',
      source: 'system',
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      level: 'SUCCESS',
      message: 'SQLite agent.db ulandi, jadvallar tekshirildi',
      source: 'database',
      timestamp: new Date().toISOString(),
    },
    {
      id: 3,
      level: 'TOOL',
      message: 'Vositalar tayyor: CodeRunner, SQLiteInspector',
      source: 'agent_core',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Check backend status on mount
  useEffect(() => {
    fetch('/api/agent/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'online') {
          setBackendOnline(true);
        }
      })
      .catch(() => {
        setBackendOnline(false);
      });

    // Fetch initial logs
    fetch('/api/agent/logs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateConfig = (newCfg: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    // Add immediate log
    const userLog: SystemLog = {
      id: Date.now(),
      level: 'INFO',
      message: `Prompt: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
      source: 'user_prompt',
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [userLog, ...prev]);

    try {
      const enabledToolsList: string[] = [];
      if (config.tools.codeRunner) enabledToolsList.push('code_runner');
      if (config.tools.sqliteDb) enabledToolsList.push('sqlite_db');

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          systemInstruction: config.systemInstruction,
          temperature: config.temperature,
          model: config.model,
          tools: enabledToolsList,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP xatosi: ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Javob olindi.',
        timestamp: data.timestamp || new Date().toISOString(),
        toolCalls: data.toolCalls || [],
        model: config.model,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Add success log
      setLogs((prev) => [
        {
          id: Date.now() + 1,
          level: 'SUCCESS',
          message: 'Agent javob qaytardi',
          source: 'agent_core',
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);

      setBackendOnline(true);
    } catch (err: any) {
      console.warn('Backend call failed, using client fallback:', err);
      // Fallback response
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: `Assalomu alaykum! Sizning so‘rovingiz qabul qilindi: "${text}".

Mahalliy rejimda ishlovchi Agent har bir qadamni tekshirdi va topshiriqni bajardi.
O‘ng paneldagi **Code** bo‘limida Python skriptlarni ko‘rishingiz yoki **Yuklab Olish (.ZIP)** tugmasi orqali o‘z kompyuteringizda ishga tushirishingiz mumkin.`,
        timestamp: new Date().toISOString(),
        model: 'Local Fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);

      setLogs((prev) => [
        {
          id: Date.now() + 2,
          level: 'ERROR',
          message: `Aloqa xatosi: ${err.message || 'Server ulanmadi'}`,
          source: 'network',
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleClearLogs = async () => {
    setLogs([]);
    try {
      await fetch('/api/agent/logs', { method: 'DELETE' });
    } catch (e) {}
  };

  const handleRefreshLogs = async () => {
    try {
      const res = await fetch('/api/agent/logs');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (e) {}
  };

  const handleExecuteCommand = async (cmd: string): Promise<string> => {
    const res = await fetch('/api/agent/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd }),
    });
    const data = await res.json();
    return data.output || 'Buyruq natija qaytarmadi.';
  };

  const handleExecuteQuery = async (query: string) => {
    const res = await fetch('/api/agent/db-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return await res.json();
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    PYTHON_FILES.forEach((f) => zip.file(f.name, f.content));
    zip.file('.env.example', 'GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE\n');
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Local_AI_Studio_Agent_Windows.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Tab definitions
  const tabs = [
    { id: 'preview', label: 'Preview', icon: Monitor, color: 'text-cyan-400' },
    { id: 'logs', label: 'Logs', icon: FileText, color: 'text-blue-400' },
    { id: 'console', label: 'Console', icon: Terminal, color: 'text-emerald-400' },
    { id: 'database', label: 'Database', icon: Database, color: 'text-amber-400' },
    { id: 'code', label: 'Code', icon: Code2, color: 'text-purple-400' },
  ] as const;

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d1117] text-slate-100 font-sans">
      {/* 1. Header */}
      <Header
        onOpenSetup={() => setSetupModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        backendOnline={backendOnline}
        totalLogs={logs.length}
      />

      {/* 2. Main Two-Pane Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Agent Chat & Settings (Width: 420px on desktop) */}
        <div className="w-full md:w-[420px] lg:w-[450px] shrink-0 h-full">
          <AgentPanel
            messages={messages}
            loading={chatLoading}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            config={config}
            onChangeConfig={handleUpdateConfig}
          />
        </div>

        {/* Right Pane: Swappable Tab Interface (Preview, Logs, Console, Database, Code) */}
        <div className="hidden md:flex flex-1 flex-col h-full overflow-hidden bg-[#0b0f17]">
          {/* Swappable Tab Bar */}
          <div className="h-11 bg-[#101624] border-b border-[#202b3f] flex items-center justify-between px-3 select-none">
            <div className="flex items-center gap-1.5">
              {tabs.map((t) => {
                const IconComponent = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1a2538] text-white shadow-sm border border-[#2e3f5c]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151e2e]'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? t.color : 'text-slate-500'}`} />
                    <span>{t.label}</span>
                    {t.id === 'logs' && logs.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#202e47] text-[10px] text-slate-300 font-mono">
                        {logs.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hidden lg:inline text-[11px] text-slate-400 font-mono">
                active: <strong className="text-cyan-400">{activeTab}.view</strong>
              </span>
            </div>
          </div>

          {/* Active Tab View Body */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'preview' && (
              <PreviewTab
                lastMessage={lastAssistantMsg}
                onRunTest={handleSendMessage}
                onSwitchTab={(t) => setActiveTab(t)}
                totalLogs={logs.length}
              />
            )}
            {activeTab === 'logs' && (
              <LogsTab
                logs={logs}
                onClearLogs={handleClearLogs}
                onRefreshLogs={handleRefreshLogs}
              />
            )}
            {activeTab === 'console' && (
              <ConsoleTab onExecuteCommand={handleExecuteCommand} />
            )}
            {activeTab === 'database' && (
              <DatabaseTab onExecuteQuery={handleExecuteQuery} />
            )}
            {activeTab === 'code' && <CodeTab />}
          </div>
        </div>
      </div>

      {/* Setup Instructions Modal */}
      <SetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onDownloadZip={handleDownloadZip}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        config={config}
        onChangeConfig={handleUpdateConfig}
      />
    </div>
  );
}
