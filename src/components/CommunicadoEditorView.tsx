import React, { useState } from 'react';
import { Communicado, Channel, Tenant, User, ActionButton, Priority, RecurrenceFreq, Template } from '../types';
import { ENTERPRISE_TEMPLATES } from '../utils/adaptiveCards';
import { TeamsCardPreview } from './TeamsCardPreview';
import { AIAssistantModal } from './AIAssistantModal';
import {
  Sparkles,
  Send,
  Calendar,
  Save,
  Clock,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Radio,
  FileCode,
  Bookmark,
  AtSign,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Repeat,
} from 'lucide-react';

interface CommunicadoEditorViewProps {
  initialCommunicado?: Communicado | null;
  channels: Channel[];
  currentTenant: Tenant;
  currentUser: User;
  groqApiKey?: string;
  allTemplates?: Template[];
  onSaveDraft: (comm: Partial<Communicado>) => void;
  onSubmitForApproval: (comm: Partial<Communicado>) => void;
  onScheduleSend: (comm: Partial<Communicado>) => void;
  onDispatchImmediately: (comm: Partial<Communicado>) => void;
  onSaveAsTemplate?: (template: Template) => void;
  onCancel: () => void;
}

export const CommunicadoEditorView: React.FC<CommunicadoEditorViewProps> = ({
  initialCommunicado,
  channels,
  currentTenant,
  currentUser,
  groqApiKey,
  allTemplates = ENTERPRISE_TEMPLATES,
  onSaveDraft,
  onSubmitForApproval,
  onScheduleSend,
  onDispatchImmediately,
  onSaveAsTemplate,
  onCancel,
}) => {
  // Form State
  const [title, setTitle] = useState(initialCommunicado?.title || '');
  const [body, setBody] = useState(
    initialCommunicado?.body ||
      'Escreva aqui a mensagem corporativa em **Markdown** para publicação nos canais do Microsoft Teams...'
  );
  const [summary, setSummary] = useState(initialCommunicado?.summary || '');
  const [category, setCategory] = useState<Communicado['category']>(
    initialCommunicado?.category || 'Geral'
  );
  const [priority, setPriority] = useState<Priority>(initialCommunicado?.priority || 'info');
  const [showBanner, setShowBanner] = useState<boolean>(
    initialCommunicado?.showBanner !== undefined
      ? initialCommunicado.showBanner
      : true
  );
  const [bannerUrl, setBannerUrl] = useState(
    initialCommunicado?.bannerUrl ||
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  );
  const [showAuthorPhoto, setShowAuthorPhoto] = useState<boolean>(
    initialCommunicado?.showAuthorPhoto !== undefined
      ? initialCommunicado.showAuthorPhoto
      : true
  );
  const [customSenderName, setCustomSenderName] = useState<string>(
    initialCommunicado?.customSenderName || currentUser.name
  );
  const [customSenderAvatar, setCustomSenderAvatar] = useState<string>(
    initialCommunicado?.customSenderAvatar || currentUser.avatar || ''
  );
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(
    initialCommunicado?.targetChannelIds || (channels.length > 0 ? [channels[0].id] : [])
  );
  const [mentionsInput, setMentionsInput] = useState(
    initialCommunicado?.mentions ? initialCommunicado.mentions.join(', ') : ''
  );

  // Action Buttons
  const [actionButtons, setActionButtons] = useState<ActionButton[]>(
    initialCommunicado?.actionButtons || [
      {
        id: 'btn-default-1',
        type: 'Action.OpenUrl',
        title: 'Acessar Link Corporativo',
        url: 'https://empresa.com',
        style: 'default',
      },
    ]
  );

  // Scheduling State
  const [scheduleType, setScheduleType] = useState<'now' | 'once' | 'recurring'>(
    initialCommunicado?.schedule?.type || 'now'
  );
  const [scheduleDate, setScheduleDate] = useState(
    initialCommunicado?.schedule?.scheduledAt
      ? initialCommunicado.schedule.scheduledAt.slice(0, 16)
      : new Date(Date.now() + 3600 * 1000 * 4).toISOString().slice(0, 16)
  );
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFreq>(
    initialCommunicado?.schedule?.recurrence?.frequency || 'weekly'
  );
  const [recurrenceTime, setRecurrenceTime] = useState(
    initialCommunicado?.schedule?.recurrence?.time || '09:00'
  );

  // AI Modal
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Templates Drawer Modal
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Helper to build draft object
  const getPayload = (): Partial<Communicado> => {
    const mentionsList = mentionsInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    return {
      id: initialCommunicado?.id || `comm-${Date.now()}`,
      tenantId: currentTenant.id,
      title: title || 'Comunicado Sem Título',
      body,
      summary: summary || title,
      category,
      priority,
      bannerUrl: showBanner ? bannerUrl : '',
      showBanner,
      showAuthorPhoto,
      customSenderName,
      customSenderAvatar: showAuthorPhoto ? (customSenderAvatar || currentUser.avatar) : '',
      actionButtons,
      mentions: mentionsList,
      targetChannelIds: selectedChannelIds,
      author: {
        id: currentUser.id,
        name: customSenderName || currentUser.name,
        email: currentUser.email,
        avatar: showAuthorPhoto ? (customSenderAvatar || currentUser.avatar) : '',
      },
      schedule: {
        type: scheduleType,
        scheduledAt: scheduleType === 'once' ? new Date(scheduleDate).toISOString() : undefined,
        recurrence:
          scheduleType === 'recurring'
            ? {
                frequency: recurrenceFreq,
                time: recurrenceTime,
              }
            : undefined,
        timezone: currentTenant.defaultTimezone || 'America/Sao_Paulo',
      },
      createdAt: initialCommunicado?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleApplyTemplate = (tmpl: (typeof ENTERPRISE_TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setCategory(tmpl.category as Communicado['category']);
    setPriority(tmpl.priority);
    setBannerUrl(tmpl.bannerUrl);
    setShowBanner(Boolean(tmpl.bannerUrl && tmpl.bannerUrl.trim().length > 0));
    setBody(tmpl.body);
    setActionButtons(tmpl.suggestedButtons);
    setShowTemplatesModal(false);
  };

  const handleAddButton = () => {
    setActionButtons([
      ...actionButtons,
      {
        id: `btn-${Date.now()}`,
        type: 'Action.OpenUrl',
        title: 'Novo Botão',
        url: 'https://',
        style: 'default',
      },
    ]);
  };

  const handleRemoveButton = (id: string) => {
    setActionButtons(actionButtons.filter((b) => b.id !== id));
  };

  const handleUpdateButton = (id: string, field: keyof ActionButton, val: any) => {
    setActionButtons(actionButtons.map((b) => (b.id === id ? { ...b, [field]: val } : b)));
  };

  const toggleChannel = (channelId: string) => {
    if (selectedChannelIds.includes(channelId)) {
      setSelectedChannelIds(selectedChannelIds.filter((id) => id !== channelId));
    } else {
      setSelectedChannelIds([...selectedChannelIds, channelId]);
    }
  };

  // Preset image banners
  const PRESET_BANNERS = [
    {
      label: 'Onboarding & Boas-Vindas',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Infra & Tecnologia',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Segurança CISO',
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Corporativo & Town Hall',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Pessoas & Benefícios',
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const insertMarkdown = (prefix: string, suffix = '') => {
    setBody((prev) => `${prev}\n${prefix}Texto${suffix}`);
  };

  const previewCommunicado = getPayload();

  const isEditorRole = currentUser.role === 'EDITOR';
  const requiresApproval = currentTenant.requireApproval && isEditorRole;

  return (
    <div className="space-y-6">
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-xs font-semibold"
          >
            ← Voltar
          </button>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              {initialCommunicado ? 'Editar Comunicado Teams' : 'Novo Comunicado Corporativo'}
            </h2>
            <p className="text-xs text-zinc-400">
              Crie cards adaptativos profissionais e programe o envio para os canais
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition border border-zinc-700"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Templates Prontos</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-[#5B5FC7] to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Melhorar com IA</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveDraft(getPayload())}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Rascunho</span>
          </button>

          {onSaveAsTemplate && (
            <button
              type="button"
              onClick={() => {
                const payload = getPayload();
                onSaveAsTemplate({
                  id: `tmpl-custom-${Date.now()}`,
                  title: payload.title || 'Template sem título',
                  description: payload.summary || 'Template personalizado salvo a partir do editor.',
                  category: payload.category || 'Geral',
                  priority: payload.priority || 'info',
                  bannerUrl: payload.bannerUrl || '',
                  body: payload.body || '',
                  suggestedButtons: payload.actionButtons || [],
                  isCustom: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 text-xs font-medium transition border border-indigo-500/30"
              title="Salvar este layout na Galeria de Templates para reutilizar depois"
            >
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              <span>Salvar na Galeria</span>
            </button>
          )}

          {/* If tenant requires approval and user is EDITOR */}
          {requiresApproval ? (
            <button
              type="button"
              onClick={() => onSubmitForApproval(getPayload())}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md shadow-amber-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submeter para Aprovação</span>
            </button>
          ) : scheduleType === 'now' ? (
            <button
              type="button"
              onClick={() => onDispatchImmediately(getPayload())}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Disparar Agora no Teams</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onScheduleSend(getPayload())}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Agendar Envio</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout: Left Form, Right Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols on XL) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Card Meta Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Configurações Principais
            </h3>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Título do Comunicado:
                </label>
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Sugerir Título com IA
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: ⚡ [TI] Janela de Manutenção Programada dos Servidores"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                  Categoria:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Geral">📌 Geral</option>
                  <option value="TI & Infra">💻 TI & Infraestrutura</option>
                  <option value="RH & Pessoas">🤝 RH & Pessoas</option>
                  <option value="Segurança">🛡️ Cibersegurança & CISO</option>
                  <option value="Benefícios">🌴 Benefícios & Ponto</option>
                  <option value="Eventos">🎤 Eventos & Town Hall</option>
                  <option value="Urgente">🚨 Alerta Urgente</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                  Nível de Prioridade:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('info')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                      priority === 'info'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    ℹ️ Informativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('warning')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                      priority === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    ⚠️ Atenção
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('critical')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                      priority === 'critical'
                        ? 'bg-red-500/20 text-red-300 border-red-500 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    🚨 Urgente
                  </button>
                </div>
              </div>
            </div>

            {/* Target Channels */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Canais de Destino ({selectedChannelIds.length} selecionados):
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedChannelIds(
                      selectedChannelIds.length === channels.length
                        ? []
                        : channels.map((c) => c.id)
                    )
                  }
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {selectedChannelIds.length === channels.length
                    ? 'Desmarcar todos'
                    : 'Selecionar todos'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-zinc-950/60 rounded-xl border border-zinc-800">
                {channels.map((ch) => {
                  const isSelected = selectedChannelIds.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChannel(ch.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-left transition border ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/60 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold truncate text-zinc-100">{ch.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          {ch.department} • {ch.type === 'teams_webhook' ? 'Webhook' : 'Flow'}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'border border-zinc-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Body & Markdown Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                2. Conteúdo do Comunicado (Markdown)
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300"
                  title="Negrito"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs italic text-zinc-300"
                  title="Itálico"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300"
                  title="Subtítulo"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                  title="Lista com marcadores"
                >
                  • Lista
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                  title="Citação / Destaque"
                >
                  “ Citação
                </button>
              </div>
            </div>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              placeholder="Digite o conteúdo aqui..."
            />

            {/* Mentions Input for Power Automate */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-1">
                <AtSign className="w-3.5 h-3.5 text-indigo-400" />
                <span>Menções no Teams (@mentions para Power Automate):</span>
              </div>
              <input
                type="text"
                value={mentionsInput}
                onChange={(e) => setMentionsInput(e.target.value)}
                placeholder="Ex: equipe-rh@empresa.com, joao.silva@empresa.com, todos"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Separe os e-mails ou identificadores por vírgula. Serão mencionados automaticamente no Teams.
              </p>
            </div>
          </div>

          {/* Banner & Visual Identity Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                3. Imagem de Cabeçalho (Banner)
              </h3>
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowBanner(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    !showBanner
                      ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🚫 Sem Foto
                </button>
                <button
                  type="button"
                  onClick={() => setShowBanner(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    showBanner
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🖼️ Com Imagem
                </button>
              </div>
            </div>

            {/* Banner Content: Mode Sem Foto vs Com Foto */}
            {!showBanner ? (
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Modo Envio Sem Foto ativado: </span>
                    <span className="text-zinc-400">
                      O card no Teams será enviado sem banner, destacando o título, texto em Markdown e botões.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBanner(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold shrink-0 ml-3"
                >
                  + Ativar Imagem
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    URL da Imagem / Banner do Topo:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBannerUrl('');
                      setShowBanner(false);
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 transition"
                  >
                    Alternar para Envio Sem Foto
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setBannerUrl('')}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 transition"
                  >
                    Limpar
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500 self-center">Presets corporativos:</span>
                  {PRESET_BANNERS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBannerUrl(p.url);
                        setShowBanner(true);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Author Signature & Profile Identity Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                4. Identidade do Remetente no Card Teams
              </h3>
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAuthorPhoto(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    !showAuthorPhoto
                      ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sem Foto do Autor
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthorPhoto(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    showAuthorPhoto
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Com Foto do Perfil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sender Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Remetente (Assinatura):
                </label>
                <input
                  type="text"
                  value={customSenderName}
                  onChange={(e) => setCustomSenderName(e.target.value)}
                  placeholder={currentUser.name}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Ex: seu nome ou nome corporativo como &quot;RH Comunica&quot; ou &quot;Equipe de TI&quot;.
                </p>
              </div>

              {/* Sender Avatar / Photo */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Foto de Perfil do Autor:
                </label>
                <div className="flex items-center gap-3">
                  {showAuthorPhoto && (customSenderAvatar || currentUser.avatar) ? (
                    <img
                      src={customSenderAvatar || currentUser.avatar}
                      alt={customSenderName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/50"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                      Sem Foto
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthorPhoto(true);
                        setCustomSenderAvatar(currentUser.avatar);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium block"
                    >
                      Usar foto do meu perfil
                    </button>
                    <span className="text-[10px] text-zinc-500 block">
                      {showAuthorPhoto
                        ? 'A foto será exibida no rodapé do card.'
                        : 'Apenas nome e cargo serão exibidos (sem imagem).'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                5. Botões de Ação Interativos (Action.OpenUrl)
              </h3>
              <button
                type="button"
                onClick={handleAddButton}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Plus className="w-3 h-3" />
                Adicionar Botão
              </button>
            </div>

              <div className="space-y-2">
                {actionButtons.map((btn) => (
                  <div
                    key={btn.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800"
                  >
                    <input
                      type="text"
                      value={btn.title}
                      onChange={(e) => handleUpdateButton(btn.id, 'title', e.target.value)}
                      placeholder="Texto do Botão"
                      className="w-1/3 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={btn.url}
                      onChange={(e) => handleUpdateButton(btn.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono"
                    />
                    <select
                      value={btn.style || 'default'}
                      onChange={(e) => handleUpdateButton(btn.id, 'style', e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300"
                    >
                      <option value="default">Padrão</option>
                      <option value="positive">Verde</option>
                      <option value="destructive">Vermelho</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveButton(btn.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                      title="Remover botão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          {/* Scheduling Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              4. Modalidade de Agendamento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setScheduleType('now')}
                className={`p-3 rounded-xl border text-left transition ${
                  scheduleType === 'now'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  Imediato
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Disparar assim que salvo/aprovado</p>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('once')}
                className={`p-3 rounded-xl border text-left transition ${
                  scheduleType === 'once'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Agendamento Único
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Disparo em data e hora futura</p>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('recurring')}
                className={`p-3 rounded-xl border text-left transition ${
                  scheduleType === 'recurring'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Repeat className="w-3.5 h-3.5 text-indigo-400" />
                  Recorrente
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Diário, semanal ou dias úteis</p>
              </button>
            </div>

            {/* Once details */}
            {scheduleType === 'once' && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center gap-3">
                <span className="text-xs text-zinc-300 font-medium">Data e Hora do Disparo:</span>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
                <span className="text-[11px] text-zinc-500 font-mono">
                  Fuso: {currentTenant.defaultTimezone}
                </span>
              </div>
            )}

            {/* Recurring details */}
            {scheduleType === 'recurring' && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-300 font-medium">Frequência:</span>
                  <select
                    value={recurrenceFreq}
                    onChange={(e) => setRecurrenceFreq(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                  >
                    <option value="daily">Diariamente (Todos os dias)</option>
                    <option value="workdays">Dias Úteis (Segunda a Sexta)</option>
                    <option value="weekly">Semanalmente (Toda semana)</option>
                    <option value="monthly">Mensalmente (Dia 1 do mês)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-300 font-medium">Horário:</span>
                  <input
                    type="time"
                    value={recurrenceTime}
                    onChange={(e) => setRecurrenceTime(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Microsoft Teams Preview (5 cols on XL) */}
        <div className="xl:col-span-5 sticky top-20">
          <TeamsCardPreview
            communicado={previewCommunicado}
            tenantName={currentTenant.name}
          />
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentTitle={title}
        currentBody={body}
        groqApiKey={groqApiKey}
        onApply={(newTitle, newBody) => {
          if (newTitle) setTitle(newTitle);
          if (newBody) setBody(newBody);
        }}
      />

      {/* Templates Selection Drawer Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Modelos Prontos de Adaptive Cards</h3>
                <p className="text-xs text-zinc-400">Selecione um template empresarial para acelerar a criação</p>
              </div>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Fechar ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {allTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        {tmpl.category}
                      </span>
                      <span className="text-xs text-zinc-400">{tmpl.description}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{tmpl.title}</h4>
                  </div>
                  <button
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shrink-0"
                  >
                    Usar Este Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
