import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Sparkles, RotateCcw, UserPlus, Award, History } from 'lucide-react';
import { Player, GameMode } from '../types';
import { calculatePlayerTotals } from '../utils/yatzyLogic';

interface GameOverModalProps {
  isOpen: boolean;
  players: Player[];
  mode: GameMode;
  onPlayAgain: () => void;
  onNewGameSetup: () => void;
  onOpenHistory?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  players,
  mode,
  onPlayAgain,
  onNewGameSetup,
  onOpenHistory,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger celebratory confetti burst
      try {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
          });

          if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } catch {
        // Ignore confetti error
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Rank players by total score
  const rankedPlayers = players
    .map((player) => {
      const totals = calculatePlayerTotals(player.scores);
      return {
        player,
        totals,
      };
    })
    .sort((a, b) => b.totals.grandTotal - a.totals.grandTotal);

  const winner = rankedPlayers[0];
  const isTie = rankedPlayers.length > 1 && rankedPlayers[0].totals.grandTotal === rankedPlayers[1].totals.grandTotal;

  return (
    <div
      id="game-over-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        id="game-over-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden my-auto"
      >
        {/* Banner */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          
          <div className="inline-flex p-3.5 rounded-full bg-white/20 backdrop-blur-md mb-2 shadow-lg">
            <Trophy className="w-10 h-10 text-white animate-bounce" />
          </div>

          <h2 className="text-3xl font-black tracking-tight">
            {isTie ? '¡Empate!' : `¡${winner.player.name} ha ganado!`}
          </h2>
          <p className="text-amber-100 text-sm mt-1">
            Puntuación final de Yatzy:{' '}
            <span className="font-extrabold text-white text-base">
              {winner.totals.grandTotal} puntos
            </span>
          </p>
          <p className="text-[11px] text-amber-200/90 mt-1 font-semibold">
            ✓ Guardado automáticamente en tu histórico
          </p>
        </div>

        {/* Podium / Ranked list */}
        <div className="p-6 flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Clasificación Final
          </h4>

          <div className="flex flex-col gap-2.5">
            {rankedPlayers.map((item, rank) => {
              const medalColors = [
                'bg-amber-400 text-amber-950 border-amber-300',
                'bg-slate-300 text-slate-900 border-slate-200',
                'bg-amber-700/60 text-white border-amber-600',
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent',
              ][rank];

              return (
                <div
                  key={item.player.id}
                  id={`ranking-row-${rank + 1}`}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    rank === 0
                      ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center border shadow-xs ${medalColors}`}
                    >
                      #{rank + 1}
                    </span>

                    <span className="text-2xl">{item.player.avatar}</span>

                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {item.player.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Sup: {item.totals.upperSum}</span>
                        {item.totals.upperBonus > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> +50 Bonus!
                          </span>
                        )}
                        {item.player.scores.yatzy === 50 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            🎲 Yatzy!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                      {item.totals.grandTotal}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-semibold">pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2.5">
              <button
                id="btn-play-again-same"
                type="button"
                onClick={onPlayAgain}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar de Nuevo</span>
              </button>

              <button
                id="btn-new-game-setup"
                type="button"
                onClick={onNewGameSetup}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nueva Partida</span>
              </button>
            </div>

            {onOpenHistory && (
              <button
                id="btn-view-match-history"
                type="button"
                onClick={onOpenHistory}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-amber-500" />
                <span>Ver Histórico de Partidas y Récords</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
