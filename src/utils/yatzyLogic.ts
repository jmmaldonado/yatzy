import { Category, CategoryInfo, Player } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  // Upper Section
  {
    id: 'ones',
    name: 'Ones',
    shortName: '1s',
    description: 'Sum of dice showing 1',
    section: 'upper',
    example: '⚀ ⚀ ⚀ ⚂ ⚄ = 3 pts',
    maxScore: 5,
  },
  {
    id: 'twos',
    name: 'Twos',
    shortName: '2s',
    description: 'Sum of dice showing 2',
    section: 'upper',
    example: '⚁ ⚁ ⚁ ⚁ ⚅ = 8 pts',
    maxScore: 10,
  },
  {
    id: 'threes',
    name: 'Threes',
    shortName: '3s',
    description: 'Sum of dice showing 3',
    section: 'upper',
    example: '⚂ ⚂ ⚂ ⚀ ⚄ = 9 pts',
    maxScore: 15,
  },
  {
    id: 'fours',
    name: 'Fours',
    shortName: '4s',
    description: 'Sum of dice showing 4',
    section: 'upper',
    example: '⚃ ⚃ ⚃ ⚃ ⚂ = 16 pts',
    maxScore: 20,
  },
  {
    id: 'fives',
    name: 'Fives',
    shortName: '5s',
    description: 'Sum of dice showing 5',
    section: 'upper',
    example: '⚄ ⚄ ⚄ ⚁ ⚅ = 15 pts',
    maxScore: 25,
  },
  {
    id: 'sixes',
    name: 'Sixes',
    shortName: '6s',
    description: 'Sum of dice showing 6',
    section: 'upper',
    example: '⚅ ⚅ ⚅ ⚃ ⚁ = 18 pts',
    maxScore: 30,
  },

  // Lower Section
  {
    id: 'one_pair',
    name: 'One Pair',
    shortName: 'Pair',
    description: 'Two dice of the same number (highest pair)',
    section: 'lower',
    example: '⚄ ⚄ ⚂ ⚁ ⚀ = 10 pts',
    maxScore: 12,
  },
  {
    id: 'two_pairs',
    name: 'Two Pairs',
    shortName: '2 Pairs',
    description: 'Two different pairs of dice',
    section: 'lower',
    example: '⚅ ⚅ ⚃ ⚃ ⚁ = 20 pts',
    maxScore: 22,
  },
  {
    id: 'three_of_a_kind',
    name: 'Three of a Kind',
    shortName: '3 of Kind',
    description: 'Three dice of the same number',
    section: 'lower',
    example: '⚄ ⚄ ⚄ ⚂ ⚁ = 15 pts',
    maxScore: 18,
  },
  {
    id: 'four_of_a_kind',
    name: 'Four of a Kind',
    shortName: '4 of Kind',
    description: 'Four dice of the same number',
    section: 'lower',
    example: '⚅ ⚅ ⚅ ⚅ ⚁ = 24 pts',
    maxScore: 24,
  },
  {
    id: 'small_straight',
    name: 'Small Straight',
    shortName: 'Sm. Straight',
    description: 'Sequence 1-2-3-4-5 (scores 15)',
    section: 'lower',
    example: '⚀ ⚁ ⚂ ⚃ ⚄ = 15 pts',
    maxScore: 15,
  },
  {
    id: 'large_straight',
    name: 'Large Straight',
    shortName: 'Lg. Straight',
    description: 'Sequence 2-3-4-5-6 (scores 20)',
    section: 'lower',
    example: '⚁ ⚂ ⚃ ⚄ ⚅ = 20 pts',
    maxScore: 20,
  },
  {
    id: 'full_house',
    name: 'Full House',
    shortName: 'Full House',
    description: 'A 3-of-a-kind and a pair (sum of all dice)',
    section: 'lower',
    example: '⚅ ⚅ ⚅ ⚄ ⚄ = 28 pts',
    maxScore: 28,
  },
  {
    id: 'chance',
    name: 'Chance',
    shortName: 'Chance',
    description: 'Sum of all 5 dice regardless of combination',
    section: 'lower',
    example: '⚅ ⚅ ⚄ ⚄ ⚃ = 26 pts',
    maxScore: 30,
  },
  {
    id: 'yatzy',
    name: 'Yatzy',
    shortName: 'YATZY',
    description: 'All 5 dice showing the exact same number (scores 50)',
    section: 'lower',
    example: '⚅ ⚅ ⚅ ⚅ ⚅ = 50 pts',
    maxScore: 50,
  },
];

