import { Tenant, User, Channel, Communicado, AuditLogEntry } from '../types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-corp-global',
    name: 'Matriz Corporativa',
    code: 'CORP-HQ',
    logoUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=120&q=80',
    defaultTimezone: 'America/Sao_Paulo',
    requireApproval: true,
    active: true,
  },
  {
    id: 'tenant-corp-brasil',
    name: 'Operações Brasil',
    code: 'CORP-BR',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80',
    defaultTimezone: 'America/Sao_Paulo',
    requireApproval: false,
    active: true,
  },
  {
    id: 'tenant-corp-tech',
    name: 'Inovação & Tecnologia',
    code: 'CORP-TECH',
    logoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=80',
    defaultTimezone: 'America/Sao_Paulo',
    requireApproval: true,
    active: true,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-victor',
    name: 'Victor Araújo',
    email: 'victor.araujo@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    role: 'SUPER_ADMIN',
    department: 'Liderança de Tecnologia & Inovação',
    tenantId: 'tenant-corp-global',
  },
  {
    id: 'user-mariana',
    name: 'Mariana Silveira',
    email: 'mariana.silveira@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    role: 'ADMIN',
    department: 'Recursos Humanos',
    tenantId: 'tenant-corp-global',
  },
  {
    id: 'user-lucas',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    role: 'EDITOR',
    department: 'Comunicação Interna',
    tenantId: 'tenant-corp-global',
  },
  {
    id: 'user-beatriz',
    name: 'Beatriz Rocha',
    email: 'beatriz.rocha@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80',
    role: 'VIEWER',
    department: 'Operações de Negócios',
    tenantId: 'tenant-corp-global',
  },
];

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'ch-rh-oficial',
    tenantId: 'tenant-corp-global',
    name: '#rh-comunicados-oficial',
    type: 'teams_webhook',
    department: 'Recursos Humanos',
    webhookUrl: 'https://outlook.office.com/webhook/demo-tenant-teams/rh-official',
    defaultTimezone: 'America/Sao_Paulo',
    isActive: true,
    lastStatus: 'online',
    lastTestedAt: '2026-10-09T08:10:00Z',
    lastLatencyMs: 142,
    description: 'Canal principal para informes de RH, folha, benefícios e avisos corporativos gerais.',
    isInboundEnabled: true,
    inboundDeliveryMode: 'approval',
    isDefaultInbound: false,
    inboundSlug: 'rh-avisos',
  },
  {
    id: 'ch-ti-infra',
    tenantId: 'tenant-corp-global',
    name: '#ti-alertas-infra',
    type: 'teams_webhook',
    department: 'TI & Infra',
    webhookUrl: 'https://outlook.office.com/webhook/demo-tenant-teams/ti-infra',
    defaultTimezone: 'America/Sao_Paulo',
    isActive: true,
    lastStatus: 'online',
    lastTestedAt: '2026-10-09T08:12:00Z',
    lastLatencyMs: 168,
    description: 'Canal de alertas de status, manutenções de servidores, VPN e suporte técnico.',
    isInboundEnabled: true,
    inboundDeliveryMode: 'direct',
    isDefaultInbound: true,
    inboundSlug: 'ti-alertas',
  },
  {
    id: 'ch-power-automate-flow',
    tenantId: 'tenant-corp-global',
    name: '#flow-power-automate-mentions',
    type: 'power_automate',
    department: 'TI & Inovação',
    webhookUrl: 'https://prod-12.brazilsouth.logic.azure.com:443/workflows/demo-flow/triggers/manual/paths/invoke',
    defaultTimezone: 'America/Sao_Paulo',
    isActive: true,
    lastStatus: 'online',
    lastTestedAt: '2026-10-09T08:15:00Z',
    lastLatencyMs: 235,
    description: 'Trigger HTTP Power Automate com suporte a menções personalizadas (@mentions) e chats diretos.',
    isInboundEnabled: true,
    inboundDeliveryMode: 'direct',
    isDefaultInbound: false,
    inboundSlug: 'power-automate',
  },
  {
    id: 'ch-geral-todos',
    tenantId: 'tenant-corp-global',
    name: '#geral-todos-colaboradores',
    type: 'teams_webhook',
    department: 'Comunicação Geral',
    webhookUrl: 'https://outlook.office.com/webhook/demo-tenant-teams/geral-todos',
    defaultTimezone: 'America/Sao_Paulo',
    isActive: true,
    lastStatus: 'online',
    lastTestedAt: '2026-10-09T07:45:00Z',
    lastLatencyMs: 155,
    description: 'Canal corporativo com todos os colaboradores da organização.',
    isInboundEnabled: false,
    inboundDeliveryMode: 'approval',
    isDefaultInbound: false,
    inboundSlug: 'geral',
  },
  {
    id: 'ch-seguranca-ciso',
    tenantId: 'tenant-corp-global',
    name: '#seguranca-ciso-alertas',
    type: 'teams_webhook',
    department: 'Segurança da Informação',
    webhookUrl: 'https://outlook.office.com/webhook/demo-tenant-teams/ciso-security',
    defaultTimezone: 'America/Sao_Paulo',
    isActive: true,
    lastStatus: 'online',
    lastTestedAt: '2026-10-09T06:30:00Z',
    description: 'Canal corporativo para boletins de segurança cibernética e phishing alerts.',
    isInboundEnabled: true,
    inboundDeliveryMode: 'direct',
    isDefaultInbound: false,
    inboundSlug: 'ciso-alertas',
  },
];

