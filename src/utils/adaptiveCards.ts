import { Communicado, ActionButton, Priority, Template } from '../types';

/**
 * Maps communicator priority to Adaptive Card theme color & badge text
 */
export function getPriorityMeta(priority: Priority) {
  switch (priority) {
    case 'critical':
      return {
        color: 'Attention',
        hex: '#D13438',
        accentBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
        label: 'URGENTE / CRÍTICO',
        icon: '🚨',
      };
    case 'warning':
      return {
        color: 'Warning',
        hex: '#FF8C00',
        accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
        label: 'ATENÇÃO',
        icon: '⚠️',
      };
    case 'info':
    default:
      return {
        color: 'Accent',
        hex: '#4F46E5',
        accentBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
        label: 'INFORMATIVO',
        icon: 'ℹ️',
      };
  }
}

/**
 * Converts a Communicado object into Microsoft Teams Adaptive Card v1.4 payload
 */
export function buildTeamsAdaptiveCard(comm: Partial<Communicado>) {
  const priorityMeta = getPriorityMeta(comm.priority || 'info');
  const labelText = comm.customPriorityLabel || priorityMeta.label;
  const iconEmoji = comm.customCategoryEmoji || priorityMeta.icon;

  const cardBody: any[] = [];

  // Top banner image (only if showBanner is not false AND bannerUrl is present)
  if (comm.showBanner !== false && comm.bannerUrl && comm.bannerUrl.trim().length > 0) {
    cardBody.push({
      type: 'Image',
      url: comm.bannerUrl.trim(),
      size: 'Auto',
      style: 'Default',
      altText: comm.title || 'Banner do Comunicado',
      spacing: 'None',
      horizontalAlignment: 'Center',
    });
  }

  // Header container with Priority Ribbon, Category & Timestamp
  cardBody.push({
    type: 'Container',
    style: 'emphasis',
    spacing: 'Small',
    items: [
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            width: 'auto',
            items: [
              {
                type: 'TextBlock',
                text: `${iconEmoji} ${labelText}`,
                weight: 'Bolder',
                color: priorityMeta.color,
                size: 'Small',
              },
            ],
          },
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: `•  ${comm.category || 'Geral'}`,
                color: 'Default',
                isSubtle: true,
                size: 'Small',
                horizontalAlignment: 'Left',
              },
            ],
          },
          {
            type: 'Column',
            width: 'auto',
            items: [
              {
                type: 'TextBlock',
                text: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                isSubtle: true,
                size: 'Small',
                horizontalAlignment: 'Right',
              },
            ],
          },
        ],
      },
      {
        type: 'TextBlock',
        text: comm.title || 'Título do Comunicado',
        weight: 'Bolder',
        size: 'Large',
        wrap: true,
        spacing: 'Small',
      },
    ],
  });

  // Body container with Markdown text
  cardBody.push({
    type: 'Container',
    spacing: 'Medium',
    items: [
      {
        type: 'TextBlock',
        text: comm.body || 'Corpo da mensagem...',
        wrap: true,
        size: 'Medium',
      },
    ],
  });

  // If there are mentions
  if (comm.mentions && comm.mentions.length > 0) {
    cardBody.push({
      type: 'FactSet',
      spacing: 'Small',
      facts: [
        {
          title: 'Notificados:',
          value: comm.mentions.map((m) => (m.startsWith('@') ? m : `@${m}`)).join(', '),
        },
      ],
    });
  }

  // Footer container with Author and Organization
  // If showAuthorPhoto is true AND author has an avatar, include image column. Otherwise text-only (sem foto)!
  const senderName = comm.customSenderName || comm.author?.name || 'Equipe Corporativa';
  const senderEmail = comm.author?.email || 'comunicados@empresa.com';
  const senderAvatar = (comm.customSenderAvatar || comm.author?.avatar || '').trim();
  const hasAvatar = comm.showAuthorPhoto === true && Boolean(senderAvatar && senderAvatar.length > 0);

  const authorColumns: any[] = [];
  if (hasAvatar) {
    authorColumns.push({
      type: 'Column',
      width: 'auto',
      items: [
        {
          type: 'Image',
          url: senderAvatar,
          size: 'Small',
          style: 'Person',
        },
      ],
    });
  }

  authorColumns.push({
    type: 'Column',
    width: 'stretch',
    items: [
      {
        type: 'TextBlock',
        text: senderName,
        weight: 'Bolder',
        size: 'Small',
        spacing: 'None',
      },
      {
        type: 'TextBlock',
        text: senderEmail,
        isSubtle: true,
        size: 'Small',
        spacing: 'None',
      },
    ],
  });

  cardBody.push({
    type: 'Container',
    spacing: 'Medium',
    separator: true,
    items: [
      {
        type: 'ColumnSet',
        columns: authorColumns,
      },
    ],
  });

  // Actions
  const actions: any[] = [];
  if (comm.actionButtons && comm.actionButtons.length > 0) {
    comm.actionButtons.forEach((btn) => {
      if (btn.type === 'Action.OpenUrl' && btn.url) {
        actions.push({
          type: 'Action.OpenUrl',
          title: btn.title || 'Acessar Link',
          url: btn.url,
          style: btn.style || 'default',
        });
      } else {
        actions.push({
          type: 'Action.Submit',
          title: btn.title || 'Confirmar',
          data: {
            actionId: btn.id,
            communicadoId: comm.id,
          },
        });
      }
    });
  }

  return {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.4',
    msteams: {
      width: 'Full',
    },
    body: cardBody,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Builds the full Teams incoming webhook envelope
 */
export function buildTeamsWebhookEnvelope(comm: Partial<Communicado>) {
  const adaptiveCard = buildTeamsAdaptiveCard(comm);
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: adaptiveCard,
      },
    ],
  };
}

