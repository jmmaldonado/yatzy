import React from 'react';
import {
  Dices,
  Settings,
  Undo2,
} from 'lucide-react';
import { Player, GameMode } from '../types';
import { calculatePlayerTotals } from '../utils/yatzyLogic';

interface HeaderProps {
  round: number;
  totalRounds?: number;
  players: Player[];
  currentPlayerIndex: number;
  rollsLeft: number;
  mode: GameMode;
  historyCount?: number;
  canUndo?: boolean;
  onUndo?: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  round,
  totalRounds = 15,
  players,
  currentPlayerIndex,
  rollsLeft,
  mode,
  historyCount = 0,
  canUndo = false,
  onUndo,
  onOpenSettings,
  onOpenRules,
  onOpenHistory,
  onResetGame,
}) => {
  return (
    <header
      id="main-app-header"
      className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 transition-colors shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 min-h-[4rem] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Round indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Dices className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Yatzy
            </h1>
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              Ronda {round}/{totalRounds}
            </p>
          </div>
        </div>

        {/* Center: Players Row with Scores & Active Turn State */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 max-w-full order-3 sm:order-2 w-full sm:w-auto justify-start sm:justify-center">
          {players.map((player, idx) => {
            const isCurrent = idx === currentPlayerIndex;
            const totals = calculatePlayerTotals(player.scores);

            if (isCurrent) {
              return (
                <div
                  key={player.id}
                  id={`header-player-active-${player.id}`}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border-2 border-emerald-500/70 shadow-xs shrink-0 transition-all ring-2 ring-emerald-500/20"
                  title={`Turno de ${player.name} (${totals.grandTotal} pts)`}
                >
                  <span className="text-base sm:text-lg shrink-0">{player.avatar}</span>
                  <div className="flex flex-col leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-100 truncate max-w-[80px] sm:max-w-[110px]">
                        {player.name}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300">
                        {totals.grandTotal} pts
                      </span>
                    </div>
                    {mode === 'digital' ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-800/90 dark:text-emerald-300/90">
                          {rollsLeft === 3
                            ? '3 tiradas'
                            : rollsLeft === 0
                            ? '0 tiradas'
                            : `${rollsLeft} ${rollsLeft === 1 ? 'tirada' : 'tiradas'}`}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((rollNum) => {
                            const isUsed = 3 - rollsLeft >= rollNum;
                            return (
                              <span
                                key={rollNum}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  isUsed
                                    ? 'bg-slate-300 dark:bg-slate-700'
                                    : 'bg-emerald-600 dark:bg-emerald-400 ring-1 ring-emerald-500/50'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700/80 dark:text-emerald-300/80">
                        Turno activo
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={player.id}
                id={`header-player-${player.id}`}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 shrink-0 transition-all opacity-80 hover:opacity-100"
                title={`${player.name}: ${totals.grandTotal} pts`}
              >
                <span className="text-sm sm:text-base shrink-0">{player.avatar}</span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold truncate max-w-[70px] sm:max-w-[90px]">
                    {player.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {totals.grandTotal} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Actions (Undo, Settings) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 order-2 sm:order-3">
          {/* Undo (Deshacer) Button */}
          {onUndo && (
            <button
              id="btn-header-undo"
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all ${
                canUndo
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 shadow-xs cursor-pointer'
                  : 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 opacity-40 cursor-not-allowed'
              }`}
              title={
                canUndo
                  ? 'Deshacer la última anotación o jugada'
                  : 'No hay jugadas anteriores para deshacer'
              }
            >
              <Undo2 className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Deshacer</span>
            </button>
          )}

          {/* Options / Settings Modal Button */}
          <button
            id="btn-header-options"
            type="button"
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Opciones y Ajustes (Modo, Jugadores, Temas, Sonidos)"
          >
            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
