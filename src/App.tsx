/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Tenant,
  User,
  UserRole,
  Channel,
  Communicado,
  AuditLogEntry,
  Template,
  Priority,
} from './types';
import {
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_CHANNELS,
  INITIAL_COMMUNICADOS,
  INITIAL_AUDIT_LOGS,
  STORAGE_KEYS,
  loadStoredData,
  saveStoredData,
} from './data/mockData';
import {
  buildTeamsWebhookEnvelope,
  buildPowerAutomatePayload,
  ENTERPRISE_TEMPLATES,
} from './utils/adaptiveCards';
import { SupportedLanguage } from './utils/translations';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CommunicadoEditorView } from './components/CommunicadoEditorView';
import { CommunicadosListView } from './components/CommunicadosListView';
import { TemplateGalleryView } from './components/TemplateGalleryView';
import { SchedulerView } from './components/SchedulerView';
import { ChannelsView } from './components/ChannelsView';
import { TeamManagementView } from './components/TeamManagementView';
import { PowerAutomateHubView } from './components/PowerAutomateHubView';
import { InboundWebhookView } from './components/InboundWebhookView';
import { HistoryAuditView } from './components/HistoryAuditView';
import { SettingsView } from './components/SettingsView';
import { ApprovalModal } from './components/ApprovalModal';
import { ResetAppModal } from './components/ResetAppModal';
import { AuthModal } from './components/AuthModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // State Initialization
  const [tenants, setTenants] = useState<Tenant[]>(() =>
    loadStoredData(STORAGE_KEYS.TENANTS, INITIAL_TENANTS)
  );
  const [currentTenant, setCurrentTenant] = useState<Tenant>(() => {
    const storedId = loadStoredData<string | null>(STORAGE_KEYS.CURRENT_TENANT_ID, null);
    const found = tenants.find((t) => t.id === storedId);
    return found || tenants[0] || INITIAL_TENANTS[0];
  });

  const [users, setUsers] = useState<User[]>(() =>
    loadStoredData(STORAGE_KEYS.USERS, INITIAL_USERS)
  );
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const storedId = loadStoredData<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null);
    const found = users.find((u) => u.id === storedId);
    return found || users[0] || INITIAL_USERS[0];
  });

  const [channels, setChannels] = useState<Channel[]>(() =>
    loadStoredData(STORAGE_KEYS.CHANNELS, INITIAL_CHANNELS)
  );
  const [communicados, setCommunicados] = useState<Communicado[]>(() =>
    loadStoredData(STORAGE_KEYS.COMMUNICADOS, INITIAL_COMMUNICADOS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    loadStoredData(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
  );
  const [templates, setTemplates] = useState<Template[]>(() =>
    loadStoredData(STORAGE_KEYS.TEMPLATES, ENTERPRISE_TEMPLATES)
  );

  const [groqApiKey, setGroqApiKey] = useState<string>(() =>
    loadStoredData(STORAGE_KEYS.GROQ_API_KEY, '')
  );
  const [lang, setLang] = useState<SupportedLanguage>(() =>
    loadStoredData(STORAGE_KEYS.LANGUAGE, 'pt-BR')
  );
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editingCommunicado, setEditingCommunicado] = useState<Communicado | null>(null);
  const [approvalModalComm, setApprovalModalComm] = useState<Communicado | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persist State
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TENANTS, tenants);
  }, [tenants]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.CURRENT_TENANT_ID, currentTenant.id);
  }, [currentTenant]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.CHANNELS, channels);
    // Keep backend in-memory routing table in sync with channels
    fetch('/api/v1/channels/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channels }),
    }).catch(() => {});
  }, [channels]);

  // Sync incoming Inbound Webhooks requiring approval into communicados state
  useEffect(() => {
    const checkIncomingQueue = async () => {
      try {
        const res = await fetch('/api/v1/communicados/incoming/history');
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const pendingItems = json.data.filter((item: any) => item.status === 'AGUARDANDO_APROVACAO');
          if (pendingItems.length > 0) {
            setCommunicados((prev) => {
              let changed = false;
              const next = [...prev];
              for (const item of pendingItems) {
                if (!next.some((c) => c.id === item.id)) {
                  changed = true;
                  const newComm: Communicado = {
                    id: item.id,
                    tenantId: currentTenant.id,
                    title: item.title,
                    body: item.body,
                    summary: item.summary || item.title,
                    category: item.category || 'Geral',
                    priority: (item.priority as Priority) || 'info',
                    showBanner: Boolean(item.adaptiveCard?.body?.some((b: any) => b.type === 'Image')),
                    bannerUrl: item.adaptiveCard?.body?.find((b: any) => b.type === 'Image')?.url,
                    actionButtons: (item.adaptiveCard?.actions || []).map((a: any, idx: number) => ({
                      id: `btn-${idx}`,
                      type: 'Action.OpenUrl',
                      title: a.title,
                      url: a.url,
                    })),
                    mentions: [],
                    targetChannelIds: item.targetChannel?.id ? [item.targetChannel.id] : (channels[0] ? [channels[0].id] : []),
                    status: 'AGUARDANDO_APROVACAO',
                    author: {
                      id: 'gateway-inbound',
                      name: item.senderName || 'Sistema Integrado (Inbound Webhook)',
                      email: 'gateway@teamscommunicator.internal',
                      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
                    },
                    schedule: {
                      type: 'now',
                      timezone: currentTenant.defaultTimezone || 'America/Sao_Paulo',
                    },
                    createdAt: item.receivedAt || new Date().toISOString(),
                    updatedAt: item.receivedAt || new Date().toISOString(),
                  };
                  next.unshift(newComm);
                  addToast('info', 'Novo comunicado via Inbound Webhook', `"${item.title}" requer aprovação corporativa.`);
                }
              }
              return changed ? next : prev;
            });
          }
        }
      } catch {
        // Ignore polling errors
      }
    };

    checkIncomingQueue();
    const interval = setInterval(checkIncomingQueue, 5000);
    return () => clearInterval(interval);
  }, [currentTenant.id, currentTenant.defaultTimezone, channels]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.COMMUNICADOS, communicados);
  }, [communicados]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TEMPLATES, templates);
  }, [templates]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.GROQ_API_KEY, groqApiKey);
  }, [groqApiKey]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LANGUAGE, lang);
  }, [lang]);

  // Log Audit Helper
  const logAudit = (
    action: AuditLogEntry['action'],
    details: string,
    entityId?: string,
    entityType?: AuditLogEntry['entityType']
  ) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      tenantId: currentTenant.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: '187.19.22.104',
      entityId,
      entityType,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Dispatch Communicado Engine (Calls Backend /api/send-communicado)
  const handleDispatchCommunicado = async (comm: Partial<Communicado>) => {
    const targetChannels = channels.filter((c) =>
      comm.targetChannelIds?.includes(c.id)
    );

    if (targetChannels.length === 0) {
      addToast('warning', 'Nenhum canal selecionado', 'Vincule ao menos um canal para disparar o comunicado.');
      return;
    }

    addToast('info', 'Iniciando disparo...', `Transmitindo payload para ${targetChannels.length} canal(is) Teams.`);

    const dispatchResults: Communicado['channelDispatches'] = [];

    for (const channel of targetChannels) {
      try {
        const payload =
          channel.type === 'power_automate'
            ? buildPowerAutomatePayload(comm, currentTenant.name)
            : buildTeamsWebhookEnvelope(comm);

        const response = await fetch('/api/send-communicado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel,
            payload,
          }),
        });

        const data = await response.json();
        dispatchResults.push({
          channelId: channel.id,
          channelName: channel.name,
          channelType: channel.type,
          status: data.success ? 'success' : 'failed',
          statusCode: data.statusCode || 200,
          message: data.responseSummary || 'Entregue com sucesso',
          timestamp: new Date().toISOString(),
          latencyMs: data.durationMs || 150,
        });
      } catch (err: any) {
        dispatchResults.push({
          channelId: channel.id,
          channelName: channel.name,
          channelType: channel.type,
          status: 'failed',
          statusCode: 500,
          message: err.message || 'Falha na conexão',
          timestamp: new Date().toISOString(),
        });
      }
    }

    const allSuccess = dispatchResults.every((d) => d.status === 'success');
    const finalStatus = allSuccess ? 'ENVIADO' : 'FALHA_PARCIAL';

    const updatedComm: Communicado = {
      ...(comm as Communicado),
      status: finalStatus,
      dispatchedAt: new Date().toISOString(),
      channelDispatches: dispatchResults,
      readCountEstimated: Math.floor(Math.random() * 450) + 120,
    };

    setCommunicados((prev) => {
      const exists = prev.some((c) => c.id === updatedComm.id);
      return exists ? prev.map((c) => (c.id === updatedComm.id ? updatedComm : c)) : [updatedComm, ...prev];
    });

    logAudit(
      'DISPARAR',
      `Disparado comunicado "${comm.title}" para ${targetChannels.length} canais (Status: ${finalStatus}).`,
      updatedComm.id,
      'COMMUNICADO'
    );

    if (allSuccess) {
      addToast('success', 'Disparo concluído com sucesso!', `Entregue em todos os ${targetChannels.length} canais configurados.`);
    } else {
      addToast('warning', 'Disparo com falhas parciais', 'Alguns webhooks retornaram erro. Verifique no Histórico.');
    }

    setActiveTab('history');
  };

  // Editor Actions
  const handleSaveDraft = (draft: Partial<Communicado>) => {
    const comm: Communicado = {
      ...(draft as Communicado),
      status: 'RASCUNHO',
      updatedAt: new Date().toISOString(),
    };
    setCommunicados((prev) => {
      const exists = prev.some((c) => c.id === comm.id);
      return exists ? prev.map((c) => (c.id === comm.id ? comm : c)) : [comm, ...prev];
    });
    logAudit('CRIAR', `Rascunho salvo: "${comm.title}".`, comm.id, 'COMMUNICADO');
    addToast('success', 'Rascunho salvo com sucesso', 'Você pode retomá-lo a qualquer momento na lista de comunicados.');
    setActiveTab('communicados');
  };

  const handleSubmitForApproval = (draft: Partial<Communicado>) => {
    const comm: Communicado = {
      ...(draft as Communicado),
      status: 'AGUARDANDO_APROVACAO',
      updatedAt: new Date().toISOString(),
    };
    setCommunicados((prev) => {
      const exists = prev.some((c) => c.id === comm.id);
      return exists ? prev.map((c) => (c.id === comm.id ? comm : c)) : [comm, ...prev];
    });
    logAudit('CRIAR', `Submetido para aprovação de Administrador: "${comm.title}".`, comm.id, 'COMMUNICADO');
    addToast('info', 'Submetido para aprovação', 'O comunicado aguarda validação de um Administrador para ser disparado.');
    setActiveTab('communicados');
  };

  const handleScheduleSend = (draft: Partial<Communicado>) => {
    const comm: Communicado = {
      ...(draft as Communicado),
      status: 'AGENDADO',
      updatedAt: new Date().toISOString(),
    };
    setCommunicados((prev) => {
      const exists = prev.some((c) => c.id === comm.id);
      return exists ? prev.map((c) => (c.id === comm.id ? comm : c)) : [comm, ...prev];
    });
    logAudit('AGENDAR', `Agendado comunicado: "${comm.title}".`, comm.id, 'COMMUNICADO');
    addToast('success', 'Envio agendado com sucesso!', 'O comunicado entrará na fila de disparo automático.');
    setActiveTab('scheduler');
  };

  // Template Gallery Actions
  const handleUseTemplateFromGallery = (template: Template) => {
    setEditingCommunicado({
      id: `comm-${Date.now()}`,
      tenantId: currentTenant.id,
      title: template.title,
      body: template.body,
      summary: template.description,
      category: template.category,
      priority: template.priority,
      bannerUrl: template.bannerUrl,
      actionButtons: template.suggestedButtons,
      mentions: ['todos@empresa.com'],
      targetChannelIds: channels.length > 0 ? [channels[0].id] : [],
      status: 'RASCUNHO',
      author: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
      },
      schedule: {
        type: 'now',
        timezone: currentTenant.defaultTimezone,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    addToast('info', 'Template carregado!', `Modelo "${template.title}" carregado no editor.`);
    setActiveTab('editor');
  };

  const handleSaveCustomTemplate = (tmpl: Template) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === tmpl.id);
      return exists ? prev.map((t) => (t.id === tmpl.id ? tmpl : t)) : [tmpl, ...prev];
    });
    logAudit('CRIAR', `Template "${tmpl.title}" salvo na galeria.`, tmpl.id, 'COMMUNICADO');
    addToast('success', 'Template salvo com sucesso na Galeria!');
  };

  const handleDeleteCustomTemplate = (tmplId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== tmplId));
    addToast('info', 'Template removido da galeria');
  };

  // Team & Member Delegation Actions
  const handleInviteUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    logAudit(
      'CRIAR',
      `Administrador ${currentUser.name} convidou ${newUser.name} (${newUser.email}) com perfil ${newUser.role} no Teams.`,
      newUser.id,
      'AUTH'
    );
    addToast(
      'success',
      'Convite gerado com sucesso!',
      `${newUser.name} foi adicionado à equipe com perfil ${newUser.role}.`
    );
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }
    const targetUser = users.find((u) => u.id === userId);
    logAudit(
      'EDITAR',
      `Perfil do usuário ${targetUser?.name || userId} alterado para ${newRole} por ${currentUser.name}.`,
      userId,
      'AUTH'
    );
    addToast('info', 'Perfil atualizado', `O perfil no Teams foi alterado para ${newRole}.`);
  };

  const handleRemoveUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logAudit('CANCELAR', `Acesso revogado do membro ${target?.name || userId}.`, userId, 'AUTH');
    addToast('info', 'Acesso revogado', 'O colaborador foi desvinculado da equipe.');
  };

  // Auth / Registration Flow (Owner creates Admin account)
  const handleRegisterAdmin = (newAdmin: User, newTenantName?: string) => {
    if (newTenantName && newTenantName.trim()) {
      const newTenant: Tenant = {
        id: `tenant-${Date.now()}`,
        name: newTenantName.trim(),
        code: newTenantName.trim().slice(0, 4).toUpperCase(),
        defaultTimezone: 'America/Sao_Paulo',
        requireApproval: true,
        active: true,
      };
      setTenants((prev) => [newTenant, ...prev]);
      setCurrentTenant(newTenant);
      newAdmin.tenantId = newTenant.id;
    }

    setUsers((prev) => [newAdmin, ...prev]);
    setCurrentUser(newAdmin);
    logAudit('LOGIN', `Novo Administrador proprietário cadastrado: ${newAdmin.name} (${newAdmin.email}).`, newAdmin.id, 'AUTH');
    addToast(
      'success',
      'Conta de Administrador Criada!',
      `Bem-vindo(a), ${newAdmin.name}! Você possui perfil de ADMIN para configurar canais e convidar sua equipe.`
    );
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    addToast('info', 'Sessão alterada', `Você está operando como ${user.name} (${user.role}).`);
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    logAudit(
      'EDITAR',
      `Perfil do usuário ${updatedUser.name} (${updatedUser.email}) atualizado.`,
      updatedUser.id,
      'AUTH'
    );
    addToast(
      'success',
      'Perfil e foto atualizados com sucesso!',
      'Suas alterações foram salvas e serão refletidas nos comunicados do Teams.'
    );
  };

  const handleUpdateTeamMember = (updatedMember: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedMember.id ? updatedMember : u)));
    if (currentUser.id === updatedMember.id) {
      setCurrentUser(updatedMember);
    }
    logAudit(
      'EDITAR',
      `Membro da equipe ${updatedMember.name} atualizado pelo Administrador ${currentUser.name}.`,
      updatedMember.id,
      'AUTH'
    );
    addToast(
      'success',
      'Membro da equipe atualizado!',
      `O perfil, permissões e foto de ${updatedMember.name} foram atualizados.`
    );
  };

  // Reset Application Handlers
  const handleResetClean = () => {
    setCommunicados([]);
    setChannels([
      {
        id: 'ch-geral-novo',
        tenantId: currentTenant.id,
        name: '#geral-avisos',
        type: 'teams_webhook',
        department: 'Geral',
        webhookUrl: 'https://outlook.office.com/webhook/demo/geral',
        defaultTimezone: currentTenant.defaultTimezone,
        isActive: true,
        lastStatus: 'online',
        lastTestedAt: new Date().toISOString(),
        lastLatencyMs: 140,
        description: 'Canal inicial limpo criado após zerar o aplicativo.',
      },
    ]);
    setAuditLogs([
      {
        id: `audit-${Date.now()}`,
        tenantId: currentTenant.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'LOGIN',
        details: 'Aplicativo zerado com sucesso. Iniciando em ambiente 100% limpo.',
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        entityType: 'AUTH',
      },
    ]);
    addToast('info', 'Aplicativo zerado com sucesso!', 'Todos os comunicados e históricos foram limpos para começar do zero.');
    setActiveTab('dashboard');
  };

  const handleResetDefault = () => {
    setCommunicados(INITIAL_COMMUNICADOS);
    setChannels(INITIAL_CHANNELS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTemplates(ENTERPRISE_TEMPLATES);
    addToast('success', 'Demonstração padrão restaurada!', 'Os dados iniciais e templates oficiais foram recarregados.');
    setActiveTab('dashboard');
  };

  // Approval Handlers
  const handleApprove = (commId: string, comments?: string) => {
    const found = communicados.find((c) => c.id === commId);
    if (!found) return;

    const updated: Communicado = {
      ...found,
      status: found.schedule.type === 'now' ? 'ENVIADO' : 'AGENDADO',
      approver: {
        id: currentUser.id,
        name: currentUser.name,
        approvedAt: new Date().toISOString(),
        status: 'approved',
        comments,
      },
    };

    setCommunicados((prev) => prev.map((c) => (c.id === commId ? updated : c)));
    logAudit('APROVAR', `Aprovado comunicado "${found.title}" por ${currentUser.name}. Comentários: ${comments || 'Nenhum'}.`, commId, 'COMMUNICADO');

    if (found.schedule.type === 'now') {
      handleDispatchCommunicado(updated);
    } else {
      addToast('success', 'Comunicado aprovado e agendado!', 'Ele será disparado no horário programado.');
    }
  };

  const handleReject = (commId: string, reason: string) => {
    const found = communicados.find((c) => c.id === commId);
    if (!found) return;

    const updated: Communicado = {
      ...found,
      status: 'RASCUNHO',
      approver: {
        id: currentUser.id,
        name: currentUser.name,
        approvedAt: new Date().toISOString(),
        status: 'rejected',
        comments: reason,
      },
    };

    setCommunicados((prev) => prev.map((c) => (c.id === commId ? updated : c)));
    logAudit('REJEITAR', `Devolvido comunicado "${found.title}" por ${currentUser.name}. Motivo: ${reason}.`, commId, 'COMMUNICADO');
    addToast('warning', 'Comunicado devolvido', 'O autor foi notificado com os apontamentos.');
  };

  // Channel Testing Handler
  const handleTestChannel = async (channel: Channel) => {
    try {
      const response = await fetch('/api/channels/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: channel.webhookUrl,
          type: channel.type,
          channelName: channel.name,
        }),
      });
      const data = await response.json();

      const updatedChannels = channels.map((c) =>
        c.id === channel.id
          ? {
              ...c,
              lastStatus: (data.success ? 'online' : 'offline') as 'online' | 'offline',
              lastTestedAt: new Date().toISOString(),
              lastLatencyMs: data.durationMs,
            }
          : c
      );
      setChannels(updatedChannels);

      logAudit(
        'CONFIGURAR_CANAL',
        `Teste de conexão para o canal "${channel.name}": ${data.success ? 'Online' : 'Falha'} (${data.durationMs}ms).`,
        channel.id,
        'CANAL'
      );

      if (data.success) {
        addToast('success', 'Canal respondendo normalmente!', `Latência: ${data.durationMs}ms`);
      } else {
        addToast('error', 'Falha na conexão do canal', data.message);
      }

      return {
        success: data.success,
        message: data.message || (data.success ? 'Conexão OK' : 'Falha no endpoint'),
        latencyMs: data.durationMs,
      };
    } catch (err: any) {
      addToast('error', 'Erro ao testar endpoint', err.message);
      return { success: false, message: err.message };
    }
  };

  const handleDuplicateCommunicado = (comm: Communicado) => {
    const dup: Communicado = {
      ...comm,
      id: `comm-${Date.now()}`,
      title: `${comm.title} (Cópia)`,
      status: 'RASCUNHO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dispatchedAt: undefined,
      channelDispatches: undefined,
    };
    setCommunicados((prev) => [dup, ...prev]);
    logAudit('CRIAR', `Duplicado comunicado a partir de "${comm.title}".`, dup.id, 'COMMUNICADO');
    addToast('info', 'Comunicado duplicado', 'Uma nova cópia em rascunho foi criada.');
    setEditingCommunicado(dup);
    setActiveTab('editor');
  };

  const handleDeleteCommunicado = (commId: string) => {
    setCommunicados((prev) => prev.filter((c) => c.id !== commId));
    logAudit('CANCELAR', `Excluído comunicado ID: ${commId}.`, commId, 'COMMUNICADO');
    addToast('info', 'Comunicado removido');
  };

  const handleCancelSchedule = (commId: string) => {
    setCommunicados((prev) =>
      prev.map((c) => (c.id === commId ? { ...c, status: 'CANCELADO' } : c))
    );
    logAudit('CANCELAR', `Cancelado agendamento do comunicado ID: ${commId}.`, commId, 'COMMUNICADO');
    addToast('warning', 'Agendamento cancelado', 'O disparo programado foi interrompido.');
  };

  // Pending Approvals & Scheduled count
  const pendingApprovalsCount = communicados.filter(
    (c) => c.tenantId === currentTenant.id && c.status === 'AGUARDANDO_APROVACAO'
  ).length;

  const scheduledCount = communicados.filter(
    (c) => c.tenantId === currentTenant.id && c.status === 'AGENDADO'
  ).length;

  return (
    <div className={`min-h-screen bg-[#0E0E10] text-zinc-100 flex flex-col font-sans selection:bg-[#5B5FC7]/40 selection:text-white`}>
      {/* Header */}
      <Header
        currentTenant={currentTenant}
        tenants={tenants}
        onSelectTenant={setCurrentTenant}
        currentUser={currentUser}
        users={users}
        onSelectUser={setCurrentUser}
        lang={lang}
        onToggleLang={() => setLang(lang === 'pt-BR' ? 'en' : 'pt-BR')}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'editor') {
              setEditingCommunicado(null);
            }
            setActiveTab(tab);
          }}
          lang={lang}
          pendingApprovalsCount={pendingApprovalsCount}
          scheduledCount={scheduledCount}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onNewCommunicado={() => {
            setEditingCommunicado(null);
            setActiveTab('editor');
          }}
          onResetApp={() => setIsResetModalOpen(true)}
          currentUser={currentUser}
          onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              communicados={communicados}
              channels={channels}
              currentTenant={currentTenant}
              lang={lang}
              onNewCommunicado={() => {
                setEditingCommunicado(null);
                setActiveTab('editor');
              }}
              onEditCommunicado={(comm) => {
                setEditingCommunicado(comm);
                setActiveTab('editor');
              }}
              onDispatchNow={handleDispatchCommunicado}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'editor' && (
            <CommunicadoEditorView
              initialCommunicado={editingCommunicado}
              channels={channels.filter((c) => c.tenantId === currentTenant.id)}
              currentTenant={currentTenant}
              currentUser={currentUser}
              groqApiKey={groqApiKey}
              allTemplates={templates}
              onSaveDraft={handleSaveDraft}
              onSubmitForApproval={handleSubmitForApproval}
              onScheduleSend={handleScheduleSend}
              onDispatchImmediately={handleDispatchCommunicado}
              onSaveAsTemplate={handleSaveCustomTemplate}
              onCancel={() => setActiveTab('communicados')}
            />
          )}

          {activeTab === 'communicados' && (
            <CommunicadosListView
              communicados={communicados}
              channels={channels}
              currentUser={currentUser}
              currentTenant={currentTenant}
              lang={lang}
              onNewCommunicado={() => {
                setEditingCommunicado(null);
                setActiveTab('editor');
              }}
              onEditCommunicado={(comm) => {
                setEditingCommunicado(comm);
                setActiveTab('editor');
              }}
              onDuplicateCommunicado={handleDuplicateCommunicado}
              onDeleteCommunicado={handleDeleteCommunicado}
              onDispatchNow={handleDispatchCommunicado}
              onOpenApproval={(comm) => setApprovalModalComm(comm)}
            />
          )}

          {activeTab === 'templates' && (
            <TemplateGalleryView
              templates={templates}
              onUseTemplate={handleUseTemplateFromGallery}
              onSaveCustomTemplate={handleSaveCustomTemplate}
              onDeleteCustomTemplate={handleDeleteCustomTemplate}
            />
          )}

          {activeTab === 'scheduler' && (
            <SchedulerView
              communicados={communicados}
              currentTenant={currentTenant}
              onDispatchNow={handleDispatchCommunicado}
              onCancelSchedule={handleCancelSchedule}
              onNewCommunicado={() => {
                setEditingCommunicado(null);
                setActiveTab('editor');
              }}
            />
          )}

          {activeTab === 'channels' && (
            <ChannelsView
              channels={channels}
              currentTenant={currentTenant}
              currentUser={currentUser}
              onSaveChannel={(channel) => {
                setChannels((prev) => {
                  let nextChannels: Channel[];
                  if (channel.isDefaultInbound) {
                    // Remove isDefaultInbound from others
                    const updated = prev.map((c) => ({ ...c, isDefaultInbound: c.id === channel.id }));
                    const exists = updated.some((c) => c.id === channel.id);
                    nextChannels = exists ? updated.map((c) => (c.id === channel.id ? channel : c)) : [channel, ...updated];
                  } else {
                    const exists = prev.some((c) => c.id === channel.id);
                    nextChannels = exists ? prev.map((c) => (c.id === channel.id ? channel : c)) : [channel, ...prev];
                  }
                  // Sync to server background
                  fetch('/api/v1/channels/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channels: nextChannels }),
                  }).catch(console.error);
                  return nextChannels;
                });
                logAudit('CONFIGURAR_CANAL', `Canal salvo: "${channel.name}" (Inbound: ${channel.isInboundEnabled !== false ? 'Ativo' : 'Inativo'}).`, channel.id, 'CANAL');
                addToast('success', 'Canal salvo com sucesso', 'Configurações de destino e Inbound atualizadas.');
              }}
              onDeleteChannel={(channelId) => {
                setChannels((prev) => {
                  const next = prev.filter((c) => c.id !== channelId);
                  fetch('/api/v1/channels/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channels: next }),
                  }).catch(console.error);
                  return next;
                });
                logAudit('CONFIGURAR_CANAL', `Canal removido ID: ${channelId}.`, channelId, 'CANAL');
                addToast('info', 'Canal removido');
              }}
              onTestChannel={handleTestChannel}
            />
          )}

          {activeTab === 'team' && (
            <TeamManagementView
              users={users}
              currentUser={currentUser}
              currentTenant={currentTenant}
              channels={channels.filter((c) => c.tenantId === currentTenant.id)}
              onInviteUser={handleInviteUser}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateUser={handleUpdateTeamMember}
              onRemoveUser={handleRemoveUser}
            />
          )}

          {activeTab === 'inbound_webhook' && (
            <InboundWebhookView
              currentTenant={currentTenant}
              channels={channels.filter((c) => c.tenantId === currentTenant.id)}
            />
          )}

          {activeTab === 'power_automate' && (
            <PowerAutomateHubView currentTenant={currentTenant} />
          )}

          {activeTab === 'history' && (
            <HistoryAuditView
              communicados={communicados}
              auditLogs={auditLogs}
              currentTenant={currentTenant}
              onResendCommunicado={handleDispatchCommunicado}
              onDuplicateCommunicado={handleDuplicateCommunicado}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentTenant={currentTenant}
              tenants={tenants}
              onSaveTenant={(updated) => {
                setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                setCurrentTenant(updated);
                addToast('success', 'Configurações do tenant atualizadas');
              }}
              onAddTenant={(newT) => {
                setTenants((prev) => [...prev, newT]);
                setCurrentTenant(newT);
                addToast('success', `Tenant "${newT.name}" criado com sucesso!`);
              }}
              groqApiKey={groqApiKey}
              onSaveGroqApiKey={setGroqApiKey}
              currentUser={currentUser}
              onResetApp={() => setIsResetModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={Boolean(approvalModalComm)}
        communicado={approvalModalComm}
        currentUser={currentUser}
        onClose={() => setApprovalModalComm(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Reset Application Modal */}
      <ResetAppModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmResetClean={handleResetClean}
        onConfirmResetDefault={handleResetDefault}
      />

      {/* Auth / Register Admin Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        currentTenant={currentTenant}
        onRegisterAdmin={handleRegisterAdmin}
        onSwitchUser={handleSwitchUser}
      />

      {/* Edit Profile & Photo Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={currentUser}
        currentTenant={currentTenant}
        onUpdateUser={handleUpdateCurrentUser}
      />

      {/* Floating Toasts Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