/**
 * Builds the Power Automate standardized HTTP POST payload
 */
export function buildPowerAutomatePayload(comm: Partial<Communicado>, tenantName = 'Matriz') {
  const adaptiveCard = buildTeamsAdaptiveCard(comm);
  return {
    title: comm.title,
    body: comm.body,
    summary: comm.summary || comm.title,
    priority: comm.priority || 'info',
    category: comm.category || 'Geral',
    showBanner: comm.showBanner !== false && Boolean(comm.bannerUrl?.trim()),
    bannerUrl: comm.showBanner !== false && comm.bannerUrl ? comm.bannerUrl.trim() : null,
    showAuthorPhoto: comm.showAuthorPhoto === true,
    senderName: comm.customSenderName || comm.author?.name || 'Teams Communicator',
    mentions: comm.mentions || [],
    author: comm.author || {
      name: 'Teams Communicator',
      email: 'bot@teamscommunicator.com',
    },
    actionUrls: comm.actionButtons?.map((b) => ({ title: b.title, url: b.url })) || [],
    adaptiveCardJson: adaptiveCard,
    metadata: {
      tenant: tenantName,
      communicadoId: comm.id,
      timestamp: new Date().toISOString(),
      source: 'Teams Communicator Web App',
    },
  };
}

/**
 * Pre-configured enterprise templates
 */
