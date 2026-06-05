import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AiSuggestion } from '@/types';
import { aiApi } from '@/api/ai';
import { ApiError } from '@/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { SparklesIcon, HeartIcon } from '@/components/ui/Icons';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  suggestions?: AiSuggestion[];
}

const EXAMPLES = [
  'Хочу допомогти дітям у лікарнях, бюджет до 500 грн',
  'Підкажи збори, які майже досягли цілі',
  'Цікавить підтримка спорту та молоді',
];

export default function AiAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text:
        'Привіт! Я AI-помічник Donatly. Опишіть, кому ви хочете допомогти (тема, сума, терміновість), і я підкажу відповідні збори.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(prompt: string) {
    const text = prompt.trim();
    if (!text || loading) return;

    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.recommend({ prompt: text });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.message, suggestions: res.suggestions },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'AI-помічник тимчасово недоступний.');
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="AI-помічник"
        subtitle="Персональні рекомендації, куди краще задонатити"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="card flex h-[60vh] flex-col">
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    Donatly AI
                  </div>
                )}
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {m.suggestions.map((s) => (
                      <button
                        key={s.initiativeId}
                        type="button"
                        onClick={() => navigate('/initiatives')}
                        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <HeartIcon className="h-4 w-4 text-brand-500" />
                          {s.title}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {Math.round(s.progressPercentage)}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400">
                Думаю…
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => send(ex)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-200"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-3">
          <input
            className="input flex-1"
            placeholder="Опишіть, кому хочете допомогти…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
            Надіслати
          </button>
        </form>
      </div>
    </div>
  );
}