export const INITIAL_COMMUNICADOS: Communicado[] = [
  {
    id: 'comm-101',
    tenantId: 'tenant-corp-global',
    title: '🔐 ALERTA CISO: Simulação de Phishing e Atualização de MFA',
    body: `Informamos a todos os colaboradores que a área de Segurança da Informação iniciou hoje a campanha trimestral de **Conscientização em Cibersegurança**.

### 📌 Pontos de Atenção:
- Nenhum membro de TI solicitará códigos de verificação em duas etapas (MFA) via Teams ou WhatsApp.
- Fique atento a links suspeitos e remetentes fora do domínio corporativo.
- Caso receba um e-mail duvidoso, utilize o botão **"Reportar Phishing"** no Outlook imediatamente.

Contamos com o engajamento de todos para mantermos nosso ambiente seguro!`,
    summary: 'Campanha de conscientização de cibersegurança e reforço nas regras de MFA.',
    category: 'Segurança',
    priority: 'critical',
    bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    actionButtons: [
      {
        id: 'btn-sec-1',
        type: 'Action.OpenUrl',
        title: '🛡️ Portal de Políticas CISO',
        url: 'https://security.empresa.com/policies',
        style: 'positive',
      },
      {
        id: 'btn-sec-2',
        type: 'Action.OpenUrl',
        title: '🚨 Reportar Incidente',
        url: 'https://security.empresa.com/report',
        style: 'destructive',
      },
    ],
    mentions: ['todos@empresa.com', 'liderancas@empresa.com'],
    targetChannelIds: ['ch-seguranca-ciso', 'ch-geral-todos'],
    status: 'ENVIADO',
    author: {
      id: 'user-victor',
      name: 'Victor Araújo',
      email: 'victor.araujo@empresa.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    },
    schedule: {
      type: 'now',
      timezone: 'America/Sao_Paulo',
    },
    createdAt: '2026-10-09T05:30:00Z',
    updatedAt: '2026-10-09T05:40:00Z',
    dispatchedAt: '2026-10-09T05:40:00Z',
    channelDispatches: [
      {
        channelId: 'ch-seguranca-ciso',
        channelName: '#seguranca-ciso-alertas',
        channelType: 'teams_webhook',
        status: 'success',
        statusCode: 200,
        message: 'Payload entregue no canal Teams',
        timestamp: '2026-10-09T05:40:02Z',
        latencyMs: 145,
      },
      {
        channelId: 'ch-geral-todos',
        channelName: '#geral-todos-colaboradores',
        channelType: 'teams_webhook',
        status: 'success',
        statusCode: 200,
        message: 'Payload entregue no canal Teams',
        timestamp: '2026-10-09T05:40:03Z',
        latencyMs: 162,
      },
    ],
    readCountEstimated: 842,
  },
  {
    id: 'comm-102',
    tenantId: 'tenant-corp-global',
    title: '⚡ [TI] Janela de Manutenção Programada dos Servidores Cloud',
    body: `Informamos que no próximo **sábado, a partir das 22h00**, realizaremos uma janela de migração preventiva de infraestrutura cloud.

### ⏱️ Cronograma:
- **Início:** Sábado às 22h00
- **Duração estimada:** 3 horas
- **Impactos:** Indisponibilidade momentânea da VPN corporativa e do portal interno.

Sistemas essenciais como e-mail (Exchange) e Microsoft Teams continuarão funcionando normalmente.`,
    summary: 'Manutenção técnica de servidores neste sábado às 22h.',
    category: 'TI & Infra',
    priority: 'warning',
    bannerUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    actionButtons: [
      {
        id: 'btn-ti-1',
        type: 'Action.OpenUrl',
        title: '📊 Status da Infraestrutura',
        url: 'https://status.empresa.com',
      },
    ],
    mentions: ['devops@empresa.com'],
    targetChannelIds: ['ch-ti-infra'],
    status: 'AGENDADO',
    author: {
      id: 'user-victor',
      name: 'Victor Araújo',
      email: 'victor.araujo@empresa.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    },
    schedule: {
      type: 'once',
      scheduledAt: '2026-10-10T21:00:00Z',
      timezone: 'America/Sao_Paulo',
    },
    createdAt: '2026-10-09T04:15:00Z',
    updatedAt: '2026-10-09T04:20:00Z',
    readCountEstimated: 0,
  },
  {
    id: 'comm-103',
    tenantId: 'tenant-corp-global',
    title: '🎤 Town Hall Global Q4: IA e Resultados Corporativos',
    body: `Convidamos todos os colaboradores para o encontro **Town Hall Global Q4**, transmitido ao vivo pelo Teams.

Venha conferir em primeira mão os resultados do trimestre e os investimentos em novas soluções de inteligência artificial corporativa.`,
    summary: 'Town Hall Global Q4 com apresentação de resultados.',
    category: 'Eventos',
    priority: 'info',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    actionButtons: [
      {
        id: 'btn-ev-1',
        type: 'Action.OpenUrl',
        title: '🔴 Link da Transmissão',
        url: 'https://teams.microsoft.com/meet/townhall-q4',
      },
    ],
    mentions: ['all'],
    targetChannelIds: ['ch-geral-todos', 'ch-rh-oficial'],
    status: 'AGENDADO',
    author: {
      id: 'user-mariana',
      name: 'Mariana Silveira',
      email: 'mariana.silveira@empresa.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    },
    schedule: {
      type: 'recurring',
      recurrence: {
        frequency: 'weekly',
        time: '14:00',
        daysOfWeek: [4], // Quinta-feira
      },
      timezone: 'America/Sao_Paulo',
    },
    createdAt: '2026-10-08T18:00:00Z',
    updatedAt: '2026-10-08T18:30:00Z',
    readCountEstimated: 0,
  },
  {
    id: 'comm-104',
    tenantId: 'tenant-corp-global',
    title: '🌴 Lembrete de Fechamento do Ponto Eletrônico e Horas Extras',
    body: `Lembramos que o fechamento da folha de pagamento ocorrerá na próxima sexta-feira. 

Por favor, revisem suas marcações, anexem atestados pendentes e solicitem a aprovação de horas extras junto à gestão imediata até às 17h00.`,
    summary: 'Lembrete de RH para regularização de espelho de ponto.',
    category: 'RH & Pessoas',
    priority: 'warning',
    bannerUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    actionButtons: [
      {
        id: 'btn-ponto',
        type: 'Action.OpenUrl',
        title: '📋 Abrir Sistema de Ponto',
        url: 'https://ponto.empresa.com',
      },
    ],
    mentions: ['equipe-brasil@empresa.com'],
    targetChannelIds: ['ch-rh-oficial'],
    status: 'AGUARDANDO_APROVACAO',
    author: {
      id: 'user-lucas',
      name: 'Lucas Mendes',
      email: 'lucas.mendes@empresa.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    },
    schedule: {
      type: 'once',
      scheduledAt: '2026-10-10T12:00:00Z',
      timezone: 'America/Sao_Paulo',
    },
    createdAt: '2026-10-09T03:00:00Z',
    updatedAt: '2026-10-09T03:00:00Z',
  },
  {
    id: 'comm-105',
    tenantId: 'tenant-corp-global',
    title: '💡 Ideathon 2026: Inscrições Abertas para Desafio de Inovação',
    body: `Estão abertas as inscrições para o maior desafio de inovação interna da companhia! Monte seu squad multidisciplinar e submeta propostas de impacto utilizando IA e automação.`,
    summary: 'Inscrições abertas para o Ideathon 2026.',
    category: 'Eventos',
    priority: 'info',
    actionButtons: [
      {
        id: 'btn-ideathon',
        type: 'Action.OpenUrl',
        title: '🚀 Inscrever Meu Squad',
        url: 'https://ideathon.empresa.com',
      },
    ],
    mentions: [],
    targetChannelIds: ['ch-geral-todos'],
    status: 'RASCUNHO',
    author: {
      id: 'user-lucas',
      name: 'Lucas Mendes',
      email: 'lucas.mendes@empresa.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    },
    schedule: {
      type: 'now',
      timezone: 'America/Sao_Paulo',
    },
    createdAt: '2026-10-09T02:20:00Z',
    updatedAt: '2026-10-09T02:20:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    tenantId: 'tenant-corp-global',
    userId: 'user-victor',
    userName: 'Victor Araújo',
    userRole: 'SUPER_ADMIN',
    action: 'DISPARAR',
    details: 'Disparo manual com sucesso de "ALERTA CISO: Simulação de Phishing" para 2 canais Teams.',
    timestamp: '2026-10-09T05:40:03Z',
    ip: '187.19.22.104',
    entityId: 'comm-101',
    entityType: 'COMMUNICADO',
  },
  {
    id: 'audit-2',
    tenantId: 'tenant-corp-global',
    userId: 'user-victor',
    userName: 'Victor Araújo',
    userRole: 'SUPER_ADMIN',
    action: 'AGENDAR',
    details: 'Agendou comunicado "Janela de Manutenção Programada dos Servidores Cloud" para 10/10/2026 às 18:00.',
    timestamp: '2026-10-09T04:20:00Z',
    ip: '187.19.22.104',
    entityId: 'comm-102',
    entityType: 'COMMUNICADO',
  },
  {
    id: 'audit-3',
    tenantId: 'tenant-corp-global',
    userId: 'user-lucas',
    userName: 'Lucas Mendes',
    userRole: 'EDITOR',
    action: 'CRIAR',
    details: 'Criou rascunho e submeteu para aprovação: "Lembrete de Fechamento do Ponto Eletrônico".',
    timestamp: '2026-10-09T03:00:00Z',
    ip: '177.34.12.88',
    entityId: 'comm-104',
    entityType: 'COMMUNICADO',
  },
  {
    id: 'audit-4',
    tenantId: 'tenant-corp-global',
    userId: 'user-victor',
    userName: 'Victor Araújo',
    userRole: 'SUPER_ADMIN',
    action: 'CONFIGURAR_CANAL',
    details: 'Testou e validou conectividade do canal "#flow-power-automate-mentions" (Latência: 235ms).',
    timestamp: '2026-10-09T08:15:00Z',
    ip: '187.19.22.104',
    entityId: 'ch-power-automate-flow',
    entityType: 'CANAL',
  },
  {
    id: 'audit-5',
    tenantId: 'tenant-corp-global',
    userId: 'user-victor',
    userName: 'Victor Araújo',
    userRole: 'SUPER_ADMIN',
    action: 'LOGIN',
    details: 'Autenticação bem-sucedida no tenant Matriz Corporativa.',
    timestamp: '2026-10-09T08:00:00Z',
    ip: '187.19.22.104',
    entityType: 'AUTH',
  },
];

// LocalStorage Persistence Keys (version 2 with neutral branding)
const STORAGE_KEYS = {
  TENANTS: 'tc_tenants_v2',
  CURRENT_TENANT_ID: 'tc_current_tenant_id_v2',
  USERS: 'tc_users_v2',
  CURRENT_USER_ID: 'tc_current_user_id_v2',
  CHANNELS: 'tc_channels_v2',
  COMMUNICADOS: 'tc_communicados_v2',
  AUDIT_LOGS: 'tc_audit_logs_v2',
  TEMPLATES: 'tc_templates_v2',
  GROQ_API_KEY: 'tc_groq_api_key_v2',
  LANGUAGE: 'tc_language_v2',
  THEME: 'tc_theme_v2',
};

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export { STORAGE_KEYS };
