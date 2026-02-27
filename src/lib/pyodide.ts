declare global {
    interface Window {
        loadPyodide: any;
        pyodideLocal: any;
    }
}

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
                window.pyodideLocal = await window.loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
                });

                // Setup initial stdout/stderr redirection immediately so it's ready
                await window.pyodideLocal.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
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
