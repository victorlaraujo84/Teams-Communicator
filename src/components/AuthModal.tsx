import React, { useState } from 'react';
import { User, Tenant } from '../types';
import { UserPlus, LogIn, Shield, Building2, Check, X, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentTenant: Tenant;
  onRegisterAdmin: (user: User, tenantName?: string) => void;
  onSwitchUser: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentTenant,
  onRegisterAdmin,
  onSwitchUser,
}) => {
  const [tab, setTab] = useState<'register' | 'switch'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState(currentTenant.name);
  const [department, setDepartment] = useState('Liderança / Diretoria');
  const [avatar, setAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  ];

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newAdminUser: User = {
      id: `user-admin-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: avatar.trim(),
      role: 'ADMIN',
      department,
      tenantId: currentTenant.id,
      status: 'active',
      joinedAt: new Date().toISOString(),
    };

    onRegisterAdmin(newAdminUser, companyName.trim() !== currentTenant.name ? companyName.trim() : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Conta & Identidade Corporativa</h3>
              <p className="text-xs text-zinc-400">Criar conta como ADMIN ou alternar usuário</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1">
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              tab === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Criar Conta (ADMIN)
          </button>
          <button
            onClick={() => setTab('switch')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              tab === 'switch' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Entrar / Alternar Usuário
          </button>
        </div>

        {/* Tab 1: Register as Admin */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
              <span>
                Ao se cadastrar, você receberá permissão de <strong>ADMINISTRADOR</strong> e poderá delegar papéis a novos colaboradores.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Seu Nome Completo:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ana Clara Martins"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                E-mail Corporativo:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: ana.martins@empresa.com"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome da Empresa / Organização:
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Matriz Corporativa"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
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
                <option value="Liderança / Diretoria">Liderança / Diretoria</option>
                <option value="Comunicação Interna">Comunicação Interna</option>
                <option value="Recursos Humanos">Recursos Humanos (RH)</option>
                <option value="TI & Infraestrutura">TI & Infraestrutura</option>
                <option value="Operações">Operações</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Escolha sua Foto de Perfil / Avatar:
              </label>
              <div className="flex items-center gap-2">
                {sampleAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition ${
                      avatar === url
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105'
                        : 'border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta & Entrar como ADMIN</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Switch User */}
        {tab === 'switch' && (
          <div className="p-6 space-y-3">
            <p className="text-xs text-zinc-400">
              Selecione qualquer usuário existente para testar os diferentes perfis e visões:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => {
                    onSwitchUser(usr);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={usr.avatar}
                      alt={usr.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{usr.name}</div>
                      <div className="text-[11px] text-zinc-500">{usr.email}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      usr.role === 'SUPER_ADMIN' || usr.role === 'ADMIN'
                        ? 'bg-blue-500/20 text-blue-300'
                        : usr.role === 'EDITOR'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {usr.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
