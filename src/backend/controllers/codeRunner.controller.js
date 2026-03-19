/**
 * codeRunner.controller.js
 *
 * Express controller that executes student code safely via the
 * Piston API (https://emkc.org/api/v2/piston).
 *
 * Piston is a free, open-source code execution engine.
 * No API key is required for the public instance.
 *
 * POST /api/code/run
 * Body: { code: string, language: string, version?: string }
 * Response: { stdout, stderr, exitCode, executionTime }
 */

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';
const TIMEOUT_MS = 30_000;   // 30 second hard timeout
const MAX_OUTPUT = 65_536;   // 64 KB output cap per stream

/**
 * Maps friendly language names to Piston runtime identifiers.
 * Full runtime list: GET https://emkc.org/api/v2/piston/runtimes
 */
const LANGUAGE_MAP = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  js:         { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  ts:         { language: 'typescript', version: '5.0.3' },
  java:       { language: 'java',       version: '15.0.2' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  c:          { language: 'c',          version: '10.2.0' },
  go:         { language: 'go',         version: '1.16.2' },
  rust:       { language: 'rust',       version: '1.50.0' },
};

/**
 * Truncate a string to a maximum byte length, appending a notice if cut.
 */
function truncate(str, max = MAX_OUTPUT) {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.slice(0, max) + `\n\n[Output truncated at ${max} bytes]`;
}

/**
 * POST /api/code/run
 */
export async function runCode(req, res) {
  const { code, language, version } = req.body;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!code || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Missing or empty code field.' });
  }

  const langKey = (language ?? '').toLowerCase().trim();
  const runtime = LANGUAGE_MAP[langKey];

  if (!runtime) {
    return res.status(400).json({
      error: `Unsupported language "${language}". Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}.`,
    });
  }

  const pistonLanguage = runtime.language;
  const pistonVersion  = version ?? runtime.version;

  // ── Build Piston request ──────────────────────────────────────────────────
  const pistonPayload = {
    language: pistonLanguage,
    version:  pistonVersion,
    files: [
      {
        name: 'solution',   // Piston infers extension from language
        content: code,
      },
    ],
    // Optional run-time limits (Piston respects these):
    run_timeout:    10000,    // 10 s CPU time
    compile_timeout: 10000,   // 10 s compile time (for compiled languages)
    run_memory_limit: 128 * 1024 * 1024,  // 128 MB
  };

  // ── Call Piston with AbortController timeout ──────────────────────────────
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const startTime = Date.now();

  try {
    const pistonRes = await fetch(PISTON_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(pistonPayload),
      signal:  controller.signal,
    });

    clearTimeout(timeoutId);
    const executionTime = Date.now() - startTime;

    if (!pistonRes.ok) {
      const errBody = await pistonRes.text().catch(() => '');
      console.error('[CodeRunner] Piston API error:', pistonRes.status, errBody);
      return res.status(502).json({
        error: `Code execution service returned HTTP ${pistonRes.status}.`,
        detail: errBody,
      });
    }

    const pistonData = await pistonRes.json();

    /*
     * Piston response shape:
     * {
     *   language, version,
     *   run: { stdout, stderr, code, signal, output }
     *   compile?: { stdout, stderr, code, signal, output }   (compiled langs)
     * }
     */
    const run     = pistonData.run     ?? {};
    const compile = pistonData.compile ?? null;

    // Surface compile errors first (for Java, C++, etc.)
    const combinedStdout = truncate(run.stdout ?? '');
    const compileStderr  = compile?.stderr ? truncate(compile.stderr) : '';
    const runStderr      = truncate(run.stderr ?? '');
    const combinedStderr = [compileStderr, runStderr].filter(Boolean).join('\n').trim();

    return res.status(200).json({
      stdout:        combinedStdout,
      stderr:        combinedStderr,
      exitCode:      run.code ?? 0,
      executionTime, // milliseconds (wall-clock, includes network)
      language:      pistonLanguage,
      version:       pistonVersion,
    });

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: `Code execution timed out after ${TIMEOUT_MS / 1000}s.`,
      });
    }

    console.error('[CodeRunner] Unexpected error:', err);
    return res.status(500).json({
      error: 'An unexpected error occurred while executing the code.',
      detail: err.message,
    });
  }
}
