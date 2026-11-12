import React, { useState } from 'react';
import { Template, Communicado, ActionButton, Priority } from '../types';
import { TeamsCardPreview } from './TeamsCardPreview';
import {
  Bookmark,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Send,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  ExternalLink,
  Layers,
  X,
  Plus,
  Check,
} from 'lucide-react';

interface TemplateGalleryViewProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
  onSaveCustomTemplate: (template: Template) => void;
  onDeleteCustomTemplate: (templateId: string) => void;
}

export const TemplateGalleryView: React.FC<TemplateGalleryViewProps> = ({
  templates,
  onUseTemplate,
  onSaveCustomTemplate,
  onDeleteCustomTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'CUSTOM' | 'SYSTEM'>('ALL');

  // Preview modal
  const [previewingTemplate, setPreviewingTemplate] = useState<Template | null>(null);

  // Create / Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<Communicado['category']>('Geral');
  const [formPriority, setFormPriority] = useState<Priority>('info');
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formButtons, setFormButtons] = useState<ActionButton[]>([
    {
      id: 'btn-1',
      type: 'Action.OpenUrl',
      title: 'Acessar Link',
      url: 'https://empresa.com',
      style: 'default',
    },
  ]);

  const categories: Communicado['category'][] = [
    'Geral',
    'TI & Infra',
    'RH & Pessoas',
    'Segurança',
    'Benefícios',
    'Eventos',
    'Urgente',
  ];

  // Filtering
  const filteredTemplates = templates.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchBody = t.body.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchBody) return false;
    }
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (sourceFilter === 'CUSTOM' && !t.isCustom) return false;
    if (sourceFilter === 'SYSTEM' && t.isCustom) return false;
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Geral');
    setFormPriority('info');
    setFormBannerUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80');
    setFormBody('Escreva aqui o corpo padrão do template corporativo em **Markdown**...');
    setFormButtons([
      {
        id: `btn-${Date.now()}`,
        type: 'Action.OpenUrl',
        title: 'Acessar Link',
        url: 'https://empresa.com',
        style: 'default',
      },
    ]);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (tmpl: Template) => {
    setEditingTemplate(tmpl);
    setFormTitle(tmpl.title);
    setFormDescription(tmpl.description);
    setFormCategory(tmpl.category);
    setFormPriority(tmpl.priority);
    setFormBannerUrl(tmpl.bannerUrl);
    setFormBody(tmpl.body);
    setFormButtons(tmpl.suggestedButtons || []);
    setIsEditModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const saved: Template = {
      id: editingTemplate ? editingTemplate.id : `tmpl-custom-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim() || 'Template personalizado de comunicado.',
      category: formCategory,
      priority: formPriority,
      bannerUrl: formBannerUrl.trim(),
      body: formBody.trim(),
      suggestedButtons: formButtons,
      isCustom: true,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
    };

    onSaveCustomTemplate(saved);
    setIsEditModalOpen(false);
  };

  const handleDuplicateTemplate = (tmpl: Template) => {
    const dup: Template = {
      ...tmpl,
      id: `tmpl-custom-${Date.now()}`,
      title: `${tmpl.title} (Cópia)`,
      description: `${tmpl.description} (Cópia personalizada)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    onSaveCustomTemplate(dup);
  };

  const handleAddButton = () => {
    setFormButtons([
      ...formButtons,
      {
        id: `btn-${Date.now()}`,
        type: 'Action.OpenUrl',
        title: 'Novo Botão',
        url: 'https://',
        style: 'default',
      },
    ]);
  };

  const handleRemoveButton = (id: string) => {
    setFormButtons(formButtons.filter((b) => b.id !== id));
  };

  const handleUpdateButton = (id: string, field: keyof ActionButton, val: any) => {
    setFormButtons(formButtons.map((b) => (b.id === id ? { ...b, [field]: val } : b)));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#5B5FC7]/20 text-[#7B83EB] flex items-center justify-center border border-[#5B5FC7]/30">
              <Bookmark className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Galeria de Templates de Adaptive Cards</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5B5FC7]/20 text-[#7B83EB]">
              {templates.length} layouts disponíveis
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Salve, reutilize e padronize layouts de comunicados para o Microsoft Teams. Selecione qualquer modelo para criar um comunicado em segundos.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5FC7] to-indigo-600 hover:from-[#6E72D6] hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar Novo Template</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, pauta ou palavras-chave..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-700 text-xs">
          <button
            onClick={() => setSourceFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              sourceFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSourceFilter('CUSTOM')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              sourceFilter === 'CUSTOM' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Personalizados
          </button>
          <button
            onClick={() => setSourceFilter('SYSTEM')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              sourceFilter === 'SYSTEM' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Do Sistema
          </button>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">Todas as Categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Clear filter */}
        {(selectedCategory !== 'ALL' || sourceFilter !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSourceFilter('ALL');
            }}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition flex flex-col justify-between shadow-sm group"
          >
            <div>
              {/* Image Banner */}
              <div className="h-36 w-full relative overflow-hidden bg-zinc-950">
                {tmpl.bannerUrl ? (
                  <img
                    src={tmpl.bannerUrl}
                    alt={tmpl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
                    Sem Banner
                  </div>
                )}
                {/* Priority ribbon badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase backdrop-blur-md shadow-md ${
                      tmpl.priority === 'critical'
                        ? 'bg-red-500/80 text-white'
                        : tmpl.priority === 'warning'
                        ? 'bg-amber-500/80 text-white'
                        : 'bg-indigo-600/80 text-white'
                    }`}
                  >
                    {tmpl.priority === 'critical' ? '🚨 Crítico' : tmpl.priority === 'warning' ? '⚠️ Atenção' : 'ℹ️ Informativo'}
                  </span>
                </div>

                {/* Custom / System badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-zinc-300 backdrop-blur-md border border-white/10">
                    {tmpl.isCustom ? '⭐ Meu Template' : 'Oficial'}
                  </span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    • {tmpl.suggestedButtons?.length || 0} botão(ões)
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition">
                  {tmpl.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>
            </div>

            {/* Actions footer */}
            <div className="p-4 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/60">
              <div className="flex items-center gap-1">
                {/* Preview Button */}
                <button
                  onClick={() => setPreviewingTemplate(tmpl)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  title="Pré-visualizar no Teams"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Duplicate Button */}
                <button
                  onClick={() => handleDuplicateTemplate(tmpl)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  title="Duplicar Template"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Edit & Delete for custom templates */}
                {tmpl.isCustom && (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(tmpl)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                      title="Editar Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCustomTemplate(tmpl.id)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 transition"
                      title="Excluir Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Primary Use Template Button */}
              <button
                onClick={() => onUseTemplate(tmpl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm"
              >
                <Send className="w-3 h-3" />
                <span>Usar Template</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Preview do Template no Teams</span>
                <p className="text-[11px] text-zinc-400">{previewingTemplate.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const t = previewingTemplate;
                    setPreviewingTemplate(null);
                    onUseTemplate(t);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Usar Este Template</span>
                </button>
                <button
                  onClick={() => setPreviewingTemplate(null)}
                  className="text-zinc-400 hover:text-white text-xs font-bold p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <TeamsCardPreview
                communicado={{
                  id: previewingTemplate.id,
                  title: previewingTemplate.title,
                  body: previewingTemplate.body,
                  category: previewingTemplate.category,
                  priority: previewingTemplate.priority,
                  bannerUrl: previewingTemplate.bannerUrl,
                  actionButtons: previewingTemplate.suggestedButtons,
                  mentions: ['todos@empresa.com'],
                  author: {
                    id: 'author-template',
                    name: 'Equipe de Comunicação Corporativa',
                    email: 'comunicados@empresa.com',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Template Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingTemplate ? 'Editar Template Personalizado' : 'Criar Novo Template para a Galeria'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Template:
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: 🚀 Lançamento de Produto / Squad"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição Curta (Objetivo do template):
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Utilizado para anunciar releases, novos recursos e squads."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Categoria:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Prioridade Padrão:
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white"
                  >
                    <option value="info">ℹ️ Informativo</option>
                    <option value="warning">⚠️ Atenção</option>
                    <option value="critical">🚨 Urgente / Crítico</option>
                  </select>
                </div>
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL da Imagem / Banner de Cabeçalho:
                </label>
                <input
                  type="text"
                  value={formBannerUrl}
                  onChange={(e) => setFormBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Markdown Body */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Corpo do Card (Markdown):
                </label>
                <textarea
                  rows={6}
                  required
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Botões Interativos Padrão:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddButton}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar Botão
                  </button>
                </div>

                <div className="space-y-2">
                  {formButtons.map((btn) => (
                    <div key={btn.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={btn.title}
                        onChange={(e) => handleUpdateButton(btn.id, 'title', e.target.value)}
                        placeholder="Rótulo"
                        className="w-1/3 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={btn.url}
                        onChange={(e) => handleUpdateButton(btn.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveButton(btn.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
                >
                  Salvar na Galeria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
