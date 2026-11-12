import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize GoogleGenAI safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// AI Assistant endpoint (supports Gemini out-of-the-box, or Groq if user provides key)
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { action, text = '', title = '', brief = '', targetLanguage = 'pt-BR', groqApiKey = '', tone = 'professional' } = req.body;

    // Check if user specifically requested Groq with their own API key
    if (groqApiKey && groqApiKey.trim().length > 10) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'Você é um assistente sênior de comunicação corporativa especializado em mensagens e comunicados para Microsoft Teams.',
              },
              {
                role: 'user',
                content: buildAIPrompt(action, text, title, brief, targetLanguage, tone),
              },
            ],
            temperature: 0.6,
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const content = groqData.choices?.[0]?.message?.content || '';
          return res.json({ success: true, result: content, provider: 'Groq (llama-3.3-70b)' });
        }
      } catch (groqErr) {
        console.warn('Groq call failed, falling back to Gemini:', groqErr);
      }
    }

    // Default to Google GenAI with gemini-3.8-flash
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        success: false,
        error: 'Chave GEMINI_API_KEY não encontrada no ambiente. Configure nas variáveis.',
      });
    }

    const prompt = buildAIPrompt(action, text, title, brief, targetLanguage, tone);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const result = response.text || '';
    return res.json({ success: true, result, provider: 'Gemini 3.8 Flash' });
  } catch (error: any) {
    console.error('Error in /api/ai/assistant:', error);
    return res.status(500).json({ success: false, error: error.message || 'Falha ao processar com IA' });
  }
});

function buildAIPrompt(action: string, text: string, title: string, brief: string, targetLanguage: string, tone: string): string {
  switch (action) {
    case 'spellcheck':
      return `Revise e corrija qualquer erro de gramática, pontuação e concordância no seguinte texto de comunicado para o Teams, mantendo a mensagem original clara e fluida:\n\n"${text}"\n\nRetorne apenas o texto revisado final, sem preâmbulos.`;
    case 'professional':
      return `Reescreva o seguinte texto em um tom corporativo ${tone === 'friendly' ? 'amigável e acolhedor' : tone === 'urgent' ? 'urgente e direto' : 'polido, profissional e engajador'} para o Microsoft Teams:\n\n"${text}"\n\nRetorne apenas o texto reescrito, pronto para publicação.`;
    case 'titles':
      return `Com base neste comunicado para o Microsoft Teams:
Título atual: "${title}"
Conteúdo: "${text}"

Sugira exatamente 3 opções de títulos atraentes, claros e objetivos, no formato:
1. [Título 1]
2. [Título 2]
3. [Título 3]

Retorne apenas as 3 opções numeradas.`;
    case 'summarize':
      return `Crie um resumo curto e objetivo (máximo 2 a 3 frases) do seguinte comunicado para ser exibido em notificações rápidas no Teams:\n\n"${text}"\n\nRetorne apenas o resumo.`;
    case 'translate':
      return `Traduza o seguinte título e texto de comunicado para o idioma: ${targetLanguage}.\n\nTítulo: ${title}\nTexto: ${text}\n\nRetorne no formato:\n[TÍTULO TRADUZIDO]\n---\n[TEXTO TRADUZIDO]`;
    case 'generate':
      return `Gere um comunicado corporativo profissional e completo para o Microsoft Teams baseado neste briefing:
"${brief || text}"

O comunicado deve ter:
- Um título chamativo com emoji adequado
- Um corpo estruturado com introdução, detalhes e orientações claras
- Formatação em Markdown (negrito, listas com marcadores)
- Conclusão com canal para dúvidas

Retorne no formato:
TÍTULO: [Título sugerido]
CORPO:
[Corpo do comunicado em markdown]`;
    default:
      return `Melhore e refine o seguinte texto para comunicado no Teams:\n\n${text}`;
  }
}

