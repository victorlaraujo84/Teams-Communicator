import React from 'react';
import { RotateCcw, AlertTriangle, Sparkles, X, Trash2, CheckCircle2 } from 'lucide-react';

interface ResetAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResetClean: () => void;
  onConfirmResetDefault: () => void;
}

export const ResetAppModal: React.FC<ResetAppModalProps> = ({
  isOpen,
  onClose,
  onConfirmResetClean,
  onConfirmResetDefault,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Zerar o Teams Communicator</h3>
              <p className="text-xs text-zinc-400">Escolha como deseja reiniciar o aplicativo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Você está prestes a redefinir o estado do aplicativo. Escolha uma das opções abaixo:
          </p>

          <div className="space-y-3">
            {/* Option 1: Clean slate */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-rose-500/30 hover:border-rose-500/60 transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  1. Começar 100% do Zero (Ambiente Limpo)
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Limpo
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Apaga todos os comunicados, rascunhos, fila de agendamentos e histórico de disparos, deixando o painel completamente novo e zerado.
              </p>
              <button
                type="button"
                onClick={() => {
                  onConfirmResetClean();
                  onClose();
                }}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/20"
              >
                Confirmar e Começar Limpo
              </button>
            </div>

            {/* Option 2: Reset to default sample data */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  2. Restaurar Dados Padrão (Modo Demo)
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Padrão
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Restaura os canais iniciais, templates oficiais e comunicados de demonstração prontos para uso corporativo.
              </p>
              <button
                type="button"
                onClick={() => {
                  onConfirmResetDefault();
                  onClose();
                }}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
              >
                Restaurar Demonstração Inicial
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
