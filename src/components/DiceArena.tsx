import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Die } from './Die';
import { RecommendationResult, CATEGORIES } from '../utils/yatzyLogic';
import { Category, Player } from '../types';
import { ScoringOptionsList } from './ScoringOptionsList';

interface DiceArenaProps {
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  isRolling: boolean;
  currentPlayer: Player;
  recommendation: RecommendationResult | null;
  selectedCategory: Category | null;
  smartRecommendations: boolean;
  onToggleHold: (index: number) => void;
  onRollDice: () => void;
  onScoreCategory: (category: Category) => void;
  onHoldAll: () => void;
  onClearHolds: () => void;
}

export const DiceArena: React.FC<DiceArenaProps> = ({
  dice,
  held,
  rollsLeft,
  isRolling,
  currentPlayer,
  recommendation,
  selectedCategory,
  smartRecommendations,
  onToggleHold,
  onRollDice,
  onScoreCategory,
  onHoldAll,
  onClearHolds,
}) => {
  const isFirstRoll = rollsLeft === 3;
  const canRoll = rollsLeft > 0 && !isRolling;
  const hasRolledAtLeastOnce = rollsLeft < 3;
  const allHeld = held.every(Boolean);
  const anyHeld = held.some(Boolean);

  const recommendedCatInfo = recommendation
    ? CATEGORIES.find((c) => c.id === recommendation.category)
    : null;

  return (
    <div
      id="dice-arena-card"
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col gap-4"
    >
      {/* Top status bar inside arena */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentPlayer.avatar}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {currentPlayer.name}'s Turn
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                Electronic Dice
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isFirstRoll
                ? 'Roll all 5 dice to start your turn'
                : rollsLeft > 0
                ? `Click dice to hold them, then roll again (${rollsLeft} left)`
                : 'No rolls remaining. Choose a category on the scorecard.'}
            </p>
          </div>
        </div>

        {/* Rolls remaining counter indicators */}
        <div className="flex items-center gap-1.5" id="rolls-left-pills">
          {[1, 2, 3].map((rollNum) => {
            const isUsed = 3 - rollsLeft >= rollNum;
            const isCurrent = 3 - rollsLeft + 1 === rollNum;
            return (
              <div
                key={rollNum}
                className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  isUsed
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 line-through'
                    : isCurrent
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50 scale-105'
                    : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                }`}
                title={`Roll ${rollNum}`}
              >
                {rollNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dice Container Tray */}
      <div
        id="dice-tray"
        className="relative bg-radial from-emerald-900/10 via-slate-900/5 to-transparent dark:from-emerald-950/40 dark:via-slate-950/20 dark:to-transparent rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-800/60 flex flex-wrap items-center justify-center gap-3 sm:gap-6 min-h-[120px]"
      >
        {isFirstRoll ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
              <Dices className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-base">
              Ready to Roll!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
              Press the Roll button below or hit Spacebar.
            </p>
          </div>
        ) : (
          dice.map((val, idx) => (
            <Die
              key={idx}
              index={idx}
              value={val}
              isHeld={held[idx]}
              isRolling={isRolling}
              disabled={rollsLeft === 0}
              onToggleHold={onToggleHold}
              size="md"
            />
          ))
        )}
      </div>

      {/* Quick Hold actions & Roll Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {hasRolledAtLeastOnce && rollsLeft > 0 ? (
          <div className="flex items-center gap-2 text-xs">
            <button
              id="btn-hold-all"
              type="button"
              onClick={onHoldAll}
              disabled={allHeld || isRolling}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Hold All
            </button>
            <button
              id="btn-clear-holds"
              type="button"
              onClick={onClearHolds}
              disabled={!anyHeld || isRolling}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Release All
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            {rollsLeft === 0 ? 'Select a category to record score' : '3 rolls per turn'}
          </div>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <motion.button
            id="btn-roll-dice"
            type="button"
            disabled={!canRoll}
            onClick={onRollDice}
            whileHover={canRoll ? { scale: 1.02 } : {}}
            whileTap={canRoll ? { scale: 0.98 } : {}}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all ${
              canRoll
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>
              {isRolling
                ? 'Rolling...'
                : isFirstRoll
                ? 'Roll 5 Dice'
                : rollsLeft > 0
                ? `Roll Again (${rollsLeft} left)`
                : 'No Rolls Left'}
            </span>
          </motion.button>
        </div>
      </div>

      {hasRolledAtLeastOnce && (
        <ScoringOptionsList
          currentPlayer={currentPlayer}
          dice={dice}
          onScoreCategory={(cat) => onScoreCategory(cat)}
          smartRecommendations={smartRecommendations}
        />
      )}
    </div>
  );
};
