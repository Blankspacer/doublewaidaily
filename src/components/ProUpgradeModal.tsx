import React, { useState } from 'react';
import { Crown, Sparkles, Check, Zap, Users, Shield, ArrowRight, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { t } from '../utils/translations';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onTrialActivated: () => void;
  isProActive: boolean;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  language,
  onTrialActivated,
  isProActive,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'family' | 'business'>('individual');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleStartTrial = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.3 },
      });
    } catch {
      // ignore
    }

    setSuccessMsg(true);
    setTimeout(() => {
      onTrialActivated();
      setSuccessMsg(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-amber-300 dark:border-amber-500/30 space-y-5 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-2xl shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                DayMate Pro AI
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Life Assistant
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('upgradeModalTitle', language)}
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

        {/* Pricing Plan Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedPlan('individual')}
            className={`py-2 px-3 rounded-xl transition-all ${
              selectedPlan === 'individual'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Individual (৳290/mo)
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlan('family')}
            className={`py-2 px-3 rounded-xl transition-all ${
              selectedPlan === 'family'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Family Plan (৳490/mo)
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlan('business')}
            className={`py-2 px-3 rounded-xl transition-all ${
              selectedPlan === 'business'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Business / Freelance
          </button>
        </div>

        {/* Feature list */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          {[
            {
              title: t('upgradeFeature1', language),
              desc: 'Execute combined sentences with expenses, reminders, and market lists.',
            },
            {
              title: t('upgradeFeature2', language),
              desc: 'Seamless collaborative grocery lists and assigned tasks for all family members.',
            },
            {
              title: t('upgradeFeature3', language),
              desc: 'Automated notification ping before bills expire or doctor visits occur.',
            },
            {
              title: t('upgradeFeature4', language),
              desc: 'Zero-loss document store for warranties, agreements, and purchase receipts.',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Local Payment Badges */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Supported payment methods:</span>
          <div className="flex items-center gap-1.5 font-bold text-[10px]">
            <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-700">bKash</span>
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700">Nagad</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">Cards</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-2">
          {successMsg ? (
            <div className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-center font-bold text-sm animate-pulse">
              🎉 14-Day Pro Trial Activated! Enjoy DayMate Pro.
            </div>
          ) : (
            <button
              onClick={handleStartTrial}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 rounded-2xl font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <span>{isProActive ? 'DayMate Pro is Active' : t('startFreeTrial', language)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <p className="text-center text-[11px] text-slate-400">
            No credit card required for trial. Cancel anytime in 1 click.
          </p>
        </div>
      </div>
    </div>
  );
};
