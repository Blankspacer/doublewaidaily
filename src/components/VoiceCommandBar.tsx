import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Volume2, Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, Currency, ParsedCommandResult } from '../types';
import { t } from '../utils/translations';

interface VoiceCommandBarProps {
  language: Language;
  currency: Currency;
  onApplyParsedResult: (result: ParsedCommandResult) => void;
}

export const VoiceCommandBar: React.FC<VoiceCommandBarProps> = ({
  language,
  currency,
  onApplyParsedResult,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ParsedCommandResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(language === 'bn' ? 'মাইক্রোফোন পারমিশন দিন।' : 'Microphone permission denied.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError(t('speechNotSupported', language));
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        recognitionRef.current.start();
      } catch (err: any) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  const handleExecuteCommand = async (commandToRun?: string) => {
    const textToExecute = (commandToRun || inputText).trim();
    if (!textToExecute) return;

    setIsProcessing(true);
    setSpeechError(null);

    try {
      const response = await fetch('/api/parse-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: textToExecute,
          language,
          currentDate: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data && data.success) {
        setLastResult(data);
        onApplyParsedResult(data);

        // Confetti burst for magic USP experience
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.2 },
          });
        } catch {
          // ignore
        }

        // Voice readout feedback
        if ('speechSynthesis' in window && data.aiSummary) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(data.aiSummary);
            utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
            utterance.rate = 1.0;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
          } catch {
            // speech synthesis optional
          }
        }
      } else {
        setSpeechError(data?.error || 'Could not process command.');
      }
    } catch (err: any) {
      setSpeechError('Network error connecting to DayMate AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 md:p-7 shadow-xl shadow-emerald-950/20 border border-emerald-500/20 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header tag */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                DayMate Unified AI Assistant
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Multi-Intent
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                {language === 'bn'
                  ? 'একসাথে খরচ, রিমাইন্ডার এবং বাজার তালিকা নির্দেশ করুন'
                  : 'Speak or type multiple life activities in one sentence'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300">
              Default Currency: <strong className="text-emerald-400">{currency} BDT</strong>
            </span>
          </div>
        </div>

        {/* Input Bar with Voice Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/70 p-2 rounded-2xl border border-slate-700/60 shadow-inner">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  handleExecuteCommand();
                }
              }}
              placeholder={t('voiceCommandPlaceholder', language)}
              className="w-full bg-transparent text-white placeholder-slate-400 text-sm md:text-base px-3 py-2.5 outline-none font-medium"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="text-slate-400 hover:text-white p-1 mr-2"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse-mic'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
              }`}
              title={isListening ? t('stopVoice', language) : t('startVoice', language)}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span className="text-xs animate-pulse">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span className="hidden md:inline text-xs">{t('startVoice', language)}</span>
                </>
              )}
            </button>

            {/* Execute Button */}
            <button
              type="button"
              disabled={isProcessing || !inputText.trim()}
              onClick={() => handleExecuteCommand()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Execute</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Listening wave banner */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 py-2 px-4 rounded-xl animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('listeningPrompt', language)}</span>
          </div>
        )}

        {/* Error message */}
        {speechError && (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/50 border border-rose-800/40 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Preset Prompt Badges - Killer USP Showcase */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300/90 uppercase tracking-wider">
              {t('quickPresetsTitle', language)}
            </span>
            <span className="text-[11px] text-slate-400">Click to execute multi-intent test</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[
              {
                text: t('preset1', language),
                label: language === 'bn' ? '🛒 বাজার + ⏰ বিল + 📝 ফর্দ' : '🛒 Grocery + ⏰ Bill + 📝 List',
              },
              {
                text: t('preset2', language),
                label: language === 'bn' ? '🩺 ডাক্তার + 💊 ঔষধ + 🍎 ফল' : '🩺 Doctor + 💊 Meds + 🍎 Apples',
              },
              {
                text: t('preset3', language),
                label: language === 'bn' ? '🚗 উবার + 🎂 জন্মদিন + 📄 ওয়ারেন্টি' : '🚗 Ride + 🎂 Birthday + 📄 Vault',
              },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(preset.text);
                  handleExecuteCommand(preset.text);
                }}
                className="text-left group relative bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/50 p-2.5 rounded-xl transition-all cursor-pointer"
              >
                <div className="text-[11px] font-bold text-emerald-400 mb-0.5">{preset.label}</div>
                <div className="text-xs text-slate-300 line-clamp-2 group-hover:text-white">
                  "{preset.text}"
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Last Executed Result Confirmation Panel */}
        {lastResult && (
          <div className="mt-4 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl p-4 shadow-lg transition-all animate-in fade-in">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <h4 className="font-bold text-sm text-emerald-100">
                  {lastResult.aiSummary || 'Executed successfully!'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {lastResult.aiSummary && (
                  <button
                    type="button"
                    onClick={() => speakText(lastResult.aiSummary)}
                    className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 transition-colors"
                    title="Read aloud"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-300 animate-pulse' : ''}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLastResult(null)}
                  className="p-1 rounded-lg hover:bg-emerald-900/40 text-emerald-300"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Extracted action cards summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              {lastResult.expenses && lastResult.expenses.length > 0 && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-600/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Expense Recorded</span>
                  <div className="font-semibold text-white mt-0.5">
                    {lastResult.expenses[0].currency || '৳'}{lastResult.expenses[0].amount}
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    {lastResult.expenses[0].note}
                  </div>
                </div>
              )}

              {lastResult.reminders && lastResult.reminders.length > 0 && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-indigo-600/30">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Reminder Scheduled</span>
                  <div className="font-semibold text-white mt-0.5 truncate">
                    {lastResult.reminders[0].title}
                  </div>
                  <div className="text-[11px] text-indigo-200">
                    Due: {lastResult.reminders[0].dueDate || 'Soon'}
                  </div>
                </div>
              )}

              {lastResult.shoppingItems && lastResult.shoppingItems.length > 0 && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-600/30">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Shopping List Updated</span>
                  <div className="font-semibold text-white mt-0.5 truncate">
                    {lastResult.shoppingItems.map((i) => i.name).join(', ')}
                  </div>
                  <div className="text-[11px] text-amber-200">Added to Bazar list</div>
                </div>
              )}

              {lastResult.documents && lastResult.documents.length > 0 && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-purple-600/30">
                  <span className="text-[10px] uppercase font-bold text-purple-400">Document Vault</span>
                  <div className="font-semibold text-white mt-0.5 truncate">
                    {lastResult.documents[0].title}
                  </div>
                  <div className="text-[11px] text-purple-200">
                    Expiry: {lastResult.documents[0].renewalDate || 'Stored'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