// Endpoint to test webhook connectivity (Teams Webhook or Power Automate HTTP trigger)
app.post('/api/channels/test', async (req, res) => {
  const { url, type = 'teams', channelName = 'Canal' } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ success: false, message: 'URL inválida ou ausente.' });
  }

  const startTime = Date.now();

  // If it's a simulated or demo URL, return instant simulated success
  if (url.includes('example.com') || url.includes('mock.teams') || url.includes('localhost') || url.includes('demo')) {
    return res.json({
      success: true,
      statusCode: 200,
      durationMs: 145,
      message: `Simulação de conectividade com sucesso para ${channelName} (${type === 'teams' ? 'Teams Webhook' : 'Power Automate Flow'}).`,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Send a benign ping / test payload conforming to the full Power Automate schema
    const testPayload = type === 'power_automate'
      ? {
          title: `✅ Teste de Conectividade (${channelName})`,
          body: `Este é um teste automático disparado pelo painel do **Teams Communicator** para validar o recebimento do fluxo no canal **${channelName}**.`,
          summary: `Teste de Conectividade - Canal ${channelName}`,
          priority: 'info',
          category: 'Teste & Diagnóstico',
          showBanner: false,
          bannerUrl: null,
          showAuthorPhoto: false,
          senderName: 'Teams Communicator Bot',
          mentions: [],
          author: {
            name: 'Teams Communicator Bot',
            email: 'bot@teamscommunicator.internal',
            avatar: '',
          },
          actionUrls: [
            {
              title: 'Acessar Painel',
              url: 'https://teams.microsoft.com',
            },
          ],
          adaptiveCardJson: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.4',
            msteams: { width: 'Full' },
            body: [
              {
                type: 'TextBlock',
                text: '✅ Conexão Verificada com Sucesso!',
                weight: 'Bolder',
                size: 'Medium',
                color: 'Good',
              },
              {
                type: 'TextBlock',
                text: `O canal **${channelName}** está integrado com sucesso ao Teams Communicator via Power Automate.`,
                wrap: true,
              },
              {
                type: 'FactSet',
                facts: [
                  { title: 'Status:', value: 'Conectado (HTTP 200/202)' },
                  { title: 'Data/Hora:', value: new Date().toLocaleString('pt-BR') },
                  { title: 'Origem:', value: 'Teams Communicator Web App' },
                ],
              },
            ],
          },
          metadata: {
            channelName,
            testType: 'PING_TEST',
            timestamp: new Date().toISOString(),
            source: 'Teams Communicator Web App',
          },
        }
      : {
          '@type': 'MessageCard',
          '@context': 'http://schema.org/extensions',
          themeColor: '5B5FC7',
          summary: 'Teste de Conexão Teams Communicator',
          sections: [
            {
              activityTitle: '✅ Conexão Verificada',
              activitySubtitle: `Canal: ${channelName}`,
              text: 'Este é um teste automático de conectividade enviado pelo painel do **Teams Communicator**.',
            },
          ],
        };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const durationMs = Date.now() - startTime;

    if (response.ok || response.status === 200 || response.status === 202) {
      return res.json({
        success: true,
        statusCode: response.status,
        durationMs,
        message: `Endpoint respondeu com status HTTP ${response.status} em ${durationMs}ms!`,
      });
    } else {
      const errorText = await response.text().catch(() => '');
      let parsedMessage = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.error?.message) {
          parsedMessage = parsed.error.message;
        }
      } catch {
        // use raw errorText
      }
      return res.json({
        success: false,
        statusCode: response.status,
        durationMs,
        message: `Endpoint retornou HTTP ${response.status}: ${parsedMessage.slice(0, 300) || 'Falha no webhook'}`,
      });
    }
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return res.json({
      success: false,
      statusCode: 0,
      durationMs,
      message: error.name === 'AbortError' ? 'Tempo limite esgotado (timeout de 8s).' : `Erro ao conectar: ${error.message}`,
    });
  }
});

