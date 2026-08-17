import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, Ban, TrendingUp } from 'lucide-react';
import { Category, Player } from '../types';
import { CATEGORIES, calculateCategoryScore, findBestCategory } from '../utils/yatzyLogic';

interface ScoringOptionsListProps {
  currentPlayer: Player;
  dice: number[];
  onScoreCategory: (category: Category, dice: number[]) => void;
  smartRecommendations: boolean;
}

export const ScoringOptionsList: React.FC<ScoringOptionsListProps> = ({
  currentPlayer,
  dice,
  onScoreCategory,
  smartRecommendations,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'scoring' | 'upper' | 'lower'>('all');

  const openCategories = CATEGORIES.filter((c) => currentPlayer.scores[c.id] === undefined);

  const scoredOptions = openCategories.map((cat) => {
    const score = calculateCategoryScore(cat.id, dice);
    return {
      cat,
      score,
      maxScore: cat.maxScore,
      percentage: Math.round((score / cat.maxScore) * 100),
      isScoring: score > 0,
    };
  });

  const bestRec = smartRecommendations ? findBestCategory(currentPlayer, dice) : null;

  const filteredOptions = scoredOptions.filter((opt) => {
    if (filterMode === 'scoring') return opt.score > 0;
    if (filterMode === 'upper') return opt.cat.section === 'upper';
    if (filterMode === 'lower') return opt.cat.section === 'lower';
    return true;
  });

  const sortedOptions = [...filteredOptions].sort((a, b) => {
    if (bestRec && a.cat.id === bestRec.category) return -1;
    if (bestRec && b.cat.id === bestRec.category) return 1;
    if (b.score !== a.score) return b.score - a.score;
    return b.percentage - a.percentage;
  });

  const scoringCount = scoredOptions.filter((o) => o.score > 0).length;

  return (
    <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Opciones de Puntuación</span>
          </h4>
          <p className="text-[11px] text-slate-400">
            {scoringCount} {scoringCount === 1 ? 'opción con puntos' : 'opciones con puntos'} disponibles
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Todas ({openCategories.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('scoring')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'scoring'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Con puntos ({scoringCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('upper')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'upper'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Superior
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('lower')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'lower'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Inferior
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {sortedOptions.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            No hay casillas abiertas que coincidan con este filtro.
          </div>
        ) : (
          sortedOptions.map((opt) => {
            const isTopRec = bestRec && bestRec.category === opt.cat.id;
            const isPositive = opt.score > 0;

            return (
              <div
                key={opt.cat.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isTopRec
                    ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : isPositive
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isTopRec ? (
                    <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs" title="Mejor opción recomendada">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {opt.cat.shortName.substring(0, 3)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                        {opt.cat.name}
                      </span>
                      {isTopRec && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                          Recomendada
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Máx: <strong className="text-slate-700 dark:text-slate-300">{opt.maxScore} pts</strong>
                      </span>
                      <span>•</span>
                      <span className="truncate">{opt.cat.section === 'upper' ? 'Sección Superior' : 'Sección Inferior'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-black ${
                        opt.score === opt.maxScore
                          ? 'text-amber-500 dark:text-amber-400'
                          : isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 line-through'
                      }`}
                    >
                      {isPositive ? `+${opt.score}` : '0'} pts
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 block">
                      {isPositive ? `${opt.percentage}% del máx.` : 'Tachar'}
                    </span>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => onScoreCategory(opt.cat.id, dice)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                      isTopRec
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        : isPositive
                        ? 'bg-emerald-500/15 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isPositive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Anotar</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>Tachar</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
