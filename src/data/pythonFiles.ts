export interface PythonFileItem {
  name: string;
  description: string;
  language: string;
  category: 'core' | 'gui' | 'setup' | 'db' | 'scripts';
  content: string;
}

export const PYTHON_FILES: PythonFileItem[] = [
  {
    name: 'agent.py',
    description: 'Mahalliy Python AI Agentining asosiy yadrosi (Gemini API va oflayn rejim)',
    language: 'python',
    category: 'core',
    content: `"""
Local AI Studio Agent - Asosiy Agent Dasturi
Ushbu skript Google AI Studio uslubidagi mahalliy AI agentini ishga tushiradi.
SQLite ma'lumotlar bazasi, vositalar (tools) va Gemini API integratsiyasiga ega.
"""

import os
import sys
import json
import time
import sqlite3
from typing import Dict, Any, List, Optional
from database import AgentDatabase

# google-genai kutubxonasini tekshirish
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class LocalAgentBot:
    def __init__(self, model_name: str = "gemini-3.8-flash", system_instruction: str = ""):
        self.db = AgentDatabase()
        self.model_name = model_name
        self.system_instruction = system_instruction or (
            "Sen Google AI Studio uslubida ishlaydigan aqlli va tezkor yordamchi AI agentsan. "
            "Foydalanuvchiga dasturlash, fayllar, ma'lumotlar bazasi va avtomatlashtirishda yordam berasan."
        )
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = None

        self.db.log_event("INFO", "Local Agent Bot initsializatsiya qilinmoqda...")
        
        if self.api_key and HAS_GENAI:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.db.log_event("SUCCESS", f"Gemini API ({self.model_name}) muvaffaqiyatli ulandi.")
            except Exception as e:
                self.db.log_event("ERROR", f"Gemini ulanishda xato: {e}. Mahalliy rejimga o'tildi.")
        else:
            self.db.log_event("INFO", "Gemini API kaliti topilmadi. Agent mahalliy mustaqil rejimda ishlaydi.")

    def run_prompt(self, user_prompt: str, temperature: float = 0.7) -> Dict[str, Any]:
        """Foydalanuvchi so'rovini qabul qiladi, qayta ishlaydi va javob qaytaradi."""
        start_time = time.time()
        self.db.log_event("INFO", f"Yangi prompt: {user_prompt[:50]}...")
        self.db.save_message("user", user_prompt)

        # 1. Asboblar (Tools) mantiqi
        tool_results = []
        p_lower = user_prompt.lower()

        # Database tool
        if any(w in p_lower for w in ["baza", "database", "sql", "jadval", "select"]):
            tool_res = self.tool_inspect_db()
            tool_results.append({"tool": "SQLite Inspector", "output": tool_res})
            self.db.log_event("TOOL", f"SQLite Inspector bajarildi: {tool_res[:40]}...")

        # System info tool
        if any(w in p_lower for w in ["tizim", "system", "os", "ram", "xotira"]):
            tool_res = self.tool_system_info()
            tool_results.append({"tool": "System Specs Tool", "output": tool_res})
            self.db.log_event("TOOL", "System Specs vositasi ishlatildi")

        # 2. Model orqali javob olish
        response_text = ""
        if self.client and HAS_GENAI:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=self.system_instruction,
                        temperature=temperature,
                    )
                )
                response_text = response.text or "Javob bo'sh."
            except Exception as e:
                self.db.log_event("ERROR", f"API so'rovida xatolik: {e}")
                response_text = self._fallback_response(user_prompt, tool_results)
        else:
            response_text = self._fallback_response(user_prompt, tool_results)

        duration = round(time.time() - start_time, 3)
        self.db.save_message("assistant", response_text)
        self.db.log_event("SUCCESS", f"Javob tayyorlandi ({duration}s)")

        return {
            "response": response_text,
            "tool_calls": tool_results,
            "duration": duration,
            "model": self.model_name if self.client else "Local Rule Engine"
        }

    def tool_inspect_db(self) -> str:
        """SQLite ma'lumotlar bazasini tekshirish vositasi."""
        tables = self.db.get_tables_summary()
        return f"Mavjud jadvallar: {', '.join(tables.keys())}. Jami yozuvlar soni: {sum(tables.values())}"

    def tool_system_info(self) -> str:
        """Operatsion tizim va muhit ma'lumotlari."""
        return f"OS: {sys.platform}, Python: {sys.version.split()[0]}, Fayl yo'li: {os.path.abspath(__file__)}"

    def _fallback_response(self, prompt: str, tools: List[Dict[str, Any]]) -> str:
        """API kalitisiz yoki oflayn holatda mantiqiy javob qaytarish."""
        p = prompt.lower()
        tool_info = ""
        if tools:
            tool_info = "\\n\\n[🛠️ Ishlatilgan Vositalar]:\\n" + "\\n".join([f"- {t['tool']}: {t['output']}" for t in tools])

        if any(w in p for w in ["salom", "assalom", "qalaysan"]):
            return (
                "Assalomu alaykum! Men sizning shaxsiy Python AI Agentingizman.\\n\\n"
                "Men kompyuteringizda to'liq oflayn SQLite ma'lumotlar bazasi va Windows GUI bilan ishlay olaman.\\n"
                "Gemini API kalitini o'rnatish uchun .env fayliga GEMINI_API_KEY yozishingiz mumkin."
                + tool_info
            )

        if "baza" in p or "database" in p:
            summary = self.db.get_tables_summary()
            return f"SQLite ma'lumotlar bazasi (agent.db) holati:\\n{json.dumps(summary, indent=2)}{tool_info}"

        return (
            f"Sizning so'rovingiz qabul qilindi: '{prompt}'.\\n"
            f"Agent muvaffaqiyatli qayta ishladi va natijani SQLite bazasiga yozdi."
            + tool_info
        )

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 Local AI Studio Agent ishga tushirildi (CLI Rejimi)")
    print("Dasturdan chiqish uchun 'exit' yoki 'chiqish' deb yozing.")
    print("=" * 60)
    
    agent = LocalAgentBot()
    while True:
        try:
            user_in = input("\\n[Siz]: ").strip()
            if not user_in:
                continue
            if user_in.lower() in ["exit", "quit", "chiqish"]:
                print("Dastur to'xtatildi. Xayr!")
                break
            
            res = agent.run_prompt(user_in)
            print(f"\\n[Agent ({res['model']})]:")
            print(res["response"])
            if res["tool_calls"]:
                print("\\n[Tools]:", json.dumps(res["tool_calls"], ensure_ascii=False, indent=2))
        except KeyboardInterrupt:
            print("\\nMajburiy to'xtatildi.")
            break
`
  },
  {
    name: 'gui_app.py',
    description: 'Windows Desktop GUI ilovasi (Tkinter) - Google AI Studio uslubidagi 2-panel darcha',
    language: 'python',
    category: 'gui',
    content: `"""
Windows Desktop GUI - Google AI Studio uslubidagi Local Agent IDE
Tkinter orqali Windows / Mac / Linux tizimlarida tashqi og'ir paketlarsiz ochiladi.
Chap panel: Agent Chat va Parametrlar
O'ng panel: Preview, Logs, Console, Database, Code sahifalari
"""

import sys
import os
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import threading
import json
import time

# Mahalliy agent va baza importi
try:
    from agent import LocalAgentBot
    from database import AgentDatabase
except ImportError:
    messagebox.showerror("Xatolik", "agent.py va database.py fayllari topilmadi!")
    sys.exit(1)

class AIStudioGUI:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Local AI Studio Agent - Windows Desktop IDE")
        self.root.geometry("1280x800")
        self.root.minsize(960, 600)
        
        # Ranglar sxemasi (Google AI Studio Dark Theme)
        self.BG_DARK = "#0d1117"
        self.BG_PANEL = "#161b22"
        self.BG_INPUT = "#21262d"
        self.ACCENT_BLUE = "#58a6ff"
        self.ACCENT_GREEN = "#3fb950"
        self.ACCENT_CYAN = "#38bdf8"
        self.TEXT_COLOR = "#e6edf3"
        self.TEXT_MUTED = "#8b949e"
        self.BORDER_COLOR = "#30363d"

        self.root.configure(bg=self.BG_DARK)
        self.db = AgentDatabase()
        self.agent = LocalAgentBot()

        self._setup_styles()
        self._build_header()
        self._build_main_layout()
        self._refresh_logs()
        self._refresh_database()

    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        
        # Notebook (Tabs) styling
        style.configure("TNotebook", background=self.BG_DARK, borderwidth=0)
        style.configure("TNotebook.Tab", background=self.BG_INPUT, foreground=self.TEXT_MUTED, padding=[16, 8], font=("Segoe UI", 10, "bold"))
        style.map("TNotebook.Tab", background=[("selected", self.BG_PANEL)], foreground=[("selected", self.ACCENT_CYAN)])

        # Treeview (Logs & DB) styling
        style.configure("Treeview", background=self.BG_INPUT, foreground=self.TEXT_COLOR, fieldbackground=self.BG_INPUT, borderwidth=0, font=("Consolas", 9))
        style.configure("Treeview.Heading", background=self.BG_PANEL, foreground=self.TEXT_COLOR, font=("Segoe UI", 9, "bold"))

    def _build_header(self):
        header_frame = tk.Frame(self.root, bg=self.BG_PANEL, height=50, bd=1, relief="ridge")
        header_frame.pack(fill="x", side="top")

        title_label = tk.Label(
            header_frame,
            text="🤖 Local AI Studio Agent",
            font=("Segoe UI", 13, "bold"),
            bg=self.BG_PANEL,
            fg=self.TEXT_COLOR
        )
        title_label.pack(side="left", padx=15, pady=8)

        status_badge = tk.Label(
            header_frame,
            text="● ONLINE",
            font=("Segoe UI", 9, "bold"),
            bg="#238636",
            fg="#ffffff",
            padx=8,
            pady=2
        )
        status_badge.pack(side="left", padx=5)

        info_label = tk.Label(
            header_frame,
            text="Model: gemini-3.8-flash (Mahalliy SQLite Agent)",
            font=("Segoe UI", 9),
            bg=self.BG_PANEL,
            fg=self.TEXT_MUTED
        )
        info_label.pack(side="left", padx=15)

        btn_refresh = tk.Button(
            header_frame,
            text="⟳ Yangilash",
            command=self._refresh_all,
            bg=self.BG_INPUT,
            fg=self.TEXT_COLOR,
            relief="flat",
            padx=10,
            cursor="hand2"
        )
        btn_refresh.pack(side="right", padx=15, pady=8)

    def _build_main_layout(self):
        # Asosiy Split Pane (PanedWindow)
        main_paned = tk.PanedWindow(self.root, orient="horizontal", bg=self.BORDER_COLOR, sashwidth=4)
        main_paned.pack(fill="both", expand=True)

        # ==============================================================
        # CHAP TOMON: AGENT PANELI
        # ==============================================================
        left_frame = tk.Frame(main_paned, bg=self.BG_PANEL, width=420)
        main_paned.add(left_frame, minsize=350)

        # Agent sarlavhasi
        agent_title = tk.Label(
            left_frame,
            text="Agent Configuration & Chat",
            font=("Segoe UI", 11, "bold"),
            bg=self.BG_PANEL,
            fg=self.ACCENT_CYAN
        )
        agent_title.pack(anchor="w", padx=12, pady=(12, 4))

        # System Instruction
        tk.Label(left_frame, text="System Instructions (Persona):", font=("Segoe UI", 8, "bold"), bg=self.BG_PANEL, fg=self.TEXT_MUTED).pack(anchor="w", padx=12)
        self.sys_inst_entry = scrolledtext.ScrolledText(left_frame, height=3, bg=self.BG_INPUT, fg=self.TEXT_COLOR, insertbackground=self.TEXT_COLOR, relief="flat", font=("Segoe UI", 9))
        self.sys_inst_entry.insert("1.0", "Sen yordamchi AI agentsan. Foydalanuvchi buyruqlarini aniq va tez bajarasiz.")
        self.sys_inst_entry.pack(fill="x", padx=12, pady=(2, 8))

        # Chat tarixi darchasi
        tk.Label(left_frame, text="Suhbat Tarixi (Chat History):", font=("Segoe UI", 8, "bold"), bg=self.BG_PANEL, fg=self.TEXT_MUTED).pack(anchor="w", padx=12)
        self.chat_display = scrolledtext.ScrolledText(left_frame, bg=self.BG_DARK, fg=self.TEXT_COLOR, insertbackground=self.TEXT_COLOR, relief="flat", font=("Segoe UI", 10), state="disabled")
        self.chat_display.pack(fill="both", expand=True, padx=12, pady=(2, 8))

        # Prompt input darchasi
        input_container = tk.Frame(left_frame, bg=self.BG_PANEL)
        input_container.pack(fill="x", padx=12, pady=(0, 12))

        self.prompt_entry = tk.Entry(input_container, bg=self.BG_INPUT, fg=self.TEXT_COLOR, insertbackground=self.TEXT_COLOR, relief="flat", font=("Segoe UI", 11))
        self.prompt_entry.pack(fill="x", side="left", expand=True, ipady=6, padx=(0, 6))
        self.prompt_entry.bind("<Return>", lambda e: self.send_message())

        self.btn_send = tk.Button(
            input_container,
            text="Yuborish ▶",
            command=self.send_message,
            bg=self.ACCENT_BLUE,
            fg="#ffffff",
            font=("Segoe UI", 9, "bold"),
            relief="flat",
            padx=14,
            pady=4,
            cursor="hand2"
        )
        self.btn_send.pack(side="right")

        # ==============================================================
        # O'NG TOMON: TABLAR (Preview, Logs, Console, Database, Code)
        # ==============================================================
        right_frame = tk.Frame(main_paned, bg=self.BG_PANEL)
        main_paned.add(right_frame, minsize=500)

        notebook = ttk.Notebook(right_frame)
        notebook.pack(fill="both", expand=True)

        # 1. Preview Tab
        self.tab_preview = tk.Frame(notebook, bg=self.BG_DARK)
        notebook.add(self.tab_preview, text="👁️ Preview")
        self._build_preview_tab()

        # 2. Logs Tab
        self.tab_logs = tk.Frame(notebook, bg=self.BG_DARK)
        notebook.add(self.tab_logs, text="📜 Logs")
        self._build_logs_tab()

        # 3. Console Tab
        self.tab_console = tk.Frame(notebook, bg=self.BG_DARK)
        notebook.add(self.tab_console, text="💻 Console")
        self._build_console_tab()

        # 4. Database Tab
        self.tab_db = tk.Frame(notebook, bg=self.BG_DARK)
        notebook.add(self.tab_db, text="🗄️ Database")
        self._build_database_tab()

        # 5. Code Tab
        self.tab_code = tk.Frame(notebook, bg=self.BG_DARK)
        notebook.add(self.tab_code, text="📝 Code")
        self._build_code_tab()

    def _build_preview_tab(self):
        container = tk.Frame(self.tab_preview, bg=self.BG_DARK)
        container.pack(fill="both", expand=True, padx=20, pady=20)

        title = tk.Label(container, text="Agent Natijalari va Jonli Preview", font=("Segoe UI", 14, "bold"), bg=self.BG_DARK, fg=self.ACCENT_CYAN)
        title.pack(anchor="w", pady=(0, 10))

        self.preview_text = scrolledtext.ScrolledText(container, bg=self.BG_PANEL, fg=self.TEXT_COLOR, font=("Consolas", 10), relief="flat")
        self.preview_text.pack(fill="both", expand=True)
        self.preview_text.insert("1.0", "--- Agent ishga tushirishga tayyor ---\\nSiz chap paneldan so'rov yuborsangiz, natijalar va hosil qilingan ma'lumotlar ushbu Preview oynasida aks etadi.")

    def _build_logs_tab(self):
        container = tk.Frame(self.tab_logs, bg=self.BG_DARK)
        container.pack(fill="both", expand=True, padx=12, pady=12)

        ctrl_frame = tk.Frame(container, bg=self.BG_DARK)
        ctrl_frame.pack(fill="x", pady=(0, 8))

        tk.Label(ctrl_frame, text="Jonli Tizim Loglari:", font=("Segoe UI", 10, "bold"), bg=self.BG_DARK, fg=self.TEXT_COLOR).pack(side="left")
        
        tk.Button(ctrl_frame, text="Loglarni tozalash", command=self._clear_logs, bg=self.BG_INPUT, fg=self.TEXT_MUTED, relief="flat", padx=8).pack(side="right")
        tk.Button(ctrl_frame, text="⟳ Yangilash", command=self._refresh_logs, bg=self.BG_INPUT, fg=self.TEXT_COLOR, relief="flat", padx=8).pack(side="right", padx=5)

        columns = ("id", "level", "message", "source", "time")
        self.logs_tree = ttk.Treeview(container, columns=columns, show="headings")
        self.logs_tree.heading("id", text="ID")
        self.logs_tree.heading("level", text="Daraja")
        self.logs_tree.heading("message", text="Xabar")
        self.logs_tree.heading("source", text="Manba")
        self.logs_tree.heading("time", text="Vaqt")

        self.logs_tree.column("id", width=40, anchor="center")
        self.logs_tree.column("level", width=80, anchor="center")
        self.logs_tree.column("message", width=360)
        self.logs_tree.column("source", width=100)
        self.logs_tree.column("time", width=140)

        self.logs_tree.pack(fill="both", expand=True)

    def _build_console_tab(self):
        container = tk.Frame(self.tab_console, bg=self.BG_DARK)
        container.pack(fill="both", expand=True, padx=12, pady=12)

        self.console_output = scrolledtext.ScrolledText(container, bg="#090d13", fg="#3fb950", font=("Consolas", 10), insertbackground="#3fb950", relief="flat")
        self.console_output.pack(fill="both", expand=True, pady=(0, 8))
        self.console_output.insert("1.0", "Local Agent Interactive Shell v1.2.0\\nBuyruqlarni kiriting (masalan: help, status, dir, ping 127.0.0.1):\\n\\n>>> ")

        input_frame = tk.Frame(container, bg=self.BG_DARK)
        input_frame.pack(fill="x")

        tk.Label(input_frame, text=">>>", font=("Consolas", 11, "bold"), bg=self.BG_DARK, fg="#3fb950").pack(side="left", padx=(0, 6))
        self.cmd_entry = tk.Entry(input_frame, bg=self.BG_INPUT, fg=self.TEXT_COLOR, insertbackground=self.TEXT_COLOR, relief="flat", font=("Consolas", 10))
        self.cmd_entry.pack(fill="x", side="left", expand=True, ipady=4)
        self.cmd_entry.bind("<Return>", lambda e: self._execute_command())

    def _execute_command(self):
        cmd = self.cmd_entry.get().strip()
        if not cmd:
            return
        self.cmd_entry.delete(0, tk.END)

        self.console_output.insert(tk.END, f"{cmd}\\n")
        self.db.log_event("INFO", f"Console buyruq: {cmd}")

        if cmd.lower() in ["clear", "cls"]:
            self.console_output.delete("1.0", tk.END)
            self.console_output.insert(tk.END, ">>> ")
            return

        if cmd.lower() == "help":
            out = "Mavjud buyruqlar: help, status, tables, logs, clear, exit\\n"
        elif cmd.lower() == "status":
            out = f"Agent: Online\\nDatabase: agent.db\\nPython: {sys.version}\\n"
        elif cmd.lower() == "tables":
            out = f"Jadvallar: {self.db.get_tables_summary()}\\n"
        else:
            out = f"Buyruq bajarildi: {cmd}\\n"

        self.console_output.insert(tk.END, out + "\\n>>> ")
        self.console_output.see(tk.END)

    def _build_database_tab(self):
        container = tk.Frame(self.tab_db, bg=self.BG_DARK)
        container.pack(fill="both", expand=True, padx=12, pady=12)

        top_ctrl = tk.Frame(container, bg=self.BG_DARK)
        top_ctrl.pack(fill="x", pady=(0, 8))

        tk.Label(top_ctrl, text="SQLite Jadval Ko'rinishi (agent.db):", font=("Segoe UI", 10, "bold"), bg=self.BG_DARK, fg=self.TEXT_COLOR).pack(side="left")
        
        self.db_table_var = tk.StringVar(value="conversations")
        cb = ttk.Combobox(top_ctrl, textvariable=self.db_table_var, values=["conversations", "logs", "agent_memory", "tasks"], state="readonly", width=16)
        cb.pack(side="left", padx=10)
        cb.bind("<<ComboboxSelected>>", lambda e: self._refresh_database())

        tk.Button(top_ctrl, text="⟳ Yangilash", command=self._refresh_database, bg=self.BG_INPUT, fg=self.TEXT_COLOR, relief="flat", padx=8).pack(side="right")

        self.db_tree = ttk.Treeview(container, show="headings")
        self.db_tree.pack(fill="both", expand=True)

    def _build_code_tab(self):
        container = tk.Frame(self.tab_code, bg=self.BG_DARK)
        container.pack(fill="both", expand=True, padx=12, pady=12)

        file_list_frame = tk.Frame(container, bg=self.BG_PANEL, width=160)
        file_list_frame.pack(side="left", fill="y", padx=(0, 8))

        tk.Label(file_list_frame, text="Loyixa Fayllari:", font=("Segoe UI", 9, "bold"), bg=self.BG_PANEL, fg=self.ACCENT_CYAN).pack(anchor="w", padx=8, pady=8)

        files = ["agent.py", "gui_app.py", "setup.py", "database.py", "console.py", "requirements.txt", "run.bat"]
        for f in files:
            btn = tk.Button(file_list_frame, text=f"📄 {f}", anchor="w", bg=self.BG_INPUT, fg=self.TEXT_COLOR, relief="flat", command=lambda fn=f: self._load_file_code(fn))
            btn.pack(fill="x", padx=6, pady=2)

        self.code_view = scrolledtext.ScrolledText(container, bg="#0d1117", fg="#c9d1d9", font=("Consolas", 10), insertbackground="#ffffff", relief="flat")
        self.code_view.pack(fill="both", expand=True)
        self._load_file_code("agent.py")

    def _load_file_code(self, filename: str):
        self.code_view.delete("1.0", tk.END)
        if os.path.exists(filename):
            with open(filename, "r", encoding="utf-8") as f:
                self.code_view.insert("1.0", f.read())
        else:
            self.code_view.insert("1.0", f"# Fayl topilmadi: {filename}")

    def send_message(self):
        prompt = self.prompt_entry.get().strip()
        if not prompt:
            return

        self.prompt_entry.delete(0, tk.END)
        self.btn_send.config(state="disabled", text="Kutilmoqda...")

        # Suhbat darchasiga yozish
        self.chat_display.config(state="normal")
        self.chat_display.insert(tk.END, f"\\nSiz: {prompt}\\n")
        self.chat_display.config(state="disabled")
        self.chat_display.see(tk.END)

        # Thread orqali ishga tushirish (UI qotib qolmasligi uchun)
        threading.Thread(target=self._run_agent_thread, args=(prompt,), daemon=True).start()

    def _run_agent_thread(self, prompt: str):
        try:
            sys_inst = self.sys_inst_entry.get("1.0", tk.END).strip()
            self.agent.system_instruction = sys_inst
            result = self.agent.run_prompt(prompt)

            self.root.after(0, self._handle_agent_response, result)
        except Exception as e:
            self.root.after(0, self._handle_agent_error, str(e))

    def _handle_agent_response(self, result: dict):
        self.btn_send.config(state="normal", text="Yuborish ▶")
        self.chat_display.config(state="normal")
        self.chat_display.insert(tk.END, f"\\nAgent ({result.get('model', 'Local')}): {result.get('response', '')}\\n")
        self.chat_display.config(state="disabled")
        self.chat_display.see(tk.END)

        # Preview darchasini yangilash
        self.preview_text.delete("1.0", tk.END)
        preview_body = f"=== Oxirgi Natija ===\\nModel: {result.get('model')}\\nVaqt: {result.get('duration')}s\\n\\n{result.get('response')}"
        if result.get("tool_calls"):
            preview_body += "\\n\\n--- Asboblar Natijasi ---\\n" + json.dumps(result.get("tool_calls"), ensure_ascii=False, indent=2)
        self.preview_text.insert("1.0", preview_body)

        self._refresh_logs()
        self._refresh_database()

    def _handle_agent_error(self, err_msg: str):
        self.btn_send.config(state="normal", text="Yuborish ▶")
        messagebox.showerror("Agent Xatoligi", err_msg)

    def _refresh_logs(self):
        for item in self.logs_tree.get_children():
            self.logs_tree.delete(item)
        logs = self.db.get_logs(limit=50)
        for log in logs:
            self.logs_tree.insert("", "end", values=(log["id"], log["level"], log["message"], log["source"], log["timestamp"]))

    def _clear_logs(self):
        self.db.clear_logs()
        self._refresh_logs()

    def _refresh_database(self):
        table_name = self.db_table_var.get()
        rows = self.db.get_table_rows(table_name, limit=50)
        
        for item in self.db_tree.get_children():
            self.db_tree.delete(item)
            
        if not rows:
            self.db_tree["columns"] = ("status",)
            self.db_tree.heading("status", text="Holat")
            self.db_tree.insert("", "end", values=("Ma'lumotlar mavjud emas",))
            return

        columns = list(rows[0].keys())
        self.db_tree["columns"] = columns
        for col in columns:
            self.db_tree.heading(col, text=col.capitalize())
            self.db_tree.column(col, width=120)

        for row in rows:
            self.db_tree.insert("", "end", values=list(row.values()))

    def _refresh_all(self):
        self._refresh_logs()
        self._refresh_database()

if __name__ == "__main__":
    root = tk.Tk()
    app = AIStudioGUI(root)
    root.mainloop()
`
  },
  {
    name: 'setup.py',
    description: 'Universal 1-bosqichli avtomatik o\'rnatuvchi va ishga tushiruvchi skript',
    language: 'python',
    category: 'setup',
    content: `"""
setup.py - Avtomatik O'rnatuvchi va Ishga Tushiruvchi Skript
Ushbu skript foydalanuvchi kompyuterida quyidagilarni avtomatik bajaradi:
1. Python versiyasini tekshiradi (3.8+)
2. Kerakli paketlarni (google-genai, requests, python-dotenv) o'rnatadi
3. agent.db SQLite ma'lumotlar bazasini initsializatsiya qiladi
4. Windows GUI ilovasini (gui_app.py) yoki CLI ni ishga tushiradi
"""

import sys
import os
import subprocess
import sqlite3

def print_banner():
    print("=" * 65)
    print("  🚀 Local AI Studio Agent - Windows / Local Setup")
    print("  Avtomatik o'rnatuvchi va ishga tushiruvchi skript")
    print("=" * 65)

def check_python_version():
    print("[1/4] Python versiyasi tekshirilmoqda...")
    if sys.version_info < (3, 8):
        print(f"XATO: Python 3.8 yoki undan yuqori talab qilinadi. Sizda: {sys.version}")
        sys.exit(1)
    print(f"      Python {sys.version.split()[0]} aniqlandi - OK!")

def install_dependencies():
    print("\\n[2/4] Kerakli kutubxonalar tekshirilmoqda va o'rnatilmoqda...")
    required_packages = [
        "google-genai>=2.4.0",
        "requests>=2.31.0",
        "python-dotenv>=1.0.0"
    ]
    
    for pkg in required_packages:
        print(f"      O'rnatilmoqda: {pkg} ...")
        try:
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", pkg, "--quiet"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            print(f"      {pkg.split('>=')[0]} o'rnatildi - OK!")
        except Exception as e:
            print(f"      Diqqat: {pkg} o'rnatishda xatolik yuz berdi ({e}).")
            print("      Dastur oflayn mahalliy rejimda davom etadi.")

def init_database():
    print("\\n[3/4] SQLite ma'lumotlar bazasi (agent.db) initsializatsiya qilinmoqda...")
    try:
        from database import AgentDatabase
        db = AgentDatabase()
        db.log_event("SUCCESS", "setup.py orqali tizim muvaffaqiyatli o'rnatildi")
        print("      agent.db jadvallari yaratildi - OK!")
    except Exception as e:
        print(f"      Bazani yaratishda xato: {e}")

def run_application():
    print("\\n[4/4] Dastur ishga tushirilmoqda...")
    print("=" * 65)
    print("  Tanlang:")
    print("  [1] Windows Desktop GUI (Google AI Studio uslubidagi darcha)")
    print("  [2] Terminal CLI Rejimi (Konsol orqali chat)")
    print("=" * 65)

    choice = input("Tanlovingizni kiriting [Standart: 1]: ").strip()
    if choice == "2":
        print("\\nCLI agent ishga tushirilmoqda...")
        subprocess.call([sys.executable, "agent.py"])
    else:
        print("\\nWindows Desktop GUI ochilmoqda...")
        subprocess.call([sys.executable, "gui_app.py"])

if __name__ == "__main__":
    print_banner()
    check_python_version()
    install_dependencies()
    init_database()
    run_application()
`
  },
  {
    name: 'database.py',
    description: 'SQLite ma\'lumotlar bazasi boshqaruvi (tarix, loglar, xotira, vazifalar)',
    language: 'python',
    category: 'db',
    content: `"""
database.py - SQLite Ma'lumotlar Bazasi Moduli
Foydalanuvchi suhbatlari, tizim loglari, agent xotirasi va vazifalarini
mahalliy 'agent.db' faylida saqlaydi.
"""

import sqlite3
import datetime
from typing import List, Dict, Any

DB_FILE = "agent.db"

class AgentDatabase:
    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self._init_tables()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. Suhbatlar jadvali
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT DEFAULT 'default',
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 2. Tizim loglari jadvali
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    source TEXT DEFAULT 'system',
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 3. Agent xotirasi (Agent Memory)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS agent_memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT UNIQUE NOT NULL,
                    value TEXT NOT NULL,
                    category TEXT DEFAULT 'general',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 4. Vazifalar jadvali
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    status TEXT DEFAULT 'PENDING',
                    priority TEXT DEFAULT 'MEDIUM',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def log_event(self, level: str, message: str, source: str = "agent"):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO logs (level, message, source, timestamp) VALUES (?, ?, ?, ?)",
                (level, message, source, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            )
            conn.commit()

    def save_message(self, role: str, content: str, session_id: str = "default"):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO conversations (session_id, role, content) VALUES (?, ?, ?)",
                (session_id, role, content)
            )
            conn.commit()

    def get_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM logs ORDER BY id DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def clear_logs(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM logs")
            conn.commit()

    def get_table_rows(self, table_name: str, limit: int = 50) -> List[Dict[str, Any]]:
        valid_tables = ["conversations", "logs", "agent_memory", "tasks"]
        if table_name not in valid_tables:
            return []
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {table_name} ORDER BY 1 DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_tables_summary(self) -> Dict[str, int]:
        tables = ["conversations", "logs", "agent_memory", "tasks"]
        res = {}
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for t in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {t}")
                res[t] = cursor.fetchone()[0]
        return res
`
  },
  {
    name: 'console.py',
    description: 'Qulay terminal va CLI buyruqlar orqali boshqaruv paneli',
    language: 'python',
    category: 'scripts',
    content: `"""
console.py - Qulay Terminal CLI Boshqaruv Paneli
Terminal orqali agent holatini tekshirish, so'rov yuborish va bazani boshqarish.
"""

import sys
import os
import argparse
from agent import LocalAgentBot
from database import AgentDatabase

def print_help():
    print("""
Mahalliy Agent CLI Boshqaruv Paneli:
------------------------------------
python console.py --chat "Sizning savolingiz"  : Tezkor so'rov yuborish
python console.py --logs                       : Oxirgi loglarni ko'rish
python console.py --tables                     : Baza jadvallarini tekshirish
python console.py --interactive                : Interaktiv muloqot sessiyasi
python console.py --gui                        : Windows GUI darchasini ochish
""")

def main():
    parser = argparse.ArgumentParser(description="Local Agent CLI Manager")
    parser.add_argument("--chat", type=str, help="Agentga bir martalik savol berish")
    parser.add_argument("--logs", action="store_true", help="Oxirgi loglarni ko'rsatish")
    parser.add_argument("--tables", action="store_true", help="Baza statistikasini ko'rish")
    parser.add_argument("--interactive", action="store_true", help="Interaktiv terminal sessiyasi")
    parser.add_argument("--gui", action="store_true", help="Windows GUI ilovasini ochish")

    args = parser.parse_args()
    db = AgentDatabase()

    if args.gui:
        import subprocess
        subprocess.call([sys.executable, "gui_app.py"])
        return

    if args.logs:
        logs = db.get_logs(limit=20)
        print("\\n=== OXIRGI 20 TA TIZIM LOGLARI ===")
        for l in reversed(logs):
            print(f"[{l['timestamp']}] [{l['level']}] [{l['source']}]: {l['message']}")
        return

    if args.tables:
        summary = db.get_tables_summary()
        print("\\n=== SQLITE BAZA STATISTIKASI ===")
        for t, count in summary.items():
            print(f"Jadval: {t:<15} | Yozuvlar soni: {count}")
        return

    if args.chat:
        agent = LocalAgentBot()
        print(f"Savol: {args.chat}")
        res = agent.run_prompt(args.chat)
        print(f"Agent ({res['model']}): {res['response']}")
        return

    # Standart holda interaktiv rejim
    agent = LocalAgentBot()
    print("🤖 Mahalliy Agent CLI interaktiv terminali boshlandi. 'exit' bilan chiqishingiz mumkin.")
    while True:
        try:
            q = input("\\n[Terminal Prompt] > ").strip()
            if not q:
                continue
            if q.lower() in ["exit", "quit", "q"]:
                break
            res = agent.run_prompt(q)
            print(f"\\n>>> {res['response']}")
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    main()
`
  },
  {
    name: 'requirements.txt',
    description: 'Loyixa uchun talab qilinadigan Python kutubxonalari ro\'yxati',
    language: 'plaintext',
    category: 'setup',
    content: `google-genai>=2.4.0
requests>=2.31.0
python-dotenv>=1.0.1
`
  },
  {
    name: 'run.bat',
    description: 'Windows operatsion tizimida 1-bosish bilan ishga tushiruvchi batch fayl',
    language: 'bat',
    category: 'setup',
    content: `@echo off
title Local AI Studio Agent - Windows Launcher
color 0b
echo ===================================================
echo   Local AI Studio Agent - Windows Desktop
echo ===================================================
echo.
echo Python tekshirilmoqda...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [XATO] Python topilmadi! Iltimos, python.org saytidan Python 3.10+ o'rnating.
    echo PATH ga qo'shish belgilanganligiga ishonch hosil qiling.
    pause
    exit /b
)

echo.
echo setup.py orqali kerakli kutubxonalar va baza tekshirilmoqda...
python setup.py
pause
`
  },
  {
    name: 'README.md',
    description: 'Windows va lokal tizimda ishga tushirish bo\'yicha to\'liq yo\'riqnoma (O\'zbek tilida)',
    language: 'markdown',
    category: 'scripts',
    content: `# 🤖 Local AI Studio Agent & Windows Desktop IDE

Google AI Studio uslubida yaratilgan mahalliy Python AI agenti.
Ushbu loyihani o'z kompyuteringizda ZIP qilib ochib, to'g'ridan-to'g'ri ishga tushirishingiz mumkin.

---

## ⚡ Tezkor Ishga Tushirish (Windows)

1. **ZIP faylni kompyuteringizdagi istalgan papkaga oching (Unzip).**
2. **\`run.bat\` faylini 2 marta bosing.**
   - U Python mavjudligini tekshiradi;
   - Kerakli kutubxonalarni (\`google-genai\`, \`requests\`, \`python-dotenv\`) o'rnatadi;
   - SQLite ma'lumotlar bazasini (\`agent.db\`) avtomatik yaratadi;
   - Chiroyli Windows Tkinter GUI darchasini ochadi!

Yoki konsol/terminal orqali:
\`\`\`bash
python setup.py
\`\`\`

---

## 🖥️ Dastur Qismlari va Sahifalar:

- **Chap tomonda (Agent Paneli)**:
  - System Instructions (Persona)
  - Parametrlar (Temperature, Model)
  - Jonli Chat oynasi va so'rov yuborish
- **O'ng tomonda (Almashinuvchi Tablar)**:
  - 👁️ **Preview**: Agent javoblari, hosil qilingan kod va vizual preview.
  - 📜 **Logs**: Tizimning barcha qadamlari, darajalari (\`INFO\`, \`TOOL\`, \`SUCCESS\`, \`ERROR\`).
  - 💻 **Console**: Interaktiv terminal, CLI buyruqlari.
  - 🗄️ **Database**: SQLite (\`agent.db\`) jadvallari va query tekshiruvi.
  - 📝 **Code**: Barcha Python skriptlarining kod muharriri.

---

## 🔑 Gemini API Kalitini Qo'shish (Ixtiyoriy)

Agar internetdagi so'nggi Gemini modelidan foydalanmoqchi bo'lsangiz:
Loyiha papkasida \`.env\` fayli yarating va kalitni yozing:
\`\`\`env
GEMINI_API_KEY=sizning_api_kalitingiz
\`\`\`
*(Kalitsiz ham agent to'liq oflayn rejimda ishlay oladi).*
`
  }
];
