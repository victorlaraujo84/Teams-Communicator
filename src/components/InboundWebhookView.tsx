import React, { useState, useEffect } from 'react';
import { Tenant, Channel } from '../types';
import {
  Webhook,
  Send,
  Copy,
  Check,
  Code2,
  Terminal,
  Play,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Cpu,
  Bookmark,
  FileJson,
  Zap,
  Shield,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

interface InboundWebhookViewProps {
  currentTenant: Tenant;
  channels: Channel[];
}

export const InboundWebhookView: React.FC<InboundWebhookViewProps> = ({
  currentTenant,
  channels,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiKey] = useState(`tc_sec_${currentTenant.code.toLowerCase()}_94821a3bf92`);

  // Target Channel selection (either 'default' or a specific channelId)
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    channels.find((c) => c.isDefaultInbound)?.id || channels[0]?.id || 'default'
  );

  // Active code snippet tab: 'curl' | 'python' | 'nodejs' | 'csharp' | 'powerautomate'
  const [activeSnippetTab, setActiveSnippetTab] = useState<'curl' | 'python' | 'nodejs' | 'csharp' | 'powerautomate'>('curl');

  // Interactive Simulator Form State
  const [simTitle, setSimTitle] = useState('🚨 [ALERTA INFRA] Falha Crítica de Conectividade - Link Primário');
  const [simBody, setSimBody] = useState(
    'Identificamos uma interrupção no link de fibra dedicado. Os serviços essenciais foram migrados com sucesso para o canal de contingência redundante.'
  );
  const [simPriority, setSimPriority] = useState<'info' | 'warning' | 'critical'>('critical');
  const [simCategory, setSimCategory] = useState('TI & Infra');
  const [simTemplateId, setSimTemplateId] = useState('tmpl-maintenance');
  const [simSenderName, setSimSenderName] = useState('Monitoramento NOC Corporativo');
  const [simMentions, setSimMentions] = useState('devops@empresa.com, infra@empresa.com');
  const [simActionTitle, setSimActionTitle] = useState('Ver Painel Grafana / Status');
  const [simActionUrl, setSimActionUrl] = useState('https://status.empresa.com');

  // Simulation execution
  const [simLoading, setSimLoading] = useState(false);
  const [simResponse, setSimResponse] = useState<any>(null);

  // Inbound Webhook History list
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const isTargetingChannelDirectly = Boolean(selectedChannel && selectedChannelId !== 'default');
  
  // Specific dedicated channel URL vs Global endpoint
  const targetSlugOrId = selectedChannel?.inboundSlug || selectedChannel?.id || 'canal';
  const channelDedicatedUrl = `${window.location.origin}/api/v1/inbound/channel/${targetSlugOrId}`;
  const globalEndpointUrl = `${window.location.origin}/api/v1/communicados/incoming`;
  
  const currentActiveUrl = isTargetingChannelDirectly ? channelDedicatedUrl : globalEndpointUrl;

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/v1/communicados/incoming/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteSimulation = async () => {
    setSimLoading(true);
    setSimResponse(null);

    const payload = {
      title: simTitle.trim(),
      body: simBody.trim(),
      priority: simPriority,
      category: simCategory,
      templateId: simTemplateId || undefined,
      senderName: simSenderName.trim(),
      mentions: simMentions
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      actionButtons: simActionTitle && simActionUrl ? [{ title: simActionTitle.trim(), url: simActionUrl.trim() }] : [],
      metadata: {
        dispatchedFromSimulator: true,
        channelTargeted: selectedChannel?.name || 'Padrão',
      },
    };

    try {
      const res = await fetch(currentActiveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSimResponse(data);
      fetchHistory();
    } catch (err: any) {
      setSimResponse({
        success: false,
        error: `Erro ao enviar requisição: ${err.message}`,
      });
    } finally {
      setSimLoading(false);
    }
  };

  // Code snippets
  const curlSnippet = `curl -X POST "${currentActiveUrl}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "${simTitle.replace(/"/g, '\\"')}",
    "body": "${simBody.replace(/"/g, '\\"')}",
    "priority": "${simPriority}",
    "category": "${simCategory}",
    "templateId": "${simTemplateId}",
    "senderName": "${simSenderName}",
    "mentions": ["ti@empresa.com"],
    "actionButtons": [
      { "title": "${simActionTitle}", "url": "${simActionUrl}" }
    ]
  }'`;

  const pythonSnippet = `import requests

# Rota pré-definida direcionada para: ${selectedChannel?.name || 'Canal Padrão'}
url = "${currentActiveUrl}"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}

payload = {
    "title": "${simTitle.replace(/"/g, '\\"')}",
    "body": "${simBody.replace(/"/g, '\\"')}",
    "priority": "${simPriority}",
    "category": "${simCategory}",
    "templateId": "${simTemplateId}",
    "senderName": "${simSenderName}",
    "mentions": ["ti@empresa.com"],
    "actionButtons": [
        {"title": "${simActionTitle}", "url": "${simActionUrl}"}
    ]
}

response = requests.post(url, json=payload, headers=headers)
print("Status:", response.status_code)
print(response.json())`;

  const nodeSnippet = `// Node.js (fetch / axios)
// Rota pré-definida direcionada para: ${selectedChannel?.name || 'Canal Padrão'}
const res = await fetch("${currentActiveUrl}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "${simTitle.replace(/"/g, '\\"')}",
    body: "${simBody.replace(/"/g, '\\"')}",
    priority: "${simPriority}",
    category: "${simCategory}",
    templateId: "${simTemplateId}",
    senderName: "${simSenderName}",
    mentions: ["ti@empresa.com"],
    actionButtons: [
      { title: "${simActionTitle}", url: "${simActionUrl}" }
    ]
  }),
});

const data = await res.json();
console.log("Resposta Gateway:", data);`;

  const csharpSnippet = `using System.Net.Http;
using System.Text;
using System.Text.Json;

// Rota pré-definida direcionada para: ${selectedChannel?.name || 'Canal Padrão'}
var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer ${apiKey}");

var payload = new
{
    title = "${simTitle.replace(/"/g, '\\"')}",
    body = "${simBody.replace(/"/g, '\\"')}",
    priority = "${simPriority}",
    templateId = "${simTemplateId}",
    senderName = "${simSenderName}"
};

var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
var response = await client.PostAsync("${currentActiveUrl}", content);
var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`;

  const powerAutomateSnippet = `// No Power Automate (Ação HTTP):
// Método: POST
// URI: ${currentActiveUrl}
// Headers:
//   Authorization: Bearer ${apiKey}
//   Content-Type: application/json
// Body:
{
  "title": "@{triggerOutputs()?['body/Subject']}",
  "body": "@{triggerOutputs()?['body/Body']}",
  "priority": "warning",
  "templateId": "${simTemplateId}",
  "senderName": "Power Automate Gateway"
}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                <Webhook className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Gateway de Entrada com Roteamento Pré-Definido</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ROTAS DEDICADAS ATIVAS
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Sistemas externos não precisam conhecer URLs de Teams. Eles apenas enviam JSON para o <strong>endpoint fixo do canal</strong> ou endpoint global, e a aplicação cuida da formatação de template e da política de entrega (<strong>Disparo Direto</strong> ou <strong>Fila de Aprovação</strong>).
            </p>
          </div>

          {/* Quick Endpoint URL Card */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 space-y-1.5 min-w-[280px]">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold gap-3">
              <span className="flex items-center gap-1 text-white">
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                URL Ativa para Envio:
              </span>
              <button
                onClick={() => copyToClipboard(currentActiveUrl, 'activeUrl')}
                className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold flex items-center gap-1"
              >
                {copiedKey === 'activeUrl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'activeUrl' ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
            <div className="font-mono text-[11px] text-indigo-300 truncate max-w-xs select-all">
              {currentActiveUrl}
            </div>
            <div className="text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Canal: {selectedChannel?.name || 'Padrão'}</span>
              <span className={selectedChannel?.inboundDeliveryMode === 'approval' ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                {selectedChannel?.inboundDeliveryMode === 'approval' ? '🛡️ Fila Aprovação' : '🚀 Disparo Direto'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Resumo de Canais Pré-Definidos */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Canais Pré-Configurados com Endpoints Fixos</h3>
          </div>
          <span className="text-xs text-zinc-400">
            Selecione um canal para gerar o código e testar no simulador
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {channels.map((ch) => {
            const isSelected = selectedChannelId === ch.id;
            const dedicatedPath = `/api/v1/inbound/channel/${ch.inboundSlug || ch.id}`;

            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-600/10'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-white truncate">{ch.name}</span>
                    {ch.isDefaultInbound && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                        PADRÃO
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-zinc-400 truncate">
                    {ch.department}
                  </div>
                </div>

                <div className="p-2 rounded bg-zinc-900/90 border border-zinc-850 font-mono text-[10px] text-indigo-300 truncate">
                  {dedicatedPath}
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-zinc-850">
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      ch.inboundDeliveryMode === 'approval' ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {ch.inboundDeliveryMode === 'approval' ? (
                      <>
                        <Shield className="w-3 h-3" /> Fila Aprovação
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" /> Disparo Direto
                      </>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const full = `${window.location.origin}${dedicatedPath}`;
                      copyToClipboard(full, `card_${ch.id}`);
                    }}
                    className="text-zinc-400 hover:text-white flex items-center gap-1"
                    title="Copiar endpoint completo"
                  >
                    {copiedKey === `card_${ch.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === `card_${ch.id}` ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: 1. Live Simulator Form | 2. Code Snippets & Adaptive Card Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (Form simulator) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Simulador de Inbound Webhook</h3>
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-1">
              <span>Destino:</span>
              <strong className="text-white">{selectedChannel?.name || 'Canal'}</strong>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Canal Pré-Definido de Destino:</label>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium"
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} — {ch.inboundDeliveryMode === 'approval' ? '🛡️ Fila de Aprovação' : '🚀 Disparo Direto'} {ch.isDefaultInbound ? '(PADRÃO)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-500 mt-1">
                A requisição será postada diretamente para a rota do canal selecionado:{' '}
                <code className="text-indigo-300 font-mono">{currentActiveUrl}</code>
              </p>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Título do Comunicado:</label>
              <input
                type="text"
                value={simTitle}
                onChange={(e) => setSimTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Corpo da Mensagem (Markdown):</label>
              <textarea
                rows={3}
                value={simBody}
                onChange={(e) => setSimBody(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Prioridade:</label>
                <select
                  value={simPriority}
                  onChange={(e) => setSimPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                >
                  <option value="info">ℹ️ Informativo</option>
                  <option value="warning">⚠️ Atenção</option>
                  <option value="critical">🚨 Urgente / Crítico</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Template Corporativo:</label>
                <select
                  value={simTemplateId}
                  onChange={(e) => setSimTemplateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                >
                  <option value="tmpl-maintenance">⚡ TI & Manutenção de Servidores</option>
                  <option value="tmpl-welcome">🎉 Boas-vindas ao Time (RH)</option>
                  <option value="tmpl-security">🛡️ Alerta de Segurança (CISO)</option>
                  <option value="tmpl-payroll">💰 Comunicado Financeiro / Holerite</option>
                  <option value="">(Sem template pré-definido)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Remetente (Sistema Externo):</label>
                <input
                  type="text"
                  value={simSenderName}
                  onChange={(e) => setSimSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Categoria:</label>
                <input
                  type="text"
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Botão de Ação (Título):</label>
                <input
                  type="text"
                  value={simActionTitle}
                  onChange={(e) => setSimActionTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">URL de Destino:</label>
                <input
                  type="text"
                  value={simActionUrl}
                  onChange={(e) => setSimActionUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <div className="text-[11px] text-zinc-400">
                Política configurada para este canal:{' '}
                <strong className={selectedChannel?.inboundDeliveryMode === 'approval' ? 'text-amber-400' : 'text-emerald-400'}>
                  {selectedChannel?.inboundDeliveryMode === 'approval' ? 'Fila de Aprovação Humana' : 'Disparo Direto no Teams'}
                </strong>
              </div>

              <button
                onClick={handleExecuteSimulation}
                disabled={simLoading || !simTitle.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/25 disabled:opacity-50"
              >
                {simLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{simLoading ? 'Disparando...' : 'Enviar Inbound Webhook'}</span>
              </button>
            </div>
          </div>

          {/* Response output */}
          {simResponse && (
            <div
              className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${
                simResponse.deliveryMode === 'approval'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span
                  className={`flex items-center gap-1.5 ${
                    simResponse.deliveryMode === 'approval' ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {simResponse.deliveryMode === 'approval' ? <Shield className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {simResponse.deliveryMode === 'approval'
                    ? 'Recebido ➔ Encaminhado para Fila de Aprovação (Status: AGUARDANDO_APROVACAO)'
                    : 'Recebido ➔ Disparado Diretamente no Canal Teams (Status: ENVIADO)'}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">{simResponse.durationMs}ms</span>
              </div>
              <p className="text-xs text-zinc-300">{simResponse.message}</p>
              <pre className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 font-mono text-[10px] text-zinc-300 max-h-40 overflow-y-auto leading-relaxed">
                {JSON.stringify(simResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right column: Code Generators & Architecture */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Código de Integração para {selectedChannel?.name || 'Canal'}
                </h3>
              </div>
              <button
                onClick={() => {
                  const snippet =
                    activeSnippetTab === 'curl'
                      ? curlSnippet
                      : activeSnippetTab === 'python'
                      ? pythonSnippet
                      : activeSnippetTab === 'nodejs'
                      ? nodeSnippet
                      : activeSnippetTab === 'csharp'
                      ? csharpSnippet
                      : powerAutomateSnippet;
                  copyToClipboard(snippet, 'codeSnippet');
                }}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
              >
                {copiedKey === 'codeSnippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'codeSnippet' ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>

            {/* Language tabs */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
              {(
                [
                  { id: 'curl', label: 'cURL' },
                  { id: 'python', label: 'Python' },
                  { id: 'nodejs', label: 'Node.js' },
                  { id: 'csharp', label: 'C# / .NET' },
                  { id: 'powerautomate', label: 'Power Automate' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSnippetTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    activeSnippetTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-indigo-300/90 max-h-72 overflow-y-auto leading-relaxed select-all">
              {activeSnippetTab === 'curl' && curlSnippet}
              {activeSnippetTab === 'python' && pythonSnippet}
              {activeSnippetTab === 'nodejs' && nodeSnippet}
              {activeSnippetTab === 'csharp' && csharpSnippet}
              {activeSnippetTab === 'powerautomate' && powerAutomateSnippet}
            </pre>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <strong className="text-white block">🎯 Como funciona o direcionamento pré-definido:</strong>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                <li>
                  <strong>URL Dedicada por Canal:</strong> Ao enviar para <code className="text-indigo-300 font-mono">/api/v1/inbound/channel/{targetSlugOrId}</code>, a mensagem cai automaticamente no canal <strong>{selectedChannel?.name}</strong> sem que a aplicação de origem precise informar o canal no JSON.
                </li>
                <li>
                  <strong>URL Geral:</strong> Ao enviar para <code className="text-indigo-300 font-mono">/api/v1/communicados/incoming</code>, o gateway utiliza o canal marcado como <strong>PADRÃO</strong>.
                </li>
                <li>
                  <strong>Ação Flexível:</strong> Se o canal estiver configurado para <em>Aprovação</em>, o comunicado surge no painel aguardando aprovação dos moderadores. Se estiver para <em>Disparo Direto</em>, é postado na hora no Teams!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* History of Inbound Webhook Calls */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Log de Requisições Recebidas em Tempo Real</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">
              {historyList.length} requisições
            </span>
          </div>

          <button
            onClick={fetchHistory}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {historyList.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
            Nenhuma requisição externa recebida ainda. Selecione um canal acima e clique em "Enviar Inbound Webhook"!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Data/Hora</th>
                  <th className="py-2.5 px-3">Título Recebido</th>
                  <th className="py-2.5 px-3">Canal Direcionado</th>
                  <th className="py-2.5 px-3">Modo Entrega</th>
                  <th className="py-2.5 px-3">Template</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Remetente</th>
                  <th className="py-2.5 px-3">Latência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {historyList.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-850/50 transition">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(item.receivedAt).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-indigo-300">
                        {item.targetChannel?.name || 'Canal Padrão'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {item.deliveryMode === 'approval' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-max">
                          <Shield className="w-3 h-3" /> Fila Aprovação
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <Zap className="w-3 h-3" /> Disparo Direto
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.templateId || 'dynamic'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'ENVIADO'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.status === 'AGUARDANDO_APROVACAO'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 max-w-xs truncate">
                      {item.senderName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                      {item.latencyMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
