import React, { useState } from 'react';
import { Communicado, User, Channel, Tenant } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { TeamsCardPreview } from './TeamsCardPreview';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface CommunicadosListViewProps {
  communicados: Communicado[];
  channels: Channel[];
  currentUser: User;
  currentTenant: Tenant;
  lang: SupportedLanguage;
  onNewCommunicado: () => void;
  onEditCommunicado: (comm: Communicado) => void;
  onDuplicateCommunicado: (comm: Communicado) => void;
  onDeleteCommunicado: (commId: string) => void;
  onDispatchNow: (comm: Communicado) => void;
  onOpenApproval: (comm: Communicado) => void;
}

export const CommunicadosListView: React.FC<CommunicadosListViewProps> = ({
  communicados,
  channels,
  currentUser,
  currentTenant,
  lang,
  onNewCommunicado,
  onEditCommunicado,
  onDuplicateCommunicado,
  onDeleteCommunicado,
  onDispatchNow,
  onOpenApproval,
}) => {
  const t = TRANSLATIONS[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Preview modal
  const [previewingComm, setPreviewingComm] = useState<Communicado | null>(null);

  // Filter logic
  const filtered = communicados.filter((c) => {
    if (c.tenantId !== currentTenant.id) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchBody = c.body.toLowerCase().includes(q);
      const matchAuthor = c.author.name.toLowerCase().includes(q);
      if (!matchTitle && !matchBody && !matchAuthor) return false;
    }

    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (selectedPriority !== 'ALL' && c.priority !== selectedPriority) return false;

    return true;
  });

  const getStatusBadge = (status: Communicado['status']) => {
    switch (status) {
      case 'ENVIADO':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'AGENDADO':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'AGUARDANDO_APROVACAO':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'RASCUNHO':
        return 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40';
      case 'FALHA':
      case 'FALHA_PARCIAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'CANCELADO':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300';
    }
  };

  const canApprove = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-white">Gerenciador de Comunicados</h2>
          <p className="text-xs text-zinc-400">
            Histórico de rascunhos, comunicados aprovados, fila e envios realizados
          </p>
        </div>

        <button
          onClick={onNewCommunicado}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5FC7] to-indigo-600 hover:from-[#6E72D6] hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Comunicado</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, conteúdo ou autor..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">Todos os Status</option>
          <option value="AGUARDANDO_APROVACAO">⏳ Aguardando Aprovação</option>
          <option value="AGENDADO">⏰ Agendado</option>
          <option value="ENVIADO">✅ Enviado</option>
          <option value="RASCUNHO">📝 Rascunho</option>
          <option value="FALHA">❌ Falha</option>
        </select>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">Todas as Prioridades</option>
          <option value="info">ℹ️ Informativo</option>
          <option value="warning">⚠️ Atenção</option>
          <option value="critical">🚨 Urgente / Crítico</option>
        </select>

        {/* Clear filter */}
        {(selectedStatus !== 'ALL' || selectedPriority !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('ALL');
              setSelectedPriority('ALL');
            }}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Communicados List / Table */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-400 text-sm">Nenhum comunicado encontrado com os filtros aplicados.</p>
            <button
              onClick={onNewCommunicado}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Criar Primeiro Comunicado
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {filtered.map((comm) => (
              <div
                key={comm.id}
                className="p-4 sm:p-5 hover:bg-zinc-850/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadge(
                        comm.status
                      )}`}
                    >
                      {comm.status.replace('_', ' ')}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        comm.priority === 'critical'
                          ? 'bg-rose-500/20 text-rose-300'
                          : comm.priority === 'warning'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {comm.priority}
                    </span>

                    <span className="text-xs text-zinc-400 font-medium">{comm.category}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug truncate">
                    {comm.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2">{comm.body}</p>

                  <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
                    <span>Autor: <strong className="text-zinc-300">{comm.author.name}</strong></span>
                    <span>•</span>
                    <span>{comm.targetChannelIds.length} canais vinculados</span>
                    <span>•</span>
                    <span>Criado em {new Date(comm.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center flex-wrap">
                  {/* Approval shortcut */}
                  {comm.status === 'AGUARDANDO_APROVACAO' && canApprove && (
                    <button
                      onClick={() => onOpenApproval(comm)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Revisar & Aprovar</span>
                    </button>
                  )}

                  {/* Dispatch Now shortcut */}
                  {(comm.status === 'APROVADO' || comm.status === 'AGENDADO' || comm.status === 'RASCUNHO') && (
                    <button
                      onClick={() => onDispatchNow(comm)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1"
                      title="Disparar Agora no Teams"
                    >
                      <Send className="w-3 h-3" />
                      <span>Disparar</span>
                    </button>
                  )}

                  {/* View Preview */}
                  <button
                    onClick={() => setPreviewingComm(comm)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="Visualizar Preview do Teams"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEditCommunicado(comm)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="Editar Comunicado"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => onDuplicateCommunicado(comm)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteCommunicado(comm.id)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-950/50 hover:text-rose-400 text-zinc-400 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewingComm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Visualização de Card no Teams</span>
              <button
                onClick={() => setPreviewingComm(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕ Fechar
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <TeamsCardPreview communicado={previewingComm} tenantName={currentTenant.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
