import React, { useState } from 'react';
import { Tenant, User } from '../types';
import {
  Settings,
  Building2,
  Sparkles,
  Shield,
  Key,
  Clock,
  Save,
  CheckCircle2,
  HelpCircle,
  Cpu,
  RefreshCw,
  Plus,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  currentTenant: Tenant;
  tenants: Tenant[];
  onSaveTenant: (updated: Tenant) => void;
  onAddTenant: (newTenant: Tenant) => void;
  groqApiKey: string;
  onSaveGroqApiKey: (key: string) => void;
  currentUser: User;
  onResetApp?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTenant,
  tenants,
  onSaveTenant,
  onAddTenant,
  groqApiKey,
  onSaveGroqApiKey,
  currentUser,
  onResetApp,
}) => {
  // Tenant settings
  const [tenantName, setTenantName] = useState(currentTenant.name);
  const [tenantCode, setTenantCode] = useState(currentTenant.code);
  const [timezone, setTimezone] = useState(currentTenant.defaultTimezone);
  const [requireApproval, setRequireApproval] = useState(currentTenant.requireApproval);

  // AI settings
  const [tempGroqKey, setTempGroqKey] = useState(groqApiKey);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [isTestingAI, setIsTestingAI] = useState(false);

  // New Tenant Modal
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantCode, setNewTenantCode] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveTenantSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Tenant = {
      ...currentTenant,
      name: tenantName,
      code: tenantCode,
      defaultTimezone: timezone,
      requireApproval,
    };
    onSaveTenant(updated);
    onSaveGroqApiKey(tempGroqKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim() || !newTenantCode.trim()) return;

    const newT: Tenant = {
      id: `tenant-${Date.now()}`,
      name: newTenantName.trim(),
      code: newTenantCode.trim().toUpperCase(),
      defaultTimezone: timezone,
      requireApproval: true,
      active: true,
    };
    onAddTenant(newT);
    setShowNewTenantModal(false);
    setNewTenantName('');
    setNewTenantCode('');
  };

  const handleTestAI = async () => {
    setIsTestingAI(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'professional',
          text: 'comunicado de teste do teams',
          groqApiKey: tempGroqKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiTestResult(`✅ Conexão bem-sucedida! Provedor: ${data.provider}`);
      } else {
        setAiTestResult(`❌ Falha: ${data.error}`);
      }
    } catch (err: any) {
      setAiTestResult(`❌ Erro de conexão: ${err.message}`);
    } finally {
      setIsTestingAI(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-white">Configurações Gerais & IA</h2>
          <p className="text-xs text-zinc-400">
            Gerenciamento de empresa (multi-tenant), políticas de aprovação e provedores de Inteligência Artificial
          </p>
        </div>

        <button
          onClick={() => setShowNewTenantModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Criar Nova Empresa (Tenant)</span>
        </button>
      </div>

      <form onSubmit={handleSaveTenantSettings} className="space-y-6">
        {/* Tenant Settings */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Configuração do Tenant Atual: {currentTenant.name}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome da Empresa / Organização:
              </label>
              <input
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Código Identificador (Sigla):
              </label>
              <input
                type="text"
                required
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Fuso Horário Padrão dos Agendamentos:
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo (Horário de Brasília UTC-3)</option>
                <option value="America/New_York">America/New_York (EST UTC-5)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="Europe/London">Europe/London (GMT UTC+0)</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Fluxo de Governança & Aprovação:
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-zinc-200">
                  Exigir aprovação de Administrador antes do disparo de comunicados criados por Editores
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* AI Assistant Settings */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Configuração do Assistente de IA</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
              DUAL ENGINE
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            O aplicativo possui o modelo <strong className="text-white">Google Gemini 3.8 Flash</strong> integrado nativamente no backend. Você também pode informar sua chave própria da <strong className="text-white">Groq API (Llama 3.3 70B)</strong>:
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">
              Chave de API Groq (Opcional - Llama 3.3 70B Versatile):
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={tempGroqKey}
                onChange={(e) => setTempGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleTestAI}
                disabled={isTestingAI}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5"
              >
                {isTestingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5 text-indigo-400" />}
                <span>Testar IA</span>
              </button>
            </div>
            <p className="text-[10px] text-zinc-500">
              Deixe em branco para usar o Gemini 3.8 Flash nativo integrado ao projeto.
            </p>

            {aiTestResult && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300">
                {aiTestResult}
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone: Zerar o App e Começar do Zero */}
        {onResetApp && (
          <div className="p-5 rounded-2xl bg-zinc-900 border border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Zona de Redefinição de Dados</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                AÇÃO DESTRUTIVA
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Deseja limpar todo o histórico, rascunhos, agendamentos e canais para configurar a aplicação do zero em um estado limpo?
            </p>

            <div className="pt-1 flex items-center justify-start">
              <button
                type="button"
                onClick={onResetApp}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs font-bold transition shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Zerar o APP e Começar do Zero</span>
              </button>
            </div>
          </div>
        )}

        {/* Save button bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs text-zinc-400">
            {savedSuccess && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Configurações salvas com sucesso!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5FC7] to-indigo-600 hover:from-[#6E72D6] hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>

      {/* New Tenant Modal */}
      {showNewTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Criar Nova Empresa / Tenant</h3>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome da Empresa:
                </label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  placeholder="Ex: Filial Regional Sul"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Sigla do Tenant:
                </label>
                <input
                  type="text"
                  required
                  value={newTenantCode}
                  onChange={(e) => setNewTenantCode(e.target.value)}
                  placeholder="Ex: CORP-SP"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white uppercase font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTenantModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Cadastrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
