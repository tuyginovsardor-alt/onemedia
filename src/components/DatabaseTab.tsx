import React, { useState, useEffect } from 'react';
import { 
  Database as DatabaseIcon, 
  Table, 
  Play, 
  RefreshCw, 
  Download, 
  FileSpreadsheet, 
  Code,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

interface DatabaseTabProps {
  onExecuteQuery: (query: string) => Promise<{ success: boolean; rows: any[]; rowCount?: number; message?: string }>;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({ onExecuteQuery }) => {
  const [selectedTable, setSelectedTable] = useState<string>('conversations');
  const [queryInput, setQueryInput] = useState<string>('SELECT * FROM conversations ORDER BY id DESC;');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryMessage, setQueryMessage] = useState<string | null>(null);

  const tables = ['conversations', 'logs', 'agent_memory', 'tasks'];

  const loadTableData = async (tbl: string) => {
    setSelectedTable(tbl);
    const sql = `SELECT * FROM ${tbl} ORDER BY 1 DESC;`;
    setQueryInput(sql);
    await runSql(sql);
  };

  const runSql = async (sqlText: string) => {
    setLoading(true);
    setQueryMessage(null);
    try {
      const res = await onExecuteQuery(sqlText);
      if (res.rows) {
        setTableData(res.rows);
      }
      if (res.message) {
        setQueryMessage(res.message);
      }
    } catch (err: any) {
      setQueryMessage(`Xatolik: ${err.message || 'SQL xatosi'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableData('conversations');
  }, []);

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(tableData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get table column names
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <div className="flex flex-col h-full bg-[#0d111a] select-none">
      {/* Top Header & Table Switcher */}
      <div className="p-3 bg-[#111622] border-b border-[#1f283c] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            SQLite Ma‘lumotlar Bazasi (agent.db)
          </span>
        </div>

        {/* Table Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-sans">Jadvallar:</span>
          {tables.map((t) => (
            <button
              key={t}
              onClick={() => loadTableData(t)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedTable === t
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-[#182133] text-slate-400 hover:text-white border border-[#26334d]'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>{t}</span>
            </button>
          ))}

          <button
            onClick={() => runSql(queryInput)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-[#182133] hover:bg-[#202c44] border border-[#26334d] transition-colors ml-1"
            title="Yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#182133] hover:bg-[#202c44] border border-[#26334d] rounded-lg transition-colors"
            title="Jadvalni JSON qilib yuklab olish"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* SQL Query Runner Section */}
      <div className="p-3 bg-[#101624] border-b border-[#1f283c]">
        <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQL Query Muharriri</span>
          </span>
          <div className="flex gap-2 text-[11px]">
            <button
              onClick={() => {
                const q = 'SELECT * FROM logs WHERE level="ERROR";';
                setQueryInput(q);
                runSql(q);
              }}
              className="text-cyan-400 hover:underline"
            >
              Faqat Xatolar
            </button>
            <button
              onClick={() => {
                const q = 'SELECT * FROM agent_memory;';
                setQueryInput(q);
                runSql(q);
              }}
              className="text-cyan-400 hover:underline"
            >
              Agent Xotirasi
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <textarea
            rows={2}
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="flex-1 bg-[#0a0d14] border border-[#243249] rounded-lg p-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500 resize-none select-text"
          />
          <button
            onClick={() => runSql(queryInput)}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-950/40 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Bajarish</span>
          </button>
        </div>

        {queryMessage && (
          <div className="mt-2 text-xs text-slate-400 bg-[#0c1018] p-1.5 rounded border border-[#1e2738] font-mono">
            {queryMessage}
          </div>
        )}
      </div>

      {/* Table Data View */}
      <div className="flex-1 overflow-auto p-3 select-text">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 select-none">
          <span>
            Jadval: <strong className="text-white">{selectedTable}</strong> ({tableData.length} ta yozuv)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            agent.db • SQLite3 v3.39+
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span>Ma'lumotlar bazadan yuklanmoqda...</span>
          </div>
        ) : tableData.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Ushbu jadvalda yozuvlar mavjud emas yoki query natija qaytarmadi.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#202b3e] shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#141c2c] border-b border-[#24334b] text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                  {columns.map((col) => (
                    <th key={col} className="p-2.5 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2336] bg-[#0c1018]">
                {tableData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#131b29] transition-colors font-mono text-[11px]"
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="p-2.5 text-slate-300 whitespace-pre-wrap max-w-xs break-words"
                      >
                        {typeof row[col] === 'object' && row[col] !== null
                          ? JSON.stringify(row[col])
                          : String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
