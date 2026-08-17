import React from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Dices,
  ClipboardList,
  Palette,
  RotateCcw,
  UserPlus,
  Check,
  History,
  Trash2,
  BookmarkCheck,
  BookOpen,
} from 'lucide-react';
import { GameMode, AppTheme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  mode: GameMode;
  theme: AppTheme;
  soundEnabled: boolean;
  smartRecommendations: boolean;
  historyCount?: number;
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
  onSelectTheme: (theme: AppTheme) => void;
  onToggleSound: () => void;
  onToggleSmartRecommendations: () => void;
  onRestartMatch: () => void;
  onOpenReconfigure: () => void;
  onOpenHistory: () => void;
  onOpenRules: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  mode,
  theme,
  soundEnabled,
  smartRecommendations,
  historyCount = 0,
  onClose,
  onSelectMode,
  onSelectTheme,
  onToggleSound,
  onToggleSmartRecommendations,
  onRestartMatch,
  onOpenReconfigure,
  onOpenHistory,
  onOpenRules,
}) => {
  if (!isOpen) return null;

  const themes: { id: AppTheme; name: string; desc: string; color: string }[] = [
    { id: 'felt', name: 'Tapete Casino', desc: 'Verde esmeralda clásico', color: 'bg-[#0a2f1d] border-emerald-600' },
    { id: 'dark', name: 'Noche Oscura', desc: 'Gris pizarra oscuro y elegante', color: 'bg-slate-950 border-slate-700' },
    { id: 'light', name: 'Luz Limpia', desc: 'Contraste claro y minimalista', color: 'bg-slate-100 border-slate-300' },
    { id: 'wood', name: 'Madera Cálida', desc: 'Mesa de caoba clásica', color: 'bg-[#2b1810] border-amber-700' },
  ];

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        id="settings-modal-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Opciones y Configuración
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personaliza modo, temas, sonido, asistencia y gestión de partidas
              </p>
            </div>
          </div>

          <button
            id="btn-close-settings"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Options */}
        <div className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Access Info Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Histórico</span>
                  </div>
                </div>
              </div>
              <button
                id="btn-settings-open-history"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Abrir
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Reglas de Juego</span>
                  </div>
                </div>
              </div>
              <button
                id="btn-settings-open-rules"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRules();
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Ver
              </button>
            </div>
          </div>

          {/* 1. Game Mode */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              🎲 Modo de Juego
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="settings-mode-digital"
                type="button"
                onClick={() => onSelectMode('digital')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                  mode === 'digital'
                    ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white mt-0.5">
                    <Dices className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      Dados Electrónicos
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Tiradas 3D interactivas con bloqueo de dados.
                    </div>
                  </div>
                </div>
                {mode === 'digital' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />}
              </button>

              <button
                id="settings-mode-tracker"
                type="button"
                onClick={() => onSelectMode('tracker')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                  mode === 'tracker'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500 text-white mt-0.5">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      Anotador para Dados Reales
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Usa tus propios dados de mesa y anota aquí.
                    </div>
                  </div>
                </div>
                {mode === 'tracker' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 ml-1" />}
              </button>
            </div>
          </div>

          {/* 2. Smart Category Recommendations */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ✨ Recomendaciones Inteligentes
            </label>
            <div
              onClick={onToggleSmartRecommendations}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                smartRecommendations
                  ? 'bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    smartRecommendations
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Sugerencias de Puntuación</span>
                    {smartRecommendations && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold">
                        ACTIVADO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {smartRecommendations
                      ? 'Resalta las mejores categorías para puntuar según la tirada.'
                      : 'Desactivado para una experiencia tradicional sin asistencia.'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  smartRecommendations ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    smartRecommendations ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 3. Audio & Sound FX */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              🔊 Efectos de Sonido
            </label>
            <div
              onClick={onToggleSound}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                soundEnabled
                  ? 'bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    soundEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Sonidos de Dados y Victoria
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sonido de dados al rodar, clics al retener y fanfarria al ganar.
                  </p>
                </div>
              </div>

              <div
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 4. Tabletop Theme */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              🎨 Tema Visual del Tablero
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  id={`settings-theme-${t.id}`}
                  type="button"
                  onClick={() => onSelectTheme(t.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    theme === t.id
                      ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded-xl ${t.color} border shadow-inner flex items-center justify-end p-1`}>
                    {theme === t.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-1">
                    {t.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Game Management / Restart / Reconfigure Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              🔄 Acciones de Partida
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-settings-restart-match"
                type="button"
                onClick={() => {
                  onRestartMatch();
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Reiniciar Partida Actual</span>
              </button>

              <button
                id="btn-settings-reconfigure"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReconfigure();
                }}
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Cambiar jugadores</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Listo
          </button>
        </div>
      </motion.div>
    </div>
  );
};
