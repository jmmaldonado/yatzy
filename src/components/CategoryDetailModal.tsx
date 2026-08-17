import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, X, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../utils/yatzyLogic';
import { Category } from '../types';

interface CategoryDetailModalProps {
  categoryId: Category | null;
  onClose: () => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  categoryId,
  onClose,
}) => {
  if (!categoryId) return null;

  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  return (
    <div
      id="category-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <motion.div
        id="category-detail-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 w-full max-w-sm"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {category.section === 'upper' ? 'Upper Section' : 'Lower Section'}
            </span>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              {category.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
          {category.description}
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Example Roll:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {category.example}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Max Possible:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {category.maxScore} points
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
        >
          Got it
        </button>
      </motion.div>
    </div>
  );
};
