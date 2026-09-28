import React, { useState } from 'react';
import { HOMEAGLOW_SCRIPT_DATA } from '../data/homeaglowData.ts';
import { X, BookOpen, Search, Copy, Check, ChevronDown, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ScriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptDrawer: React.FC<ScriptDrawerProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredSections = HOMEAGLOW_SCRIPT_DATA.map((section) => {
    if (activeTab !== 'all' && section.id !== activeTab) return null;
    const matchingItems = section.items.filter(
      (item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tip && item.tip.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (matchingItems.length === 0) return null;
    return { ...section, items: matchingItems };
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Homeaglow Call Flow Reference Guide
              </h2>
              <p className="text-xs text-slate-400">
                Official Company Knowledge, Discovery Pillars & Objection Rebuttals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Tabs */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scripts, objections (e.g. membership, spouse, background check)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg transition-colors shrink-0 font-medium ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Sections
            </button>
            <button
              onClick={() => setActiveTab('opening')}
              className={`px-3 py-1 rounded-lg transition-colors shrink-0 font-medium ${
                activeTab === 'opening'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Openings
            </button>
            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-3 py-1 rounded-lg transition-colors shrink-0 font-medium ${
                activeTab === 'discovery'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Discovery
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-3 py-1 rounded-lg transition-colors shrink-0 font-medium ${
                activeTab === 'pricing'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Membership
            </button>
            <button
              onClick={() => setActiveTab('objections')}
              className={`px-3 py-1 rounded-lg transition-colors shrink-0 font-medium ${
                activeTab === 'objections'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Objections
            </button>
            <button
              onClick={() => setActiveTab('closing')}
              className={`px-3 py-1 rounded-lg transition-colors shrink-0 font-medium ${
                activeTab === 'closing'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Closing
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching scripts found for "{searchQuery}".
            </div>
          ) : (
            filteredSections.map((sec) => (
              <div key={sec!.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {sec!.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {sec!.badge}
                  </span>
                </div>

                <div className="space-y-3">
                  {sec!.items.map((item, idx) => {
                    const uniqueId = `${sec!.id}-${idx}`;
                    return (
                      <div
                        key={uniqueId}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors relative group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-200">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(uniqueId, item.text)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-emerald-400"
                            title="Copy script"
                          >
                            {copiedId === uniqueId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <p className="text-xs font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed select-all">
                          {item.text}
                        </p>

                        {item.tip && (
                          <p className="mt-2 text-[11px] text-emerald-400/80 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span>{item.tip}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>Cross-referenced during Phase 4 QA Scoring</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