export const ENTERPRISE_TEMPLATES: Template[] = [
  {
    id: 'tmpl-welcome',
    title: '🎉 Boas-vindas ao Time! Novo(a) Colaborador(a)',
    category: 'RH & Pessoas',
    priority: 'info' as Priority,
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    description: 'Acolhimento de novos funcionários na equipe com apresentação e canais de contato.',
    body: `É com imensa alegria que anunciamos a chegada de **[Nome do Colaborador]** ao nosso time de **[Departamento/Área]**!

### 🌟 Sobre o(a) novo(a) integrante:
- **Cargo:** Analista de Projetos Sênior
- **Localização:** São Paulo / Híbrido
- **Hobbies:** Tecnologia, café especial e ciclismo

Desejamos muito sucesso nesta nova jornada! Não deixem de enviar uma mensagem de boas-vindas no canal ou via chat individual.`,
    suggestedButtons: [
      {
        id: 'btn-1',
        type: 'Action.OpenUrl' as const,
        title: '👋 Enviar Boas-Vindas no Teams',
        url: 'https://teams.microsoft.com',
      },
      {
        id: 'btn-2',
        type: 'Action.OpenUrl' as const,
        title: '📖 Acessar Portal do Colaborador',
        url: 'https://portal.empresa.com/onboarding',
      },
    ],
  },
  {
    id: 'tmpl-maintenance',
    title: '⚡ [MANUTENÇÃO TI] Janela Programada de Atualização de Servidores',
    category: 'TI & Infra',
    priority: 'warning' as Priority,
    bannerUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    description: 'Aviso sobre parada programada de infraestrutura, VPN ou ERP corporativo.',
    body: `Informamos que realizaremos uma **manutenção preventiva e atualização de segurança** em nossa infraestrutura de rede e bancos de dados.

### 📅 Detalhes da Janela:
- **Início:** Sábado, às 22h00 (Horário de Brasília)
- **Término Previsto:** Domingo, às 04h00
- **Serviços Afetados:** Acesso ao SAP ERP, VPN Corporativa e Intranet

> 💡 **Recomendação:** Salve todos os seus trabalhos e efetue logoff das sessões ativas antes do início do procedimento.`,
    suggestedButtons: [
      {
        id: 'btn-1',
        type: 'Action.OpenUrl' as const,
        title: '📊 Painel de Status em Tempo Real',
        url: 'https://status.empresa.com',
      },
      {
        id: 'btn-2',
        type: 'Action.OpenUrl' as const,
        title: '🎫 Abrir Chamado no Helpdesk',
        url: 'https://servicedesk.empresa.com',
      },
    ],
  },
  {
    id: 'tmpl-security',
    title: '🚨 [ALERTA DE SEGURANÇA] Campanha Ativa de Phishing Identificada',
    category: 'Segurança',
    priority: 'critical' as Priority,
    bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    description: 'Alerta urgente de cibersegurança sobre tentativas de phishing ou atualização de senhas.',
    body: `Nossa equipe de Cibersegurança (SOC) detectou e-mails fraudulentos se passando pelo departamento Financeiro solicitando "Confirmação Urgente de Dados Bancários".

### 🛡️ O que você deve fazer imediatamente:
1. **NÃO clique em links** ou anexos suspeitos com extensões .zip ou .html.
2. Verifique sempre o domínio do remetente (deve terminar estritamente com **@empresa.com**).
3. Caso tenha inserido sua senha, altere-a imediatamente no portal de autoatendimento.

A equipe de segurança nunca solicitará sua senha por e-mail ou chat.`,
    suggestedButtons: [
      {
        id: 'btn-1',
        type: 'Action.OpenUrl' as const,
        title: '🚩 Reportar E-mail Suspeito',
        url: 'https://security.empresa.com/report',
      },
      {
        id: 'btn-2',
        type: 'Action.OpenUrl' as const,
        title: '🔑 Redefinir Senha Segura',
        url: 'https://identity.empresa.com/reset',
      },
    ],
  },
  {
    id: 'tmpl-townhall',
    title: '🎤 Town Hall Global Q4: Estratégia, Inovação & Resultados',
    category: 'Eventos',
    priority: 'info' as Priority,
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    description: 'Convite para reunião geral da empresa com link de transmissão ao vivo.',
    body: `Convidamos todos os colaboradores para o nosso encontro trimestral **Town Hall Q4**, onde a liderança executiva compartilhará os principais marcos atingidos e o direcionamento estratégico para o próximo ano.

### 📌 Pauta Principal:
- Apresentação de resultados financeiros do trimestre
- Lançamento das novas iniciativas de Inteligência Artificial
- Sessão aberta de Perguntas & Respostas (Q&A)
- Reconhecimento dos destaques da temporada

Sua presença e participação ativa são fundamentais! Envie suas dúvidas antecipadamente pela plataforma de Q&A.`,
    suggestedButtons: [
      {
        id: 'btn-1',
        type: 'Action.OpenUrl' as const,
        title: '🔴 Entrar na Transmissão ao Vivo (Teams)',
        url: 'https://teams.microsoft.com/meet/townhall2026',
      },
      {
        id: 'btn-2',
        type: 'Action.OpenUrl' as const,
        title: '💬 Enviar Dúvida para o Q&A',
        url: 'https://slido.com/townhall-q4',
      },
    ],
  },
  {
    id: 'tmpl-benefits',
    title: '🌴 Lembrete de RH: Fechamento de Ponto e Saldo de Banco de Horas',
    category: 'Benefícios',
    priority: 'warning' as Priority,
    bannerUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    description: 'Lembrete recorrente para acerto de marcações e justificativas de ponto eletrônico.',
    body: `Prezados colaboradores,

Lembramos que o espelho de ponto eletrônico deste mês fecha impreterivelmente nesta **sexta-feira às 18h00**.

### ⏰ Check-list de Regularização:
- [ ] Justificar marcações ausentes ou inconsistentes
- [ ] Anexar atestados médicos pendentes
- [ ] Solicitar aprovação de horas extras à sua liderança imediata

O fechamento correto garante o pagamento pontual e sem deduções indevidas na folha de pagamento.`,
    suggestedButtons: [
      {
        id: 'btn-1',
        type: 'Action.OpenUrl' as const,
        title: '📋 Acessar Sistema de Ponto',
        url: 'https://ponto.empresa.com',
      },
    ],
  },
];