// Endpoint to dispatch a communicado to MS Teams or Power Automate
app.post('/api/send-communicado', async (req, res) => {
  const { channel, payload, mode = 'live' } = req.body;

  if (!channel || !channel.webhookUrl) {
    return res.status(400).json({ success: false, message: 'Dados de canal inválidos.' });
  }

  const startTime = Date.now();
  const url = channel.webhookUrl;

  // Handle mock/demo URLs gracefully
  if (url.includes('example.com') || url.includes('mock.teams') || url.includes('demo') || mode === 'simulate') {
    // Artificial slight latency for realistic UI feedback
    await new Promise((r) => setTimeout(r, 600));
    return res.json({
      success: true,
      statusCode: 200,
      durationMs: Date.now() - startTime,
      channelId: channel.id,
      channelName: channel.name,
      responseSummary: 'OK 200 (Disparo simulado com sucesso)',
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const durationMs = Date.now() - startTime;
    const responseText = await response.text().catch(() => '');

    if (response.ok || response.status === 200 || response.status === 202) {
      return res.json({
        success: true,
        statusCode: response.status,
        durationMs,
        channelId: channel.id,
        channelName: channel.name,
        responseSummary: responseText.slice(0, 200) || 'Entregue com sucesso',
      });
    } else {
      let parsedSummary = responseText;
      try {
        const parsed = JSON.parse(responseText);
        if (parsed?.error?.message) {
          parsedSummary = parsed.error.message;
        }
      } catch {
        // use raw responseText
      }
      return res.json({
        success: false,
        statusCode: response.status,
        durationMs,
        channelId: channel.id,
        channelName: channel.name,
        responseSummary: `HTTP ${response.status}: ${parsedSummary.slice(0, 300)}`,
      });
    }
  } catch (error: any) {
    return res.json({
      success: false,
      statusCode: 0,
      durationMs: Date.now() - startTime,
      channelId: channel.id,
      channelName: channel.name,
      responseSummary: `Falha na requisição: ${error.message}`,
    });
  }
});

// Power Automate ready-to-import template
app.get('/api/power-automate/templates', (req, res) => {
  const flowTemplate = {
    schemaVersion: '1.0.0.0',
    description: 'Teams Communicator - Fluxo padrão para Postagem no Teams com Menções (@mentions)',
    trigger: {
      type: 'Request',
      kind: 'Http',
      inputs: {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            body: { type: 'string' },
            priority: { type: 'string', enum: ['info', 'warning', 'critical'] },
            author: { type: 'string' },
            mentions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lista de e-mails para menção no Teams',
            },
            actionUrls: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  url: { type: 'string' },
                },
              },
            },
            adaptiveCardJson: { type: 'object' },
          },
        },
      },
    },
    actions: {
      Format_Adaptive_Card: {
        type: 'Teams_PostCardToConversation',
        inputs: {
          recipientType: 'Channel',
          body: '@{triggerBody()}',
        },
      },
    },
  };

  res.setHeader('Content-Disposition', 'attachment; filename="teams-communicator-flow.json"');
  res.setHeader('Content-Type', 'application/json');
  return res.send(JSON.stringify(flowTemplate, null, 2));
});

// Store recent incoming webhook requests in memory for inspection and live dashboard sync
const incomingWebhookHistory: any[] = [];

// Helper to build an Adaptive Card dynamically on the server
function serverBuildAdaptiveCard(params: {
  title: string;
  body: string;
  priority: string;
  category?: string;
  bannerUrl?: string | null;
  senderName?: string;
  actionButtons?: Array<{ title: string; url?: string }>;
}) {
  const { title, body, priority, category = 'Geral', bannerUrl, senderName, actionButtons = [] } = params;

  const priorityColor = priority === 'critical' ? 'Attention' : priority === 'warning' ? 'Warning' : 'Accent';
  const priorityLabel = priority === 'critical' ? '🚨 URGENTE / CRÍTICO' : priority === 'warning' ? '⚠️ ATENÇÃO' : 'ℹ️ INFORMATIVO';

  const cardBody: any[] = [];

  if (bannerUrl && bannerUrl.trim().length > 0) {
    cardBody.push({
      type: 'Image',
      url: bannerUrl.trim(),
      size: 'Auto',
      style: 'Default',
      altText: title,
      spacing: 'None',
      horizontalAlignment: 'Center',
    });
  }

  cardBody.push({
    type: 'Container',
    style: priority === 'critical' ? 'attention' : priority === 'warning' ? 'warning' : 'emphasis',
    bleed: true,
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
                text: priorityLabel,
                weight: 'Bolder',
                color: priorityColor,
                size: 'Small',
              },
            ],
          },
          {
            type: 'Column',
            width: 'stretch',
            horizontalAlignment: 'Right',
            items: [
              {
                type: 'TextBlock',
                text: `🏷️ ${category}`,
                size: 'Small',
                isSubtle: true,
                horizontalAlignment: 'Right',
              },
            ],
          },
        ],
      },
      {
        type: 'TextBlock',
        text: title,
        weight: 'Bolder',
        size: 'Large',
        wrap: true,
        spacing: 'Small',
      },
    ],
  });

  cardBody.push({
    type: 'Container',
    spacing: 'Medium',
    items: [
      {
        type: 'TextBlock',
        text: body,
        wrap: true,
      },
    ],
  });

  // Footer / Sender info
  cardBody.push({
    type: 'Container',
    spacing: 'Medium',
    separator: true,
    items: [
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: `Enviado por: **${senderName || 'Teams Communicator Gateway'}**`,
                size: 'Small',
                isSubtle: true,
              },
              {
                type: 'TextBlock',
                text: `Disparado via Inbound Webhook em ${new Date().toLocaleString('pt-BR')}`,
                size: 'ExtraSmall',
                isSubtle: true,
                spacing: 'None',
              },
            ],
          },
        ],
      },
    ],
  });

  const actions = (actionButtons || []).map((btn) => ({
    type: 'Action.OpenUrl',
    title: btn.title || 'Acessar Link',
    url: btn.url || 'https://teams.microsoft.com',
  }));

  return {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.4',
    msteams: { width: 'Full' },
    body: cardBody,
    actions: actions.length > 0 ? actions : undefined,
  };
}

