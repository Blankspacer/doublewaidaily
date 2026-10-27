import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  Download,
  Eye,
  FileCheck,
} from 'lucide-react';
import { DocumentItem, Language } from '../types';
import { t } from '../utils/translations';

interface DocumentOrganizerViewProps {
  documents: DocumentItem[];
  language: Language;
  onAddDocument: (doc: Omit<DocumentItem, 'id'>) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentOrganizerView: React.FC<DocumentOrganizerViewProps> = ({
  documents,
  language,
  onAddDocument,
  onDeleteDocument,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<DocumentItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'bill' | 'receipt' | 'warranty' | 'document' | 'subscription'>('warranty');
  const [provider, setProvider] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [notes, setNotes] = useState('');
  const [important, setImportant] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredDocs = documents.filter((doc) => {
    if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
    return true;
  });

  const getDaysRemaining = (targetDateStr?: string) => {
    if (!targetDateStr) return null;
    const target = new Date(targetDateStr).getTime();
    const today = new Date().getTime();
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddDocument({
      title: title.trim(),
      category,
      provider: provider.trim() || undefined,
      renewalDate: renewalDate || undefined,
      notes: notes.trim() || undefined,
      important,
      fileMockType: 'pdf',
    });

    setTitle('');
    setProvider('');
    setRenewalDate('');
    setNotes('');
    setShowAddModal(false);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'warranty':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'document':
        return 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300';
      case 'receipt':
        return 'text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      default:
        return 'text-purple-700 bg-purple-50 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-500" />
            {t('documents', language)}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'বিল, রসিদ, হোম অ্যাপ্লায়েন্স ওয়ারেন্টি ও গুরুত্বপূর্ণ নথি ডিজিটাল ভল্টে রাখুন'
              : 'Secure digital vault for receipts, home appliance warranties, and renewal reminders'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addDocument', language)}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'warranty', 'document', 'receipt', 'bill', 'subscription'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              filterCategory === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Records' : cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const daysLeft = getDaysRemaining(doc.renewalDate);
          const isExpiringSoon = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
          const isExpired = daysLeft !== null && daysLeft < 0;

          return (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getCategoryBadge(
                      doc.category
                    )}`}
                  >
                    {doc.category}
                  </span>

                  {doc.renewalDate && (
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        isExpired
                          ? 'text-rose-600 dark:text-rose-400'
                          : isExpiringSoon
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {isExpired
                        ? 'Expired'
                        : isExpiringSoon
                        ? `${daysLeft} days left`
                        : `${daysLeft} days`}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                  {doc.title}
                </h3>

                {doc.provider && (
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Issuer: {doc.provider}
                  </p>
                )}

                {doc.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {doc.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  <span>Valid until: {doc.renewalDate || 'Indefinite'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewDoc(doc)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                    title="Preview Record"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No documents found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add appliance warranties or tenancy contracts via the button above.
            </p>
          </div>
        )}
      </div>

      {/* Document Preview Simulator Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Vault Document Viewer
                </h3>
              </div>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Document Certificate Frame */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 bg-slate-50 dark:bg-slate-950 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 mx-auto flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedPreviewDoc.title}
                </h4>
                <p className="text-xs text-slate-500">
                  Category: {selectedPreviewDoc.category.toUpperCase()} • Issuer: {selectedPreviewDoc.provider || 'Verified'}
                </p>
              </div>

              <div className="text-xs text-left bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Renewal / Expiry Date:</span>{' '}
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    {selectedPreviewDoc.renewalDate || 'No expiration set'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Notes & Coverage:</span>{' '}
                  <span>{selectedPreviewDoc.notes || 'Full standard digital certificate.'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Encryption Status:</span>{' '}
                  <span className="text-emerald-600 font-semibold">AES-256 Cloud Stored</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                {t('addDocument', language)}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document / Warranty Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Walton Refrigerator Warranty Card"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="warranty">Warranty Card</option>
                    <option value="receipt">Purchase Receipt</option>
                    <option value="bill">Utility Bill</option>
                    <option value="document">Legal / Tenancy</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issuer / Brand
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g. Singer, Walton, BRTA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expiry / Renewal Date
                </label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 10-year compressor warranty, includes serial #SN-8940"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-white shadow-md shadow-purple-600/20"
                >
                  {t('save', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
