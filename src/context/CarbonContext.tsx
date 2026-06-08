import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CalculatorData, DailyAction, Badge, DailyLog } from '../types';

interface CarbonContextProps {
  hasCalculated: boolean;
  calculatorData: CalculatorData;
  dailyLogs: DailyLog[];
  badges: Badge[];
  streak: number;
  points: number;
  co2OffsetTotal: number; // in kg
  updateCalculator: (data: Partial<CalculatorData>) => void;
  setCalculatorCompleted: () => void;
  toggleAction: (date: string, actionId: string) => void;
  getEmissionsByCategory: () => { transport: number; energy: number; food: number; shopping: number };
  getTotalEmissions: () => number; // in metric tons
  getDailyOffsetForDate: (date: string) => number; // in kg
  resetData: () => void;
}

const DEFAULT_CALCULATOR_DATA: CalculatorData = {
  carKm: 160,
  carType: 'compact',
  transitHours: 2,
  flightsShort: 2,
  flightsLong: 0,
  electricityKwh: 300,
  heatingSource: 'gas',
  gasBill: 2500,
  diet: 'low-meat',
  waste: 'average',
  shoppingHabits: 'average',
  electronics: 'average',
};

export const AVAILABLE_ACTIONS: DailyAction[] = [
  {
    id: 'walk_cycle',
    category: 'transport',
    title: 'Walk or Cycle',
    description: 'Walk or bike instead of driving a car for short trips.',
    points: 25,
    co2Offset: 2.4,
    icon: 'bike',
  },
  {
    id: 'plant_meal',
    category: 'food',
    title: 'Plant-Based Meal',
    description: 'Eat a fully plant-based meal today (no meat or dairy).',
    points: 20,
    co2Offset: 1.5,
    icon: 'salad',
  },
  {
    id: 'shorter_shower',
    category: 'energy',
    title: 'Shorter Shower',
    description: 'Limit your shower to under 5 minutes to save water and energy.',
    points: 15,
    co2Offset: 0.5,
    icon: 'shower',
  },
  {
    id: 'line_dry',
    category: 'energy',
    title: 'Line Dry Clothes',
    description: 'Air dry laundry instead of using a high-energy tumble dryer.',
    points: 15,
    co2Offset: 0.8,
    icon: 'wind',
  },
  {
    id: 'unplug_idle',
    category: 'energy',
    title: 'Unplug Standby Devices',
    description: 'Turn off power strips and unplug appliances not in use.',
    points: 10,
    co2Offset: 0.3,
    icon: 'power',
  },
  {
    id: 'no_food_waste',
    category: 'waste',
    title: 'Zero Food Waste',
    description: 'Finish all meals and properly store leftovers to avoid throwing food away.',
    points: 15,
    co2Offset: 0.7,
    icon: 'trash',
  },
  {
    id: 'second_hand',
    category: 'shopping',
    title: 'Buy Second-Hand/Local',
    description: 'Buy local produce or thrift clothing/items instead of new ones.',
    points: 25,
    co2Offset: 1.8,
    icon: 'shopping-bag',
  },
  {
    id: 'lights_off',
    category: 'energy',
    title: 'Smart Lighting',
    description: 'Turn off lights when leaving rooms and use natural light when possible.',
    points: 10,
    co2Offset: 0.2,
    icon: 'lightbulb',
  },
  {
    id: 'reusable_cup',
    category: 'waste',
    title: 'Reusable Container',
    description: 'Use reusable water bottles, coffee cups, or grocery bags today.',
    points: 10,
    co2Offset: 0.2,
    icon: 'cup-soda',
  },
];

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_calc',
    title: 'Climate Conscious',
    description: 'Complete the carbon footprint questionnaire.',
    requirement: 'Questionnaire completed',
    iconName: 'Compass',
    unlocked: false,
  },
  {
    id: 'first_action',
    title: 'First Step',
    description: 'Log your first green daily action.',
    requirement: 'Log 1 daily action',
    iconName: 'Footprints',
    unlocked: false,
  },
  {
    id: 'streak_3',
    title: 'Eco Habit',
    description: 'Maintain a 3-day active streak.',
    requirement: '3-day streak',
    iconName: 'Flame',
    unlocked: false,
  },
  {
    id: 'streak_7',
    title: 'Climate Champion',
    description: 'Maintain a 7-day active streak.',
    requirement: '7-day streak',
    iconName: 'Zap',
    unlocked: false,
  },
  {
    id: 'offset_10',
    title: 'Carbon Cutter',
    description: 'Offset a total of 10kg of CO2 emissions.',
    requirement: '10kg offset',
    iconName: 'Leaf',
    unlocked: false,
  },
  {
    id: 'offset_50',
    title: 'Green Guardian',
    description: 'Offset a total of 50kg of CO2 emissions.',
    requirement: '50kg offset',
    iconName: 'Shield',
    unlocked: false,
  },
  {
    id: 'diversity_hero',
    title: 'Green All-Rounder',
    description: 'Perform at least one action from all 5 categories.',
    requirement: '5 categories logged',
    iconName: 'Layers',
    unlocked: false,
  },
];

