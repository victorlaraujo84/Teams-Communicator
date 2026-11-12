import React, { useState } from 'react';
import { Tenant } from '../types';
import {
  Workflow,
  Download,
  Copy,
  Check,
  Code2,
  ExternalLink,
  Shield,
  Key,
  Play,
  Terminal,
  BookOpen,
  Send,
  Sparkles,
  HelpCircle,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Layers,
  Cpu,
  ArrowRight,
  Maximize2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { PowerAutomateGuideModal } from './PowerAutomateGuideModal';

interface PowerAutomateHubViewProps {
  currentTenant: Tenant;
}

export const PowerAutomateHubView: React.FC<PowerAutomateHubViewProps> = ({ currentTenant }) => {
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'tester' | 'schema' | 'rest'>('guide');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(1);

  // Copied helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // REST API state
  const [apiKey] = useState(`tc_sec_${currentTenant.code.toLowerCase()}_94821a3bf92`);
  const [restEndpointSelected, setRestEndpointSelected] = useState<'send' | 'schedule' | 'list'>('send');
  const [restSimulationRunning, setRestSimulationRunning] = useState(false);
  const [restResponseOutput, setRestResponseOutput] = useState<string | null>(null);

  // Live Flow Tester state
  const [testUrl, setTestUrl] = useState('');
  const [testMode, setTestMode] = useState<'ping' | 'full_card' | 'with_mentions'>('full_card');
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusCode: number;
    durationMs: number;
    message: string;
    details?: string;
  } | null>(null);

  const samplePayload = {
    title: 'Manutenção de Infraestrutura Cloud',
    body: 'Aviso sobre janela de atualização preventiva nos servidores centrais corporativos...',
    summary: 'Manutenção programada no cluster de banco de dados e servidores.',
    priority: 'critical',
    category: 'TI & Infra',
    showBanner: true,
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    showAuthorPhoto: false,
    senderName: 'TI Corporativa Comunica',
    mentions: ['devops@empresa.com', 'noc@empresa.com'],
    author: {
      name: 'Equipe de Infraestrutura',
      email: 'ti@empresa.com',
    },
    actionUrls: [
      {
        title: 'Ver Status em Tempo Real',
        url: 'https://status.empresa.com',
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
          text: '🚨 Manutenção de Infraestrutura Cloud',
          weight: 'Bolder',
          size: 'Medium',
          color: 'Attention',
        },
        {
          type: 'TextBlock',
          text: 'Aviso sobre janela de atualização preventiva nos servidores centrais corporativos.',
          wrap: true,
        },
      ],
    },
    metadata: {
      tenantId: currentTenant.id,
      tenantCode: currentTenant.code,
      source: 'Teams Communicator REST API v1',
      timestamp: new Date().toISOString(),
    },
  };

  const jsonSchema = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Título principal do comunicado' },
      body: { type: 'string', description: 'Corpo da mensagem formatado em Markdown' },
      summary: { type: 'string', description: 'Resumo conciso para notificações' },
      priority: { type: 'string', enum: ['info', 'warning', 'critical'] },
      category: { type: 'string', description: 'Categoria corporativa' },
      showBanner: { type: 'boolean', description: 'Flag de exibição de banner de imagem' },
      bannerUrl: { type: ['string', 'null'], description: 'URL da imagem de banner' },
      showAuthorPhoto: { type: 'boolean', description: 'Flag de exibição da foto do autor' },
      senderName: { type: 'string', description: 'Nome do remetente (pessoa ou departamento)' },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Lista de e-mails de usuários para notificação no Teams',
      },
      author: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          avatar: { type: 'string' },
        },
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
      adaptiveCardJson: {
        type: 'object',
        description: 'Adaptive Card v1.4 pré-construído pelo app, pronto para colar na ação do Teams',
      },
      metadata: {
        type: 'object',
        properties: {
          tenant: { type: 'string' },
          communicadoId: { type: 'string' },
          timestamp: { type: 'string' },
          source: { type: 'string' },
        },
      },
    },
  };

  const handleRunLiveTest = async () => {
    if (!testUrl.trim()) return;
    setTestRunning(true);
    setTestResult(null);

    try {
      if (testMode === 'ping') {
        const res = await fetch('/api/channels/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: testUrl.trim(),
            type: 'power_automate',
            channelName: 'Power Automate Flow Test',
          }),
        });
        const data = await res.json();
        setTestResult({
          success: data.success,
          statusCode: data.statusCode || (data.success ? 200 : 500),
          durationMs: data.durationMs || 120,
          message: data.message,
        });
      } else {
        const payloadToSend = {
          ...samplePayload,
          title: `[TESTE AO VIVO] ${samplePayload.title}`,
          mentions: testMode === 'with_mentions' ? ['usuario.teste@empresa.com'] : [],
          metadata: {
            ...samplePayload.metadata,
            testMode,
            dispatchedAt: new Date().toISOString(),
          },
        };

        const res = await fetch('/api/send-communicado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: {
              id: 'test-flow',
              name: 'Power Automate Test',
              webhookUrl: testUrl.trim(),
            },
            payload: payloadToSend,
            mode: testUrl.includes('example.com') || testUrl.includes('demo') ? 'simulate' : 'live',
          }),
        });
        const data = await res.json();
        setTestResult({
          success: data.success,
          statusCode: data.statusCode || (data.success ? 200 : 500),
          durationMs: data.durationMs || 150,
          message: data.success
            ? 'Payload entregue com sucesso ao endpoint do Power Automate!'
            : data.responseSummary || 'Falha na resposta do Power Automate',
          details: data.responseSummary,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        statusCode: 0,
        durationMs: 0,
        message: `Erro ao disparar requisição: ${err.message}`,
      });
    } finally {
      setTestRunning(false);
    }
  };

  const handleRunRestSimulation = () => {
    setRestSimulationRunning(true);
    setRestResponseOutput(null);

    setTimeout(() => {
      setRestSimulationRunning(false);
      if (restEndpointSelected === 'send') {
        setRestResponseOutput(
          JSON.stringify(
            {
              status: 200,
              success: true,
              message: 'Comunicado recebido e enfileirado para entrega no Teams com @mentions.',
              communicadoId: `comm-rest-${Date.now().toString().slice(-6)}`,
              mentionsDelivered: 2,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      } else if (restEndpointSelected === 'schedule') {
        setRestResponseOutput(
          JSON.stringify(
            {
              status: 201,
              success: true,
              message: 'Agendamento registrado com sucesso no scheduler corporativo.',
              scheduleId: `sched-${Date.now().toString().slice(-6)}`,
              scheduledAt: new Date(Date.now() + 3600000 * 24).toISOString(),
            },
            null,
            2
          )
        );
      } else {
        setRestResponseOutput(
          JSON.stringify(
            {
              status: 200,
              success: true,
              totalItems: 3,
              data: [
                { id: 'comm-101', title: 'Alerta CISO', status: 'ENVIADO' },
                { id: 'comm-102', title: 'Manutenção Cloud', status: 'AGENDADO' },
              ],
            },
            null,
            2
          )
        );
      }
    }, 550);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-purple-950/40 border border-zinc-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Workflow className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Central de Conexão com Microsoft Power Automate</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Adaptive Card v1.4
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Orientações completas, esquemas JSON e ferramentas para conectar os disparos do Teams Communicator a fluxos automatizados do Microsoft Power Automate.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/25"
            >
              <BookOpen className="w-4 h-4" />
              <span>Abrir Guia em Tela Cheia</span>
            </button>

            <a
              href="/api/power-automate/templates"
              download="teams-communicator-flow.json"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition border border-zinc-700"
              title="Baixar arquivo de template de fluxo JSON pronto para importar"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Template (.json)</span>
            </a>
          </div>
        </div>

        {/* Subtabs selector */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'guide'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guia Passo a Passo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tester')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'tester'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Testador de Fluxo em Tempo Real</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schema')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'schema'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON Schema & Expressões</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rest')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'rest'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API REST & OpenAPI Explorer</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6">
          {/* Architecture diagram card */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Arquitetura da Integração
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs">1</span>
                  <span>Teams Communicator</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Gera o comunicado corporativo com tema, prioridade, menções e compila o <strong>Adaptive Card v1.4</strong> com botões de ação e remetente.
                </p>
                <div className="pt-2 text-[10px] text-zinc-500 font-mono">Dispara: HTTP POST com JSON</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-purple-500/30 space-y-1.5 relative">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs">2</span>
                  <span>Microsoft Power Automate</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Recebe a chamada no gatilho <em>"Quando uma solicitação HTTP é recebida"</em>, extrai as variáveis e executa a postagem segura na organização.
                </p>
                <div className="pt-2 text-[10px] text-purple-400 font-mono">Processa: triggerBody()</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                  <span>Microsoft Teams</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Exibe o card estilizado no canal corporativo ou no chat de grupo, marcando os colaboradores por @mention e emitindo notificações no Teams.
                </p>
                <div className="pt-2 text-[10px] text-emerald-400 font-mono">Entrega: Card Interativo</div>
              </div>
            </div>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Step selector navigation */}
            <div className="lg:col-span-4 space-y-2">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-300 mb-2">
                Etapas de Configuração
              </div>

              {[
                { n: 1, title: 'Criar Fluxo Automatizado', desc: 'make.powerautomate.com com Gatilho HTTP' },
                { n: 2, title: 'Colar JSON Schema', desc: 'Estruturar os campos recebidos no gatilho' },
                { n: 3, title: 'Adicionar Ação do Teams', desc: 'Postar cartão adaptável em canal/chat' },
                { n: 4, title: 'Vincular o Adaptive Card', desc: "Expressão triggerBody()?['adaptiveCardJson']" },
                { n: 5, title: 'Salvar e Copiar URL POST', desc: 'Obter endpoint exclusivo do seu fluxo' },
                { n: 6, title: 'Cadastrar Canal no App', desc: 'Vincular em Canais & Webhooks e testar ping' },
              ].map((step) => (
                <button
                  key={step.n}
                  onClick={() => setGuideStep(step.n)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                    guideStep === step.n
                      ? 'bg-purple-600/15 border-purple-500/50 text-white shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      guideStep === step.n
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {step.n}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{step.title}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{step.desc}</div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-750"
              >
                <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Ver Passo a Passo Detalhado</span>
              </button>
            </div>

            {/* Step content detail */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              {guideStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                        1
                      </span>
                      Passo 1: Criar o Fluxo na Nuvem Automatizado
                    </h3>
                    <a
                      href="https://make.powerautomate.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-xs font-semibold inline-flex items-center gap-1"
                    >
                      make.powerautomate.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Entre no portal oficial do Microsoft Power Automate usando seu e-mail institucional corporativo (Microsoft 365).
                  </p>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs text-zinc-300">
                    <strong className="text-white block">Instruções Práticas:</strong>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 leading-relaxed">
                      <li>No menu lateral, selecione <strong>"Criar" (Create)</strong>.</li>
                      <li>Escolha <strong>"Fluxo de nuvem automatizado" (Automated cloud flow)</strong>.</li>
                      <li>Atribua o nome: <code className="text-purple-300 bg-zinc-900 px-1 rounded">Disparador Teams Communicator</code>.</li>
                      <li>
                        No campo de busca de gatilhos, pesquise por <strong>HTTP</strong> e selecione o gatilho da Microsoft:{' '}
                        <span className="text-emerald-400 font-semibold">
                          "Quando uma solicitação HTTP é recebida" (When an HTTP request is received)
                        </span>.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {guideStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                        2
                      </span>
                      Passo 2: Configurar o JSON Schema no Gatilho
                    </h3>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(jsonSchema, null, 2), 'schemaTab2')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                    >
                      {copiedKey === 'schemaTab2' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'schemaTab2' ? 'Copiado!' : 'Copiar Schema'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Dentro do bloco do gatilho HTTP no Power Automate, cole o Schema JSON abaixo no campo{' '}
                    <strong className="text-purple-300">"Esquema JSON do corpo da solicitação" (Request Body JSON Schema)</strong>.
                    Isso fará o Power Automate reconhecer dinamicamente o título, autor, resumo, menções e o Adaptive Card:
                  </p>

                  <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-purple-300/90 max-h-56 overflow-y-auto leading-relaxed">
                    {JSON.stringify(jsonSchema, null, 2)}
                  </pre>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                    <div className="font-bold text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Como evitar o erro "TriggerInputSchemaMismatch" (HTTP 400):
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-[11px]">
                      Esse erro acontece quando o Power Automate exige campos com <code className="text-amber-300 font-mono">"required": [...]</code> e algum valor é omitido. Para evitar isso, <strong>não adicione a propriedade "required"</strong> no Schema JSON do gatilho.
                    </p>
                  </div>
                </div>
              )}

              {guideStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                        3
                      </span>
                      Passo 3: Adicionar a Ação do Microsoft Teams
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Logo após o gatilho, clique em <strong className="text-white">+ Nova etapa (+ New step)</strong> e procure por <strong className="text-white">Microsoft Teams</strong>.
                  </p>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 space-y-2">
                    <div className="font-bold text-sm text-purple-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Ação Oficial Recomendada:
                    </div>
                    <p className="leading-relaxed">
                      Selecione: <strong className="text-emerald-300">"Postar cartão adaptável em um canal ou chat" (Post adaptive card in a chat or channel)</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-purple-800/30 text-[11px]">
                      <div>• <strong>Postar como:</strong> Flow bot (Canal) ou Usuário (Grupo)</div>
                      <div>• <strong>Postar em:</strong> Channel ou Group chat</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 space-y-1.5">
                    <div className="font-bold text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Como postar em Chat em Grupo (Group Chat):
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-[11px]">
                      Em chats em grupo, mude <strong className="text-white">"Postar como" (Post as)</strong> para <strong className="text-emerald-300">"Usuário" (User)</strong>. Isso evita bloqueios de permissão do bot no grupo privado. Em seguida, selecione o nome do seu grupo no campo <strong className="text-white">"Group chat"</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 space-y-1.5">
                    <div className="font-bold text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Cuidado com o nome da ação no Power Automate:
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-[11px]">
                      Certifique-se de escolher <strong className="text-white">"POSTAR cartão adaptável em um canal ou chat"</strong>.
                      <br />
                      Não selecione <em>"Atualizar um cartão adaptável"</em> (essa ação exige o ID de uma mensagem já existente e causa o erro <strong>400 Bad Request - Error in query syntax</strong>).
                    </p>
                  </div>
                </div>
              )}

              {guideStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                        4
                      </span>
                      Passo 4: Preencher o Campo do Adaptive Card
                    </h3>
                    <button
                      onClick={() => copyToClipboard("@{triggerBody()?['adaptiveCardJson']}", 'exprTab4')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                    >
                      {copiedKey === 'exprTab4' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'exprTab4' ? 'Copiado!' : 'Copiar Expressão'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    No campo <strong className="text-white">"Cartão Adaptável" (Adaptive Card)</strong> da ação do Teams, insira a expressão dinâmica:
                  </p>

                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-purple-500/30 font-mono text-sm text-emerald-400">
                    @{`{triggerBody()?['adaptiveCardJson']}`}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Como o Teams Communicator compila e valida o Adaptive Card v1.4 completo no client-side com imagens, estilos, botões e dados do remetente, o Power Automate apenas repassa esse objeto JSON para o canal do Teams sem que você precise montar o cartão manualmente!
                  </p>
                </div>
              )}

              {guideStep === 5 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                        5
                      </span>
                      Passo 5: Salvar o Fluxo e Copiar a URL HTTP POST
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Clique no botão <strong className="text-white">"Salvar" (Save)</strong> no topo do Power Automate. Em seguida, clique novamente no primeiro card (o gatilho HTTP) e copie o endereço que aparece no campo <strong className="text-emerald-400">"URL HTTP POST"</strong>.
                  </p>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 font-mono truncate">
                    Ex: https://prod-xx.brazilsouth.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
                  </div>
                </div>
              )}

              {guideStep === 6 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                        6
                      </span>
                      Passo 6: Cadastrar e Testar no Aplicativo
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Agora acesse a aba <strong className="text-white">"Canais & Webhooks"</strong> no menu lateral deste app, clique em <strong className="text-purple-300">+ Novo Canal</strong>, selecione a opção <strong className="text-purple-300">Power Automate Flow (HTTP)</strong> e cole a URL copiada.
                  </p>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>
                      Após salvar, clique em <strong>"Testar Ping"</strong> para verificar se o Power Automate recebe a chamada com status HTTP 200/202 e entrega o card no seu Microsoft Teams!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: LIVE TESTER */}
      {activeSubTab === 'tester' && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Testador de Disparo em Tempo Real para Power Automate</h3>
            </div>
            <span className="text-xs text-zinc-400">Valide o endpoint do seu fluxo instantaneamente</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                URL HTTP POST do seu Fluxo no Power Automate:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://prod-xx.brazilsouth.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() =>
                    setTestUrl(
                      'https://prod-15.brazilsouth.logic.azure.com:443/workflows/demo-teams-communicator/triggers/manual/paths/invoke?api-version=2016-06-01'
                    )
                  }
                  className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs text-zinc-300 font-medium whitespace-nowrap transition border border-zinc-700"
                >
                  Usar URL Demo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label
                onClick={() => setTestMode('full_card')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  testMode === 'full_card'
                    ? 'bg-purple-600/15 border-purple-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <input
                  type="radio"
                  name="testMode"
                  checked={testMode === 'full_card'}
                  onChange={() => setTestMode('full_card')}
                  className="accent-purple-600"
                />
                <div>
                  <div className="text-xs font-bold text-white">Card Adaptável Completo</div>
                  <div className="text-[10px] text-zinc-400">Título, banner, prioridade e ações</div>
                </div>
              </label>

              <label
                onClick={() => setTestMode('with_mentions')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  testMode === 'with_mentions'
                    ? 'bg-purple-600/15 border-purple-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <input
                  type="radio"
                  name="testMode"
                  checked={testMode === 'with_mentions'}
                  onChange={() => setTestMode('with_mentions')}
                  className="accent-purple-600"
                />
                <div>
                  <div className="text-xs font-bold text-white">Com @Mentions de E-mail</div>
                  <div className="text-[10px] text-zinc-400">Inclui lista de menções para teste</div>
                </div>
              </label>

              <label
                onClick={() => setTestMode('ping')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  testMode === 'ping'
                    ? 'bg-purple-600/15 border-purple-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <input
                  type="radio"
                  name="testMode"
                  checked={testMode === 'ping'}
                  onChange={() => setTestMode('ping')}
                  className="accent-purple-600"
                />
                <div>
                  <div className="text-xs font-bold text-white">Ping Simples</div>
                  <div className="text-[10px] text-zinc-400">Apenas validação de status HTTP</div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-400">
                A requisição será disparada através do proxy seguro do servidor backend do aplicativo.
              </span>
              <button
                onClick={handleRunLiveTest}
                disabled={!testUrl.trim() || testRunning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/25 disabled:opacity-50"
              >
                {testRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{testRunning ? 'Enviando ao Power Automate...' : 'Disparar Teste Imediato'}</span>
              </button>
            </div>

            {/* Test result feedback banner */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {testResult.success
                        ? `Sucesso: Power Automate respondeu HTTP ${testResult.statusCode}`
                        : `Falha na Conexão (HTTP ${testResult.statusCode})`}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] opacity-80">{testResult.durationMs}ms</span>
                </div>
                <p className="text-xs opacity-90">{testResult.message}</p>
                {testResult.details && (
                  <pre className="p-2.5 rounded-lg bg-zinc-950/80 font-mono text-[10px] overflow-x-auto text-zinc-300">
                    {testResult.details}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SCHEMA & EXPRESSIONS */}
      {activeSubTab === 'schema' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: JSON Schema */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">JSON Schema Oficial</h3>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(jsonSchema, null, 2), 'schemaTab')}
                className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1"
              >
                {copiedKey === 'schemaTab' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'schemaTab' ? 'Copiado!' : 'Copiar Schema'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-purple-300/90 overflow-x-auto max-h-96 leading-relaxed">
              {JSON.stringify(jsonSchema, null, 2)}
            </pre>
          </div>

          {/* Right: Power Automate Expressions & Payload */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Expressões Prontas para Usar no Flow</h3>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                {
                  label: 'Adaptive Card JSON',
                  expr: "@{triggerBody()?['adaptiveCardJson']}",
                  desc: 'Cole no campo "Cartão Adaptável" da ação do Teams',
                },
                {
                  label: 'Título do Comunicado',
                  expr: "@{triggerBody()?['title']}",
                  desc: 'Título oficial com emoji selecionado',
                },
                {
                  label: 'Resumo / Notificação',
                  expr: "@{triggerBody()?['summary']}",
                  desc: 'Texto conciso para banners ou notificações push',
                },
                {
                  label: 'Nome do Remetente',
                  expr: "@{triggerBody()?['senderName']}",
                  desc: 'Ex: "RH Corporativo", "TI Comunica", ou nome do autor',
                },
                {
                  label: 'Lista de Menções (@mentions)',
                  expr: "@{triggerBody()?['mentions']}",
                  desc: 'Array de e-mails corporativos dos destinatários',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.label}</span>
                    <button
                      onClick={() => copyToClipboard(item.expr, `expr_${idx}`)}
                      className="text-purple-400 hover:text-purple-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      {copiedKey === `expr_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `expr_${idx}` ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 font-mono text-[11px] text-emerald-400 select-all border border-zinc-850">
                    {item.expr}
                  </div>
                  <p className="text-[10px] text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: REST API & OPENAPI */}
      {activeSubTab === 'rest' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">API REST & OpenAPI Explorer</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                v1.0.0
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Consuma os endpoints do Teams Communicator via HTTP a partir de aplicações externas ou rotinas do Power Apps:
            </p>

            {/* Tenant Token */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1 font-semibold">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Token Bearer do Tenant ({currentTenant.code}):
                </span>
                <button
                  onClick={() => copyToClipboard(`Bearer ${apiKey}`, 'apiKey')}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedKey === 'apiKey' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'apiKey' ? 'Copiado!' : 'Copiar Token'}
                </button>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900 font-mono text-xs text-zinc-200 select-all truncate border border-zinc-800">
                Bearer {apiKey}
              </div>
            </div>

            {/* Interactive REST Runner */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setRestEndpointSelected('send')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    restEndpointSelected === 'send'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  POST /api/v1/send
                </button>
                <button
                  onClick={() => setRestEndpointSelected('schedule')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    restEndpointSelected === 'schedule'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  POST /api/v1/schedule
                </button>
                <button
                  onClick={() => setRestEndpointSelected('list')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    restEndpointSelected === 'list'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  GET /api/v1/list
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Simulador de Execução da API:</span>
                <button
                  onClick={handleRunRestSimulation}
                  disabled={restSimulationRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{restSimulationRunning ? 'Enviando...' : 'Executar Requisição'}</span>
                </button>
              </div>

              {restResponseOutput && (
                <div className="space-y-1 animate-in fade-in">
                  <span className="text-[11px] text-emerald-400 font-semibold">Resposta HTTP:</span>
                  <pre className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    {restResponseOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Payload de Amostra para API REST:</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(samplePayload, null, 2), 'sampleRestJson')}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                {copiedKey === 'sampleRestJson' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sampleRestJson' ? 'Copiado!' : 'Copiar Payload'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-96 leading-relaxed">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Guide Modal Component */}
      <PowerAutomateGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        tenantCode={currentTenant.code}
      />
    </div>
  );
};
