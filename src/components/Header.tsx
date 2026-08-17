import React from 'react';
import {
  Dices,
  BookOpen,
  RotateCcw,
  Settings,
  History,
  Undo2,
} from 'lucide-react';
import { Player } from '../types';

interface HeaderProps {
  round: number;
  totalRounds?: number;
  activePlayer: Player;
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
  activePlayer,
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
      className="w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 transition-colors shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Dices className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Classic Yatzy
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Ronda {round} de {totalRounds} • Turno de: {activePlayer.name} {activePlayer.avatar}
            </p>
          </div>
        </div>

        {/* Center: Mobile Round & Turn badge */}
        <div className="flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span>R{round}/15</span>
          <span>•</span>
          <span className="truncate max-w-[70px]">{activePlayer.name}</span>
          <span>{activePlayer.avatar}</span>
        </div>

        {/* Right: Actions (Undo, Options) */}
        <div className="flex items-center gap-1 sm:gap-2">
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
            <span>Opciones</span>
          </button>
        </div>
      </div>
    </header>
  );
};