// Pre-defined template lookup
const SERVER_TEMPLATES: Record<string, { bannerUrl: string; category: string; defaultButtons: any[] }> = {
  'tmpl-welcome': {
    category: 'RH & Pessoas',
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    defaultButtons: [{ title: '👋 Enviar Boas-Vindas', url: 'https://teams.microsoft.com' }],
  },
  'tmpl-maintenance': {
    category: 'TI & Infra',
    bannerUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    defaultButtons: [{ title: '📊 Status dos Servidores', url: 'https://status.empresa.com' }],
  },
  'tmpl-security': {
    category: 'Segurança (CISO)',
    bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    defaultButtons: [{ title: '🛡️ Portal de Segurança', url: 'https://ciso.empresa.com' }],
  },
  'tmpl-payroll': {
    category: 'Financeiro & RH',
    bannerUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    defaultButtons: [{ title: '💰 Portal do Holerite', url: 'https://rh.empresa.com/holerite' }],
  },
};

// Channels registry in backend memory for fast inbound routing & sync
let serverChannelsRegistry: any[] = [
  {
    id: 'ch-ti-infra',
    name: '#ti-alertas-infra',
    type: 'teams_webhook',
    webhookUrl: 'https://outlook.office.com/webhook/demo-tenant-teams/ti-infra',
    isInboundEnabled: true,
    inboundDeliveryMode: 'direct',
    isDefaultInbound: true,
    inboundSlug: 'ti-alertas',
  },
  {
    id: 'ch-rh-oficial',
    name: '#rh-comunicados-oficial',
    type: 'teams_webhook',
    webhookUrl: 'https://outlook.office.com/webhook/demo-tenant-teams/rh-official',
    isInboundEnabled: true,
    inboundDeliveryMode: 'approval',
    isDefaultInbound: false,
    inboundSlug: 'rh-avisos',
  },
  {
    id: 'ch-power-automate-flow',
    name: '#flow-power-automate-mentions',
    type: 'power_automate',
    webhookUrl: 'https://prod-12.brazilsouth.logic.azure.com:443/workflows/demo-flow/triggers/manual/paths/invoke',
    isInboundEnabled: true,
    inboundDeliveryMode: 'direct',
    isDefaultInbound: false,
    inboundSlug: 'power-automate',
  },
  {
    id: 'ch-seguranca-ciso',
    name: '#seguranca-ciso-alertas',
    type: 'teams_webhook',
    webhookUrl: 'https://outlook.office.com/webhook/demo-tenant-teams/ciso-security',
    isInboundEnabled: true,
    inboundDeliveryMode: 'direct',
    isDefaultInbound: false,
    inboundSlug: 'ciso-alertas',
  },
];

// Endpoint for frontend to sync updated channels with backend routing table
app.post('/api/v1/channels/sync', (req, res) => {
  const { channels } = req.body;
  if (Array.isArray(channels)) {
    serverChannelsRegistry = channels;
  }
  return res.json({ success: true, count: serverChannelsRegistry.length });
});

