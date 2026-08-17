import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, HelpCircle, Plus } from 'lucide-react';
import {
  CATEGORIES,
  UPPER_CATEGORIES,
  LOWER_CATEGORIES,
  calculateCategoryScore,
  calculatePlayerTotals,
  RecommendationResult,
} from '../utils/yatzyLogic';
import { Category, Player, GameMode } from '../types';

interface ScorecardProps {
  players: Player[];
  currentPlayerIndex: number;
  mode: GameMode;
  dice: number[];
  rollsLeft: number;
  recommendation: RecommendationResult | null;
  selectedCategory: Category | null;
  smartRecommendations: boolean;
  onSelectCategory: (category: Category) => void;
  onOpenCategoryInfo: (category: Category) => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({
  players,
  currentPlayerIndex,
  mode,
  dice,
  rollsLeft,
  recommendation,
  selectedCategory,
  smartRecommendations,
  onSelectCategory,
  onOpenCategoryInfo,
}) => {
  const activePlayer = players[currentPlayerIndex];
  const isDigitalMode = mode === 'digital';
  const hasRolledDigital = isDigitalMode && rollsLeft < 3;

  // Render a section's categories
  const renderCategoryRow = (cat: typeof CATEGORIES[0]) => {
    return (
      <tr
        key={cat.id}
        id={`score-row-${cat.id}`}
        className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-500/5 transition-colors"
      >
        {/* Category Name & Info */}
        <td className="py-2.5 px-3 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenCategoryInfo(cat.id)}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 group text-left cursor-pointer"
              title={`${cat.name}: ${cat.description} (Puntuación máxima: ${cat.maxScore} pts)`}
            >
              <span>{cat.name}</span>
              <HelpCircle className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <span
              className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 whitespace-nowrap"
              title={`Puntuación máxima alcanzable en esta casilla: ${cat.maxScore} puntos`}
            >
              Máx: {cat.maxScore}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline-block mt-0.5">
            {cat.description}
          </span>
        </td>

        {/* Player columns */}
        {players.map((player, pIdx) => {
          const isCurrentTurn = pIdx === currentPlayerIndex;
          const scoreValue = player.scores[cat.id];
          const isScored = scoreValue !== undefined;
          const isRecommended = isDigitalMode && smartRecommendations && isCurrentTurn && recommendation?.category === cat.id;

          // Potential score preview if active in digital mode
          let previewScore: number | null = null;
          if (isDigitalMode && isCurrentTurn && !isScored && hasRolledDigital) {
            previewScore = calculateCategoryScore(cat.id, dice);
          }

          return (
            <td
              key={player.id}
              className={`py-2 px-2 sm:px-3 text-center align-middle transition-all ${
                isCurrentTurn
                  ? 'bg-emerald-500/5 dark:bg-emerald-500/10 font-bold'
                  : ''
              }`}
            >
              <div className="flex items-center justify-center w-full min-h-[32px]">
                {isScored ? (
                  <div
                    className={`inline-flex items-center justify-center min-w-[36px] py-1 px-2.5 rounded-lg text-xs sm:text-sm font-bold ${
                      scoreValue === 0
                        ? 'text-slate-400 dark:text-slate-600 line-through bg-slate-100 dark:bg-slate-800'
                        : scoreValue >= (cat.section === 'upper' ? 12 : 20)
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15'
                        : 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80'
                    }`}
                  >
                    {scoreValue}
                  </div>
                ) : isCurrentTurn ? (
                  // Turn is active for this player
                  isDigitalMode ? (
                    hasRolledDigital ? (
                      <motion.button
                        id={`btn-score-cell-${cat.id}`}
                        type="button"
                        onClick={() => onSelectCategory(cat.id)}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        className={`inline-flex items-center justify-center gap-1 min-w-[42px] sm:min-w-[50px] py-1.5 px-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer mx-auto ${
                          isRecommended
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400 animate-pulse'
                            : previewScore! > 0
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-dashed border-slate-300 dark:border-slate-700'
                        }`}
                        title={
                          isRecommended
                            ? `Recomendado: ${previewScore} pts`
                            : previewScore! > 0
                            ? `Anotar ${previewScore} pts`
                            : 'Tachar por 0 pts'
                        }
                      >
                        {isRecommended && <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />}
                        <span>{previewScore}</span>
                      </motion.button>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs font-semibold">-</span>
                    )
                  ) : (
                    // Physical Dice Tracker Mode: Clicking opens the score modal for this category
                    <motion.button
                      id={`btn-score-cell-${cat.id}`}
                      type="button"
                      onClick={() => onSelectCategory(cat.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center justify-center gap-1 min-w-[48px] sm:min-w-[56px] py-1.5 px-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-700 dark:text-emerald-300 border border-dashed border-emerald-400/60 dark:border-emerald-500/40 transition-all cursor-pointer shadow-xs mx-auto"
                      title={`Anotar puntuación para ${cat.name}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Anotar</span>
                    </motion.button>
                  )
                ) : (
                  <span className="text-slate-300 dark:text-slate-700 text-xs font-semibold">-</span>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div
      id="scorecard-container"
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col"
    >
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <th className="py-3 px-3 text-left font-bold w-2/5 sm:w-1/3">
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Categories
                </span>
              </th>
              {players.map((player, idx) => {
                const isCurrent = idx === currentPlayerIndex;
                return (
                  <th
                    key={player.id}
                    className={`py-3 px-2 sm:px-3 text-center transition-all ${
                      isCurrent
                        ? 'bg-emerald-500/15 border-b-2 border-emerald-500 text-slate-900 dark:text-white'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-base sm:text-lg">{player.avatar}</span>
                      <span className="font-bold truncate max-w-[80px] sm:max-w-[110px]">
                        {player.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-600 text-white mt-0.5 shadow-xs">
                          Turn
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {/* UPPER SECTION HEADER */}
            <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800">
              <td
                colSpan={players.length + 1}
                className="py-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Upper Section (Sum 63+ for +50 Bonus)
              </td>
            </tr>

            {UPPER_CATEGORIES.map(renderCategoryRow)}

            {/* Upper Sum Subtotal Row */}
            <tr className="bg-slate-100/60 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/80 font-semibold text-slate-700 dark:text-slate-200">
              <td className="py-2 px-3 text-left">
                <span className="font-bold">Upper Sum</span>
              </td>
              {players.map((player) => {
                const totals = calculatePlayerTotals(player.scores);
                return (
                  <td key={player.id} className="py-2 px-3 text-center align-middle">
                    <div className="flex items-center justify-center w-full">
                      <span className="font-bold">{totals.upperSum}</span>
                      <span className="text-[10px] text-slate-400 ml-1">/ 63</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Upper Bonus Row (+50) */}
            <tr className="bg-slate-100/90 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 font-semibold">
              <td className="py-2 px-3 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    Bonus (+50 pts)
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    (Need 63+)
                  </span>
                </div>
              </td>
              {players.map((player) => {
                const totals = calculatePlayerTotals(player.scores);
                const hasBonus = totals.upperBonus > 0;
                return (
                  <td key={player.id} className="py-2 px-3 text-center align-middle">
                    <div className="flex items-center justify-center w-full">
                      {hasBonus ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs">
                          <Sparkles className="w-3 h-3 text-amber-500" /> +50
                        </span>
                      ) : totals.neededForBonus > 0 ? (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {totals.neededForBonus} needed
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* LOWER SECTION HEADER */}
            <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800">
              <td
                colSpan={players.length + 1}
                className="py-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Lower Section
              </td>
            </tr>

            {LOWER_CATEGORIES.map(renderCategoryRow)}

            {/* GRAND TOTAL ROW */}
            <tr className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border-t-2 border-emerald-500 text-slate-900 dark:text-white font-extrabold">
              <td className="py-3 px-3 text-left">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm uppercase tracking-wide">Grand Total</span>
                </div>
              </td>
              {players.map((player, idx) => {
                const totals = calculatePlayerTotals(player.scores);
                const isCurrent = idx === currentPlayerIndex;
                return (
                  <td
                    key={player.id}
                    className={`py-3 px-3 text-center align-middle text-base sm:text-lg ${
                      isCurrent ? 'text-emerald-700 dark:text-emerald-300' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center w-full">
                      {totals.grandTotal}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress & Bonus Guide Footer */}
      <div className="p-3 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {activePlayer.name}'s Bonus Progress:
          </span>
          {(() => {
            const totals = calculatePlayerTotals(activePlayer.scores);
            const percent = Math.min(100, Math.round((totals.upperSum / 63) * 100));
            return (
              <div className="flex items-center gap-2">
                <div className="w-24 sm:w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      totals.upperBonus > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {totals.upperSum}/63 pts ({percent}%)
                </span>
              </div>
            );
          })()}
        </div>

        <div className="text-[11px] text-slate-400">
          {isDigitalMode
            ? 'Tip: An average of 3 dice for each upper category earns the 50-point bonus!'
            : 'Tap any open category cell (+ Score) to record your tabletop dice roll.'}
        </div>
      </div>
    </div>
  );
};
