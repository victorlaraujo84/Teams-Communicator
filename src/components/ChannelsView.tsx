import React, { useState } from 'react';
import { Channel, ChannelType, Tenant, User } from '../types';
import {
  Radio,
  PlusCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  Workflow,
  BookOpen,
  Webhook,
  Copy,
  Check,
  Zap,
  Shield,
} from 'lucide-react';
import { PowerAutomateGuideModal } from './PowerAutomateGuideModal';

interface ChannelsViewProps {
  channels: Channel[];
  currentTenant: Tenant;
  currentUser: User;
  onSaveChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: string) => void;
  onTestChannel: (channel: Channel) => Promise<{ success: boolean; message: string; latencyMs?: number }>;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  currentTenant,
  currentUser,
  onSaveChannel,
  onDeleteChannel,
  onTestChannel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ChannelType>('teams_webhook');
  const [department, setDepartment] = useState('Recursos Humanos');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isInboundEnabled, setIsInboundEnabled] = useState(true);
  const [inboundDeliveryMode, setInboundDeliveryMode] = useState<'direct' | 'approval'>('direct');
  const [isDefaultInbound, setIsDefaultInbound] = useState(false);
  const [inboundSlug, setInboundSlug] = useState('');
  const [copiedChannelId, setCopiedChannelId] = useState<string | null>(null);

  // Ping test states per channel
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const tenantChannels = channels.filter((c) => c.tenantId === currentTenant.id);

  const handleOpenAdd = () => {
    setEditingChannel(null);
    setName('');
    setType('teams_webhook');
    setDepartment('Recursos Humanos');
    setWebhookUrl('');
    setDescription('');
    setIsInboundEnabled(true);
    setInboundDeliveryMode('direct');
    setIsDefaultInbound(tenantChannels.length === 0);
    setInboundSlug('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ch: Channel) => {
    setEditingChannel(ch);
    setName(ch.name);
    setType(ch.type);
    setDepartment(ch.department);
    setWebhookUrl(ch.webhookUrl);
    setDescription(ch.description || '');
    setIsInboundEnabled(ch.isInboundEnabled !== false);
    setInboundDeliveryMode(ch.inboundDeliveryMode || 'direct');
    setIsDefaultInbound(Boolean(ch.isDefaultInbound));
    setInboundSlug(ch.inboundSlug || ch.id.replace('ch-', ''));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !webhookUrl.trim()) return;

    const baseSlug = inboundSlug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const saved: Channel = {
      id: editingChannel ? editingChannel.id : `ch-${Date.now()}`,
      tenantId: currentTenant.id,
      name: name.trim(),
      type,
      department,
      webhookUrl: webhookUrl.trim(),
      defaultTimezone: currentTenant.defaultTimezone,
      isActive: true,
      lastStatus: editingChannel ? editingChannel.lastStatus : 'untested',
      lastTestedAt: editingChannel?.lastTestedAt,
      lastLatencyMs: editingChannel?.lastLatencyMs,
      description: description.trim(),
      isInboundEnabled,
      inboundDeliveryMode,
      isDefaultInbound,
      inboundSlug: baseSlug || 'canal',
    };

    onSaveChannel(saved);
    setIsModalOpen(false);
  };

  const handleRunPing = async (ch: Channel) => {
    setTestingId(ch.id);
    setTestResult(null);
    try {
      const res = await onTestChannel(ch);
      setTestResult({ id: ch.id, success: res.success, message: res.message });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Canais & Endpoints de Webhook</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5B5FC7]/20 text-[#7B83EB]">
              {tenantChannels.length} canais ativos
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Cadastre Incoming Webhooks do Microsoft Teams e gatilhos HTTP do Power Automate
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs transition border border-purple-500/30"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Guia Power Automate</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5FC7] to-indigo-600 hover:from-[#6E72D6] hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Novo Canal</span>
          </button>
        </div>
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenantChannels.map((ch) => {
          const isTesting = testingId === ch.id;
          const pingInfo = testResult?.id === ch.id ? testResult : null;

          return (
            <div
              key={ch.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        ch.lastStatus === 'online'
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                          : ch.lastStatus === 'offline'
                          ? 'bg-rose-500'
                          : 'bg-zinc-500'
                      }`}
                    />
                    <h3 className="text-sm font-bold text-white truncate">{ch.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ch.type === 'power_automate'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {ch.type === 'power_automate' ? 'Power Automate Flow' : 'Teams Incoming Webhook'}
                  </span>
                </div>

                <div className="text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Departamento:</span> {ch.department}
                </div>

                {ch.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2">{ch.description}</p>
                )}

                {/* Webhook Destino Teams */}
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    Webhook Destino (Teams/Flow):
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850 font-mono text-[11px] text-zinc-400 truncate">
                    {ch.webhookUrl}
                  </div>
                </div>

                {/* Inbound Webhook Endpoint Dedicado */}
                {ch.isInboundEnabled !== false && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Webhook className="w-3.5 h-3.5 text-indigo-400" />
                        Endpoint Inbound Dedicado:
                        {ch.isDefaultInbound && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            PADRÃO
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        {ch.inboundDeliveryMode === 'approval' ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Fila Aprovação
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Disparo Direto
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-[10px] text-indigo-200 bg-zinc-950/80 px-2 py-1 rounded truncate border border-indigo-500/20">
                        {`/api/v1/inbound/channel/${ch.inboundSlug || ch.id}`}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const fullUrl = `${window.location.origin}/api/v1/inbound/channel/${ch.inboundSlug || ch.id}`;
                          navigator.clipboard.writeText(fullUrl);
                          setCopiedChannelId(ch.id);
                          setTimeout(() => setCopiedChannelId(null), 2500);
                        }}
                        className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                        title="Copiar URL completa do Inbound para este canal"
                      >
                        {copiedChannelId === ch.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedChannelId === ch.id ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Test feedback banner if available */}
                {pingInfo && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                      pingInfo.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {pingInfo.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{pingInfo.message}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div className="text-[11px] text-zinc-500 font-mono">
                  {ch.lastLatencyMs ? `Latência: ${ch.lastLatencyMs}ms` : 'Não testado'}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRunPing(ch)}
                    disabled={isTesting}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testando...' : 'Testar Ping'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(ch)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteChannel(ch.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingChannel ? 'Editar Canal Teams' : 'Cadastrar Novo Canal / Webhook'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Canal:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: #rh-comunicados-oficial"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tipo de Integração:
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
                  >
                    <option value="teams_webhook">Incoming Webhook (Teams)</option>
                    <option value="power_automate">Power Automate Flow (HTTP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Departamento:
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
                  >
                    <option value="Recursos Humanos">Recursos Humanos (RH)</option>
                    <option value="TI & Infra">TI & Infraestrutura</option>
                    <option value="Comunicação Geral">Comunicação Geral</option>
                    <option value="Segurança da Informação">Segurança (CISO)</option>
                    <option value="Diretoria & Executivo">Diretoria & Executivo</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>
              </div>

              {type === 'power_automate' && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                      <Workflow className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block text-xs">Precisa de ajuda com o Power Automate?</span>
                      <span className="text-[11px] text-zinc-400">
                        Veja o JSON Schema e como configurar o gatilho HTTP passo a passo.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGuideModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shrink-0 shadow-sm"
                  >
                    Ver Guia
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL do Webhook / Endpoint HTTP:
                </label>
                <textarea
                  required
                  rows={3}
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://outlook.office.com/webhook/... ou https://prod-xx.brazilsouth.logic.azure.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Cole aqui o endereço gerado pelo conector de Incoming Webhook do Teams ou o trigger HTTP do Power Automate.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição (Opcional):
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Canal principal de avisos com mais de 1.200 colaboradores ativos."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500"
                />
              </div>

              {/* Seção Inbound Webhook Routing */}
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Gateway de Entrada (Inbound Webhook)</span>
                      <span className="text-[10px] text-zinc-400">Permitir que sistemas externos enviem mensagens diretamente para este canal</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInboundEnabled}
                      onChange={(e) => setIsInboundEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {isInboundEnabled && (
                  <div className="space-y-3 pt-2 border-t border-indigo-500/20 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          Ação ao Receber Inbound:
                        </label>
                        <select
                          value={inboundDeliveryMode}
                          onChange={(e) => setInboundDeliveryMode(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white"
                        >
                          <option value="direct">🚀 Disparo Direto (Postar no Teams)</option>
                          <option value="approval">🛡️ Enviar para Fila de Aprovação</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          Identificador / Slug da URL:
                        </label>
                        <input
                          type="text"
                          value={inboundSlug}
                          onChange={(e) => setInboundSlug(e.target.value)}
                          placeholder="Ex: ti-alertas"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white font-mono placeholder-zinc-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input
                          type="checkbox"
                          checked={isDefaultInbound}
                          onChange={(e) => setIsDefaultInbound(e.target.checked)}
                          className="accent-indigo-600 rounded"
                        />
                        <span>Definir como <strong>Canal Padrão</strong> de entrada do Tenant</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
                >
                  Salvar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Power Automate Step-by-Step Guide Modal */}
      <PowerAutomateGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        tenantCode={currentTenant.code}
      />
    </div>
  );
};
