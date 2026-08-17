import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Trophy,
  Trash2,
  X,
  Calendar,
  Dices,
  ClipboardList,
  Sparkles,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Search,
  Eye,
  BarChart3,
  Award,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { Category, MatchRecord, Player } from '../types';
import { CATEGORIES, UPPER_CATEGORIES, LOWER_CATEGORIES } from '../utils/yatzyLogic';
import { getHistoryStats } from '../utils/historyStorage';

interface HistoryModalProps {
  isOpen: boolean;
  history: MatchRecord[];
  onClose: () => void;
  onDeleteMatch: (id: string) => void;
  onClearAllHistory: () => void;
  onRematchWithPlayers: (players: Player[], mode: 'digital' | 'tracker') => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  history,
  onClose,
  onDeleteMatch,
  onClearAllHistory,
  onRematchWithPlayers,
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'stats'>('matches');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'digital' | 'tracker'>('all');
  const [viewingDetailMatch, setViewingDetailMatch] = useState<MatchRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const stats = getHistoryStats(history);

  // Filter history items
  const filteredHistory = history.filter((match) => {
    if (filterMode !== 'all' && match.mode !== filterMode) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const hasPlayer = match.players.some((p) => p.name.toLowerCase().includes(q));
      return hasPlayer;
    }
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleRematch = (match: MatchRecord) => {
    const playersToRematch: Player[] = match.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color || 'emerald',
      scores: {},
    }));
    onRematchWithPlayers(playersToRematch, match.mode);
    onClose();
  };

  return (
    <div
      id="history-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        id="history-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <History className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl">
                  Histórico de Partidas
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  {history.length} {history.length === 1 ? 'partida' : 'partidas'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                Consulta los resultados guardados, estadísticas globales y revanchas
              </p>
            </div>
          </div>

          <button
            id="btn-close-history-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Stats Summary Bar */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 shrink-0">
            {/* Total Partidas */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Dices className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Partidas Totales
                </span>
                <span className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  {stats.totalMatches}
                </span>
              </div>
            </div>

            {/* Completadas */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Completadas
                </span>
                <span className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  {stats.completedMatches}
                </span>
              </div>
            </div>

            {/* Récord Puntuación */}
            <div className="col-span-2 sm:col-span-2 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                    Récord Histórico
                  </span>
                  {stats.highestScore ? (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      <span>{stats.highestScore.avatar}</span>
                      <span>{stats.highestScore.playerName}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold ml-1">
                        ({stats.highestScore.score} pts)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </div>
              </div>

              {stats.leaderboard[0] && (
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Líder Victorias
                  </span>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    {stats.leaderboard[0].avatar} {stats.leaderboard[0].name} ({stats.leaderboard[0].wins}W)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation & Search Filters Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              id="tab-history-matches"
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'matches'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Partidas ({history.length})</span>
            </button>
            <button
              id="tab-history-stats"
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Estadísticas de Jugadores</span>
            </button>
          </div>

          {/* Search & Mode Filters */}
          {activeTab === 'matches' && history.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-history-search"
                  type="text"
                  placeholder="Buscar jugador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                id="select-history-filter-mode"
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Todos los modos</option>
                <option value="digital">🎲 Electrónico</option>
                <option value="tracker">📋 Físico</option>
              </select>
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* TAB 1: MATCHES LIST */}
          {activeTab === 'matches' && (
            <>
              {history.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-3xl">
                    🎲
                  </div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">
                    No hay partidas guardadas en el historial
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Al completar una partida de Yatzy (o al guardarla), se registrará aquí automáticamente con el desglose de puntos de cada jugador.
                  </p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  No se encontraron partidas con el filtro seleccionado "{searchQuery}".
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredHistory.map((match) => {
                    const sortedPlayers = [...match.players].sort(
                      (a, b) => b.grandTotal - a.grandTotal
                    );
                    const winner = match.winner;

                    return (
                      <div
                        key={match.id}
                        id={`history-match-card-${match.id}`}
                        className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col gap-3.5 shadow-xs"
                      >
                        {/* Match Metadata Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(match.date)}
                            </span>

                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                match.mode === 'digital'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {match.mode === 'digital' ? (
                                <>
                                  <Dices className="w-3 h-3" /> Electrónico
                                </>
                              ) : (
                                <>
                                  <ClipboardList className="w-3 h-3" /> Físico
                                </>
                              )}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                match.isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {match.isCompleted ? 'Completada (15/15)' : `Ronda ${match.round}/15`}
                            </span>
                          </div>

                          {/* Delete single match button */}
                          <button
                            id={`btn-delete-match-${match.id}`}
                            type="button"
                            onClick={() => {
                              if (window.confirm('¿Eliminar esta partida del historial?')) {
                                onDeleteMatch(match.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Eliminar esta partida"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Players Standings Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {sortedPlayers.map((p, rank) => {
                            const isWinner = winner && winner.id === p.id && !match.isTie;
                            return (
                              <div
                                key={p.id}
                                className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
                                  isWinner
                                    ? 'bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/30'
                                    : 'bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600/70'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xl shrink-0">{p.avatar}</span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                                        {p.name}
                                      </span>
                                      {isWinner && (
                                        <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">
                                      {rank === 0 ? '1º lugar' : `${rank + 1}º lugar`}
                                      {p.upperBonus > 0 && ' • +50 bonus'}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-black text-sm text-slate-900 dark:text-white">
                                    {p.grandTotal}
                                  </span>
                                  <span className="text-[9px] text-slate-400 block font-semibold">
                                    pts
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Action buttons on card: Inspect Scorecard / Rematch */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {match.players.length} {match.players.length === 1 ? 'jugador' : 'jugadores'}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              id={`btn-view-detail-${match.id}`}
                              type="button"
                              onClick={() => setViewingDetailMatch(match)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Ver Scorecard</span>
                            </button>

                            <button
                              id={`btn-rematch-${match.id}`}
                              type="button"
                              onClick={() => handleRematch(match)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Revancha</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PLAYER LEADERBOARD & STATS */}
          {activeTab === 'stats' && (
            <div className="flex flex-col gap-4">
              {stats.leaderboard.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs font-semibold">
                  Aún no hay estadísticas registradas.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-left">
                        <th className="py-3 px-3 font-bold">Jugador</th>
                        <th className="py-3 px-3 font-bold text-center">Victorias</th>
                        <th className="py-3 px-3 font-bold text-center">Partidas</th>
                        <th className="py-3 px-3 font-bold text-center">Winrate</th>
                        <th className="py-3 px-3 font-bold text-center">Media Pts</th>
                        <th className="py-3 px-3 font-bold text-center">Récord Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.leaderboard.map((player, idx) => {
                        const winRate =
                          player.matchesPlayed > 0
                            ? Math.round((player.wins / player.matchesPlayed) * 100)
                            : 0;

                        return (
                          <tr
                            key={player.name}
                            className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-500/5 transition-colors font-medium"
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{player.avatar}</span>
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-100">
                                    {player.name}
                                  </span>
                                  {idx === 0 && player.wins > 0 && (
                                    <span className="inline-flex items-center gap-0.5 ml-2 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                      <Trophy className="w-2.5 h-2.5 text-amber-500" /> Líder
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center font-black text-amber-600 dark:text-amber-400">
                              {player.wins}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300">
                              {player.matchesPlayed}
                            </td>
                            <td className="py-3 px-3 text-center font-bold">
                              {winRate}%
                            </td>
                            <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-200">
                              {player.avgScore}
                            </td>
                            <td className="py-3 px-3 text-center font-black text-emerald-600 dark:text-emerald-400">
                              {player.highestScore}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <div>
            {history.length > 0 && (
              <button
                id="btn-clear-all-history"
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Estás seguro de que deseas borrar TODO el histórico de partidas? Esta acción no se puede deshacer.'
                    )
                  ) {
                    onClearAllHistory();
                  }
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar todo el historial</span>
              </button>
            )}
          </div>

          <button
            id="btn-history-close"
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </motion.div>

      {/* DETAIL MODAL FOR A SPECIFIC HISTORICAL MATCH */}
      <AnimatePresence>
        {viewingDetailMatch && (
          <div
            id="match-detail-overlay"
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              id="match-detail-card"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                    <span>Detalle de Scorecard</span>
                    <span className="text-xs font-semibold text-slate-400">
                      • {formatDate(viewingDetailMatch.date)}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modo {viewingDetailMatch.mode === 'digital' ? 'Electrónico' : 'Físico'} •{' '}
                    {viewingDetailMatch.isCompleted
                      ? 'Partida Completa'
                      : `Hasta Ronda ${viewingDetailMatch.round}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingDetailMatch(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table */}
              <div className="p-4 overflow-y-auto flex-1">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      <th className="py-2 px-2 text-left font-bold w-1/3">Categoría</th>
                      {viewingDetailMatch.players.map((p) => (
                        <th key={p.id} className="py-2 px-2 text-center font-bold">
                          <div className="flex flex-col items-center">
                            <span className="text-base">{p.avatar}</span>
                            <span className="truncate max-w-[70px]">{p.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Upper Section */}
                    <tr className="bg-slate-50 dark:bg-slate-950/40 font-bold text-slate-400 text-[10px] uppercase">
                      <td colSpan={viewingDetailMatch.players.length + 1} className="py-1 px-2">
                        Sección Superior
                      </td>
                    </tr>
                    {UPPER_CATEGORIES.map((cat) => (
                      <tr
                        key={cat.id}
                        className="border-b border-slate-200/50 dark:border-slate-800/50"
                      >
                        <td className="py-1.5 px-2 text-slate-700 dark:text-slate-300 font-medium">
                          {cat.name}
                        </td>
                        {viewingDetailMatch.players.map((p) => (
                          <td key={p.id} className="py-1.5 px-2 text-center font-semibold">
                            {p.scores[cat.id] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Subtotal & Bonus */}
                    <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold border-b border-slate-200">
                      <td className="py-1.5 px-2">Suma Superior</td>
                      {viewingDetailMatch.players.map((p) => (
                        <td key={p.id} className="py-1.5 px-2 text-center">
                          {p.upperSum} / 63
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-amber-500/10 font-bold border-b border-slate-200 text-amber-800 dark:text-amber-300">
                      <td className="py-1.5 px-2">Bonus (+50)</td>
                      {viewingDetailMatch.players.map((p) => (
                        <td key={p.id} className="py-1.5 px-2 text-center">
                          {p.upperBonus > 0 ? '+50' : '0'}
                        </td>
                      ))}
                    </tr>

                    {/* Lower Section */}
                    <tr className="bg-slate-50 dark:bg-slate-950/40 font-bold text-slate-400 text-[10px] uppercase">
                      <td colSpan={viewingDetailMatch.players.length + 1} className="py-1 px-2">
                        Sección Inferior
                      </td>
                    </tr>
                    {LOWER_CATEGORIES.map((cat) => (
                      <tr
                        key={cat.id}
                        className="border-b border-slate-200/50 dark:border-slate-800/50"
                      >
                        <td className="py-1.5 px-2 text-slate-700 dark:text-slate-300 font-medium">
                          {cat.name}
                        </td>
                        {viewingDetailMatch.players.map((p) => (
                          <td key={p.id} className="py-1.5 px-2 text-center font-semibold">
                            {p.scores[cat.id] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Grand Total */}
                    <tr className="bg-emerald-500/20 font-black text-sm text-slate-900 dark:text-white border-t-2 border-emerald-500">
                      <td className="py-2.5 px-2 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>TOTAL</span>
                      </td>
                      {viewingDetailMatch.players.map((p) => (
                        <td key={p.id} className="py-2.5 px-2 text-center text-base">
                          {p.grandTotal}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleRematch(viewingDetailMatch);
                    setViewingDetailMatch(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Jugar Revancha</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingDetailMatch(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
