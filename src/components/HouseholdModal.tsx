import React, { useState } from 'react';
import { Users, Plus, Shield, Check, Trash2, Heart } from 'lucide-react';
import { FamilyMember, Language } from '../types';
import { t } from '../utils/translations';

interface HouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  language: Language;
  onAddMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
}

export const HouseholdModal: React.FC<HouseholdModalProps> = ({
  isOpen,
  onClose,
  familyMembers,
  language,
  onAddMember,
  onDeleteMember,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Family Member');

  if (!isOpen) return null;

  const bgColors = [
    'bg-emerald-600',
    'bg-indigo-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-purple-600',
    'bg-cyan-600',
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Member',
      avatarBg: bgColors[Math.floor(Math.random() * bgColors.length)],
    };

    onAddMember(newMember);
    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {t('family', language)} & Household Sharing
              </h3>
              <p className="text-xs text-slate-500">
                Sync shopping lists, bill chores, and reminders across family members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Member cards */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${member.avatarBg} text-white font-extrabold flex items-center justify-center text-sm shadow-sm`}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {member.name}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {member.role}
                  </span>
                </div>
              </div>

              {familyMembers.length > 1 && member.id !== 'm1' && (
                <button
                  type="button"
                  onClick={() => onDeleteMember(member.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Member form or button */}
        {showAddForm ? (
          <form onSubmit={handleAdd} className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Add New Household Member
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                required
                autoFocus
                placeholder="Full Name (e.g. Ayesha)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
              />
              <input
                type="text"
                placeholder="Role (e.g. Sister, Roommate)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold"
              >
                Add Member
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-2xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Household Member</span>
          </button>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
