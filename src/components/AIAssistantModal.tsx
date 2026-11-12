import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, RefreshCw, X, FileText, CheckCircle2, ShieldCheck, Languages, Zap, MessageSquare } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentBody: string;
  onApply: (newTitle: string, newBody: string, actionType: string) => void;
  groqApiKey?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  currentBody,
  onApply,
  groqApiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'improve' | 'titles' | 'summarize' | 'translate' | 'generate'>('improve');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'urgent'>('professional');
  const [targetLang, setTargetLang] = useState<'pt-BR' | 'en' | 'es'>('en');
  const [briefing, setBriefing] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [providerUsed, setProviderUsed] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const runAIOperation = async (action: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAiOutput('');
    setSuggestedTitles([]);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: currentBody,
          title: currentTitle,
          brief: briefing,
          targetLanguage: targetLang === 'en' ? 'Inglês' : targetLang === 'es' ? 'Espanhol' : 'Português',
          tone,
          groqApiKey,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro na resposta da IA');
      }

      setProviderUsed(data.provider || 'Gemini 3.8 Flash');

      if (action === 'titles') {
        const rawLines = data.result
          .split('\n')
          .map((l: string) => l.replace(/^\d+[\.\)]\s*/, '').trim())
          .filter((l: string) => l.length > 3);
        setSuggestedTitles(rawLines.slice(0, 3));
      } else if (action === 'translate') {
        const parts = data.result.split('---');
        if (parts.length >= 2) {
          setAiOutput(parts[1].trim());
          setSuggestedTitles([parts[0].replace(/\[|\]/g, '').trim()]);
        } else {
          setAiOutput(data.result);
        }
      } else if (action === 'generate') {
        // Parse Title and Body
        const text = data.result;
        const titleMatch = text.match(/TÍTULO:\s*(.+)/i);
        const bodyMatch = text.match(/CORPO:\s*([\s\S]+)/i);

        if (titleMatch && bodyMatch) {
          setSuggestedTitles([titleMatch[1].trim()]);
          setAiOutput(bodyMatch[1].trim());
        } else {
          setAiOutput(text);
        }
      } else {
        setAiOutput(data.result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao conectar com o serviço de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (newTitle?: string, newBody?: string) => {
    onApply(newTitle ?? currentTitle, newBody ?? currentBody, activeTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B5FC7] to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Assistente de IA para Comunicados</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {groqApiKey ? 'Groq Llama-3.3' : 'Gemini 3.8 Flash Nativo'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Otimize, revise e gere comunicados corporativos de alto engajamento no Teams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/90 px-6 gap-2 overflow-x-auto py-2">
          <button
            onClick={() => {
              setActiveTab('improve');
              setAiOutput('');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'improve'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Revisar & Mudar Tom
          </button>
          <button
            onClick={() => {
              setActiveTab('titles');
              setAiOutput('');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'titles'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            Sugerir Títulos (3 opções)
          </button>
          <button
            onClick={() => {
              setActiveTab('summarize');
              setAiOutput('');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'summarize'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Resumir Notificação
          </button>
          <button
            onClick={() => {
              setActiveTab('translate');
              setAiOutput('');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'translate'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Languages className="w-4 h-4" />
            Traduzir (EN / ES)
          </button>
          <button
            onClick={() => {
              setActiveTab('generate');
              setAiOutput('');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'generate'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Gerar do Zero (Briefing)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* Controls bar per action */}
          {activeTab === 'improve' && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Escolha o Tom Desejado:</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-200 border border-zinc-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="professional">💼 Corporativo & Polido (Padrão)</option>
                  <option value="friendly">🤝 Acolhedor & Engajador (RH / Time)</option>
                  <option value="urgent">🚨 Urgente & Direto ao Ponto (CISO / TI)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => runAIOperation('spellcheck')}
                  disabled={isLoading || !currentBody}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  Corrigir Ortografia
                </button>
                <button
                  onClick={() => runAIOperation('professional')}
                  disabled={isLoading || !currentBody}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition disabled:opacity-50 shadow-sm"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Reescrever Texto
                </button>
              </div>
            </div>
          )}

          {activeTab === 'titles' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <p className="text-xs text-zinc-400">
                A IA analisará o corpo da mensagem e criará 3 opções de títulos de alto impacto.
              </p>
              <button
                onClick={() => runAIOperation('titles')}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition disabled:opacity-50 shadow-sm"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Gerar Sugestões de Título
              </button>
            </div>
          )}

          {activeTab === 'summarize' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <p className="text-xs text-zinc-400">
                Gere uma síntese em 2 frases para notificações curtas no canal do Teams.
              </p>
              <button
                onClick={() => runAIOperation('summarize')}
                disabled={isLoading || !currentBody}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition disabled:opacity-50 shadow-sm"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                Gerar Resumo
              </button>
            </div>
          )}

          {activeTab === 'translate' && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Idioma de Destino:</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-200 border border-zinc-700"
                >
                  <option value="en">Inglês (English - Global Teams)</option>
                  <option value="es">Espanhol (Español - LatAm)</option>
                  <option value="pt-BR">Português (Brasil)</option>
                </select>
              </div>
              <button
                onClick={() => runAIOperation('translate')}
                disabled={isLoading || !currentBody}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition disabled:opacity-50 shadow-sm"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                Traduzir Comunicado
              </button>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-3 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descreva o briefing ou contexto do comunicado:
                </label>
                <textarea
                  value={briefing}
                  onChange={(e) => setBriefing(e.target.value)}
                  placeholder="Ex: Avise a equipe sobre uma manutenção na VPN e no portal corporativo no sábado das 22h às 02h. Peça para salvarem arquivos antes."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => runAIOperation('generate')}
                  disabled={isLoading || !briefing.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-[#5B5FC7] hover:from-indigo-500 hover:to-[#6E72D6] text-xs text-white font-semibold transition disabled:opacity-50 shadow-md"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Gerar Comunicado Completo com IA
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Results: Titles */}
          {suggestedTitles.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Opções de Título Sugeridas:
              </h4>
              <div className="space-y-2">
                {suggestedTitles.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition group"
                  >
                    <span className="text-xs text-zinc-200 font-medium">{t}</span>
                    <button
                      onClick={() => handleApply(t, currentBody)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition"
                    >
                      <Check className="w-3 h-3" />
                      Usar Este Título
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-side or Output comparison */}
          {aiOutput && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Versão Original:
                </span>
                <div className="flex-1 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-300 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {currentBody || '(Vazio)'}
                </div>
              </div>

              {/* AI output */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sugestão da IA ({providerUsed}):
                  </span>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-zinc-900 border border-indigo-500/30 text-xs text-zinc-200 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {aiOutput}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            Powered by {providerUsed || 'Google Gemini 3.8 Flash & Groq Llama 3.3'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Fechar
            </button>
            {aiOutput && (
              <button
                onClick={() =>
                  handleApply(
                    suggestedTitles.length > 0 ? suggestedTitles[0] : currentTitle,
                    aiOutput
                  )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold transition shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aplicar Alterações ao Comunicado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
