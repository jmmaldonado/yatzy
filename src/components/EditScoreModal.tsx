import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Ban,
  Trash2,
  ArrowRightLeft,
  Pencil,
  Info,
  Sparkles,
} from 'lucide-react';
import { Category, Player } from '../types';
import { CATEGORIES, getNormalCategoryChips } from '../utils/yatzyLogic';

interface EditScoreModalProps {
  isOpen: boolean;
  player: Player | null;
  category: Category | null;
  currentScore: number;
  onClose: () => void;
  onSaveScore: (playerId: string, category: Category, newScore: number) => void;
  onMoveScore: (playerId: string, fromCategory: Category, toCategory: Category, newScore: number) => void;
  onDeleteScore: (playerId: string, category: Category) => void;
}

export const EditScoreModal: React.FC<EditScoreModalProps> = ({
  isOpen,
  player,
  category,
  currentScore,
  onClose,
  onSaveScore,
  onMoveScore,
  onDeleteScore,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(category);
  const [score, setScore] = useState<number>(currentScore);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && category) {
      setSelectedCategory(category);
      setScore(currentScore);
      setIsMoving(false);
    }
  }, [isOpen, category, currentScore]);

  if (!isOpen || !player || !category) return null;

  const currentCatInfo = CATEGORIES.find((c) => c.id === category);
  const activeCatInfo = CATEGORIES.find((c) => c.id === (selectedCategory || category));

  if (!currentCatInfo || !activeCatInfo) return null;

  // Unscored categories for this player (available destinations for moving)
  const availableCategories = CATEGORIES.filter(
    (c) => c.id === category || player.scores[c.id] === undefined
  );

  const isMoved = selectedCategory !== null && selectedCategory !== category;
  const normalChips = getNormalCategoryChips(activeCatInfo.id);

  const handleSelectCategory = (catId: Category) => {
    setSelectedCategory(catId);
    if (catId !== category) {
      setIsMoving(true);
      // If moving, check if current score fits or pick from target normal chips
      const targetChips = getNormalCategoryChips(catId);
      if (!targetChips.includes(score) && targetChips.length > 0) {
        // Keep current score if valid, else pick first chip
        if (score > activeCatInfo.maxScore) {
          setScore(targetChips[0]);
        }
      }
    } else {
      setIsMoving(false);
    }
  };

  const handleScratch = () => {
    if (isMoved && selectedCategory) {
      onMoveScore(player.id, category, selectedCategory, 0);
    } else {
      onSaveScore(player.id, category, 0);
    }
    onClose();
  };

  const handleDelete = () => {
    onDeleteScore(player.id, category);
    onClose();
  };

  const handleConfirm = () => {
    if (isMoved && selectedCategory) {
      onMoveScore(player.id, category, selectedCategory, score);
    } else {
      onSaveScore(player.id, category, score);
    }
    onClose();
  };

  return (
    <div
      id="edit-score-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        id="edit-score-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden my-auto flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl font-bold border border-amber-500/30 shrink-0">
              {player.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  Modificar Puntuación
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  {currentCatInfo.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jugador: <strong className="text-slate-700 dark:text-slate-200">{player.name}</strong> • Puntuación actual: <strong>{currentScore} pts</strong>
              </p>
            </div>
          </div>

          <button
            id="btn-close-edit-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Category selection: keep or move to another category */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
                <span>Casilla de destino:</span>
              </label>
              {isMoved && (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  Moviendo desde {currentCatInfo.name}
                </span>
              )}
            </div>

            <select
              id="select-edit-category"
              value={selectedCategory || category}
              onChange={(e) => handleSelectCategory(e.target.value as Category)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <optgroup label="Casilla actual">
                <option value={category}>
                  {currentCatInfo.name} ({currentCatInfo.section === 'upper' ? 'Superior' : 'Inferior'})
                </option>
              </optgroup>
              <optgroup label="Mover a otra casilla libre">
                {availableCategories
                  .filter((c) => c.id !== category)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.section === 'upper' ? 'Superior' : 'Inferior'}) — Máx: {c.maxScore} pts
                    </option>
                  ))}
              </optgroup>
            </select>

            {isMoved && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  La casilla <strong>{currentCatInfo.name}</strong> quedará vacía y la puntuación pasará a <strong>{activeCatInfo.name}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Points selector */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Puntos para {activeCatInfo.name}:
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setScore((prev) => Math.max(0, prev - 1))}
                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xl flex items-center justify-center cursor-pointer"
              >
                -
              </button>

              <div className="w-32 text-center">
                <input
                  id="input-edit-score"
                  type="number"
                  min={0}
                  max={50}
                  value={score}
                  onChange={(e) => setScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center py-2 px-3 text-3xl font-black rounded-2xl border-2 border-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                  Puntos (Máx: {activeCatInfo.maxScore})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setScore((prev) => Math.min(50, prev + 1))}
                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xl flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Quick normal category values chips */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                Valores habituales para {activeCatInfo.name}:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {normalChips.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScore(val)}
                    className={`min-w-[52px] py-2 px-3 rounded-xl font-black text-sm transition-all cursor-pointer border ${
                      score === val
                        ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/30 scale-105 ring-2 ring-amber-400/50'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {val} pts
                  </button>
                ))}
              </div>
            </div>

            {/* Clear / Dejar vacía option */}
            <div className="flex justify-center pt-1">
              <button
                id="btn-delete-cell-score"
                type="button"
                onClick={handleDelete}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Elimina la puntuación y deja la casilla vacía"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar casilla (dejar sin anotar)</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Tachar (0 pts) and Guardar */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
            <button
              id="btn-edit-scratch"
              type="button"
              onClick={handleScratch}
              className="py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="Tachar casilla con 0 puntos"
            >
              <Ban className="w-4 h-4 shrink-0" />
              <span>Tachar (0 pts)</span>
            </button>

            <motion.button
              id="btn-edit-confirm-score"
              type="button"
              onClick={handleConfirm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>
                {isMoved ? `Mover y Guardar ${score} pts` : `Guardar ${score} pts`}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
