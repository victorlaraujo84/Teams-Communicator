import React, { useState } from 'react';
import { Communicado, AuditLogEntry, Tenant } from '../types';
import {
  History,
  ShieldCheck,
  Download,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileSpreadsheet,
  FileCode,
  AlertTriangle,
  Send,
  Layers,
} from 'lucide-react';

interface HistoryAuditViewProps {
  communicados: Communicado[];
  auditLogs: AuditLogEntry[];
  currentTenant: Tenant;
  onResendCommunicado: (comm: Communicado) => void;
  onDuplicateCommunicado: (comm: Communicado) => void;
}

export const HistoryAuditView: React.FC<HistoryAuditViewProps> = ({
  communicados,
  auditLogs,
  currentTenant,
  onResendCommunicado,
  onDuplicateCommunicado,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'audit'>('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayloadComm, setSelectedPayloadComm] = useState<Communicado | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const tenantComms = communicados.filter((c) => c.tenantId === currentTenant.id && c.status === 'ENVIADO');
  const tenantLogs = auditLogs.filter((a) => a.tenantId === currentTenant.id);

  // Export CSV helper
  const exportHistoryCSV = () => {
    const headers = ['ID', 'Titulo', 'Categoria', 'Prioridade', 'Data_Disparo', 'Autor', 'Canais'];
    const rows = tenantComms.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.dispatchedAt || c.createdAt,
      `"${c.author.name}"`,
      `"${c.targetChannelIds.join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `teams-historico-${currentTenant.code.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON helper
  const exportHistoryJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tenantComms, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `teams-historico-${currentTenant.code.toLowerCase()}.json`);
    dlAnchorElem.click();
  };

  const copyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-white">Histórico de Disparos & Auditoria</h2>
          <p className="text-xs text-zinc-400">
            Acompanhe status individual por canal, respostas de webhooks e trilha de conformidade
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportHistoryCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={exportHistoryJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Envios ({tenantComms.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Trilha de Auditoria ({tenantLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Histórico */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-sm">
            {tenantComms.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-sm">
                Nenhum comunicado enviado registrado para esta empresa ainda.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {tenantComms.map((comm) => (
                  <div key={comm.id} className="p-5 hover:bg-zinc-850/40 transition space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ENTREGUE ✅
                          </span>
                          <span className="text-xs font-semibold text-zinc-400">{comm.category}</span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {comm.dispatchedAt ? new Date(comm.dispatchedAt).toLocaleString('pt-BR') : '-'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{comm.title}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Enviado por: {comm.author.name}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedPayloadComm(comm)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Payload</span>
                        </button>
                        <button
                          onClick={() => onResendCommunicado(comm)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reenviar</span>
                        </button>
                      </div>
                    </div>

                    {/* Channel-by-Channel Delivery Breakdown */}
                    <div className="pt-2 border-t border-zinc-850">
                      <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                        Status de Entrega por Canal:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {comm.channelDispatches && comm.channelDispatches.length > 0 ? (
                          comm.channelDispatches.map((cd, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                            >
                              <div className="truncate pr-1">
                                <span className="font-semibold text-zinc-200 block truncate">
                                  {cd.channelName}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {cd.latencyMs ? `${cd.latencyMs}ms` : 'HTTP 200'}
                                </span>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                OK 200
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between col-span-2">
                            <span>{comm.targetChannelIds.length} canais sincronizados</span>
                            <span className="text-emerald-400 font-mono text-[11px]">200 OK</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Trilha de Auditoria */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Registro imutável de ações corporativas (Retenção: 12 meses)</span>
            <span>{tenantLogs.length} eventos registrados</span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {tenantLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-zinc-850/50 transition flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-zinc-800 text-zinc-300">
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-white">{log.userName}</span>
                    <span className="text-[10px] text-zinc-500">({log.userRole})</span>
                    <span className="text-[10px] text-zinc-500">•</span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{log.details}</p>

                  <div className="text-[10px] text-zinc-500 font-mono mt-1">
                    IP: {log.ip} {log.entityId ? `• ID Entidade: ${log.entityId}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: View Payload */}
      {selectedPayloadComm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Payload HTTP Enviado</h3>
                <p className="text-xs text-zinc-400">Conteúdo exato entregue aos endpoints de Webhook</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyPayload(selectedPayloadComm)}
                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedPayload ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={() => setSelectedPayloadComm(null)}
                  className="text-zinc-400 hover:text-white text-xs font-bold"
                >
                  ✕ Fechar
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-zinc-950">
              <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap select-all">
                {JSON.stringify(selectedPayloadComm, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
