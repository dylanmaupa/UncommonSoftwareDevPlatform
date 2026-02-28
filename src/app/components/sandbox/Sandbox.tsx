import { useState } from 'react';
import Editor from '@monaco-editor/react';
import DashboardLayout from '../layout/DashboardLayout';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { supabase } from '../../../lib/supabase';
import { loadPyodideEnvironment } from '../../../lib/pyodide';
import { LuPlay, LuTerminal, LuTrash2 } from 'react-icons/lu';

export default function Sandbox() {
    const [code, setCode] = useState('# Try writing some Python code here!\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState('python');

    const logActivity = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.rpc('record_user_activity', { p_user_id: user.id });
        }
    };

    const executeCode = async (sourceCode: string) => {
        if (language === 'python') {
            try {
                const pyodide = await loadPyodideEnvironment();

                // Redirect stdout/stderr specifically for this run
                await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

                try {
                    await pyodide.runPythonAsync(sourceCode);
                    const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
                    const stderr = await pyodide.runPythonAsync("sys.stderr.getvalue()");
                    return { run: { output: stdout || stderr, code: stderr ? 1 : 0, stderr } };
                } catch (execErr: any) {
                    return { run: { output: String(execErr), code: 1, stderr: String(execErr) } };
                }
            } catch (err: any) {
                console.error('Pyodide Error:', err);
                return { run: { output: 'Failed to load Python environment: \n' + String(err), code: 1, stderr: 'Error' } };
            }
        } else {
            // JavaScript Sandbox
            let stdout = '';
            const originalLog = console.log;
            console.log = (...args) => {
                stdout += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
            };

            try {
                const func = new Function(sourceCode);
                func();
                return { run: { output: stdout, code: 0, stderr: '' } };
            } catch (err: any) {
                return { run: { output: stdout + '\n' + String(err), code: 1, stderr: String(err) } };
            } finally {
                console.log = originalLog;
            }
        }
    };

    const handleRun = async () => {
        try {
            setIsRunning(true);
            if (language === 'python' && !window.pyodideLocal) {
                setOutput('Connecting to Python environment...\n');
            } else {
                setOutput('Running code...\n');
            }

            const result = await executeCode(code);
            setOutput(result?.run?.output || 'No output.');

            // Log activity for streaks on successful run attempt
            await logActivity();
        } catch (e: any) {
            setOutput(`Execution failed: ${e?.message || String(e)}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleClearConsole = () => {
        setOutput('');
    };

    return (
        <DashboardLayout>
            <div className="relative flex flex-col min-h-[calc(100vh-theme(spacing.16))] lg:min-h-screen bg-[#0b0b0b] text-white overflow-hidden">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.1),_transparent_40%)]"
                />
                <div className="relative z-10 flex flex-col min-h-[calc(100vh-theme(spacing.16))] lg:min-h-screen">
                    <div className="border-b border-white/10 bg-[#0f0f10]/90 backdrop-blur px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30">
                            <LuTerminal className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-white heading-font">Practice Sandbox</h1>
                            <p className="text-xs text-white/60">Write and test your code securely in the browser.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-[#111214] border border-white/10 rounded-lg text-sm px-3 py-2 text-white/80 outline-none focus:ring-2 focus:ring-blue-500/30"
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value);
                                if (e.target.value === 'javascript' && code.includes('def greet(name):')) {
                                    setCode('// Try writing some JavaScript code here!\\n\\nfunction greet(name) {\\n  return `Hello, ${name}!`;\\n}\\n\\nconsole.log(greet("World"));\\n');
                                } else if (e.target.value === 'python' && code.includes('function greet(name)')) {
                                    setCode('# Try writing some Python code here!\\n\\ndef greet(name):\\n    return f"Hello, {name}!"\\n\\nprint(greet("World"))\\n');
                                }
                            }}
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                        </select>
                        <Button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="bg-blue-500 text-white hover:bg-blue-400 rounded-full px-6 shadow-lg shadow-blue-500/20"
                        >
                            <LuPlay className="w-4 h-4 mr-2" />
                            {isRunning ? 'Running...' : 'Run Code'}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col lg:flex-row gap-6">

                    {/* Editor Column */}
                    <Card className="flex-1 flex flex-col gap-0 border border-white/10 overflow-hidden rounded-2xl min-h-[420px] bg-[#141518] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-36px_rgba(0,0,0,0.9)]">
                        <div className="bg-[#17181b] p-2 border-b border-[#24262b] flex items-center justify-between">
                            <div className="flex gap-2 px-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-blue-500/80"></div>
                            </div>
                            <span className="text-xs text-white/50 font-mono tracking-wider">{language === 'python' ? 'main.py' : 'index.js'}</span>
                            <div className="w-10"></div> {/* Spacer for centering */}
                        </div>
                        <div className="flex-1 bg-[#141518] relative">
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: language === 'python' ? 4 : 2,
                                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                }}
                                className="absolute inset-0"
                            />
                        </div>
                    </Card>

                    {/* Console Column */}
                    <Card className="lg:w-1/3 flex flex-col gap-0 border border-white/10 overflow-hidden rounded-2xl min-h-[300px] lg:min-h-0 bg-[#0f1012] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-36px_rgba(0,0,0,0.9)]">
                        <div className="bg-[#17181b] px-4 py-2 flex items-center justify-between border-b border-[#24262b]">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-2">
                                <LuTerminal className="w-3 h-3" /> Console
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearConsole}
                                className="h-7 text-xs text-white/50 hover:text-white hover:bg-white/10"
                            >
                                <LuTrash2 className="w-3 h-3 mr-1" /> Clear
                            </Button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto w-full">
                            {output ? (
                                <pre className="text-sm font-mono text-blue-400 whitespace-pre-wrap leading-relaxed">
                                    {output}
                                </pre>
                            ) : (
                                <div className="h-full flex items-center justify-center text-white/30 text-sm italic font-mono">
                                    Output will appear here...
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
}





