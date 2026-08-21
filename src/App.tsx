/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DiceArena } from './components/DiceArena';
import { PhysicalTrackerInput } from './components/PhysicalTrackerInput';
import { Scorecard } from './components/Scorecard';
import { PlayerSetupModal } from './components/PlayerSetupModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { PhysicalScoreModal } from './components/PhysicalScoreModal';
import { HistoryModal } from './components/HistoryModal';
import { sound } from './utils/audio';
import {
  CATEGORIES,
  calculateCategoryScore,
  calculatePlayerTotals,
  findBestCategory,
  RecommendationResult,
} from './utils/yatzyLogic';
import {
  STORAGE_KEYS,
  loadMatchHistory,
  saveMatchRecord,
  deleteMatchRecord,
  clearAllMatchHistory,
  loadSavedPlayersProfile,
  createMatchRecordFromPlayers,
} from './utils/historyStorage';
import { Category, GameMode, Player, AppTheme, MatchRecord } from './types';
import { Dices, Eye, EyeOff, Sparkles, HelpCircle, Undo2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameSnapshot {
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  physicalDice: number[];
  mode: GameMode;
  actionDescription?: string;
}

export default function App() {
  // Saved Match ID
  const [currentMatchId, setCurrentMatchId] = useState<string>(
    () => `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  );

  // Match History
  const [history, setHistory] = useState<MatchRecord[]>(() => loadMatchHistory());

  // Game Setup & Mode
  const [mode, setMode] = useState<GameMode>('digital');
  const [players, setPlayers] = useState<Player[]>(() => {
    const savedProfile = loadSavedPlayersProfile();
    const count = savedProfile.playerCount || 2;
    return savedProfile.players.slice(0, count).map((p, idx) => ({
      id: String(idx + 1),
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      scores: {},
    }));
  });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [round, setRound] = useState<number>(1);

  // Digital Dice Rolling State
  const [dice, setDice] = useState<number[]>([1, 2, 3, 4, 5]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState<number>(3);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isScoringOptionsCollapsed, setIsScoringOptionsCollapsed] = useState<boolean>(true);

  // Synchronized Physical Dice Tracker State (shared between mat & modal)
  const [physicalDice, setPhysicalDice] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedPhysicalCategory, setSelectedPhysicalCategory] = useState<Category | null>(null);
  const [showPhysicalSidePanel, setShowPhysicalSidePanel] = useState<boolean>(false);

  // Undo System Stack
  const [undoStack, setUndoStack] = useState<GameSnapshot[]>([]);
  const [undoToastMessage, setUndoToastMessage] = useState<string | null>(null);

  // App Settings & Preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<AppTheme>('felt');
  const [smartRecommendations, setSmartRecommendations] = useState<boolean>(true);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [viewingCategoryInfo, setViewingCategoryInfo] = useState<Category | null>(null);

  // Flag to avoid overwriting during initial mount check
  const [hasLoadedInitialStorage, setHasLoadedInitialStorage] = useState<boolean>(false);

  // PWA Installation & Standalone State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isStandaloneApp, setIsStandaloneApp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    }
    return false;
  });

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsStandaloneApp(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredInstallPrompt(null);
        }
      } catch (err) {
        console.error('Error launching PWA install prompt:', err);
      }
    }
  };

  // 1. Initial Mount: Load saved game or launch setup if no active game found
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
          setPlayers(parsed.players);
          setMode(parsed.mode || 'digital');
          setCurrentPlayerIndex(parsed.currentPlayerIndex || 0);
          setRound(parsed.round || 1);
          setDice(parsed.dice || [1, 2, 3, 4, 5]);
          setHeld(parsed.held || [false, false, false, false, false]);
          setRollsLeft(parsed.rollsLeft ?? 3);
          setPhysicalDice(parsed.physicalDice || [1, 2, 3, 4, 5]);
          setTheme(parsed.theme || 'felt');
          setSoundEnabled(parsed.soundEnabled ?? true);
          setSmartRecommendations(parsed.smartRecommendations ?? true);
          setShowPhysicalSidePanel(parsed.showPhysicalSidePanel ?? false);
          if (parsed.currentMatchId) {
            setCurrentMatchId(parsed.currentMatchId);
          }
          setHasLoadedInitialStorage(true);
          return;
        }
      }

      // If no valid active game found in localStorage, open setup modal directly
      setShowSetupModal(true);
      setHasLoadedInitialStorage(true);
    } catch (err) {
      console.error('Error loading initial game state:', err);
      setShowSetupModal(true);
      setHasLoadedInitialStorage(true);
    }
  }, []);

  // 2. Real-Time Sync of Current Match State to localStorage
  useEffect(() => {
    if (!hasLoadedInitialStorage) return;

    try {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify({
          currentMatchId,
          players,
          mode,
          currentPlayerIndex,
          round,
          dice,
          held,
          rollsLeft,
          physicalDice,
          theme,
          soundEnabled,
          smartRecommendations,
          showPhysicalSidePanel,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error('Error saving current match to localStorage:', err);
    }
  }, [
    hasLoadedInitialStorage,
    currentMatchId,
    players,
    mode,
    currentPlayerIndex,
    round,
    dice,
    held,
    rollsLeft,
    physicalDice,
    theme,
    soundEnabled,
    smartRecommendations,
    showPhysicalSidePanel,
  ]);

  // Sync sound settings
  useEffect(() => {
    sound.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const activePlayer = players[currentPlayerIndex] || players[0];

  // Compute smart recommendation for active player & current dice (if enabled)
  const recommendation: RecommendationResult | null =
    smartRecommendations && mode === 'digital' && rollsLeft < 3
      ? findBestCategory(activePlayer, dice)
      : null;

  // Dice Roll Handler
  const handleRollDice = useCallback(() => {
    if (rollsLeft <= 0 || isRolling) return;

    setIsRolling(true);
    sound.playDiceRoll();

    // Roll animation delay
    setTimeout(() => {
      setDice((prevDice) =>
        prevDice.map((val, idx) => (held[idx] ? val : Math.floor(Math.random() * 6) + 1))
      );
      setRollsLeft((prev) => prev - 1);
      setIsRolling(false);
    }, 450);
  }, [rollsLeft, isRolling, held]);

  // Hold Toggle Handler
  const handleToggleHold = useCallback(
    (index: number) => {
      if (rollsLeft === 3 || rollsLeft === 0 || isRolling) return;
      setHeld((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        sound.playHoldToggle(next[index]);
        return next;
      });
    },
    [rollsLeft, isRolling]
  );

  // Advance turn to next player / next round
  const advanceTurn = (updatedPlayers: Player[]) => {
    // Check if game is completed for all players
    const allFinished = updatedPlayers.every((p) => {
      const totals = calculatePlayerTotals(p.scores);
      return totals.isComplete;
    });

    if (allFinished) {
      // Save completed match record into history
      const finishedRecord = createMatchRecordFromPlayers(
        updatedPlayers,
        mode,
        15,
        currentMatchId
      );
      const updatedHistory = saveMatchRecord(finishedRecord);
      setHistory(updatedHistory);

      setShowGameOverModal(true);
      return;
    }

    const nextPlayerIndex = (currentPlayerIndex + 1) % updatedPlayers.length;
    if (nextPlayerIndex === 0) {
      setRound((prev) => Math.min(15, prev + 1));
    }

    setCurrentPlayerIndex(nextPlayerIndex);
    setDice([1, 2, 3, 4, 5]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setSelectedCategory(null);
    setSelectedPhysicalCategory(null);
  };

  // Score a category clicked from the Scorecard
  const handleSelectScorecardCategory = (category: Category) => {
    if (activePlayer.scores[category] !== undefined) return;

    if (mode === 'tracker') {
      // Physical mode: open the physical score modal with synchronized dice matching & direct entry
      setSelectedPhysicalCategory(category);
    } else {
      // Digital mode: must roll at least once
      if (rollsLeft === 3) return;
      const score = calculateCategoryScore(category, dice);
      recordScoreForActivePlayer(category, score);
    }
  };

  // Score confirmation from PhysicalScoreModal
  const handleConfirmPhysicalScore = (category: Category, score: number) => {
    recordScoreForActivePlayer(category, score);
    setSelectedPhysicalCategory(null);
  };

  // Score a category with physical dice in Tracker mode (from optional side panel)
  const handleScoreCategoryWithPhysicalDice = (category: Category, diceUsed: number[]) => {
    if (activePlayer.scores[category] !== undefined) return;
    const score = calculateCategoryScore(category, diceUsed);
    recordScoreForActivePlayer(category, score);
  };

  // Direct manual score input in Tracker mode (from optional side panel)
  const handleDirectManualScore = (category: Category, scoreValue: number) => {
    if (activePlayer.scores[category] !== undefined) return;
    recordScoreForActivePlayer(category, scoreValue);
  };

  // Record score & save snapshot to undo stack
  const recordScoreForActivePlayer = (category: Category, score: number) => {
    const catName = CATEGORIES.find((c) => c.id === category)?.name || category;

    // Snapshot current state for UNDO
    const snapshot: GameSnapshot = {
      players: JSON.parse(JSON.stringify(players)),
      currentPlayerIndex,
      round,
      dice: [...dice],
      held: [...held],
      rollsLeft,
      physicalDice: [...physicalDice],
      mode,
      actionDescription: `${activePlayer.name}: +${score} pts en ${catName}`,
    };

    setUndoStack((prev) => [...prev, snapshot]);

    const beforeTotals = calculatePlayerTotals(activePlayer.scores);

    // Audio chimes
    if (category === 'yatzy' && score === 50) {
      sound.playYatzyFanfare();
    } else {
      sound.playScoreRecorded();
    }

    const updatedPlayers = [...players];
    const updatedScores = { ...activePlayer.scores, [category]: score };
    updatedPlayers[currentPlayerIndex] = {
      ...activePlayer,
      scores: updatedScores,
    };

    // Check if player just reached the upper bonus
    const afterTotals = calculatePlayerTotals(updatedScores);
    if (beforeTotals.upperBonus === 0 && afterTotals.upperBonus > 0) {
      sound.playBonus();
    }

    setPlayers(updatedPlayers);
    advanceTurn(updatedPlayers);
  };

  // UNDO LAST ACTION
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastSnapshot = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    setPlayers(lastSnapshot.players);
    setCurrentPlayerIndex(lastSnapshot.currentPlayerIndex);
    setRound(lastSnapshot.round);
    setDice(lastSnapshot.dice);
    setHeld(lastSnapshot.held);
    setRollsLeft(lastSnapshot.rollsLeft);
    setPhysicalDice(lastSnapshot.physicalDice);
    setMode(lastSnapshot.mode);
    setShowGameOverModal(false);
    setSelectedCategory(null);
    setSelectedPhysicalCategory(null);

    sound.playHoldToggle(false);
    setUndoToastMessage(
      lastSnapshot.actionDescription
        ? `Acción deshecha (${lastSnapshot.actionDescription})`
        : 'Última acción deshecha correctamente'
    );

    setTimeout(() => {
      setUndoToastMessage(null);
    }, 3500);
  }, [undoStack]);

  // Start new game with configured players & mode
  const handleStartNewGame = (newPlayers: Player[], newMode: GameMode) => {
    const newId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCurrentMatchId(newId);
    setPlayers(newPlayers);
    setMode(newMode);
    setCurrentPlayerIndex(0);
    setRound(1);
    setDice([1, 2, 3, 4, 5]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setPhysicalDice([1, 2, 3, 4, 5]);
    setUndoStack([]);
    setSelectedCategory(null);
    setSelectedPhysicalCategory(null);
    setShowSetupModal(false);
    setShowGameOverModal(false);
  };

  // Rematch / Restart with same players
  const handlePlayAgain = () => {
    const newId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCurrentMatchId(newId);
    const resetPlayers = players.map((p) => ({
      ...p,
      scores: {},
    }));
    setPlayers(resetPlayers);
    setCurrentPlayerIndex(0);
    setRound(1);
    setDice([1, 2, 3, 4, 5]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setPhysicalDice([1, 2, 3, 4, 5]);
    setUndoStack([]);
    setSelectedCategory(null);
    setSelectedPhysicalCategory(null);
    setShowGameOverModal(false);
  };

  // History Actions
  const handleDeleteMatch = (matchId: string) => {
    const updated = deleteMatchRecord(matchId);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearAllMatchHistory();
    setHistory([]);
  };

  const handleRematchWithPlayers = (rematchPlayers: Player[], rematchMode: GameMode) => {
    handleStartNewGame(rematchPlayers, rematchMode);
  };

  // Keyboard controls (Space to roll, 1-5 to hold, Ctrl+Z to undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z or Cmd+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (undoStack.length > 0) {
          e.preventDefault();
          handleUndo();
          return;
        }
      }

      // Don't intercept when typing in input or when modal is open
      if (
        ['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) ||
        selectedPhysicalCategory !== null ||
        showSettingsModal ||
        showSetupModal ||
        showGameOverModal ||
        showRulesModal ||
        showHistoryModal ||
        viewingCategoryInfo !== null
      ) {
        return;
      }

      if (e.code === 'Space' && mode === 'digital') {
        e.preventDefault();
        if (rollsLeft > 0 && !isRolling) {
          handleRollDice();
        }
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        const index = parseInt(e.code.replace('Digit', '')) - 1;
        if (index >= 0 && index < 5 && mode === 'digital' && rollsLeft < 3 && rollsLeft > 0) {
          e.preventDefault();
          handleToggleHold(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    mode,
    rollsLeft,
    isRolling,
    handleRollDice,
    handleToggleHold,
    handleUndo,
    undoStack.length,
    selectedPhysicalCategory,
    showSettingsModal,
    showSetupModal,
    showGameOverModal,
    showRulesModal,
    showHistoryModal,
    viewingCategoryInfo,
  ]);

  // Theme styling classes
  const themeContainerClasses = {
    felt: 'bg-[#0a2f1d] text-slate-100 bg-[radial-gradient(#144f33_1px,transparent_1px)] [background-size:20px_20px]',
    dark: 'bg-slate-950 text-slate-100 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]',
    light: 'bg-slate-100 text-slate-900 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]',
    wood: 'bg-[#2b1810] text-amber-50 bg-[radial-gradient(#4a2818_1px,transparent_1px)] [background-size:20px_20px]',
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${themeContainerClasses}`}>
      {/* Streamlined Header Bar */}
      <Header
        round={round}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        rollsLeft={rollsLeft}
        mode={mode}
        historyCount={history.length}
        canUndo={undoStack.length > 0}
        onUndo={handleUndo}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onResetGame={handlePlayAgain}
      />

      {/* Undo Toast Banner */}
      <AnimatePresence>
        {undoToastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-amber-300"
          >
            <Undo2 className="w-4 h-4 text-slate-950" />
            <span>{undoToastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-6">

        {/* Dynamic Layout Based on Mode */}
        {mode === 'digital' ? (
          // Electronic Dice Mode: 2-column layout (Dice Arena + Scorecard)
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <DiceArena
                dice={dice}
                held={held}
                rollsLeft={rollsLeft}
                isRolling={isRolling}
                currentPlayer={activePlayer}
                recommendation={recommendation}
                selectedCategory={selectedCategory}
                smartRecommendations={smartRecommendations}
                onToggleHold={handleToggleHold}
                onRollDice={handleRollDice}
                onScoreCategory={handleSelectScorecardCategory}
                isScoringOptionsCollapsed={isScoringOptionsCollapsed}
                onToggleScoringOptionsCollapsed={() => setIsScoringOptionsCollapsed((prev) => !prev)}
              />
            </div>

            <div className="lg:col-span-7">
              <Scorecard
                players={players}
                currentPlayerIndex={currentPlayerIndex}
                mode={mode}
                dice={dice}
                rollsLeft={rollsLeft}
                recommendation={recommendation}
                selectedCategory={selectedCategory}
                smartRecommendations={smartRecommendations}
                onSelectCategory={handleSelectScorecardCategory}
                onOpenCategoryInfo={(cat) => setViewingCategoryInfo(cat)}
              />
            </div>
          </div>
        ) : (
          // Physical Tabletop Dice Mode: Clean Scorecard with optional Side Mat toggle
          <div className="flex flex-col gap-4">
            {/* Top Toolbar for Physical Mode with Optional Mat Toggle */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="text-xs sm:text-sm dark:text-white/80 font-medium">
                🎲 Tira los dados reales en tu mesa y pulsa <strong className="text-emerald-600 dark:text-emerald-300 font-bold">+ Anotar</strong> en cualquier casilla.
              </div>

              <button
                id="btn-toggle-physical-mat"
                type="button"
                onClick={() => setShowPhysicalSidePanel((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-black/15 dark:border-white/15 shrink-0"
                title="Mostrar/ocultar tapete auxiliar de dados"
              >
                {showPhysicalSidePanel ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ocultar Tapete</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Mostrar Tapete</span>
                  </>
                )}
              </button>
            </div>

            <div className={showPhysicalSidePanel ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : 'w-full'}>
              {showPhysicalSidePanel && (
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <PhysicalTrackerInput
                    currentPlayer={activePlayer}
                    physicalDice={physicalDice}
                    onUpdatePhysicalDice={setPhysicalDice}
                    smartRecommendations={smartRecommendations}
                    onScoreCategoryWithDice={handleScoreCategoryWithPhysicalDice}
                  />
                </div>
              )}

              <div className={showPhysicalSidePanel ? 'lg:col-span-7' : 'w-full'}>
                <Scorecard
                  players={players}
                  currentPlayerIndex={currentPlayerIndex}
                  mode={mode}
                  dice={physicalDice}
                  rollsLeft={0}
                  recommendation={smartRecommendations ? findBestCategory(activePlayer, physicalDice) : null}
                  selectedCategory={selectedCategory}
                  smartRecommendations={smartRecommendations}
                  onSelectCategory={handleSelectScorecardCategory}
                  onOpenCategoryInfo={(cat) => setViewingCategoryInfo(cat)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Physical Dice Score Entry Popup Modal (Synchronized with Physical Dice) */}
      <PhysicalScoreModal
        isOpen={selectedPhysicalCategory !== null}
        category={selectedPhysicalCategory}
        player={activePlayer}
        physicalDice={physicalDice}
        onUpdatePhysicalDice={setPhysicalDice}
        onClose={() => setSelectedPhysicalCategory(null)}
        onConfirmScore={handleConfirmPhysicalScore}
      />

      {/* Options & Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        mode={mode}
        theme={theme}
        soundEnabled={soundEnabled}
        smartRecommendations={smartRecommendations}
        historyCount={history.length}
        installPromptAvailable={Boolean(deferredInstallPrompt)}
        isStandalone={isStandaloneApp}
        onInstallApp={handleInstallPWA}
        onClose={() => setShowSettingsModal(false)}
        onSelectMode={(newMode) => setMode(newMode)}
        onSelectTheme={(newTheme) => setTheme(newTheme)}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onToggleSmartRecommendations={() => setSmartRecommendations((prev) => !prev)}
        onRestartMatch={handlePlayAgain}
        onOpenReconfigure={() => {
          setShowSettingsModal(false);
          setShowSetupModal(true);
        }}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
      />

      {/* Match History Modal */}
      <HistoryModal
        isOpen={showHistoryModal}
        history={history}
        onClose={() => setShowHistoryModal(false)}
        onDeleteMatch={handleDeleteMatch}
        onClearAllHistory={handleClearAllHistory}
        onRematchWithPlayers={handleRematchWithPlayers}
      />

      {/* Player Setup & Game Reconfigure Modal */}
      <PlayerSetupModal
        isOpen={showSetupModal}
        initialMode={mode}
        initialPlayers={players}
        onStartGame={handleStartNewGame}
        onClose={() => setShowSetupModal(false)}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOverModal}
        players={players}
        mode={mode}
        onPlayAgain={handlePlayAgain}
        onNewGameSetup={() => {
          setShowGameOverModal(false);
          setShowSetupModal(true);
        }}
        onOpenHistory={() => {
          setShowGameOverModal(false);
          setShowHistoryModal(true);
        }}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* Category Details Modal */}
      <CategoryDetailModal
        categoryId={viewingCategoryInfo}
        onClose={() => setViewingCategoryInfo(null)}
      />
    </div>
  );
}
