import { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  LuX,
  LuPlay,
  LuTrash2,
  LuCode,
  LuTerminal,
  LuLoader,
  LuChevronDown,
  LuCircleCheck,
  LuCircleAlert,
  LuClock,
} from 'react-icons/lu';
import type * as Monaco from 'monaco-editor';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Language {
  id: string;
  label: string;
  pistonLanguage: string;
  pistonVersion: string;
  monacoLanguage: string;
  starterCode: string;
}

interface OutputLine {
  kind: 'stdout' | 'stderr' | 'info' | 'error';
  text: string;
}

interface CodeAssignmentPortalProps {
  exercise: {
    id: string;
    title: string;
    description: string;
    module: string;
    type: string;
  };
  onClose: () => void;
}

// ─── Language Definitions ────────────────────────────────────────────────────

const LANGUAGES: Language[] = [
  {
    id: 'python',
    label: 'Python',
    pistonLanguage: 'python',
    pistonVersion: '3.10.0',
    monacoLanguage: 'python',
    starterCode: `# ${''} Write your Python solution below
def solution():
    # Your code here
    print("Hello from Python!")

solution()
`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    pistonLanguage: 'javascript',
    pistonVersion: '18.15.0',
    monacoLanguage: 'javascript',
    starterCode: `// Write your JavaScript solution below
function solution() {
  // Your code here
  console.log("Hello from JavaScript!");
}

solution();
`,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    pistonLanguage: 'typescript',
    pistonVersion: '5.0.3',
    monacoLanguage: 'typescript',
    starterCode: `// Write your TypeScript solution below
function solution(): void {
  // Your code here
  console.log("Hello from TypeScript!");
}

solution();
`,
  },
];

// ─── Execution Status ─────────────────────────────────────────────────────────

