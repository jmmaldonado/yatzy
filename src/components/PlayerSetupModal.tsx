import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Dices, ClipboardList, Sparkles, Check, Play, RotateCcw, X, BookmarkCheck } from 'lucide-react';
import { GameMode, Player, SavedPlayersProfile } from '../types';
import { loadSavedPlayersProfile, savePlayersProfile, DEFAULT_SAVED_PLAYERS } from '../utils/historyStorage';

interface PlayerSetupModalProps {
  isOpen: boolean;
  initialMode?: GameMode;
  initialPlayers?: Player[];
  onStartGame: (players: Player[], mode: GameMode) => void;
  onClose?: () => void;
}

const AVAILABLE_AVATARS = [
  '🎲', '👑', '🦊', '🦁', '🚀', '🐼', 
  '⚡', '🍀', '🦉', '🎯', '💎', '🐉', 
  '🐱', '🐶', '🍕', '🏆'
];

const AVAILABLE_COLORS = [
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { id: 'blue', label: 'Sapphire', bg: 'bg-blue-500', text: 'text-blue-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', text: 'text-amber-500' },
  { id: 'rose', label: 'Ruby', bg: 'bg-rose-500', text: 'text-rose-500' },
  { id: 'purple', label: 'Amethyst', bg: 'bg-purple-500', text: 'text-purple-500' },
];

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  isOpen,
  initialMode = 'digital',
  initialPlayers,
  onStartGame,
  onClose,
}) => {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = loadSavedPlayersProfile();
    return saved.players.map((p, idx) => ({
      id: String(idx + 1),
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      scores: {},
    }));
  });

  const [activeAvatarPicker, setActiveAvatarPicker] = useState<number | null>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = loadSavedPlayersProfile();
      setMode(initialMode || saved.preferredMode || 'digital');
      
      let count = saved.playerCount || 2;
      if (initialPlayers && initialPlayers.length > 0) {
        count = initialPlayers.length;
      }
      setPlayerCount(count);

      // Merge saved profiles or initial players with defaults
      const baseList = DEFAULT_SAVED_PLAYERS.players;
      setPlayers(
        baseList.map((def, idx) => {
          const initP = initialPlayers && initialPlayers[idx];
          const savedP = saved.players && saved.players[idx];
          return {
            id: String(idx + 1),
            name: (initP && initP.name) || (savedP && savedP.name) || def.name,
            avatar: (initP && initP.avatar) || (savedP && savedP.avatar) || def.avatar,
            color: (initP && initP.color) || (savedP && savedP.color) || def.color,
            scores: {},
          };
        })
      );
    }
  }, [isOpen, initialMode, initialPlayers]);

  if (!isOpen) return null;

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
  };

  const handleNameChange = (index: number, name: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  };

  const handleAvatarChange = (index: number, avatar: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], avatar };
      return updated;
    });
    setActiveAvatarPicker(null);
  };

  const handleColorChange = (index: number, color: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], color };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activePlayers = players.slice(0, playerCount).map((p, idx) => ({
      ...p,
      name: p.name.trim() || `Player ${idx + 1}`,
      scores: {},
    }));

    // Save profile to localStorage so player names, avatars and colors are permanently remembered
    const profileToSave: SavedPlayersProfile = {
      playerCount,
      preferredMode: mode,
      players: players.map((p, idx) => ({
        id: String(idx + 1),
        name: p.name.trim() || `Player ${idx + 1}`,
        avatar: p.avatar,
        color: p.color,
      })),
    };
    savePlayersProfile(profileToSave);

    onStartGame(activePlayers, mode);
  };

  return (
    <div
      id="player-setup-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        id="player-setup-card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 text-white text-center relative shrink-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex p-3 rounded-2xl bg-white/15 backdrop-blur-md mb-2 shadow-inner">
            <Dices className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Nueva Partida de Yatzy</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Configura el modo y los jugadores (sus nombres y colores se guardarán automáticamente)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Game Mode Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Selecciona Modo de Juego
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="mode-select-digital"
                type="button"
                onClick={() => setMode('digital')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                  mode === 'digital'
                    ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                      <Dices className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">Dados Electrónicos</span>
                  </div>
                  {mode === 'digital' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                  Tira los 5 dados virtuales en pantalla con opción de retención.
                </p>
              </button>

              <button
                id="mode-select-tracker"
                type="button"
                onClick={() => setMode('tracker')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                  mode === 'tracker'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">Anotador para Dados Reales</span>
                  </div>
                  {mode === 'tracker' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                  Tira tus dados en la mesa y usa la app como bloc de puntuación digital.
                </p>
              </button>
            </div>
          </div>

          {/* Number of Players (1 to 4) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Número de Jugadores ({playerCount})
              </label>
              <span className="text-xs text-slate-400">1, 2, 3 o 4 jugadores</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  id={`btn-player-count-${count}`}
                  type="button"
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                    playerCount === count
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {count} {count === 1 ? 'Jugador' : 'Jugadores'}
                </button>
              ))}
            </div>
          </div>

          {/* Player Customization Lines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Personalizar {playerCount} {playerCount === 1 ? 'Jugador' : 'Jugadores'}
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5" /> Se guardan en tu dispositivo
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {players.slice(0, playerCount).map((player, idx) => (
                <div
                  key={idx}
                  id={`player-config-row-${idx}`}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-2.5 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar Button */}
                    <div className="relative">
                      <button
                        id={`btn-avatar-picker-${idx}`}
                        type="button"
                        onClick={() => setActiveAvatarPicker(activeAvatarPicker === idx ? null : idx)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-2xl shadow-xs hover:scale-105 transition-transform cursor-pointer"
                        title="Toca para cambiar avatar"
                      >
                        {player.avatar}
                      </button>
                    </div>

                    {/* Name Input */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                        Nombre Jugador #{idx + 1}
                      </label>
                      <input
                        id={`input-player-name-${idx}`}
                        type="text"
                        maxLength={18}
                        value={player.name}
                        placeholder={`Jugador ${idx + 1}`}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Color Picker Dots */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Color</span>
                      <div className="flex items-center gap-1.5">
                        {AVAILABLE_COLORS.map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => handleColorChange(idx, col.id)}
                            className={`w-6 h-6 rounded-full ${col.bg} transition-all flex items-center justify-center cursor-pointer ${
                              player.color === col.id
                                ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                            title={col.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Avatar Picker Menu */}
                  <AnimatePresence>
                    {activeAvatarPicker === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 border-t border-slate-200 dark:border-slate-700 overflow-hidden"
                      >
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                          Selecciona avatar para {player.name}:
                        </span>
                        <div className="grid grid-cols-8 gap-1.5 bg-white dark:bg-slate-700/80 p-2 rounded-xl border border-slate-200 dark:border-slate-600">
                          {AVAILABLE_AVATARS.map((av) => (
                            <button
                              key={av}
                              type="button"
                              onClick={() => handleAvatarChange(idx, av)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer ${
                                player.avatar === av ? 'bg-emerald-500/20 ring-1 ring-emerald-500' : ''
                              }`}
                            >
                              {av}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {onClose && (
              <button
                id="btn-cancel-setup"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <motion.button
              id="btn-start-game"
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Empezar Partida</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