// GET list of channels configured for inbound
app.get('/api/v1/channels/inbound-routes', (req, res) => {
  res.json({
    success: true,
    channels: serverChannelsRegistry.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      isInboundEnabled: c.isInboundEnabled !== false,
      inboundDeliveryMode: c.inboundDeliveryMode || 'direct',
      isDefaultInbound: Boolean(c.isDefaultInbound),
      inboundSlug: c.inboundSlug || c.id,
      routeUrl: `/api/v1/inbound/channel/${c.inboundSlug || c.id}`,
    })),
  });
});

// Helper function to process and route an inbound payload
async function processInboundWebhook(req: express.Request, targetChannelIdentifier?: string) {
  const startTime = Date.now();
  const {
    title,
    body,
    priority = 'info',
    category,
    templateId,
    senderName = 'Sistema Integrado (Inbound Webhook)',
    mentions = [],
    actionButtons = [],
    bannerUrl: customBannerUrl,
    targetWebhookUrls = [],
    autoDispatch,
    metadata = {},
  } = req.body;

  if (!title || !body) {
    return {
      status: 400,
      data: {
        success: false,
        error: 'Campos obrigatórios ausentes: "title" e "body" são requeridos.',
      },
    };
  }

  // 1. Resolve target channel
  let resolvedChannel: any = null;
  const channelQueryParam = (req.query.channel as string) || (req.query.slug as string) || req.body.channelId || req.body.channelSlug;
  const identifier = targetChannelIdentifier || channelQueryParam;

  if (identifier) {
    resolvedChannel = serverChannelsRegistry.find(
      (c) => c.id === identifier || c.inboundSlug === identifier || c.name.toLowerCase() === identifier.toLowerCase()
    );
  }

  // Fallback to default inbound channel if none specified
  if (!resolvedChannel) {
    resolvedChannel = serverChannelsRegistry.find((c) => c.isDefaultInbound) || serverChannelsRegistry[0];
  }

  // 2. Resolve delivery policy: 'direct' vs 'approval'
  // Priority: explicit query parameter > channel setting > autoDispatch boolean > default 'direct'
  const explicitMode = req.query.mode as string;
  let deliveryMode: 'direct' | 'approval' = 'direct';

  if (explicitMode === 'approval' || explicitMode === 'direct') {
    deliveryMode = explicitMode;
  } else if (resolvedChannel?.inboundDeliveryMode) {
    deliveryMode = resolvedChannel.inboundDeliveryMode;
  } else if (autoDispatch === false) {
    deliveryMode = 'approval';
  }

  // 3. Resolve template styling
  const chosenTemplate = templateId && SERVER_TEMPLATES[templateId] ? SERVER_TEMPLATES[templateId] : null;
  const finalCategory = category || chosenTemplate?.category || (resolvedChannel ? resolvedChannel.name.replace('#', '') : 'Geral');
  const finalBannerUrl = customBannerUrl || chosenTemplate?.bannerUrl || null;
  const finalButtons = (actionButtons && actionButtons.length > 0) ? actionButtons : (chosenTemplate?.defaultButtons || []);

  // 4. Build the official Adaptive Card
  const adaptiveCard = serverBuildAdaptiveCard({
    title,
    body,
    priority,
    category: finalCategory,
    bannerUrl: finalBannerUrl,
    senderName,
    actionButtons: finalButtons,
  });

  // 5. Build standardized payload
  const compiledPayload = {
    title,
    body,
    summary: title,
    priority,
    category: finalCategory,
    showBanner: Boolean(finalBannerUrl),
    bannerUrl: finalBannerUrl,
    senderName,
    mentions,
    author: {
      name: senderName,
      email: 'gateway@teamscommunicator.internal',
    },
    actionUrls: finalButtons,
    adaptiveCardJson: adaptiveCard,
    metadata: {
      ...metadata,
      source: 'Teams Communicator Inbound Gateway',
      channelId: resolvedChannel?.id,
      channelName: resolvedChannel?.name,
      deliveryMode,
      receivedAt: new Date().toISOString(),
      templateApplied: templateId || 'dynamic-card',
    },
  };

  const dispatchResults: any[] = [];
  const generatedId = `comm-inbound-${Date.now().toString().slice(-6)}`;

  // 6. Execute delivery according to policy
  if (deliveryMode === 'direct') {
    const urlsToDispatch: string[] = [];
    if (resolvedChannel?.webhookUrl) {
      urlsToDispatch.push(resolvedChannel.webhookUrl);
    }
    if (Array.isArray(targetWebhookUrls)) {
      for (const u of targetWebhookUrls) {
        if (typeof u === 'string' && u.startsWith('http') && !urlsToDispatch.includes(u)) {
          urlsToDispatch.push(u);
        }
      }
    }

    for (const webhookUrl of urlsToDispatch) {
      const isTeamsNativeWebhook = webhookUrl.includes('outlook.office.com') || webhookUrl.includes('webhook.office.com');
      const payloadToSend = isTeamsNativeWebhook
        ? {
            type: 'message',
            attachments: [
              {
                contentType: 'application/vnd.microsoft.card.adaptive',
                contentUrl: null,
                content: adaptiveCard,
              },
            ],
          }
        : compiledPayload;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);

        const dispatchRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadToSend),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const respText = await dispatchRes.text().catch(() => '');

        dispatchResults.push({
          channelName: resolvedChannel?.name || 'Webhook Externo',
          targetUrl: webhookUrl.slice(0, 45) + '...',
          status: dispatchRes.ok || dispatchRes.status === 202 ? 'success' : 'failed',
          statusCode: dispatchRes.status,
          response: respText.slice(0, 150) || 'OK',
        });
      } catch (err: any) {
        dispatchResults.push({
          channelName: resolvedChannel?.name || 'Webhook Externo',
          targetUrl: webhookUrl.slice(0, 45) + '...',
          status: 'failed',
          statusCode: 0,
          response: err.message,
        });
      }
    }
  }

  const finalStatus = deliveryMode === 'approval'
    ? 'AGUARDANDO_APROVACAO'
    : dispatchResults.some((d) => d.status === 'success')
    ? 'ENVIADO'
    : 'FALHA';

  const record = {
    id: generatedId,
    receivedAt: new Date().toISOString(),
    title,
    body,
    priority,
    category: finalCategory,
    templateId: templateId || 'custom',
    senderName,
    mentionsCount: mentions.length,
    deliveryMode,
    targetChannel: resolvedChannel
      ? { id: resolvedChannel.id, name: resolvedChannel.name, slug: resolvedChannel.inboundSlug }
      : null,
    status: finalStatus,
    dispatchedCount: dispatchResults.filter((d) => d.status === 'success').length,
    dispatchResults,
    adaptiveCard,
    latencyMs: Date.now() - startTime,
    clientIp: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  };

  incomingWebhookHistory.unshift(record);
  if (incomingWebhookHistory.length > 50) {
    incomingWebhookHistory.pop();
  }

  const messageText = deliveryMode === 'approval'
    ? `Comunicado recebido com sucesso, formatado no template e enviado para a Fila de Aprovação Corporativa do canal ${resolvedChannel?.name || 'Geral'}.`
    : `Comunicado recebido, formatado em Adaptive Card e disparado diretamente para ${resolvedChannel?.name || 'canal configurado'}!`;

  return {
    status: 200,
    data: {
      success: true,
      statusCode: 200,
      communicadoId: generatedId,
      status: finalStatus,
      deliveryMode,
      targetChannel: resolvedChannel ? { id: resolvedChannel.id, name: resolvedChannel.name, slug: resolvedChannel.inboundSlug } : null,
      templateApplied: chosenTemplate ? templateId : 'card-padrao',
      dispatchedTargets: dispatchResults,
      adaptiveCardCompiled: adaptiveCard,
      durationMs: Date.now() - startTime,
      message: messageText,
    },
  };
}

// 1. DEDICATED INBOUND ROUTE PER CHANNEL: /api/v1/inbound/channel/:channelIdentifier
app.post('/api/v1/inbound/channel/:channelIdentifier', async (req, res) => {
  const result = await processInboundWebhook(req, req.params.channelIdentifier);
  return res.status(result.status).json(result.data);
});

// 2. GLOBAL INBOUND WEBHOOK ENDPOINT: /api/v1/communicados/incoming
app.post('/api/v1/communicados/incoming', async (req, res) => {
  const result = await processInboundWebhook(req);
  return res.status(result.status).json(result.data);
});

// GET endpoint to query incoming webhook history for frontend inspection
app.get('/api/v1/communicados/incoming/history', (req, res) => {
  res.json({
    success: true,
    total: incomingWebhookHistory.length,
    data: incomingWebhookHistory,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Teams Communicator Backend', timestamp: new Date().toISOString() });
});

// Setup Vite or Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Teams Communicator running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
