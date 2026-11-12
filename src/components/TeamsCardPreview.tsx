import React, { useState } from 'react';
import { Communicado } from '../types';
import { buildTeamsAdaptiveCard, buildPowerAutomatePayload, getPriorityMeta } from '../utils/adaptiveCards';
import { Copy, Check, ExternalLink, Monitor, Smartphone, Code2, Bot, Sparkles, Send } from 'lucide-react';

interface TeamsCardPreviewProps {
  communicado: Partial<Communicado>;
  tenantName?: string;
}

export const TeamsCardPreview: React.FC<TeamsCardPreviewProps> = ({ communicado, tenantName = 'Matriz Corporativa' }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'json' | 'power_automate'>('desktop');
  const [cardTheme, setCardTheme] = useState<'dark' | 'light'>('dark');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const priorityMeta = getPriorityMeta(communicado.priority || 'info');
  const adaptiveCardJson = buildTeamsAdaptiveCard(communicado);
  const powerAutomatePayload = buildPowerAutomatePayload(communicado, tenantName);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Convert basic markdown to formatted HTML-like output
  const renderFormattedMarkdown = (text: string = '') => {
    if (!text) return <p className="italic text-zinc-500">Nenhum texto informado...</p>;

    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-base mt-2 mb-1 flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-lg mt-3 mb-1 text-zinc-900 dark:text-zinc-100">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-zinc-800 dark:text-zinc-200">
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.substring(2)) }} />
              </li>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="pl-3 border-l-3 border-indigo-500/70 text-xs italic bg-indigo-500/5 dark:bg-indigo-500/10 py-1.5 pr-2 rounded-r"
              >
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.substring(2)) }} />
              </blockquote>
            );
          }
          if (trimmed === '') {
            return <div key={idx} className="h-1.5" />;
          }
          return (
            <p key={idx} className="text-zinc-800 dark:text-zinc-200">
              <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
            </p>
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-50">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-xs bg-zinc-200 dark:bg-zinc-800 font-mono text-indigo-600 dark:text-indigo-400">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 font-medium">$1</a>');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-950/80 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#5B5FC7]/20 text-[#7B83EB] font-bold text-xs border border-[#5B5FC7]/40">
            MS
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Preview Microsoft Teams
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-zinc-500 font-mono">
              Adaptive Card v1.4
            </span>
          </div>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'desktop'
                ? 'bg-[#5B5FC7] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Visualização Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'mobile'
                ? 'bg-[#5B5FC7] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Visualização Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'json'
                ? 'bg-[#5B5FC7] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="JSON do Adaptive Card"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">JSON Card</span>
          </button>
          <button
            onClick={() => setViewMode('power_automate')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'power_automate'
                ? 'bg-[#5B5FC7] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Payload Power Automate"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Power Automate</span>
          </button>
        </div>

        {/* Card sub-theme switcher */}
        {(viewMode === 'desktop' || viewMode === 'mobile') && (
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <span className="hidden sm:inline">Tema Teams:</span>
            <button
              onClick={() => setCardTheme(cardTheme === 'dark' ? 'light' : 'dark')}
              className="px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 transition"
            >
              {cardTheme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
            </button>
          </div>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center bg-zinc-950/40">
        {viewMode === 'desktop' && (
          <div className="w-full max-w-xl animate-in fade-in duration-200">
            <TeamsChatBubble cardTheme={cardTheme}>
              <AdaptiveCardContent
                communicado={communicado}
                priorityMeta={priorityMeta}
                cardTheme={cardTheme}
                renderMarkdown={renderFormattedMarkdown}
              />
            </TeamsChatBubble>
          </div>
        )}

        {viewMode === 'mobile' && (
          <div className="w-full max-w-[340px] animate-in fade-in duration-200">
            {/* Mobile phone mock frame */}
            <div className="rounded-[36px] p-3 bg-zinc-800/90 border-4 border-zinc-700 shadow-2xl">
              <div className="flex justify-between items-center px-4 py-1.5 text-[10px] text-zinc-400 font-medium">
                <span>09:41</span>
                <div className="w-16 h-3.5 bg-zinc-950 rounded-full mx-auto" />
                <div className="flex gap-1">5G 100%</div>
              </div>
              <div className="mt-2 rounded-2xl overflow-hidden shadow-inner max-h-[580px] overflow-y-auto">
                <TeamsChatBubble cardTheme={cardTheme} isMobile>
                  <AdaptiveCardContent
                    communicado={communicado}
                    priorityMeta={priorityMeta}
                    cardTheme={cardTheme}
                    renderMarkdown={renderFormattedMarkdown}
                    isMobile
                  />
                </TeamsChatBubble>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'json' && (
          <div className="w-full h-full flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Schema oficial: AdaptiveCard v1.4 para Microsoft Teams Webhooks</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(adaptiveCardJson, null, 2), 'cardJson')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition"
              >
                {copiedKey === 'cardJson' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'cardJson' ? 'Copiado!' : 'Copiar JSON'}
              </button>
            </div>
            <pre className="flex-1 p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-400/90 overflow-auto whitespace-pre leading-relaxed select-all">
              {JSON.stringify(adaptiveCardJson, null, 2)}
            </pre>
          </div>
        )}

        {viewMode === 'power_automate' && (
          <div className="w-full h-full flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Payload HTTP Trigger pronto para fluxo do Power Automate (com @mentions):</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(powerAutomatePayload, null, 2), 'flowPayload')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm"
              >
                {copiedKey === 'flowPayload' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'flowPayload' ? 'Copiado!' : 'Copiar Payload Power Automate'}
              </button>
            </div>
            <pre className="flex-1 p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-indigo-300 overflow-auto whitespace-pre leading-relaxed select-all">
              {JSON.stringify(powerAutomatePayload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer status summary bar */}
      <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Card renderizado sem erros de validação</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{communicado.actionButtons?.length || 0} botões de ação</span>
          <span>•</span>
          <span>{communicado.mentions?.length || 0} menções</span>
        </div>
      </div>
    </div>
  );
};

// Teams Chat message wrapper mimicking real Microsoft Teams UI
const TeamsChatBubble: React.FC<{
  children: React.ReactNode;
  cardTheme: 'dark' | 'light';
  isMobile?: boolean;
}> = ({ children, cardTheme, isMobile = false }) => {
  const isDark = cardTheme === 'dark';

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl shadow-lg border transition-colors ${
        isDark ? 'bg-[#201F1F] border-[#2B2B2B] text-white' : 'bg-[#F5F5F5] border-[#E0E0E0] text-zinc-900'
      }`}
    >
      {/* Bot Header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-[#5B5FC7] flex items-center justify-center text-white shadow-sm shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Teams Communicator
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase bg-[#5B5FC7]/20 text-[#7B83EB] border border-[#5B5FC7]/40">
              BOT
            </span>
            <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Hoje às 10:14
            </span>
          </div>
        </div>
      </div>

      {/* Adaptive Card container */}
      <div
        className={`rounded-xl border overflow-hidden shadow-sm transition-colors ${
          isDark ? 'bg-[#292929] border-[#383838]' : 'bg-white border-[#E6E6E6]'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

// Internal card renderer
const AdaptiveCardContent: React.FC<{
  communicado: Partial<Communicado>;
  priorityMeta: ReturnType<typeof getPriorityMeta>;
  cardTheme: 'dark' | 'light';
  renderMarkdown: (text?: string) => React.ReactNode;
  isMobile?: boolean;
}> = ({ communicado, priorityMeta, cardTheme, renderMarkdown, isMobile }) => {
  const isDark = cardTheme === 'dark';

  const labelText = communicado.customPriorityLabel || priorityMeta.label;
  const iconEmoji = communicado.customCategoryEmoji || priorityMeta.icon;
  const accentHex = communicado.customPriorityColor || priorityMeta.hex;

  const showBanner = communicado.showBanner !== false && Boolean(communicado.bannerUrl && communicado.bannerUrl.trim().length > 0);
  const showPhoto = communicado.showAuthorPhoto === true && Boolean(communicado.author?.avatar && communicado.author.avatar.trim().length > 0);

  // Author initials if photo is disabled or not provided
  const authorInitials = (communicado.author?.name || 'EC')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col">
      {/* Top Banner if provided and enabled */}
      {showBanner && (
        <div className="w-full relative overflow-hidden max-h-44 bg-zinc-900">
          <img
            src={communicado.bannerUrl!.trim()}
            alt="Banner do comunicado"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Priority accent stripe */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: accentHex }}
      />

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Category & Priority Badge Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${accentHex}22`,
                color: accentHex,
                border: `1px solid ${accentHex}44`,
              }}
            >
              <span>{iconEmoji}</span>
              <span>{labelText}</span>
            </span>

            {communicado.category && (
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                  isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {communicado.category}
              </span>
            )}
          </div>

          <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            ID: #{communicado.id?.slice(-4) || 'NOVO'}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-lg sm:text-xl font-bold tracking-tight leading-snug ${
            isDark ? 'text-zinc-50' : 'text-zinc-900'
          }`}
        >
          {communicado.title || 'Título do Comunicado'}
        </h3>

        {/* Body (Markdown formatted) */}
        <div className={`pt-1 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
          {renderMarkdown(communicado.body)}
        </div>

        {/* Mentions tags */}
        {communicado.mentions && communicado.mentions.length > 0 && (
          <div
            className={`p-2.5 rounded-lg flex items-start gap-2 text-xs ${
              isDark ? 'bg-indigo-950/40 border border-indigo-900/50' : 'bg-indigo-50 border border-indigo-200'
            }`}
          >
            <span className="font-semibold text-indigo-400 shrink-0">@ Destinatários:</span>
            <div className="flex flex-wrap gap-1">
              {communicado.mentions.map((m, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                    isDark ? 'bg-indigo-900/60 text-indigo-200' : 'bg-indigo-200 text-indigo-900'
                  }`}
                >
                  {m.startsWith('@') ? m : `@${m}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author signature footer (with photo OR clean text without photo) */}
        <div
          className={`flex items-center justify-between gap-3 pt-3 mt-1 border-t ${
            isDark ? 'border-zinc-800/80 text-zinc-400' : 'border-zinc-200 text-zinc-600'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {showPhoto ? (
              <img
                src={communicado.author!.avatar!}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-700/60 text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-zinc-600/40">
                {authorInitials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {communicado.customSenderName || communicado.author?.name || 'Equipe Corporativa'}
                </p>
                {!showPhoto && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                    Sem Foto
                  </span>
                )}
              </div>
              <p className="text-[10px] truncate opacity-80">
                {communicado.author?.email || 'comunicados@empresa.com'}
              </p>
            </div>
          </div>
          <span className="text-[10px] opacity-70 whitespace-nowrap">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>

        {/* Interactive Action Buttons */}
        {communicado.actionButtons && communicado.actionButtons.length > 0 && (
          <div className="pt-2 flex flex-col sm:flex-row gap-2 mt-1">
            {communicado.actionButtons.map((btn) => (
              <a
                key={btn.id}
                href={btn.url || '#'}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition shadow-sm ${
                  btn.style === 'positive'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : btn.style === 'destructive'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-[#5B5FC7] hover:bg-[#4F52B2] text-white'
                }`}
              >
                <span>{btn.title || 'Acessar Link'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
