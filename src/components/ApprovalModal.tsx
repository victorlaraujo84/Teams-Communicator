import React, { useState } from 'react';
import { Communicado, User } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Send, X, ShieldAlert } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  communicado: Communicado | null;
  currentUser: User;
  onClose: () => void;
  onApprove: (commId: string, comments?: string) => void;
  onReject: (commId: string, reason: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  communicado,
  currentUser,
  onClose,
  onApprove,
  onReject,
}) => {
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  if (!isOpen || !communicado) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'approve') {
      onApprove(communicado.id, comments);
    } else {
      if (!comments.trim()) return;
      onReject(communicado.id, comments);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Fluxo de Aprovação de Comunicado</h3>
              <p className="text-xs text-zinc-400">Revisão administrativa necessária antes do disparo no Teams</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Autor do Comunicado:</span>
              <span className="font-semibold text-zinc-200">{communicado.author.name}</span>
            </div>
            <div className="text-sm font-bold text-white">{communicado.title}</div>
            <div className="text-xs text-zinc-400 line-clamp-3 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
              {communicado.body}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">Decisão do Administrador:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActionType('approve')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                  actionType === 'approve'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprovar Comunicado
              </button>
              <button
                type="button"
                onClick={() => setActionType('reject')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                  actionType === 'reject'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-sm'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Rejeitar / Devolver
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-300">
              {actionType === 'approve' ? 'Comentários ou Observações (Opcional):' : 'Motivo da Rejeição (Obrigatório):'}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required={actionType === 'reject'}
              rows={3}
              placeholder={
                actionType === 'approve'
                  ? 'Ex: Texto revisado e aprovado para disparo corporativo.'
                  : 'Ex: Favor incluir a data limite para inscrição e ajustar a imagem.'
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition shadow-md ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {actionType === 'approve' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {actionType === 'approve' ? 'Confirmar Aprovação' : 'Devolver com Apontamentos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
