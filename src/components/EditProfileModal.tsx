import React, { useState } from 'react';
import { User, Tenant } from '../types';
import {
  User as UserIcon,
  Camera,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  Shield,
  Building2,
  Mail,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentTenant: Tenant;
  onUpdateUser: (updatedUser: User) => void;
}

export const CORPORATE_AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    label: 'Executivo 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Executiva 2',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-3',
    label: 'Gestor 3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Especialista 4',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-5',
    label: 'Líder Técnico 5',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-6',
    label: 'Diretora 6',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-7',
    label: 'Coordenador 7',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-8',
    label: 'Analista 8',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-9',
    label: 'Engenheiro 9',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-10',
    label: 'Supervisora 10',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-11',
    label: 'Líder Ágil 11',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'avatar-12',
    label: 'Bot Corporativo',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentTenant,
  onUpdateUser,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [department, setDepartment] = useState(currentUser.department);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [avatarTab, setAvatarTab] = useState<'presets' | 'url' | 'upload'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: User = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      avatar: avatar.trim(),
    };

    onUpdateUser(updated);
    onClose();
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Editar Meu Perfil & Imagem</h3>
              <p className="text-xs text-zinc-400">Personalize seu avatar, nome e dados para o Teams</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Avatar Section & Live Preview */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Foto de Perfil / Imagem de Exibição</span>
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover Foto (Usar Iniciais)</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-500/50 shadow-md bg-zinc-800"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-[#5B5FC7] flex items-center justify-center text-white text-xl font-bold shadow-md ring-2 ring-indigo-500/30">
                    {getInitials(name || 'Admin')}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 p-1 rounded-full bg-zinc-900 border border-zinc-700 text-indigo-400">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <p className="text-xs font-semibold text-zinc-200">
                  {avatar ? 'Foto personalizada ativa' : 'Modo sem foto (Iniciais corporativas)'}
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Esta foto será usada no seu perfil e pode ser incluída como assinatura do autor nos comunicados do Microsoft Teams.
                </p>
              </div>
            </div>

            {/* Avatar Selection Tabs */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="flex border-b border-zinc-800 bg-zinc-900/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAvatarTab('presets')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    avatarTab === 'presets'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Avatares Prontos
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab('upload')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    avatarTab === 'upload'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Upload do Computador
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab('url')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    avatarTab === 'url'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Colar URL
                </button>
              </div>

              {/* Presets Grid */}
              {avatarTab === 'presets' && (
                <div className="grid grid-cols-6 gap-2 pt-1 max-h-40 overflow-y-auto p-1">
                  {CORPORATE_AVATAR_PRESETS.map((p) => {
                    const isSelected = avatar === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAvatar(p.url)}
                        className={`relative rounded-full aspect-square overflow-hidden border-2 transition transform hover:scale-105 ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                            : 'border-zinc-800 hover:border-zinc-600'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Upload Tab */}
              {avatarTab === 'upload' && (
                <div className="space-y-2 pt-1">
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-zinc-700 hover:border-indigo-500/80 bg-zinc-900/50 cursor-pointer transition">
                    <Upload className="w-6 h-6 text-indigo-400 mb-1.5" />
                    <span className="text-xs font-bold text-zinc-200">
                      Clique para escolher uma imagem do seu dispositivo
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">
                      JPG, PNG, GIF ou WEBP (máx. 2MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadError && (
                    <p className="text-xs text-rose-400">{uploadError}</p>
                  )}
                </div>
              )}

              {/* URL Tab */}
              {avatarTab === 'url' && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://exemplo.com/sua-foto.jpg"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome Completo:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Departamento:
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Recursos Humanos"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Papel no Teams:
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-white">{currentUser.role}</span>
                  <span className="text-[10px] text-zinc-500">
                    {currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN'
                      ? '(Gestão Total)'
                      : currentUser.role === 'EDITOR'
                      ? '(Criação de Cards)'
                      : '(Visualizador)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
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
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
