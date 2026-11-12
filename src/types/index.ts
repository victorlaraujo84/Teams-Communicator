export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  tenantId: string;
  status?: 'active' | 'pending_invite';
  joinedAt?: string;
  invitedBy?: string;
  allowedChannelIds?: string[];
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  defaultTimezone: string;
  requireApproval: boolean;
  active: boolean;
}

export type ChannelType = 'teams_webhook' | 'power_automate';

export interface Channel {
  id: string;
  tenantId: string;
  name: string;
  type: ChannelType;
  department: string;
  webhookUrl: string;
  defaultTimezone: string;
  isActive: boolean;
  lastStatus: 'online' | 'offline' | 'untested';
  lastTestedAt?: string;
  lastLatencyMs?: number;
  description?: string;
  isInboundEnabled?: boolean;
  inboundDeliveryMode?: 'direct' | 'approval';
  isDefaultInbound?: boolean;
  inboundSlug?: string;
}

export type Priority = 'info' | 'warning' | 'critical';

export type CommunicadoStatus =
  | 'RASCUNHO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADO'
  | 'AGENDADO'
  | 'ENVIADO'
  | 'FALHA_PARCIAL'
  | 'FALHA'
  | 'CANCELADO';

export interface ActionButton {
  id: string;
  type: 'Action.OpenUrl' | 'Action.Submit';
  title: string;
  url?: string;
  style?: 'default' | 'positive' | 'destructive';
}

export type RecurrenceFreq = 'daily' | 'weekly' | 'workdays' | 'monthly' | 'custom_cron';

export interface ScheduleConfig {
  type: 'now' | 'once' | 'recurring';
  scheduledAt?: string; // ISO string
  recurrence?: {
    frequency: RecurrenceFreq;
    time: string; // HH:mm
    daysOfWeek?: number[]; // 0 = Dom, 1 = Seg, ..., 6 = Sab
    cronExpr?: string;
  };
  timezone: string;
}

export interface ChannelDispatchResult {
  channelId: string;
  channelName: string;
  channelType: ChannelType;
  status: 'success' | 'failed' | 'pending';
  statusCode: number;
  message: string;
  timestamp: string;
  latencyMs?: number;
}

export interface AIHistoryRecord {
  id: string;
  action: string;
  provider: string;
  originalText: string;
  modifiedText: string;
  timestamp: string;
}

export interface Communicado {
  id: string;
  tenantId: string;
  title: string;
  body: string;
  summary?: string;
  category: string;
  customCategoryEmoji?: string;
  customPriorityLabel?: string;
  customPriorityColor?: string;
  priority: Priority;
  bannerUrl?: string;
  showBanner?: boolean;
  showAuthorPhoto?: boolean;
  customSenderName?: string;
  customSenderAvatar?: string;
  actionButtons: ActionButton[];
  mentions: string[]; // e.g. ["all", "ti-team@empresa.com"]
  targetChannelIds: string[];
  status: CommunicadoStatus;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  approver?: {
    id: string;
    name: string;
    approvedAt: string;
    status: 'approved' | 'rejected';
    comments?: string;
  };
  schedule: ScheduleConfig;
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
  channelDispatches?: ChannelDispatchResult[];
  aiHistory?: AIHistoryRecord[];
  readCountEstimated?: number;
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CRIAR' | 'EDITAR' | 'APROVAR' | 'REJEITAR' | 'AGENDAR' | 'DISPARAR' | 'CANCELAR' | 'REPETIR' | 'CONFIGURAR_CANAL' | 'LOGIN';
  details: string;
  timestamp: string;
  ip: string;
  entityId?: string;
  entityType?: 'COMMUNICADO' | 'CANAL' | 'CONFIG' | 'AUTH';
}

export interface Template {
  id: string;
  title: string;
  category: Communicado['category'];
  priority: Priority;
  bannerUrl: string;
  body: string;
  suggestedButtons: ActionButton[];
  description: string;
  isCustom?: boolean;
  createdAt?: string;
  tags?: string[];
}
