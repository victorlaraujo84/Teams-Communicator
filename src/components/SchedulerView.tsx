import React, { useState } from 'react';
import { Communicado, Tenant } from '../types';
import {
  Clock,
  Calendar,
  Repeat,
  AlertTriangle,
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  Send,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

interface SchedulerViewProps {
  communicados: Communicado[];
  currentTenant: Tenant;
  onDispatchNow: (comm: Communicado) => void;
  onCancelSchedule: (commId: string) => void;
  onNewCommunicado: () => void;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  communicados,
  currentTenant,
  onDispatchNow,
  onCancelSchedule,
  onNewCommunicado,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'once' | 'recurring'>('all');

  const tenantComms = communicados.filter((c) => c.tenantId === currentTenant.id);
  const scheduledComms = tenantComms.filter((c) => c.status === 'AGENDADO');

  const filtered = scheduledComms.filter((c) => {
    if (filterType === 'once') return c.schedule.type === 'once';
    if (filterType === 'recurring') return c.schedule.type === 'recurring';
    return true;
  });

  // Simulated active retry queue items
  const retryQueueSimulated = [
    {
      id: 'retry-1',
      title: 'Aviso de Reinicialização de Roteador Filial RJ',
      channel: '#ti-infra-rj',
      attempt: '2 de 3',
      nextRetryIn: '4m 12s',
      lastError: 'HTTP 504 Gateway Timeout (Teams Webhook)',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Central de Agendamentos & Fila Ativa</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {scheduledComms.length} na fila
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Controle de disparos programados, rotinas recorrentes e retentativas automáticas
          </p>
        </div>

        <button
          onClick={onNewCommunicado}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Agendar Novo</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Todos ({scheduledComms.length})
        </button>
        <button
          onClick={() => setFilterType('once')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'once' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Disparos Únicos
        </button>
        <button
          onClick={() => setFilterType('recurring')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'recurring' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Recorrentes
        </button>
      </div>

      {/* Queue items */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800">
            <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">Nenhum envio agendado no momento</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Agende comunicados futuros ou com recorrência semanal/mensal para equipes do Teams.
            </p>
          </div>
        ) : (
          filtered.map((comm) => {
            const isRecurring = comm.schedule.type === 'recurring';
            return (
              <div
                key={comm.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isRecurring
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isRecurring ? <Repeat className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                      {isRecurring ? 'Recorrente' : 'Disparo Programado'}
                    </span>

                    <span className="text-xs text-zinc-400 font-medium">
                      {isRecurring
                        ? `Frequência: ${comm.schedule.recurrence?.frequency} às ${comm.schedule.recurrence?.time}`
                        : `Data: ${
                            comm.schedule.scheduledAt
                              ? new Date(comm.schedule.scheduledAt).toLocaleString('pt-BR')
                              : 'Em breve'
                          }`}
                    </span>

                    <span className="text-xs text-zinc-500 font-mono">
                      ({comm.schedule.timezone || currentTenant.defaultTimezone})
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {comm.title}
                  </h3>

                  <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1">
                    <span>{comm.targetChannelIds.length} canais vinculados</span>
                    <span>•</span>
                    <span>Criado por {comm.author.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onDispatchNow(comm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Imediatamente</span>
                  </button>

                  <button
                    onClick={() => onCancelSchedule(comm.id)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 transition"
                    title="Cancelar Agendamento"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Exponential Backoff & Retry Queue Explanation */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Fila de Retentativa com Backoff Exponencial</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          O Teams Communicator gerencia falhas de rede em webhooks automaticamente com 3 tentativas progressivas:
          <span className="text-zinc-200 font-semibold"> 1ª tentativa em 1 min</span> → 
          <span className="text-zinc-200 font-semibold"> 2ª tentativa em 5 min</span> → 
          <span className="text-zinc-200 font-semibold"> 3ª tentativa em 15 min</span>. Caso persista a falha, o administrador é notificado na trilha de auditoria.
        </p>

        {retryQueueSimulated.length > 0 && (
          <div className="mt-3 p-3.5 rounded-xl bg-zinc-950/80 border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Retentativa em Andamento: {retryQueueSimulated[0].title}</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Erro: {retryQueueSimulated[0].lastError}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                Tentativa {retryQueueSimulated[0].attempt} (Próxima em {retryQueueSimulated[0].nextRetryIn})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