const CarbonContext = createContext<CarbonContextProps | undefined>(undefined);

export const CarbonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or use defaults
  const [hasCalculated, setHasCalculated] = useState<boolean>(() => {
    const saved = localStorage.getItem('carbon_has_calculated');
    return saved ? JSON.parse(saved) : false;
  });

  const [calculatorData, setCalculatorData] = useState<CalculatorData>(() => {
    const saved = localStorage.getItem('carbon_calculator_data');
    return saved ? JSON.parse(saved) : DEFAULT_CALCULATOR_DATA;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('carbon_daily_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('carbon_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [streak, setStreak] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [co2OffsetTotal, setCo2OffsetTotal] = useState<number>(0);

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem('carbon_has_calculated', JSON.stringify(hasCalculated));
  }, [hasCalculated]);

  useEffect(() => {
    localStorage.setItem('carbon_calculator_data', JSON.stringify(calculatorData));
  }, [calculatorData]);

  useEffect(() => {
    localStorage.setItem('carbon_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('carbon_badges', JSON.stringify(badges));
  }, [badges]);

  // Recalculate totals, points, streaks, and check badges
  useEffect(() => {
    // 1. Calculate Total CO2 Offset and Points
    let totalOffset = 0;
    let totalPoints = 0;
    const actionIdsUsed = new Set<string>();

    dailyLogs.forEach((log) => {
      log.actions.forEach((actionId) => {
        const action = AVAILABLE_ACTIONS.find((a) => a.id === actionId);
        if (action) {
          totalOffset += action.co2Offset;
          totalPoints += action.points;
          actionIdsUsed.add(actionId);
        }
      });
    });

    setCo2OffsetTotal(Number(totalOffset.toFixed(1)));
    setPoints(totalPoints);

    // 2. Calculate Streaks (Consecutive days including today or ending yesterday)
    const activeDates = new Set(dailyLogs.filter(log => log.actions.length > 0).map(log => log.date));
    const sortedDates = Array.from(activeDates).sort();

    let currentStreak = 0;
    if (sortedDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Only calculate if the last logged action was today or yesterday
      const lastLoggedDate = sortedDates[sortedDates.length - 1];
      if (lastLoggedDate === todayStr || lastLoggedDate === yesterdayStr) {
        currentStreak = 1;
        let checkDate = new Date(lastLoggedDate);

        // Walk backwards to count consecutive days
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkDateStr = checkDate.toISOString().split('T')[0];
          if (activeDates.has(checkDateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }
    setStreak(currentStreak);

    // 3. Process Badges triggers
    let badgeTriggered = false;
    const newBadges = badges.map((badge) => {
      if (badge.unlocked) return badge;

      let shouldUnlock = false;

      if (badge.id === 'first_calc' && hasCalculated) {
        shouldUnlock = true;
      } else if (badge.id === 'first_action' && dailyLogs.some((l) => l.actions.length > 0)) {
        shouldUnlock = true;
      } else if (badge.id === 'streak_3' && currentStreak >= 3) {
        shouldUnlock = true;
      } else if (badge.id === 'streak_7' && currentStreak >= 7) {
        shouldUnlock = true;
      } else if (badge.id === 'offset_10' && totalOffset >= 10) {
        shouldUnlock = true;
      } else if (badge.id === 'offset_50' && totalOffset >= 50) {
        shouldUnlock = true;
      } else if (badge.id === 'diversity_hero') {
        const loggedCategories = new Set(
          Array.from(actionIdsUsed).map((id) => AVAILABLE_ACTIONS.find((a) => a.id === id)?.category)
        );
        if (loggedCategories.size >= 5) {
          shouldUnlock = true;
        }
      }

      if (shouldUnlock) {
        badgeTriggered = true;
        // Trigger a confetti or custom notification
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        });
        return { ...badge, unlocked: true };
      }
      return badge;
    });

    if (badgeTriggered) {
      setBadges(newBadges);
    }
  }, [dailyLogs, hasCalculated, badges]);

  const updateCalculator = (data: Partial<CalculatorData>) => {
    setCalculatorData((prev) => ({ ...prev, ...data }));
  };

  const setCalculatorCompleted = () => {
    setHasCalculated(true);
  };

  const toggleAction = (date: string, actionId: string) => {
    setDailyLogs((prevLogs) => {
      const existingLogIdx = prevLogs.findIndex((log) => log.date === date);

      if (existingLogIdx > -1) {
        const existingLog = prevLogs[existingLogIdx];
        const isActionLogged = existingLog.actions.includes(actionId);

        let newActions: string[];
        if (isActionLogged) {
          newActions = existingLog.actions.filter((id) => id !== actionId);
        } else {
          newActions = [...existingLog.actions, actionId];
        }

        const updatedLogs = [...prevLogs];
        updatedLogs[existingLogIdx] = { ...existingLog, actions: newActions };
        return updatedLogs.filter((log) => log.actions.length > 0); // remove empty logs
      } else {
        return [...prevLogs, { date, actions: [actionId] }];
      }
    });
  };

  const getEmissionsByCategory = () => {
    // Annual emissions in kg CO2

    // 1. Transportation
    let transportEmissions = 0;
    const { carKm, carType, transitHours, flightsShort, flightsLong } = calculatorData;

    // Car factors (kg CO2 / km)
    const carFactors = {
      none: 0,
      electric: 0.05,
      hybrid: 0.11,
      compact: 0.20,
      suv: 0.30,
    };
    transportEmissions += carKm * 52 * carFactors[carType];

    // Transit hours factor: ~2.2 kg CO2 per transit hour (based on average bus/train emissions per passenger-hour)
    transportEmissions += transitHours * 52 * 2.2;

    // Flights: short flight = 220 kg, long flight = 950 kg
    transportEmissions += flightsShort * 220 + flightsLong * 950;

    // 2. Home Energy
    let energyEmissions = 0;
    const { electricityKwh, heatingSource, gasBill } = calculatorData;

    // Electricity factor: ~0.38 kg CO2 per kWh
    energyEmissions += electricityKwh * 12 * 0.38;

    // Heating factors (kg CO2 per year)
    const heatingFactors = {
      none: 0,
      electricity: 300, // additional heat pump load
      gas: 1200,
      oil: 2400,
    };
    energyEmissions += heatingFactors[heatingSource];

    // Gas Bill factor (assuming ₹1 = roughly 0.03 kg CO2)
    energyEmissions += gasBill * 12 * 0.03;

    // 3. Food
    let foodEmissions = 0;
    const { diet, waste } = calculatorData;

    // Diet annual emissions (kg CO2)
    const dietEmissionsMap = {
      vegan: 900,
      vegetarian: 1300,
      'low-meat': 1900,
      'high-meat': 3100,
    };
    foodEmissions += dietEmissionsMap[diet];

    // Waste annual emissions
    const wasteEmissionsMap = {
      minimal: 40,
      average: 180,
      high: 450,
    };
    foodEmissions += wasteEmissionsMap[waste];

    // 4. Shopping & Consumption
    let shoppingEmissions = 0;
    const { shoppingHabits, electronics } = calculatorData;

    const shoppingMap = {
      minimalist: 250,
      average: 700,
      shopper: 1600,
    };
    shoppingEmissions += shoppingMap[shoppingHabits];

    const electronicsMap = {
      rarely: 80,
      average: 250,
      frequently: 650,
    };
    shoppingEmissions += electronicsMap[electronics];

    return {
      transport: Math.round(transportEmissions),
      energy: Math.round(energyEmissions),
      food: Math.round(foodEmissions),
      shopping: Math.round(shoppingEmissions),
    };
  };

  const getTotalEmissions = () => {
    const categories = getEmissionsByCategory();
    const totalKg = categories.transport + categories.energy + categories.food + categories.shopping;
    return Number((totalKg / 1000).toFixed(2)); // return in metric tons
  };

  const getDailyOffsetForDate = (date: string) => {
    const log = dailyLogs.find((l) => l.date === date);
    if (!log) return 0;
    return log.actions.reduce((acc, actionId) => {
      const action = AVAILABLE_ACTIONS.find((a) => a.id === actionId);
      return acc + (action ? action.co2Offset : 0);
    }, 0);
  };

  const resetData = () => {
    localStorage.removeItem('carbon_has_calculated');
    localStorage.removeItem('carbon_calculator_data');
    localStorage.removeItem('carbon_daily_logs');
    localStorage.removeItem('carbon_badges');
    setHasCalculated(false);
    setCalculatorData(DEFAULT_CALCULATOR_DATA);
    setDailyLogs([]);
    setBadges(INITIAL_BADGES.map(b => ({ ...b, unlocked: false })));
    setStreak(0);
    setPoints(0);
    setCo2OffsetTotal(0);
  };

  return (
    <CarbonContext.Provider
      value={{
        hasCalculated,
        calculatorData,
        dailyLogs,
        badges,
        streak,
        points,
        co2OffsetTotal,
        updateCalculator,
        setCalculatorCompleted,
        toggleAction,
        getEmissionsByCategory,
        getTotalEmissions,
        getDailyOffsetForDate,
        resetData,
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
};

export const useCarbon = () => {
  const context = useContext(CarbonContext);
  if (context === undefined) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
};
