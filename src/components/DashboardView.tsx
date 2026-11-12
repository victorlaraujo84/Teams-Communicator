import React from 'react';
import { Communicado, Channel, Tenant } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import {
  Send,
  Clock,
  AlertTriangle,
  Eye,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Radio,
  ExternalLink,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

interface DashboardViewProps {
  communicados: Communicado[];
  channels: Channel[];
  currentTenant: Tenant;
  lang: SupportedLanguage;
  onNewCommunicado: () => void;
  onEditCommunicado: (comm: Communicado) => void;
  onDispatchNow: (comm: Communicado) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  communicados,
  channels,
  currentTenant,
  lang,
  onNewCommunicado,
  onEditCommunicado,
  onDispatchNow,
  onNavigateToTab,
}) => {
  const t = TRANSLATIONS[lang];

  // Filter items for current tenant
  const tenantComms = communicados.filter((c) => c.tenantId === currentTenant.id);

  // Stats calculation
  const sentComms = tenantComms.filter((c) => c.status === 'ENVIADO');
  const scheduledComms = tenantComms.filter((c) => c.status === 'AGENDADO');
  const pendingApprovals = tenantComms.filter((c) => c.status === 'AGUARDANDO_APROVACAO');
  const failedComms = tenantComms.filter((c) => c.status === 'FALHA' || c.status === 'FALHA_PARCIAL');

  const totalDelivered = sentComms.length;
  const totalEstimatedReads = sentComms.reduce((acc, curr) => acc + (curr.readCountEstimated || 0), 0);
  const deliverySuccessRate =
    tenantComms.length > 0
      ? Math.round((sentComms.length / Math.max(1, sentComms.length + failedComms.length)) * 100)
      : 100;

  // Upcoming 5 scheduled
  const upcoming5 = [...scheduledComms].slice(0, 5);

  // Top 5 Communicados
  const top5 = [...sentComms]
    .sort((a, b) => (b.readCountEstimated || 0) - (a.readCountEstimated || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-indigo-950/40 border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Dashboard de Comunicação Integrada
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5B5FC7]/20 text-[#7B83EB] border border-[#5B5FC7]/40">
              {currentTenant.name}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Monitore o fluxo de comunicados no MS Teams, agendamentos automáticos, status de webhooks e taxas de entrega corporativa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateToTab('channels')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition border border-zinc-700"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gerenciar Canais ({channels.length})</span>
          </button>
          <button
            onClick={onNewCommunicado}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5FC7] to-indigo-600 hover:from-[#6E72D6] hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Comunicado</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enviados */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {t.metrics.sentTotal}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {totalDelivered}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% OK
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-800/80 flex justify-between text-[11px] text-zinc-500 font-mono">
            <span>Hoje: 1</span>
            <span>Semana: {totalDelivered}</span>
            <span>Mês: {totalDelivered + 4}</span>
          </div>
        </div>

        {/* Agendados Pendentes */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {t.metrics.scheduled}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {scheduledComms.length}
            </span>
            <span className="text-xs text-indigo-400 font-medium">Na fila ativa</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Próximo disparo:</span>
            <span className="text-zinc-300 font-medium font-mono">
              {scheduledComms[0]?.schedule?.scheduledAt
                ? new Date(scheduledComms[0].schedule.scheduledAt).toLocaleDateString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '10/10 às 18:00'}
            </span>
          </div>
        </div>

        {/* Taxa de Entrega / Falhas */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {t.metrics.successRate}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {deliverySuccessRate}%
            </span>
            <span className="text-xs text-zinc-400">Taxa HTTP 200</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Falhas registradas:</span>
            <span className="text-zinc-400 font-medium">{failedComms.length}</span>
          </div>
        </div>

        {/* Taxa de Leitura Est. (Graph API Preview) */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {t.metrics.readRate}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {totalEstimatedReads.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-purple-400 font-medium">leituras est.</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="truncate">Fase 3: Graph API</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 font-mono">
              PREVIEW
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Próximos Agendamentos & Distribuição por Canais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Próximos 5 Agendados */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Próximos Envios Agendados</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                {scheduledComms.length}
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('scheduler')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Ver fila completa</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {upcoming5.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/50 rounded-xl border border-zinc-800/60 my-auto">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">Nenhum comunicado agendado para os próximos dias.</p>
              <button
                onClick={onNewCommunicado}
                className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Agendar Novo Comunicado
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming5.map((comm) => (
                <div
                  key={comm.id}
                  className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                          comm.priority === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : comm.priority === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {comm.priority}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">{comm.category}</span>
                      <span className="text-[11px] text-zinc-500">•</span>
                      <span className="text-[11px] text-indigo-400 font-mono">
                        {comm.schedule.type === 'recurring' ? '🔄 Recorrente' : '⏰ Disparo Único'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-100 truncate group-hover:text-indigo-300 transition">
                      {comm.title}
                    </h4>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500">
                      <span>Por: {comm.author.name}</span>
                      <span>•</span>
                      <span>{comm.targetChannelIds.length} canais</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onDispatchNow(comm)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                      title="Disparar Imediatamente"
                    >
                      <Send className="w-3 h-3" />
                      <span>Disparar Agora</span>
                    </button>
                    <button
                      onClick={() => onEditCommunicado(comm)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Status por Canal & Conexões */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Status dos Canais Teams</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('channels')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Testar todos
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {channels.slice(0, 5).map((ch) => (
              <div
                key={ch.id}
                className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-zinc-200 truncate">{ch.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {ch.department} • {ch.type === 'teams_webhook' ? 'Webhook Teams' : 'Power Automate'}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ch.lastLatencyMs ? `${ch.lastLatencyMs}ms` : 'Online'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Flow Info */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/20 text-xs">
            <div className="font-semibold text-purple-300 flex items-center gap-1">
              <span>⚡ Power Automate Ativo</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Suporta notificações com menções @usuário individuais e canais fechados via Azure Logic Apps.
            </p>
          </div>
        </div>
      </div>

      {/* Top 5 Comunicados Mais Enviados / Engajamento */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Top Comunicados Corporativos Enviados</h3>
          </div>
          <button
            onClick={() => onNavigateToTab('communicados')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Título</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Prioridade</th>
                <th className="py-2.5 px-3">Data de Disparo</th>
                <th className="py-2.5 px-3">Canais Entregues</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {top5.map((comm) => (
                <tr key={comm.id} className="hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">
                    {comm.title}
                  </td>
                  <td className="py-3 px-3 text-zinc-400">{comm.category}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        comm.priority === 'critical'
                          ? 'bg-rose-500/20 text-rose-300'
                          : comm.priority === 'warning'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {comm.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                    {comm.dispatchedAt ? new Date(comm.dispatchedAt).toLocaleString('pt-BR') : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      ✅ {comm.targetChannelIds.length} canais OK
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onEditCommunicado(comm)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                    >
                      Duplicar / Reenviar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
