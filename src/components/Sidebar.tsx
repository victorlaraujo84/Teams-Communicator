import React from 'react';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { User } from '../types';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  Radio,
  Workflow,
  History,
  Settings,
  X,
  Sparkles,
  ShieldAlert,
  Bookmark,
  RotateCcw,
  Users,
  Camera,
  Shield,
  Webhook,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'editor'
  | 'communicados'
  | 'templates'
  | 'scheduler'
  | 'channels'
  | 'inbound_webhook'
  | 'team'
  | 'power_automate'
  | 'history'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lang: SupportedLanguage;
  pendingApprovalsCount: number;
  scheduledCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onNewCommunicado: () => void;
  onResetApp: () => void;
  currentUser?: User;
  onOpenEditProfile?: () => void;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  lang,
  pendingApprovalsCount,
  scheduledCount,
  isOpenMobile,
  onCloseMobile,
  onNewCommunicado,
  onResetApp,
  currentUser,
  onOpenEditProfile,
  onOpenAuth,
}) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: t.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'communicados' as ActiveTab,
      label: t.communicados,
      icon: <FileText className="w-4 h-4" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'templates' as ActiveTab,
      label: t.templateGallery,
      icon: <Bookmark className="w-4 h-4" />,
    },
    {
      id: 'scheduler' as ActiveTab,
      label: t.scheduler,
      icon: <Clock className="w-4 h-4" />,
      badge: scheduledCount > 0 ? scheduledCount : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      id: 'channels' as ActiveTab,
      label: t.channels,
      icon: <Radio className="w-4 h-4" />,
    },
    {
      id: 'inbound_webhook' as ActiveTab,
      label: 'Gateway / Inbound API',
      icon: <Webhook className="w-4 h-4 text-indigo-400" />,
      badge: 'NOVO',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'team' as ActiveTab,
      label: t.team,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'power_automate' as ActiveTab,
      label: t.powerAutomateHub,
      icon: <Workflow className="w-4 h-4" />,
    },
    {
      id: 'history' as ActiveTab,
      label: t.historyAudit,
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'settings' as ActiveTab,
      label: t.settings,
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-850 p-4 text-zinc-300">
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between pb-3 mb-2 border-b border-zinc-800">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Navegação</span>
        <button onClick={onCloseMobile} className="p-1 rounded-lg text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current User Profile Box */}
      {currentUser && (
        <div className="mb-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {currentUser.department}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              {currentUser.role}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-zinc-800/80">
            {onOpenEditProfile && (
              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenEditProfile();
                }}
                className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition"
                title="Editar Nome, Foto e Imagem de Perfil"
              >
                <Camera className="w-3 h-3 text-indigo-400" />
                <span>Editar Foto</span>
              </button>
            )}
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenAuth();
                }}
                className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition"
                title="Criar Nova Conta como ADMIN ou Alternar"
              >
                <Shield className="w-3 h-3 text-purple-400" />
                <span>Conta ADMIN</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        onClick={() => {
          onNewCommunicado();
          onCloseMobile();
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5B5FC7] to-indigo-600 hover:from-[#6E72D6] hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mb-4"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{t.newCommunicado}</span>
      </button>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#5B5FC7]/20 text-white border border-[#5B5FC7]/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-[#7B83EB]' : 'text-zinc-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Callout card */}
      <div className="mt-auto pt-3 border-t border-zinc-850">
        <div className="p-3 rounded-xl bg-gradient-to-b from-indigo-950/40 to-zinc-900/60 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assistente IA Ativo</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-snug">
            Crie comunicados com formatação Adaptive Card, tons corporativos e revisão instantânea.
          </p>
        </div>

        {/* Reset / Zerar App Button */}
        <button
          onClick={() => {
            onCloseMobile();
            onResetApp();
          }}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold transition"
          title="Zerar dados e reiniciar o aplicativo do zero"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Zerar App (Começar do Zero)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-53px)] sticky top-[53px] shrink-0">
        {content}
      </aside>

      {/* Mobile drawer backdrop */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