export const UPPER_CATEGORIES = CATEGORIES.filter(c => c.section === 'upper');
export const LOWER_CATEGORIES = CATEGORIES.filter(c => c.section === 'lower');

// Helper to count frequencies of each face 1-6
export function getCounts(dice: number[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const d of dice) {
    if (d >= 1 && d <= 6) {
      counts[d] = (counts[d] || 0) + 1;
    }
  }
  return counts;
}

// Calculate the score for a specific category given 5 dice
export function calculateCategoryScore(category: Category, dice: number[]): number {
  if (!dice || dice.length !== 5 || dice.some(d => d < 1 || d > 6)) {
    return 0;
  }

  const counts = getCounts(dice);
  const sumAll = dice.reduce((acc, val) => acc + val, 0);

  switch (category) {
    case 'ones':
      return counts[1] * 1;
    case 'twos':
      return counts[2] * 2;
    case 'threes':
      return counts[3] * 3;
    case 'fours':
      return counts[4] * 4;
    case 'fives':
      return counts[5] * 5;
    case 'sixes':
      return counts[6] * 6;

    case 'one_pair': {
      // Find highest pair
      for (let num = 6; num >= 1; num--) {
        if (counts[num] >= 2) {
          return num * 2;
        }
      }
      return 0;
    }

    case 'two_pairs': {
      // Find two different pairs
      const pairs: number[] = [];
      for (let num = 6; num >= 1; num--) {
        if (counts[num] >= 2) {
          pairs.push(num);
        }
      }
      if (pairs.length >= 2) {
        return pairs[0] * 2 + pairs[1] * 2;
      }
      return 0;
    }

    case 'three_of_a_kind': {
      for (let num = 6; num >= 1; num--) {
        if (counts[num] >= 3) {
          return num * 3;
        }
      }
      return 0;
    }

    case 'four_of_a_kind': {
      for (let num = 6; num >= 1; num--) {
        if (counts[num] >= 4) {
          return num * 4;
        }
      }
      return 0;
    }

    case 'small_straight': {
      // 1-2-3-4-5
      const isSmallStraight =
        counts[1] >= 1 &&
        counts[2] >= 1 &&
        counts[3] >= 1 &&
        counts[4] >= 1 &&
        counts[5] >= 1;
      return isSmallStraight ? 15 : 0;
    }

    case 'large_straight': {
      // 2-3-4-5-6
      const isLargeStraight =
        counts[2] >= 1 &&
        counts[3] >= 1 &&
        counts[4] >= 1 &&
        counts[5] >= 1 &&
        counts[6] >= 1;
      return isLargeStraight ? 20 : 0;
    }

    case 'full_house': {
      // 3 of one number and 2 of another number (different)
      let hasThree = 0;
      let hasTwo = 0;

      for (let num = 6; num >= 1; num--) {
        if (counts[num] === 3) {
          hasThree = num;
        } else if (counts[num] === 2) {
          hasTwo = num;
        }
      }

      if (hasThree > 0 && hasTwo > 0) {
        return sumAll;
      }
      return 0;
    }

    case 'chance':
      return sumAll;

    case 'yatzy': {
      for (let num = 1; num <= 6; num++) {
        if (counts[num] === 5) {
          return 50;
        }
      }
      return 0;
    }

    default:
      return 0;
  }
}

