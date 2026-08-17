import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../utils/yatzyLogic';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="rules-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        id="rules-modal-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Classic Yatzy Rules & Scoring
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                15 rounds, 5 dice, 3 rolls per turn
              </p>
            </div>
          </div>

          <button
            id="btn-close-rules"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-sm">
          {/* Game Overview */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              🎯 How the Game Works
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li>Each player takes 15 turns to fill all 15 categories on their scorecard.</li>
              <li>On each turn, you can roll the 5 dice up to <strong>3 times</strong>.</li>
              <li>You may hold/keep any dice between rolls, or release them to re-roll.</li>
              <li>After 3 rolls (or earlier if satisfied), you must choose one open category to score.</li>
              <li>If your roll doesn't meet the category criteria, you record a <strong>0 (scratch)</strong>.</li>
            </ul>
          </div>

          {/* Upper Section & 50-pt Bonus */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Upper Section 50-Point Bonus</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              The Upper Section includes <strong>Ones, Twos, Threes, Fours, Fives, and Sixes</strong>. If the sum of your upper section scores reaches <strong>63 points or higher</strong>, you receive a massive <strong>+50 point bonus</strong>!
            </p>
            <div className="text-xs text-amber-800 dark:text-amber-200 font-semibold mt-1">
              💡 Target Guide: Scoring at least 3 of each number (3×1 + 3×2 + 3×3 + 3×4 + 3×5 + 3×6) equals exactly 63 points.
            </div>
          </div>

          {/* Category Reference Table */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              📊 Category Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {cat.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                      Max: {cat.maxScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.description}</p>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {cat.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            Got it, Let's Play!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
