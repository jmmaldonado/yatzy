import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dices,
  Hash,
  X,
  Check,
  Ban,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Category, Player } from '../types';
import {
  CATEGORIES,
  calculateCategoryScore,
} from '../utils/yatzyLogic';
import { Die } from './Die';

interface PhysicalScoreModalProps {
  isOpen: boolean;
  category: Category | null;
  player: Player;
  physicalDice: number[];
  onUpdatePhysicalDice: (dice: number[]) => void;
  onClose: () => void;
  onConfirmScore: (category: Category, score: number) => void;
}

export const PhysicalScoreModal: React.FC<PhysicalScoreModalProps> = ({
  isOpen,
  category,
  player,
  physicalDice,
  onUpdatePhysicalDice,
  onClose,
  onConfirmScore,
}) => {
  const [entryMode, setEntryMode] = useState<'dice' | 'direct'>('dice');
  const [manualScore, setManualScore] = useState<number>(0);
  const [activeDieIndex, setActiveDieIndex] = useState<number>(0);

  const catInfo = category ? CATEGORIES.find((c) => c.id === category) : null;

  // Whenever modal opens for a category, pre-calculate the score with the current physicalDice
  useEffect(() => {
    if (isOpen && category) {
      const calculated = calculateCategoryScore(category, physicalDice);
      setManualScore(calculated);
      setEntryMode('dice');
      setActiveDieIndex(0);
    }
  }, [isOpen, category]);

  if (!isOpen || !category || !catInfo) return null;

  const calculatedDiceScore = calculateCategoryScore(category, physicalDice);
  const currentScore = entryMode === 'dice' ? calculatedDiceScore : manualScore;

  // Select die on click
  const handleDieClick = (index: number) => {
    setActiveDieIndex(index);
  };

  // Set die value directly
  const handleSetDieValue = (val: number) => {
    const targetIdx = activeDieIndex;
    const updated = [...physicalDice];
    updated[targetIdx] = val;
    onUpdatePhysicalDice(updated);
    setActiveDieIndex((prev) => (prev + 1) % 5);
  };

  // Set all dice to a uniform number
  const handleSetAllDice = (val: number) => {
    onUpdatePhysicalDice([val, val, val, val, val]);
  };

  const handleScratch = () => {
    onConfirmScore(category, 0);
  };

  const handleConfirm = () => {
    onConfirmScore(category, currentScore);
  };

  return (
    <div
      id="physical-score-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        id="physical-score-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden my-auto flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold border border-emerald-500/30 shrink-0">
              {player.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  {catInfo.name}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {catInfo.section === 'upper' ? 'Sección Superior' : 'Sección Inferior'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Anotando para <strong className="text-slate-700 dark:text-slate-200">{player.name}</strong>
              </p>
            </div>
          </div>

          <button
            id="btn-close-physical-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Description Banner with Max Score */}
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 px-5 py-2.5 border-b border-emerald-500/10 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{catInfo.description}</span>
          </div>
          <span className="font-black text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 whitespace-nowrap ml-2">
            Máx: {catInfo.maxScore} pts
          </span>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Method Tabs (Dice Matcher vs Direct Number) */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              id="tab-method-dice"
              type="button"
              onClick={() => setEntryMode('dice')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                entryMode === 'dice'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Dices className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Dados Reales (Sincronizados)</span>
            </button>
            <button
              id="tab-method-direct"
              type="button"
              onClick={() => setEntryMode('direct')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                entryMode === 'direct'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Hash className="w-4 h-4 text-amber-500" />
              <span>Introducción Directa</span>
            </button>
          </div>

          {/* TAB 1: Match 5 Tabletop Dice */}
          {entryMode === 'dice' && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Toca un dado para rotar (1-6) o pulsa un número para fijarlo:
                </span>
              </div>

              {/* 5 Dice Slots */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-1">
                {physicalDice.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`relative transition-all cursor-pointer ${
                        activeDieIndex === idx
                          ? 'scale-110 ring-2 ring-emerald-500 rounded-2xl shadow-lg'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                    >
                      <Die
                        index={idx}
                        value={val}
                        isHeld={false}
                        isRolling={false}
                        onClick={() => handleDieClick(idx)}
                        showHoldLabel={false}
                        size="md"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      D{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Number Selector for selected die & Presets */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {activeDieIndex !== null ? `Fijar Dado #${activeDieIndex + 1}:` : 'Fijar valor:'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Sincronizado con tapete
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSetDieValue(num)}
                      className="py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-colors cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Result Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Puntos Calculados para {catInfo.name}
                  </span>
                  <div className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-0.5">
                    {calculatedDiceScore} <span className="text-sm font-bold text-slate-500">/ {catInfo.maxScore} pts máx.</span>
                  </div>
                </div>

                <div className="text-right">
                  {calculatedDiceScore > 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
                      <Check className="w-3.5 h-3.5" /> Coincidencia Válida
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs">
                      0 Puntos (Tachar)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Score Box */}
          {entryMode === 'direct' && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Introduce o ajusta directamente los puntos para {catInfo.name}:
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setManualScore((prev) => Math.max(0, prev - 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xl flex items-center justify-center cursor-pointer"
                >
                  -
                </button>

                <div className="w-32 text-center">
                  <input
                    id="input-direct-score"
                    type="number"
                    min={0}
                    max={50}
                    value={manualScore}
                    onChange={(e) => setManualScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center py-2 px-3 text-3xl font-black rounded-2xl border-2 border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                    Puntos (Máx: {catInfo.maxScore})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setManualScore((prev) => Math.min(50, prev + 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xl flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Quick preset buttons */}
              <div className="grid grid-cols-5 gap-2">
                {[0, 15, 20, 25, catInfo.maxScore].map((val, idx) => (
                  <button
                    key={`${val}-${idx}`}
                    type="button"
                    onClick={() => setManualScore(val)}
                    className={`py-2 rounded-xl font-extrabold text-xs transition-colors cursor-pointer border ${
                      manualScore === val
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {val} pts
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Scratch (0 pts), Cancel, Confirm (+X pts) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              id="btn-modal-scratch"
              type="button"
              onClick={handleScratch}
              className="px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Tachar casilla con 0 puntos"
            >
              <Ban className="w-4 h-4" />
              <span>Tachar (0 pts)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                id="btn-modal-cancel"
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <motion.button
                id="btn-modal-confirm-score"
                type="button"
                onClick={handleConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar {currentScore} pts</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
