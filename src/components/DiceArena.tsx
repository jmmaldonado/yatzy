import React from 'react';
import { motion } from 'motion/react';
import { Dices } from 'lucide-react';
import { Die } from './Die';
import { RecommendationResult } from '../utils/yatzyLogic';
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
  onHoldAll?: () => void;
  onClearHolds?: () => void;
}

export const DiceArena: React.FC<DiceArenaProps> = ({
  dice,
  held,
  rollsLeft,
  isRolling,
  currentPlayer,
  selectedCategory,
  smartRecommendations,
  onToggleHold,
  onRollDice,
  onScoreCategory,
}) => {
  const isFirstRoll = rollsLeft === 3;
  const canRoll = rollsLeft > 0 && !isRolling;
  const hasRolledAtLeastOnce = rollsLeft < 3;

  return (
    <div
      id="dice-arena-card"
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col gap-3 sm:gap-4"
    >
      {/* Dice Container Tray - Guaranteed single row */}
      <div
        id="dice-tray"
        className="relative bg-radial from-emerald-900/10 via-slate-900/5 to-transparent dark:from-emerald-950/40 dark:via-slate-950/20 dark:to-transparent rounded-2xl p-2.5 sm:p-4 border border-slate-200/50 dark:border-slate-800/60 flex flex-nowrap items-center justify-center gap-1.5 sm:gap-3 md:gap-4 w-full min-h-[72px] sm:min-h-[88px] overflow-hidden"
      >
        {isFirstRoll ? (
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 opacity-35 select-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-11 h-11 min-w-[2.75rem] sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/40 dark:bg-slate-800/20 flex items-center justify-center"
              >
                <Dices className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 dark:text-slate-600" />
              </div>
            ))}
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

      {/* Roll Action Button & Helper text */}
      <div className="flex flex-col items-center justify-center gap-2">
        <motion.button
          id="btn-roll-dice"
          type="button"
          disabled={!canRoll}
          onClick={onRollDice}
          whileHover={canRoll ? { scale: 1.02 } : {}}
          whileTap={canRoll ? { scale: 0.98 } : {}}
          className={`w-full py-3 px-6 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all ${
            canRoll
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
          }`}
        >
          <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          <span>
            {isRolling
              ? 'Lanzando dados...'
              : isFirstRoll
              ? 'Lanzar 5 Dados'
              : rollsLeft > 0
              ? `Volver a lanzar (${rollsLeft} restantes)`
              : 'Sin tiradas restantes'}
          </span>
        </motion.button>
        {isFirstRoll && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Pulsa el botón o la barra espaciadora para tirar.
          </p>
        )}
      </div>

      {/* Scoring Suggestions List */}
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
