import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  Trash2,
  Share2,
  Sparkles,
  Copy,
  Check,
  Tag,
  User,
} from 'lucide-react';
import { ShoppingItem, Language, Currency, FamilyMember } from '../types';
import { t } from '../utils/translations';

interface ShoppingListViewProps {
  shoppingItems: ShoppingItem[];
  familyMembers: FamilyMember[];
  language: Language;
  currency: Currency;
  onToggleShoppingItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isBought'>) => void;
  onApplyTemplate: (items: Array<Omit<ShoppingItem, 'id' | 'isBought'>>) => void;
  onClearBought: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingItems,
  familyMembers,
  language,
  currency,
  onToggleShoppingItem,
  onDeleteItem,
  onAddItem,
  onApplyTemplate,
  onClearBought,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pantry');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [assignedTo, setAssignedTo] = useState(familyMembers[0]?.id || '');

  const pendingItems = shoppingItems.filter((i) => !i.isBought);
  const boughtItems = shoppingItems.filter((i) => i.isBought);

  const totalEstPending = pendingItems.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);
  const totalEstAll = shoppingItems.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);

  const filteredItems = shoppingItems.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      category,
      quantity,
      unit,
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      assignedTo,
    });

    setName('');
    setEstimatedPrice('');
    setShowAddModal(false);
  };

  const copyShoppingList = () => {
    const lines = [
      `🛒 DayMate AI — ${language === 'bn' ? 'বাজারের ফর্দ' : 'Household Shopping List'}:`,
      ...pendingItems.map((i) => `• [ ] ${i.name} (${i.quantity} ${i.unit || ''}) ${i.estimatedPrice ? `~${currency}${i.estimatedPrice}` : ''}`),
      `\nTotal Estimated: ${currency}${totalEstPending.toLocaleString()}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `🛒 DayMate Shopping List:\n` +
      pendingItems.map((i) => `• ${i.name} (${i.quantity} ${i.unit || ''})`).join('\n') +
      `\nEst: ${currency}${totalEstPending}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Templates
  const dhakaBazarTemplate = [
    { name: 'Miniket Rice (চিনিকুড়া / মিনিকেট চাল)', category: 'Pantry', quantity: '5', unit: 'kg', estimatedPrice: 420 },
    { name: 'Mustard Oil (খাঁটি সরিষার তেল)', category: 'Pantry', quantity: '1', unit: 'liter', estimatedPrice: 280 },
    { name: 'Fresh Rui / Hilsa Fish (তাজা রুই মাছ)', category: 'Meat/Fish', quantity: '1.5', unit: 'kg', estimatedPrice: 750 },
    { name: 'Onions & Potatoes (দেশি পেঁয়াজ ও আলু)', category: 'Produce', quantity: '3', unit: 'kg', estimatedPrice: 210 },
    { name: 'Green Chillies & Coriander (কাঁচা মরিচ ও ধনেপাতা)', category: 'Produce', quantity: '1', unit: 'pack', estimatedPrice: 60 },
  ];

  const ramadanTemplate = [
    { name: 'Premium Maryam Dates (মরিয়ম খেজুর)', category: 'Pantry', quantity: '1', unit: 'kg', estimatedPrice: 650 },
    { name: 'Chickpeas / Chola (ছোলা বুট)', category: 'Pantry', quantity: '2', unit: 'kg', estimatedPrice: 220 },
    { name: 'Besan / Gram Flour (বেসন)', category: 'Pantry', quantity: '1', unit: 'kg', estimatedPrice: 130 },
    { name: 'Rooh Afza / Tang (রুহ আফজা)', category: 'Pantry', quantity: '1', unit: 'bottle', estimatedPrice: 320 },
    { name: 'Puffed Rice / Muri (মুড়ি)', category: 'Snacks', quantity: '1', unit: 'kg', estimatedPrice: 90 },
  ];

  const breakfastTemplate = [
    { name: 'Farm Brown Eggs (ডিম)', category: 'Dairy', quantity: '1', unit: 'dozen', estimatedPrice: 155 },
    { name: 'Whole Wheat Bread (হোল হুইট রুটি)', category: 'Pantry', quantity: '1', unit: 'pack', estimatedPrice: 90 },
    { name: 'Fresh Cow Milk (মিল্কভিটা / আড়ং দুধ)', category: 'Dairy', quantity: '2', unit: 'liters', estimatedPrice: 180 },
    { name: 'Ispahani Mirzapore Tea (চা পাতা)', category: 'Pantry', quantity: '400', unit: 'g', estimatedPrice: 210 },
    { name: 'Sagar Bananas (সাগর কলা)', category: 'Produce', quantity: '1', unit: 'dozen', estimatedPrice: 120 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            {t('shopping', language)}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'মুদি সদাই ও বাজারের ফর্দ তৈরি করুন, পরিবারের সদস্যদের কাজ ভাগ করে দিন'
              : 'Collaborative grocery manager with cost estimation and family task sharing'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyShoppingList}
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="Copy formatted list"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={shareViaWhatsApp}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            title="Share to WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addItem', language)}</span>
          </button>
        </div>
      </div>

      {/* Quick Template Presets Bar */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
          <Sparkles className="w-4 h-4" />
          <span>{language === 'bn' ? '১-ক্লিকে বাজারের টেমপ্লেট যোগ করুন:' : '1-Click Regional Grocery Templates:'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => onApplyTemplate(dhakaBazarTemplate)}
            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 text-left hover:border-amber-400 hover:shadow-sm transition-all"
          >
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              {t('marketDhaka', language)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Rice, mustard oil, fish, onions, coriander (~৳1,720)
            </div>
          </button>

          <button
            onClick={() => onApplyTemplate(ramadanTemplate)}
            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 text-left hover:border-amber-400 hover:shadow-sm transition-all"
          >
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              {t('marketRamadan', language)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Dates, Chola, Besan, Rooh Afza, Muri (~৳1,410)
            </div>
          </button>

          <button
            onClick={() => onApplyTemplate(breakfastTemplate)}
            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 text-left hover:border-amber-400 hover:shadow-sm transition-all"
          >
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              {t('marketQuick', language)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Eggs, bread, milk, tea leaves, bananas (~৳755)
            </div>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-400">
            Pending: <strong className="text-amber-600 dark:text-amber-400">{pendingItems.length}</strong> items
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            Purchased: <strong className="text-emerald-600 dark:text-emerald-400">{boughtItems.length}</strong> items
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            Est. Cost: <strong className="text-slate-900 dark:text-white">{currency}{totalEstPending.toLocaleString()}</strong>
          </span>
        </div>

        {boughtItems.length > 0 && (
          <button
            onClick={onClearBought}
            className="text-xs text-slate-500 hover:text-rose-600 underline font-medium"
          >
            Clear Purchased ({boughtItems.length})
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const assignedUser = familyMembers.find((m) => m.id === item.assignedTo);
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.isBought
                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleShoppingItem(item.id)}
                  className="text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {item.isBought ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-slate-400 dark:border-slate-600 hover:border-emerald-500" />
                  )}
                </button>

                <div>
                  <h4
                    className={`font-bold text-sm md:text-base ${
                      item.isBought
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                      {item.category}
                    </span>
                    <span>
                      Qty: {item.quantity} {item.unit || ''}
                    </span>
                    {assignedUser && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <User className="w-3 h-3" /> {assignedUser.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.estimatedPrice && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      ~{currency}{item.estimatedPrice}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <ShoppingCart className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Shopping list is empty
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Select one of the regional templates above or add items using voice!
            </p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                {t('addItem', language)}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Miniket Rice, Beef, Mustard Oil"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Produce">Produce & Vegetables</option>
                    <option value="Pantry">Pantry & Grains</option>
                    <option value="Dairy">Dairy & Eggs</option>
                    <option value="Meat/Fish">Meat & Fish</option>
                    <option value="Household">Household & Cleaning</option>
                    <option value="Snacks">Snacks & Beverages</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Price ({currency})
                  </label>
                  <input
                    type="number"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 1, 2.5, 12"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="dozen">dozen</option>
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                    <option value="grams">grams</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Household Member
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 shadow-md shadow-amber-500/20"
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
