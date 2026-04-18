declare global {
    interface Window {
        loadPyodide: any;
        pyodideLocal: any;
    }
}

// Per-run output capture buffers (replaced before each execution)
let _captureStdout: ((text: string) => void) | null = null;
let _captureStderr: ((text: string) => void) | null = null;

let pyodidePromise: Promise<any> | null = null;

export const loadPyodideEnvironment = async (): Promise<any> => {
    // If it's already loading or loaded, return the existing promise
    if (pyodidePromise) {
        return pyodidePromise;
    }

    // Create the loading promise and store it
    pyodidePromise = (async () => {
        try {
            if (!window.pyodideLocal) {
                if (!document.getElementById('pyodide-script')) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.id = 'pyodide-script';
                        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }

                // Pass stdout/stderr INTO loadPyodide so Pyodide sets up WASM-level I/O
                // correctly from the start. This avoids OSError [Errno 29] (ESPIPE) which
                // occurs when the WASM file descriptors are initialised without callbacks
                // and then Python tries to flush/seek them.
                window.pyodideLocal = await window.loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
                    stdout: (text: string) => {
                        if (_captureStdout) _captureStdout(text);
                        else console.log('[pyodide]', text);
                    },
                    stderr: (text: string) => {
                        if (_captureStderr) _captureStderr(text);
                        else console.error('[pyodide]', text);
                    },
                });

                // Replace builtins.input() with a console-only version.
                // Prints the prompt to stdout and returns "" — no browser dialog.
                // stdin is a broken WASM file descriptor so the real input() always
                // crashes with OSError [Errno 29].
                await window.pyodideLocal.runPythonAsync(`
import builtins
import sys

def _browser_input(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt))
        sys.stdout.flush()
    return ""

builtins.input = _browser_input
`);
            }
            return window.pyodideLocal;
        } catch (error) {
            console.error('Failed to initialize Pyodide environment:', error);
            pyodidePromise = null; // allow retries if it fails completely
            throw error;
        }
    })();

    return pyodidePromise;
};

/** Call before running user code to redirect output into your own buffers. */
export const setPyodideCapture = (
    stdoutCb: (text: string) => void,
    stderrCb: (text: string) => void,
) => {
    _captureStdout = stdoutCb;
    _captureStderr = stderrCb;
};

/** Call after running user code to restore default (console) output. */
export const clearPyodideCapture = () => {
    _captureStdout = null;
    _captureStderr = null;
};
