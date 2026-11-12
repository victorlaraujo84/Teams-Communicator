import React, { useState, useEffect } from 'react';
import { Tenant, User, UserRole } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import {
  Building2,
  ChevronDown,
  UserCheck,
  Globe,
  Sun,
  Moon,
  Clock,
  Menu,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentTenant: Tenant;
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  lang: SupportedLanguage;
  onToggleLang: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
  onOpenAuthModal?: () => void;
  onOpenEditProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTenant,
  tenants,
  onSelectTenant,
  currentUser,
  users,
  onSelectUser,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onToggleMobileMenu,
  onOpenAuthModal,
  onOpenEditProfile,
}) => {
  const t = TRANSLATIONS[lang];
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'ADMIN':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'EDITOR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'VIEWER':
      default:
        return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 text-zinc-100">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B5FC7] via-[#6E72D6] to-indigo-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-[#5B5FC7]/25 border border-indigo-400/30">
            <span className="text-sm tracking-tighter">TC</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">
                Teams Communicator
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase bg-[#5B5FC7]/20 text-[#7B83EB] border border-[#5B5FC7]/40">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
              MS Teams & Power Automate Hub
            </p>
          </div>
        </div>
      </div>

      {/* Center: Tenant Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowTenantMenu(!showTenantMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 transition text-xs font-medium text-zinc-200"
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="max-w-[120px] sm:max-w-[180px] truncate">{currentTenant.name}</span>
          <span className="hidden md:inline px-1 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
            {currentTenant.code}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {showTenantMenu && (
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150">
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {t.tenant} (Multi-Tenant)
            </div>
            {tenants.map((ten) => (
              <button
                key={ten.id}
                onClick={() => {
                  onSelectTenant(ten);
                  setShowTenantMenu(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition ${
                  ten.id === currentTenant.id
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <div className="truncate">
                  <div className="font-medium text-white">{ten.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{ten.code} • {ten.defaultTimezone}</div>
                </div>
                {ten.id === currentTenant.id && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 ml-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Clock, Lang, User & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Clock & Timezone */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-800/80 font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentTime}</span>
          <span className="text-[10px] text-zinc-500">BRT (UTC-3)</span>
        </div>

        {/* Language switch */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition"
          title="Alternar Idioma (PT-BR / EN)"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">{lang === 'pt-BR' ? 'PT' : 'EN'}</span>
        </button>

        {/* User Profile & Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center ring-1 ring-zinc-700">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-white leading-none">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(
                    currentUser.role
                  )}`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
              <div className="px-2 py-1.5 border-b border-zinc-800 mb-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">{currentUser.email}</div>
                <div className="text-[10px] text-indigo-400 mt-0.5">{currentUser.department}</div>

                {onOpenEditProfile && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenEditProfile();
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition border border-zinc-700/80"
                  >
                    <span>✏️ Editar Meu Perfil & Foto</span>
                  </button>
                )}
              </div>

              <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                {t.switchRole}:
              </div>

              {users.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => {
                    onSelectUser(usr);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs text-left transition ${
                    usr.id === currentUser.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <img
                    src={usr.avatar}
                    alt={usr.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{usr.name}</div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded border ${getRoleBadge(
                          usr.role
                        )}`}
                      >
                        {usr.role}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {onOpenAuthModal && (
                <div className="pt-2 mt-2 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Criar Minha Conta (ADMIN)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
