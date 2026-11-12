import React, { useState } from 'react';
import { User, UserRole, Tenant, Channel } from '../types';
import { CORPORATE_AVATAR_PRESETS } from './EditProfileModal';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Edit3,
  Eye,
  Mail,
  Building2,
  Trash2,
  Copy,
  Check,
  Search,
  ExternalLink,
  X,
  Share2,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';

interface TeamManagementViewProps {
  users: User[];
  currentUser: User;
  currentTenant: Tenant;
  channels: Channel[];
  onInviteUser: (newUser: User) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onUpdateUser?: (updatedUser: User) => void;
  onRemoveUser: (userId: string) => void;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  users,
  currentUser,
  currentTenant,
  channels,
  onInviteUser,
  onUpdateUserRole,
  onUpdateUser,
  onRemoveUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [copiedLinkUserId, setCopiedLinkUserId] = useState<string | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('Comunicação Interna');
  const [inviteRole, setInviteRole] = useState<UserRole>('EDITOR');
  const [inviteAvatar, setInviteAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );
  const [inviteSelectedChannels, setInviteSelectedChannels] = useState<string[]>(
    channels.map((c) => c.id)
  );

  const tenantUsers = users.filter((u) => u.tenantId === currentTenant.id);

  // Stats
  const adminCount = tenantUsers.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;
  const editorCount = tenantUsers.filter((u) => u.role === 'EDITOR').length;
  const viewerCount = tenantUsers.filter((u) => u.role === 'VIEWER').length;

