import React from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock } from 'lucide-react';

interface DieProps {
  value: number; // 1 to 6
  isHeld?: boolean;
  isRolling?: boolean;
  disabled?: boolean;
  index: number;
  onToggleHold?: (index: number) => void;
  onClick?: (index: number) => void;
  showHoldLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Die: React.FC<DieProps> = ({
  value,
  isHeld = false,
  isRolling = false,
  disabled = false,
  index,
  onToggleHold,
  onClick,
  showHoldLabel = Boolean(onToggleHold),
  size = 'md',
}) => {
  // Dot pip positions for standard die faces (3x3 grid)
  const pipPositions: Record<number, number[]> = {
    1: [4], // center
    2: [0, 8], // top-left, bottom-right
    3: [0, 4, 8], // top-left, center, bottom-right
    4: [0, 2, 6, 8], // 4 corners
    5: [0, 2, 4, 6, 8], // 4 corners + center
    6: [0, 2, 3, 5, 6, 8], // 2 vertical columns of 3
  };

  const currentPips = pipPositions[value] || [4];

  const sizeClasses = {
    sm: 'w-11 h-11 rounded-xl p-1.5',
    md: 'w-15 h-15 sm:w-18 sm:h-18 rounded-2xl p-2.5',
    lg: 'w-18 h-18 sm:w-22 sm:h-22 rounded-2xl p-3',
  }[size];

  const pipSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    lg: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
  }[size];

  // Random rotation offset during roll
  const randomRotation = isRolling ? (index % 2 === 0 ? 360 : -360) : 0;
  const randomY = isRolling ? [0, -18, 4, -8, 0] : 0;

  const handleClick = () => {
    if (disabled || isRolling) return;
    if (onClick) {
      onClick(index);
    } else if (onToggleHold) {
      onToggleHold(index);
    }
  };

  const isClickable = Boolean(onClick || onToggleHold) && !disabled && !isRolling;

  return (
    <div className="flex flex-col items-center gap-1.5 select-none" id={`die-container-${index}`}>
      <motion.button
        id={`die-button-${index}`}
        type="button"
        disabled={disabled || isRolling || (!onClick && !onToggleHold)}
        onClick={handleClick}
        animate={{
          rotate: randomRotation,
          y: randomY,
          scale: isHeld ? 0.96 : 1,
        }}
        transition={{
          duration: isRolling ? 0.5 : 0.15,
          ease: 'easeInOut',
        }}
        whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
        whileTap={isClickable ? { scale: 0.92 } : {}}
        className={`relative ${sizeClasses} transition-all duration-200 shadow-lg flex flex-col justify-between ${
          isClickable ? 'cursor-pointer' : 'cursor-default'
        } ${
          isHeld
            ? 'bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-500 shadow-amber-500/25 ring-2 ring-amber-400/40'
            : 'bg-gradient-to-b from-white to-slate-100 border-2 border-slate-200/90 hover:border-slate-300 hover:shadow-xl'
        } ${disabled ? 'opacity-80' : ''}`}
        aria-label={`Die ${index + 1} with value ${value}${isHeld ? ' (Held)' : ''}`}
      >
        {/* Held badge indicator at top corner */}
        {isHeld && (
          <span
            id={`die-held-badge-${index}`}
            className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1 shadow-md flex items-center justify-center text-[10px]"
          >
            <Lock className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        )}

        {/* 3x3 Pip grid */}
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5 pointer-events-none">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((gridPos) => {
            const hasPip = currentPips.includes(gridPos);
            return (
              <div key={gridPos} className="flex items-center justify-center">
                {hasPip && (
                  <div
                    className={`${pipSize} rounded-full ${
                      value === 1
                        ? 'bg-rose-600 shadow-sm'
                        : isHeld
                        ? 'bg-amber-950 shadow-inner'
                        : 'bg-slate-900 shadow-inner'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </motion.button>

      {/* Hold toggle status label if requested */}
      {showHoldLabel && onToggleHold && (
        <button
          id={`die-hold-text-${index}`}
          type="button"
          disabled={disabled || isRolling}
          onClick={() => onToggleHold(index)}
          className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
            isHeld
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        >
          {isHeld ? (
            <>
              <Lock className="w-2.5 h-2.5" /> HELD
            </>
          ) : (
            <>
              <Unlock className="w-2.5 h-2.5" /> KEEP
            </>
          )}
        </button>
      )}
    </div>
  );
};
