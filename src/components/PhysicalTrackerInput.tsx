import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Die } from './Die';
import { Category, Player } from '../types';
import { CATEGORIES } from '../utils/yatzyLogic';
import { ScoringOptionsList } from './ScoringOptionsList';

interface PhysicalTrackerInputProps {
  currentPlayer: Player;
  physicalDice: number[];
  onUpdatePhysicalDice: (dice: number[]) => void;
  smartRecommendations?: boolean;
  onScoreCategoryWithDice: (category: Category, dice: number[]) => void;
  onDirectManualScore: (category: Category, score: number) => void;
}

export const PhysicalTrackerInput: React.FC<PhysicalTrackerInputProps> = ({
  currentPlayer,
  physicalDice,
  onUpdatePhysicalDice,
  smartRecommendations = true,
  onScoreCategoryWithDice,
}) => {
  const [activeDieIndex, setActiveDieIndex] = useState<number>(0);

  // Open categories for the active player
  const openCategories = CATEGORIES.filter((c) => currentPlayer.scores[c.id] === undefined);

  // Select die on click
  const handleDieClick = (index: number) => {
    setActiveDieIndex(index);
  };

  const handleSetDieValue = (value: number) => {
    const updated = [...physicalDice];
    updated[activeDieIndex] = value;
    onUpdatePhysicalDice(updated);
    // Auto advance to next die for rapid sequential input
    setActiveDieIndex((prev) => (prev + 1) % 5);
  };

  const handleResetDice = () => {
    onUpdatePhysicalDice([1, 1, 1, 1, 1]);
    setActiveDieIndex(0);
  };

  return (
    <div
      id="physical-tracker-card"
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col gap-4"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl font-bold border border-amber-500/30 shrink-0">
            {currentPlayer.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                Tapete de Dados Reales
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentPlayer.name} • {openCategories.length} casillas disponibles
            </p>
          </div>
        </div>
      </div>

      {/* Physical Dice Matcher */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Indica los 5 dados de tu mesa:</span>
          <button
            id="btn-reset-physical-dice"
            type="button"
            onClick={handleResetDice}
            className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-semibold text-xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reiniciar (1s)
          </button>
        </div>

        {/* 5 Physical Dice display */}
        <div
          id="physical-dice-row"
          className="bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl p-3.5 border border-amber-500/20 flex flex-wrap items-center justify-center gap-2 sm:gap-4"
        >
          {physicalDice.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`relative transition-all cursor-pointer ${
                  activeDieIndex === idx
                    ? 'scale-110 ring-2 ring-amber-500 rounded-2xl shadow-lg'
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
              <span className="text-[10px] font-bold text-slate-400">
                Dado {idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Face buttons (1 to 6) to set currently selected die */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            Fijar Dado {activeDieIndex + 1}:
          </span>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              id={`btn-set-die-val-${num}`}
              type="button"
              onClick={() => handleSetDieValue(num)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-sm transition-all border cursor-pointer ${
                physicalDice[activeDieIndex] === num
                  ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/30 scale-105'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <ScoringOptionsList
        currentPlayer={currentPlayer}
        dice={physicalDice}
        onScoreCategory={onScoreCategoryWithDice}
        smartRecommendations={smartRecommendations}
      />
    </div>
  );
};