type RunStatus = 'idle' | 'running' | 'success' | 'error';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CodeAssignmentPortal({
  exercise,
  onClose,
}: CodeAssignmentPortalProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState<string>(LANGUAGES[0].starterCode);
  const [output, setOutput] = useState<OutputLine[]>([
    { kind: 'info', text: '▶ Run your code to see output here.' },
  ]);
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [lastRunMs, setLastRunMs] = useState<number | null>(null);

  // ── Editor mount ──────────────────────────────────────────────────────────
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  // ── Language switch ───────────────────────────────────────────────────────
  const switchLanguage = (lang: Language) => {
    setSelectedLang(lang);
    setCode(lang.starterCode);
  };

  // ── Clear terminal ────────────────────────────────────────────────────────
  const clearTerminal = () => {
    setOutput([{ kind: 'info', text: '▶ Terminal cleared.' }]);
    setRunStatus('idle');
    setLastRunMs(null);
  };

  // ── Scroll terminal to bottom ─────────────────────────────────────────────
  const scrollTerminal = () => {
    setTimeout(
      () => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
      50,
    );
  };

  // ── Run Code ──────────────────────────────────────────────────────────────
  const runCode = async () => {
    const currentCode = editorRef.current?.getValue() ?? code;
    if (!currentCode.trim()) return;

    setRunStatus('running');
    setOutput([{ kind: 'info', text: `⟳ Running ${selectedLang.label} code…` }]);
    scrollTerminal();

    const startTime = performance.now();

    try {
      const response = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language: selectedLang.pistonLanguage,
          version: selectedLang.pistonVersion,
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLastRunMs(elapsed);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `HTTP ${response.status}`);
      }

      const data = await response.json() as {
        stdout: string;
        stderr: string;
        exitCode: number;
        executionTime?: number;
      };

      const lines: OutputLine[] = [];

      if (data.stdout) {
        data.stdout
          .trimEnd()
          .split('\n')
          .forEach((line) => lines.push({ kind: 'stdout', text: line }));
      }

      if (data.stderr) {
        data.stderr
          .trimEnd()
          .split('\n')
          .forEach((line) => lines.push({ kind: 'stderr', text: line }));
      }

      if (lines.length === 0) {
        lines.push({ kind: 'info', text: '(No output)' });
      }

      lines.push({
        kind: data.exitCode === 0 ? 'info' : 'error',
        text: `── Exited with code ${data.exitCode} · ${elapsed}ms ──`,
      });

      setOutput(lines);
      setRunStatus(data.exitCode === 0 ? 'success' : 'error');
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - startTime);
      setLastRunMs(elapsed);
      const msg = err instanceof Error ? err.message : String(err);
      setOutput([
        { kind: 'error', text: `✖ Execution failed: ${msg}` },
        { kind: 'error', text: `── ${elapsed}ms ──` },
      ]);
      setRunStatus('error');
    }

    scrollTerminal();
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (runStatus === 'idle') return null;
    if (runStatus === 'running') {
      return (
        <Badge className="gap-1 bg-blue-100 text-blue-700 rounded-full text-xs animate-pulse">
          <LuLoader className="h-3 w-3 animate-spin" />
          Running
        </Badge>
      );
    }
    if (runStatus === 'success') {
      return (
        <Badge className="gap-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
          <LuCircleCheck className="h-3 w-3" />
          Success {lastRunMs !== null ? `· ${lastRunMs}ms` : ''}
        </Badge>
      );
    }
    return (
      <Badge className="gap-1 bg-rose-100 text-rose-700 rounded-full text-xs">
        <LuCircleAlert className="h-3 w-3" />
        Error {lastRunMs !== null ? `· ${lastRunMs}ms` : ''}
      </Badge>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3">
      <div
        className="relative w-full bg-[#0d1117] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
        style={{ maxWidth: 1100, height: 'min(90vh, 780px)' }}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#161b22] shrink-0">
          {/* Left – exercise info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <LuCode className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">
                {exercise.title}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {exercise.module} · Code Exercise
              </p>
            </div>
          </div>

          {/* Centre – language pills */}
          <div className="hidden sm:flex items-center gap-1 bg-[#0d1117] rounded-full px-1.5 py-1 border border-white/10">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => switchLanguage(lang)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedLang.id === lang.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Right – run + close */}
          <div className="flex items-center gap-2">
            <Button
              className="rounded-full bg-emerald-600 hover:bg-emerald-500 h-8 px-4 gap-1.5 text-xs font-semibold"
              disabled={runStatus === 'running'}
              onClick={runCode}
            >
              {runStatus === 'running' ? (
                <>
                  <LuLoader className="h-3.5 w-3.5 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <LuPlay className="h-3.5 w-3.5" />
                  Run Code
                </>
              )}
            </Button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Problem description strip ── */}
        <div className="px-4 py-2 bg-[#1c2128] border-b border-white/10 shrink-0">
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            <span className="text-slate-300 font-medium mr-1.5">📋 Task:</span>
            {exercise.description}
          </p>
        </div>

        {/* ── Resizable panes ── */}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="vertical" className="h-full">
            {/* Top pane – Monaco Editor */}
            <Panel defaultSize={60} minSize={30} className="flex flex-col">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#1c2128] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    solution.{selectedLang.id === 'python' ? 'py' : selectedLang.id === 'typescript' ? 'ts' : 'js'}
                  </span>
                </div>
                <StatusBadge />
              </div>

              {/* Monaco */}
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={selectedLang.monacoLanguage}
                  value={code}
                  onChange={(val) => setCode(val ?? '')}
                  onMount={handleEditorMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                    fontLigatures: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    padding: { top: 12, bottom: 12 },
                    tabSize: selectedLang.id === 'python' ? 4 : 2,
                    wordWrap: 'on',
                    automaticLayout: true,
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    suggest: { preview: true },
                  }}
                />
              </div>
            </Panel>

            {/* Resize handle */}
            <PanelResizeHandle className="group h-1.5 bg-transparent hover:bg-blue-500/40 transition-colors cursor-row-resize flex items-center justify-center">
              <div className="w-12 h-0.5 rounded-full bg-white/20 group-hover:bg-blue-400/70 transition-colors" />
            </PanelResizeHandle>

            {/* Bottom pane – Terminal */}
            <Panel defaultSize={40} minSize={20} className="flex flex-col bg-[#0d1117]">
              {/* Terminal toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#1c2128] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <LuTerminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    Terminal Output
                  </span>
                  {lastRunMs !== null && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <LuClock className="h-3 w-3" />
                      {lastRunMs}ms
                    </span>
                  )}
                </div>
                <button
                  onClick={clearTerminal}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-white/10"
                >
                  <LuTrash2 className="h-3 w-3" />
                  Clear
                </button>
              </div>

              {/* Output lines */}
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5">
                {output.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.kind === 'stdout'
                        ? 'text-slate-200'
                        : line.kind === 'stderr'
                        ? 'text-red-400'
                        : line.kind === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-500 italic'
                    }
                  >
                    {line.kind === 'stdout' && (
                      <span className="text-emerald-500 mr-1 select-none">›</span>
                    )}
                    {line.kind === 'stderr' && (
                      <span className="text-red-500 mr-1 select-none">✖</span>
                    )}
                    {line.text}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Keyboard hint */}
              <div className="px-4 py-2 border-t border-white/10 shrink-0 flex items-center gap-2 bg-[#161b22]">
                <span className="text-[10px] text-slate-600">
                  Click{' '}
                  <kbd className="px-1 py-0.5 rounded bg-slate-700 text-slate-400 font-mono text-[10px]">
                    Run Code
                  </kbd>{' '}
                  or press{' '}
                  <kbd className="px-1 py-0.5 rounded bg-slate-700 text-slate-400 font-mono text-[10px]">
                    Ctrl+Enter
                  </kbd>{' '}
                  to execute
                </span>
                <LuChevronDown className="h-3 w-3 text-slate-600 ml-auto" />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
}
