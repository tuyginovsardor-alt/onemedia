export type ActiveTab = 'preview' | 'logs' | 'console' | 'database' | 'code';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: Array<{ tool: string; result: string }>;
  model?: string;
  duration?: number;
}

export interface AgentConfig {
  model: string;
  systemInstruction: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  tools: {
    codeRunner: boolean;
    sqliteDb: boolean;
    webSearch: boolean;
    fileSystem: boolean;
  };
}

export interface SystemLog {
  id: number | string;
  level: 'INFO' | 'TOOL' | 'SUCCESS' | 'ERROR';
  message: string;
  source: string;
  timestamp: string;
  details?: string;
}

export interface DatabaseState {
  currentTable: string;
  tables: string[];
  rows: Array<Record<string, any>>;
  loading: boolean;
  totalRecords: number;
}
