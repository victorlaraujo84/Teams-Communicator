import React, { useState } from 'react';
import {
  X,
  Workflow,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Terminal,
  ShieldCheck,
  FileJson,
  Info,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
} from 'lucide-react';

interface PowerAutomateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantCode?: string;
}

export const PowerAutomateGuideModal: React.FC<PowerAutomateGuideModalProps> = ({
  isOpen,
  onClose,
  tenantCode = 'MATRIZ',
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const jsonSchema = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Título principal do comunicado' },
      body: { type: 'string', description: 'Corpo da mensagem em Markdown' },
      summary: { type: 'string', description: 'Resumo curto para notificações' },
      priority: { type: 'string', enum: ['info', 'warning', 'critical'] },
      category: { type: 'string', description: 'Categoria corporativa (RH, TI, etc.)' },
      showBanner: { type: 'boolean', description: 'Indica se deve exibir banner de imagem' },
      bannerUrl: { type: ['string', 'null'], description: 'URL pública da imagem de banner' },
      showAuthorPhoto: { type: 'boolean', description: 'Exibir foto do autor ou iniciais' },
      senderName: { type: 'string', description: 'Nome do remetente customizado' },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Lista de e-mails corporativos para @menção no Teams',
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
        description: 'JSON do Adaptive Card v1.4 pré-construído e pronto para envio direto',
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

  const samplePayload = {
    title: '📢 Comunicado Oficial: Atualização de Sistemas Corporativos',
    body: 'Prezados colaboradores,\n\nInformamos que no próximo sábado haverá uma janela de manutenção programada...',
    summary: 'Manutenção preventiva dos sistemas centrais no sábado das 22h às 02h.',
    priority: 'warning',
    category: 'TI & Infra',
    showBanner: true,
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    showAuthorPhoto: false,
    senderName: 'TI Corporativa Comunica',
    mentions: ['joao.silva@suaempresa.com', 'maria.santos@suaempresa.com'],
    author: {
      name: 'Equipe de Infraestrutura',
      email: 'ti@suaempresa.com',
      avatar: '',
    },
    actionUrls: [
      {
        title: 'Ver Status dos Serviços',
        url: 'https://status.suaempresa.com',
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
          text: '📢 Comunicado Oficial: Atualização de Sistemas Corporativos',
          size: 'Large',
          weight: 'Bolder',
          wrap: true,
        },
      ],
    },
    metadata: {
      tenant: tenantCode,
      communicadoId: 'comm-exemplo-001',
      timestamp: new Date().toISOString(),
      source: 'Teams Communicator Web App',
    },
  };

  const steps = [
    {
      number: 1,
      title: 'Criar o Fluxo na Nuvem',
      shortDesc: 'Acesse o portal e crie o fluxo com o Gatilho HTTP',
    },
    {
      number: 2,
      title: 'Configurar o Gatilho HTTP',
      shortDesc: 'Cole o JSON Schema oficial no gatilho de requisição',
    },
    {
      number: 3,
      title: 'Adicionar a Ação do Teams',
      shortDesc: 'Insira "Postar cartão adaptável em um canal ou chat"',
    },
    {
      number: 4,
      title: 'Vincular o Adaptive Card',
      shortDesc: 'Use a expressão triggerBody()?[\'adaptiveCardJson\']',
    },
    {
      number: 5,
      title: 'Salvar e Copiar a URL',
      shortDesc: 'Obtenha o endereço POST gerado pelo Power Automate',
    },
    {
      number: 6,
      title: 'Cadastrar e Testar no App',
      shortDesc: 'Vincule em Canais & Webhooks e execute o teste de disparo',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Guia Passo a Passo: Conexão com Microsoft Power Automate
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Adaptive Card v1.4
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Aprenda a receber o payload do Teams Communicator e publicar comunicados automáticos no Teams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="px-6 py-3 bg-zinc-950/60 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {steps.map((st) => (
            <button
              key={st.number}
              onClick={() => setActiveStep(st.number)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeStep === st.number
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep === st.number
                    ? 'bg-white text-purple-700'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {st.number}
              </span>
              <span>{st.title}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">O que é este fluxo?</strong>
                  O Teams Communicator envia uma requisição HTTP POST segura contendo o título, corpo, categoria, remetente, lista de menções e o <strong>Adaptive Card v1.4 completo</strong>. No Power Automate, você cria um fluxo que escuta essas requisições e as publica diretamente nos canais ou chats da sua organização.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Passo 1.1: Criar o Fluxo no Portal da Microsoft
                </h4>
                <ol className="space-y-2.5 text-xs text-zinc-300 list-decimal list-inside leading-relaxed">
                  <li>
                    Acesse o portal oficial:{' '}
                    <a
                      href="https://make.powerautomate.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      make.powerautomate.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    com sua conta corporativa Microsoft 365.
                  </li>
                  <li>
                    No menu lateral esquerdo, clique em <strong className="text-white">"Criar" (Create)</strong>.
                  </li>
                  <li>
                    Selecione a opção{' '}
                    <strong className="text-purple-300">"Fluxo de nuvem automatizado" (Automated cloud flow)</strong> ou{' '}
                    <strong className="text-purple-300">"Fluxo de nuvem instantâneo"</strong>.
                  </li>
                  <li>
                    Nomeie o fluxo como:{' '}
                    <code className="text-white bg-zinc-900 px-1.5 py-0.5 rounded font-mono border border-zinc-800">
                      Teams Communicator - Disparo Oficial
                    </code>.
                  </li>
                  <li>
                    No campo de pesquisa de gatilhos, digite <code className="text-purple-300 font-mono">HTTP</code> e escolha:{' '}
                    <strong className="text-emerald-400">
                      "Quando uma solicitação HTTP é recebida" (When an HTTP request is received)
                    </strong>.
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  Próximo passo: colar o esquema JSON no gatilho para o Power Automate reconhecer todos os campos enviados.
                </div>
                <button
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  <span>Ir para o Passo 2</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-purple-400" />
                    Passo 2.1: Inserir o Esquema JSON no Gatilho HTTP
                  </h4>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(jsonSchema, null, 2), 'schemaJson')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    {copiedKey === 'schemaJson' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'schemaJson' ? 'Copiado!' : 'Copiar Schema JSON'}</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  No gatilho <em>"Quando uma solicitação HTTP é recebida"</em>, você pode clicar em{' '}
                  <strong className="text-white">"Usar payload de amostra para gerar o esquema"</strong> e colar o JSON de exemplo, ou colar o Schema estruturado diretamente na caixa{' '}
                  <strong className="text-purple-300">"Esquema JSON do corpo da solicitação"</strong>.
                </p>

                {/* Schema display */}
                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-purple-300/90 max-h-56 overflow-y-auto leading-relaxed">
                    {JSON.stringify(jsonSchema, null, 2)}
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Como evitar o erro "TriggerInputSchemaMismatch" (HTTP 400):
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    Esse erro ocorre no Power Automate quando o gatilho exige campos com <code className="text-amber-300 font-mono">"required": [...]</code> e algum valor é omitido. Para evitar isso, <strong>não inclua a cláusula "required"</strong> no seu Schema JSON (o esquema fornecido acima já é flexível e livre desse erro).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                  <strong className="text-white block">💡 Configuração Avançada do Gatilho:</strong>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li>
                      <strong>Método:</strong> Escolha <code className="text-purple-300 font-mono">POST</code> nas opções avançadas.
                    </li>
                    <li>
                      <strong>Quem pode acionar o fluxo:</strong> Selecione{' '}
                      <code className="text-purple-300 font-mono">"Qualquer pessoa" (Anyone)</code> para que a aplicação possa enviar o POST diretamente via Webhook.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  <span>Ir para o Passo 3</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Passo 3.1: Adicionar a Ação do Microsoft Teams
                </h4>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Abaixo do gatilho HTTP, clique em <strong className="text-white">+ Nova etapa (+ New step)</strong> e adicione a ação de postagem oficial da Microsoft:
                </p>

                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200">
                  <div className="font-bold text-sm text-purple-300 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    Ação recomendada no Teams:
                  </div>
                  <div>
                    Buscar por: <strong className="text-white">Microsoft Teams</strong>
                  </div>
                  <div>
                    Ação:{' '}
                    <strong className="text-emerald-300">
                      "Postar cartão adaptável em um canal ou chat" (Post adaptive card in a chat or channel)
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5 text-xs text-zinc-300">
                  <div className="font-bold text-white">Configurações dos campos da ação:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-400 font-semibold block">Postar como (Post as):</span>
                      <strong className="text-purple-300">Flow bot (para Canal) ou Usuário (para Chat em Grupo)</strong>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">⚠️ Em chats em grupo, use "Usuário" para evitar bloqueios de permissão do bot</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-400 font-semibold block">Postar em (Post in):</span>
                      <strong className="text-purple-300">Channel (Canal) ou Group chat (Chat em grupo)</strong>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">Selecione o tipo de destino desejado</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-400 font-semibold block">Se escolheu Canal (Channel):</span>
                      <strong className="text-white">Selecione Equipe (Team) e Canal (Channel)</strong>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">Ex: Equipe "TI Geral", Canal "Avisos"</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-400 font-semibold block">Se escolheu Chat em Grupo (Group chat):</span>
                      <strong className="text-emerald-400">Selecione o Grupo no dropdown "Group chat"</strong>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">Aparecerão as conversas em grupo existentes</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 space-y-1.5">
                  <div className="font-bold text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Dica Especial para Chat em Grupo (Group Chat):
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    No Microsoft Teams, o <strong>Flow bot</strong> é bloqueado em conversas privadas em grupo se o aplicativo Power Automate não tiver sido adicionado previamente ao chat.
                    <br />
                    Para funcionar imediatamente no grupo, basta alterar o campo <strong className="text-white">"Postar como" (Post as)</strong> para <strong className="text-emerald-300">"Usuário" (User)</strong>. Dessa forma, a mensagem será postada com a sua conta corporativa que já tem acesso ao grupo!
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
                    Não selecione <em>"Atualizar um cartão adaptável"</em> (essa ação é apenas para editar mensagens que já foram enviadas anteriormente e exige um ID de mensagem, gerando o erro <strong>400 Bad Request - Error in query syntax</strong> se não encontrar a mensagem).
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  <span>Ir para o Passo 4</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Passo 4.1: Preencher o Campo "Cartão Adaptável" (Adaptive Card)
                </h4>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  No campo <strong className="text-white">"Cartão Adaptável" (Adaptive Card)</strong> da ação do Teams, você deve inserir o objeto JSON gerado pelo nosso aplicativo. Como nosso app já envia o Adaptive Card 100% formatado e validado, você só precisa passar a expressão dinâmica:
                </p>

                {/* Expression box */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">
                      Expressão Power Automate para o Cartão:
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard("@{triggerBody()?['adaptiveCardJson']}", 'exprAdaptiveCard')
                      }
                      className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300"
                    >
                      {copiedKey === 'exprAdaptiveCard' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'exprAdaptiveCard' ? 'Copiado!' : 'Copiar Expressão'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 font-mono text-sm text-emerald-400 select-all border border-zinc-800">
                    @{`{triggerBody()?['adaptiveCardJson']}`}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Clique na aba <strong>"Expressão" (Expression)</strong> ao lado de Conteúdo Dinâmico no Power Automate e cole o texto acima.
                  </p>
                </div>

                {/* Mentions helper */}
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Como funcionam as Menções de Colaboradores (@mentions)?
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    A lista de e-mails corporativos dos colaboradores marcados é enviada no campo{' '}
                    <code className="text-purple-300 font-mono">triggerBody()?['mentions']</code>.
                    Se desejar marcar colaboradores no canal, você pode adicionar a ação{' '}
                    <strong className="text-white">"Obter token de menção @mention para um usuário"</strong> do conector do Teams antes da postagem.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setActiveStep(5)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  <span>Ir para o Passo 5</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {activeStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-purple-400" />
                  Passo 5.1: Salvar o Fluxo e Obter a URL HTTP POST
                </h4>

                <ol className="space-y-3 text-xs text-zinc-300 list-decimal list-inside leading-relaxed">
                  <li>
                    No canto superior direito da tela do Power Automate, clique no botão{' '}
                    <strong className="text-white">"Salvar" (Save)</strong>.
                  </li>
                  <li>
                    Clique novamente no primeiro bloco do fluxo ({' '}
                    <strong className="text-purple-300">"Quando uma solicitação HTTP é recebida"</strong>).
                  </li>
                  <li>
                    Observe que o campo <strong className="text-emerald-400">"URL HTTP POST"</strong> agora foi preenchido pela Microsoft com um endereço único similar a:
                    <div className="my-2 p-2.5 rounded-lg bg-zinc-900 font-mono text-[11px] text-zinc-400 truncate border border-zinc-800">
                      https://prod-15.brazilsouth.logic.azure.com:443/workflows/93a0.../triggers/manual/paths/invoke?...
                    </div>
                  </li>
                  <li>
                    Clique no botão de <strong className="text-white">Copiar URL</strong> ao lado desse campo no Power Automate.
                  </li>
                </ol>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    Essa URL é o endpoint exclusivo do seu fluxo. Com ela em mãos, você está pronto para conectá-la ao Teams Communicator!
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setActiveStep(6)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  <span>Ir para o Passo 6 (Final)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {activeStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Passo 6.1: Cadastrar o Canal no Teams Communicator
                </h4>

                <ol className="space-y-2.5 text-xs text-zinc-300 list-decimal list-inside leading-relaxed">
                  <li>
                    No menu lateral do aplicativo, vá até a aba <strong className="text-white">"Canais & Webhooks"</strong>.
                  </li>
                  <li>
                    Clique no botão <strong className="text-purple-300">+ Novo Canal / Webhook</strong>.
                  </li>
                  <li>
                    Em <strong className="text-white">Tipo de Integração</strong>, selecione:{' '}
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      Power Automate Flow (HTTP)
                    </span>.
                  </li>
                  <li>
                    Cole a URL do Power Automate no campo <strong className="text-white">"URL do Webhook / Endpoint HTTP"</strong>.
                  </li>
                  <li>
                    Salve o canal e clique em <strong className="text-emerald-400">"Testar Ping"</strong> para verificar a comunicação imediata com status 200/202!
                  </li>
                </ol>

                {/* Direct payload copy */}
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300">Payload de Exemplo enviado pelo app:</span>
                    <button
                      onClick={() =>
                        copyToClipboard(JSON.stringify(samplePayload, null, 2), 'samplePayloadTest')
                      }
                      className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'samplePayloadTest' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'samplePayloadTest' ? 'Copiado!' : 'Copiar Payload'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-[10px] text-zinc-400 max-h-36 overflow-y-auto">
                    {JSON.stringify(samplePayload, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveStep(5)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
                >
                  Voltar
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25"
                >
                  <Check className="w-4 h-4" />
                  <span>Concluir e Fechar Guia</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compatível com Microsoft Teams v1.4+ e Power Automate Cloud</span>
          </div>
          <a
            href="https://learn.microsoft.com/pt-br/power-automate/get-started"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-purple-300 inline-flex items-center gap-1 transition"
          >
            Documentação Microsoft <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