  const filteredUsers = tenantUsers.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchDept = u.department?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDept) return false;
    }
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    return true;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          label: 'Super Admin (Criador)',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
        };
      case 'ADMIN':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          label: 'Admin (Gestor)',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case 'EDITOR':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          label: 'Editor (Criador de Cards)',
          icon: <Edit3 className="w-3.5 h-3.5" />,
        };
      case 'VIEWER':
      default:
        return {
          bg: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
          label: 'Visualizador (Leitor)',
          icon: <Eye className="w-3.5 h-3.5" />,
        };
    }
  };

  const handleCopyInviteLink = (user: User) => {
    const inviteUrl = `${window.location.origin}?inviteToken=${encodeURIComponent(user.email)}&tenant=${currentTenant.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLinkUserId(user.id);
    setTimeout(() => setCopiedLinkUserId(null), 2500);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      avatar: inviteAvatar.trim(),
      role: inviteRole,
      department: inviteDepartment,
      tenantId: currentTenant.id,
      status: 'pending_invite',
      joinedAt: new Date().toISOString(),
      invitedBy: currentUser.name,
      allowedChannelIds: inviteSelectedChannels,
    };

    onInviteUser(newUser);
    setIsInviteModalOpen(false);

    // Reset Form
    setInviteName('');
    setInviteEmail('');
    setInviteRole('EDITOR');
  };

  const toggleInviteChannel = (channelId: string) => {
    if (inviteSelectedChannels.includes(channelId)) {
      setInviteSelectedChannels(inviteSelectedChannels.filter((id) => id !== channelId));
    } else {
      setInviteSelectedChannels([...inviteSelectedChannels, channelId]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Membros da Equipe & Delegação de Perfis</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {tenantUsers.length} membros
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Como Administrador, convide colaboradores da empresa e atribua papéis com níveis de permissão específicos para o Microsoft Teams.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5FC7] to-indigo-600 hover:from-[#6E72D6] hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Convidar Colaborador</span>
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-blue-500/20 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Perfil ADMIN ({adminCount})</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Acesso total: gerencia webhooks, aprova comunicados pendentes, convida membros e delega papéis.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/20 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Edit3 className="w-4 h-4" />
            <span>Perfil EDITOR ({editorCount})</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Cria cards adaptativos, agenda disparos e submete para aprovação de administradores.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/40 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
            <Eye className="w-4 h-4" />
            <span>Perfil VIEWER ({viewerCount})</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Apenas consulta: acompanha métricas do dashboard, histórico de disparos e auditoria.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar membro por nome, e-mail ou departamento..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">Todos os Perfis</option>
          <option value="ADMIN">🛡️ Administradores</option>
          <option value="EDITOR">✍️ Editores</option>
          <option value="VIEWER">👁️ Visualizadores</option>
        </select>

        {(roleFilter !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('ALL');
            }}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Membro</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Perfil Delegado (Teams)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredUsers.map((user) => {
                const roleMeta = getRoleBadge(user.role);
                const isCurrent = user.id === currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-zinc-850/50 transition">
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white truncate">{user.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300">
                                Você
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-400 block truncate">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-zinc-300 font-medium">{user.department}</td>

                    {/* Role selector dropdown */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => onUpdateUserRole(user.id, e.target.value as UserRole)}
                          disabled={user.role === 'SUPER_ADMIN'}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none focus:border-indigo-500 transition cursor-pointer ${roleMeta.bg}`}
                        >
                          <option value="ADMIN">🛡️ ADMIN (Gestor)</option>
                          <option value="EDITOR">✍️ EDITOR (Criação)</option>
                          <option value="VIEWER">👁️ VIEWER (Consulta)</option>
                        </select>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'pending_invite'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {user.status === 'pending_invite' ? (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Convite Pendente</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Ativo</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-300 text-xs font-medium transition"
                          title="Editar perfil e foto do membro"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>

                        <button
                          onClick={() => handleCopyInviteLink(user)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
                          title="Copiar link de convite"
                        >
                          {copiedLinkUserId === user.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {copiedLinkUserId === user.id ? 'Copiado!' : 'Link'}
                          </span>
                        </button>

                        {!isCurrent && user.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => onRemoveUser(user.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
                            title="Remover acesso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Convidar Colaborador & Delegar Perfil</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
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
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Ex: carlos.oliveira@empresa.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Departamento:
                  </label>
                  <select
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
                  >
                    <option value="Comunicação Interna">Comunicação Interna</option>
                    <option value="Recursos Humanos">Recursos Humanos (RH)</option>
                    <option value="TI & Infraestrutura">TI & Infraestrutura</option>
                    <option value="Segurança da Informação">Segurança (CISO)</option>
                    <option value="Operações & Negócios">Operações & Negócios</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Diretoria & Executivo">Diretoria & Executivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Perfil Delegado no Teams:
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white font-semibold"
                  >
                    <option value="EDITOR">✍️ EDITOR (Criação de Cards)</option>
                    <option value="ADMIN">🛡️ ADMIN (Gestão Total)</option>
                    <option value="VIEWER">👁️ VIEWER (Somente Leitura)</option>
                  </select>
                </div>
              </div>

              {/* Avatar Selection for Invited Member */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Foto de Perfil / Avatar do Colaborador:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CORPORATE_AVATAR_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setInviteAvatar(preset.url)}
                      className={`relative w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 transition ${
                        inviteAvatar === preset.url
                          ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105'
                          : 'border-zinc-700 opacity-60 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Authorization */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Canais do Teams com Permissão de Postagem:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  {channels.map((ch) => {
                    const isChecked = inviteSelectedChannels.includes(ch.id);
                    return (
                      <label
                        key={ch.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs cursor-pointer hover:border-zinc-700"
                      >
                        <span className="font-semibold text-zinc-200 truncate">{ch.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleInviteChannel(ch.id)}
                          className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-0"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enviar Convite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingUser && (
        <EditMemberModal
          isOpen={true}
          user={editingUser}
          channels={channels}
          onClose={() => setEditingUser(null)}
          onSave={(updated) => {
            if (onUpdateUser) {
              onUpdateUser(updated);
            } else {
              onUpdateUserRole(updated.id, updated.role);
            }
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

interface EditMemberModalProps {
  isOpen: boolean;
  user: User;
  channels: Channel[];
  onClose: () => void;
  onSave: (updated: User) => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  user,
  channels,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [department, setDepartment] = useState(user.department || '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [allowedChannels, setAllowedChannels] = useState<string[]>(
    user.allowedChannelIds || channels.map((c) => c.id)
  );

  if (!isOpen) return null;

  const toggleChannel = (chId: string) => {
    if (allowedChannels.includes(chId)) {
      setAllowedChannels(allowedChannels.filter((id) => id !== chId));
    } else {
      setAllowedChannels([...allowedChannels, chId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...user,
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role,
      avatar: avatar.trim(),
      allowedChannelIds: allowedChannels,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Editar Perfil & Delegação Teams</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Avatar Row */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Foto de Perfil / Imagem no Teams:
            </label>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                alt={name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/50"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="URL da foto..."
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] text-zinc-500">Presets:</span>
              {CORPORATE_AVATAR_PRESETS.slice(0, 7).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAvatar(p.url)}
                  className={`relative w-7 h-7 rounded-full overflow-hidden border transition ${
                    avatar === p.url ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-zinc-700'
                  }`}
                  title={p.label}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Nome do Membro:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              E-mail:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Departamento:
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Perfil Delegado no Teams:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white font-semibold"
              >
                <option value="ADMIN">🛡️ ADMIN (Gestor)</option>
                <option value="EDITOR">✍️ EDITOR (Criação)</option>
                <option value="VIEWER">👁️ VIEWER (Consulta)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Canais do Teams Autorizados:
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-zinc-950 border border-zinc-800">
              {channels.map((ch) => {
                const isChecked = allowedChannels.includes(ch.id);
                return (
                  <label
                    key={ch.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs cursor-pointer hover:border-zinc-700"
                  >
                    <span className="font-semibold text-zinc-200 truncate">{ch.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChannel(ch.id)}
                      className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-0"
                    />
                  </label>
                );
              })}
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
