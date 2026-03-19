import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import {
  LuX,
  LuFileText,
  LuSend,
  LuEye,
  LuEyeOff,
  LuAlertTriangle,
  LuCheckCircle2,
  LuLoader2,
} from 'react-icons/lu';

const MAX_CHARS = 5000;

interface WrittenAssignmentEditorProps {
  exercise: {
    id: string;
    title: string;
    description: string;
    module: string;
  };
  onClose: () => void;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function WrittenAssignmentEditor({
  exercise,
  onClose,
}: WrittenAssignmentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState('');
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [showFocusWarning, setShowFocusWarning] = useState(false);

  const charCount = text.length;
  const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100);

  // ── Focus-loss tracker ────────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setFocusLossCount((prev) => {
          const next = prev + 1;
          setShowFocusWarning(true);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // ── Paste & copy prevention ───────────────────────────────────────────────
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    toast.warning('✏️ No pasting allowed!', {
      description:
        'Typing your answer yourself helps with retention and deeper understanding. Give it a go — you've got this!',
      duration: 4000,
      position: 'top-center',
    });
  }, []);

  const handleCopy = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    toast.info('📋 Copying is disabled', {
      description: 'To maintain academic integrity, copying text is not allowed.',
      duration: 3000,
      position: 'top-center',
    });
  }, []);

  const handleCut = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    toast.info('✂️ Cutting is disabled', {
      description: 'To maintain academic integrity, cutting text is not allowed.',
      duration: 3000,
      position: 'top-center',
    });
  }, []);

  // ── Context-menu paste guard ──────────────────────────────────────────────
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!text.trim()) return;

    setSubmitStatus('submitting');
    const payload = {
      exerciseId: exercise.id,
      answer: text,
      focusLossCount,
      submittedAt: new Date().toISOString(),
    };

    try {
      // Replace with your actual API endpoint
      const res = await fetch('/api/submissions/written', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Submission failed');

      setSubmitStatus('success');
      toast.success('🎉 Assignment submitted!', {
        description: 'Your written assignment has been submitted successfully.',
        duration: 5000,
        position: 'top-center',
      });
    } catch {
      setSubmitStatus('error');
      toast.error('Submission failed', {
        description: 'Something went wrong. Please try again.',
        duration: 5000,
        position: 'top-center',
      });
      setSubmitStatus('idle');
    }
  };

  // ── Character counter colour ──────────────────────────────────────────────
  const charColour =
    charPercent >= 95
      ? 'text-rose-500'
      : charPercent >= 80
      ? 'text-amber-500'
      : 'text-slate-400';

  const progressColour =
    charPercent >= 95
      ? 'bg-rose-500'
      : charPercent >= 80
      ? 'bg-amber-400'
      : 'bg-blue-500';

  const isSubmitted = submitStatus === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-blue-100">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <LuFileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 leading-tight">
                {exercise.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{exercise.module} · Written Assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        {/* ── Prompt / description ── */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <p className="text-sm text-slate-600 leading-relaxed">{exercise.description}</p>
        </div>

        {/* ── Focus-loss banner ── */}
        {showFocusWarning && (
          <div className="mx-6 mt-4 shrink-0 flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200">
            <LuAlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                Tab switch detected ({focusLossCount} {focusLossCount === 1 ? 'time' : 'times'})
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Focus losses are recorded and included with your submission. Stay focused — you can do this!
              </p>
            </div>
            <button
              onClick={() => setShowFocusWarning(false)}
              className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
            >
              <LuX className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ── Textarea ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {isSubmitted ? (
            /* Success state */
            <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <LuCheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">Assignment Submitted!</p>
                <p className="text-sm text-slate-500 mt-1">Your response has been recorded successfully.</p>
              </div>
              <div className="flex gap-6 text-center mt-2">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{charCount}</p>
                  <p className="text-xs text-slate-500">Characters written</p>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{focusLossCount}</p>
                  <p className="text-xs text-slate-500">Tab switches</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 h-full">
              {/* Anti-paste badge row */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-medium select-none">
                  <LuEyeOff className="h-3 w-3" />
                  Paste & copy disabled
                </span>
                {focusLossCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-medium select-none">
                    <LuEye className="h-3 w-3" />
                    {focusLossCount} tab {focusLossCount === 1 ? 'switch' : 'switches'} recorded
                  </span>
                )}
              </div>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                onPaste={handlePaste}
                onCopy={handleCopy}
                onCut={handleCut}
                onContextMenu={handleContextMenu}
                placeholder="Start typing your answer here… Take your time and express your thoughts clearly."
                className="flex-1 w-full min-h-[280px] resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all leading-relaxed"
                style={{ userSelect: 'text' }}
                spellCheck
                autoFocus
              />

              {/* Character counter & progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-medium tabular-nums ${charColour}`}>
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                  </p>
                  {charPercent >= 95 && (
                    <p className="text-xs text-rose-500 font-medium animate-pulse">Character limit almost reached</p>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${progressColour}`}
                    style={{ width: `${charPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!isSubmitted && (
          <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between gap-3 bg-white">
            {/* Stats pill */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <LuFileText className="h-3.5 w-3.5" />
                {text.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <LuAlertTriangle className="h-3.5 w-3.5" />
                {focusLossCount} tab {focusLossCount === 1 ? 'switch' : 'switches'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full border-slate-200 text-slate-600 h-9"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="rounded-full bg-blue-600 hover:bg-blue-700 h-9 px-5 gap-2"
                disabled={!text.trim() || submitStatus === 'submitting'}
                onClick={handleSubmit}
              >
                {submitStatus === 'submitting' ? (
                  <>
                    <LuLoader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <LuSend className="h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isSubmitted && (
          <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end bg-white">
            <Button
              className="rounded-full bg-blue-600 hover:bg-blue-700 h-9"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