// Calculate player score totals & bonus
export function calculatePlayerTotals(scores: Partial<Record<Category, number>>) {
  const upperCategories: Category[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
  const lowerCategories: Category[] = [
    'one_pair',
    'two_pairs',
    'three_of_a_kind',
    'four_of_a_kind',
    'small_straight',
    'large_straight',
    'full_house',
    'chance',
    'yatzy',
  ];

  let upperSum = 0;
  let upperFilledCount = 0;
  for (const cat of upperCategories) {
    if (scores[cat] !== undefined) {
      upperSum += scores[cat]!;
      upperFilledCount++;
    }
  }

  const upperBonusThreshold = 63;
  const upperBonus = upperSum >= upperBonusThreshold ? 50 : 0;
  const upperTotal = upperSum + upperBonus;

  let lowerSum = 0;
  let lowerFilledCount = 0;
  for (const cat of lowerCategories) {
    if (scores[cat] !== undefined) {
      lowerSum += scores[cat]!;
      lowerFilledCount++;
    }
  }

  const grandTotal = upperTotal + lowerSum;
  const filledCount = upperFilledCount + lowerFilledCount;
  const isComplete = filledCount === 15;

  return {
    upperSum,
    upperBonusThreshold,
    upperBonus,
    upperTotal,
    lowerSum,
    grandTotal,
    filledCount,
    isComplete,
    neededForBonus: Math.max(0, upperBonusThreshold - upperSum),
  };
}

// Find recommended category with smart scoring heuristics
export interface RecommendationResult {
  category: Category;
  score: number;
  reason: string;
  isHighValue: boolean;
}

export function findBestCategory(
  player: Player,
  dice: number[]
): RecommendationResult | null {
  const openCategories = CATEGORIES.filter(c => player.scores[c.id] === undefined);
  if (openCategories.length === 0) return null;

  // Calculate scores for all open categories
  const scoredCategories = openCategories.map(cat => {
    const rawScore = calculateCategoryScore(cat.id, dice);
    const maxScore = cat.maxScore;
    const efficiency = maxScore > 0 ? rawScore / maxScore : 0;

    // Heuristic weight adjustments:
    let strategicScore = rawScore * 10;

    // 1. Yatzy scored is top priority!
    if (cat.id === 'yatzy' && rawScore === 50) {
      strategicScore += 10000;
    }

    // 2. Straights are fixed value, if hit, prioritize them highly
    if ((cat.id === 'large_straight' || cat.id === 'small_straight') && rawScore > 0) {
      strategicScore += 5000;
    }

    // 3. Full house is high value when achieved
    if (cat.id === 'full_house' && rawScore >= 20) {
      strategicScore += 4000;
    }

    // 4. Upper section: hitting >= 3 of a kind (average target for 63 bonus) gives great bonus priority
    if (cat.section === 'upper') {
      const targetVal = { ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6 }[cat.id as Category];
      if (targetVal) {
        const count = rawScore / targetVal;
        if (count >= 4) strategicScore += 4500;
        else if (count >= 3) strategicScore += 3000;
        else if (count === 2 && (targetVal === 1 || targetVal === 2)) {
          // 2 ones or 2 twos is okay to take if no better option
          strategicScore += 500;
        }
      }
    }

    // 5. Four of a kind & 3 of a kind
    if (cat.id === 'four_of_a_kind' && rawScore >= 16) {
      strategicScore += 3500;
    }
    if (cat.id === 'two_pairs' && rawScore >= 16) {
      strategicScore += 2000;
    }

    // 6. Chance: preserve chance if score is low, use it if score is high (>= 22)
    if (cat.id === 'chance') {
      if (rawScore >= 22) strategicScore += 1500;
      else strategicScore -= 2000; // avoid wasting chance on low rolls
    }

    return {
      category: cat.id,
      name: cat.name,
      score: rawScore,
      strategicScore,
      efficiency,
    };
  });

  // Sort by strategic score descending
  scoredCategories.sort((a, b) => b.strategicScore - a.strategicScore);

  const best = scoredCategories[0];
  if (!best) return null;

  let reason = '';
  if (best.category === 'yatzy' && best.score === 50) {
    reason = '🌟 YATZY! 50 points!';
  } else if (best.category === 'large_straight' && best.score === 20) {
    reason = '🎯 Large Straight completed (20 pts)';
  } else if (best.category === 'small_straight' && best.score === 15) {
    reason = '🎯 Small Straight completed (15 pts)';
  } else if (best.category === 'full_house' && best.score > 0) {
    reason = `🏠 Full House! (+${best.score} pts)`;
  } else if (best.score > 0) {
    reason = `Best available: +${best.score} pts in ${CATEGORIES.find(c => c.id === best.category)?.name}`;
  } else {
    // If all scores are 0, recommend scratching the least damaging category (e.g. ones, or yatzy if desperate)
    reason = `Scratch (0 pts) in ${CATEGORIES.find(c => c.id === best.category)?.name}`;
  }

  return {
    category: best.category,
    score: best.score,
    reason,
    isHighValue: best.score >= 15 || best.category === 'yatzy',
  };
}
