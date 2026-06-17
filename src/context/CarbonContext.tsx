import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { CalculatorData, Badge, DailyLog } from '../types';
import {
  DEFAULT_CALCULATOR_DATA,
  AVAILABLE_ACTIONS,
  INITIAL_BADGES,
} from '../constants/carbonData';

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

  // 1. Derived stats: Total CO2 Offset and Points
  const { co2OffsetTotal, points } = useMemo(() => {
    let totalOffset = 0;
    let totalPoints = 0;
    const ids = new Set<string>();

    dailyLogs.forEach((log) => {
      log.actions.forEach((actionId) => {
        const action = AVAILABLE_ACTIONS.find((a) => a.id === actionId);
        if (action) {
          totalOffset += action.co2Offset;
          totalPoints += action.points;
          ids.add(actionId);
        }
      });
    });

    return {
      co2OffsetTotal: Number(totalOffset.toFixed(1)),
      points: totalPoints,
      actionIdsUsed: ids,
    };
  }, [dailyLogs]);

  // 2. Derived stats: Streak (Consecutive days including today or ending yesterday)
  const streak = useMemo(() => {
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
        const checkDate = new Date(lastLoggedDate);

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
    return currentStreak;
  }, [dailyLogs]);

  // 3. Process Badges triggers based on state changes to avoid infinite loop
  const checkAndUnlockBadges = (nextLogs: DailyLog[], hasCalc: boolean) => {
    // 1. Calculate next co2OffsetTotal and actionIdsUsed
    let totalOffset = 0;
    const ids = new Set<string>();
    nextLogs.forEach((log) => {
      log.actions.forEach((actionId) => {
        const action = AVAILABLE_ACTIONS.find((a) => a.id === actionId);
        if (action) {
          totalOffset += action.co2Offset;
          ids.add(actionId);
        }
      });
    });
    const nextCo2OffsetTotal = Number(totalOffset.toFixed(1));

    // 2. Calculate next streak
    const activeDates = new Set(nextLogs.filter(log => log.actions.length > 0).map(log => log.date));
    const sortedDates = Array.from(activeDates).sort();
    let nextStreak = 0;
    if (sortedDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const lastLoggedDate = sortedDates[sortedDates.length - 1];
      if (lastLoggedDate === todayStr || lastLoggedDate === yesterdayStr) {
        nextStreak = 1;
        const checkDate = new Date(lastLoggedDate);

        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkDateStr = checkDate.toISOString().split('T')[0];
          if (activeDates.has(checkDateStr)) {
            nextStreak++;
          } else {
            break;
          }
        }
      }
    }

    // 3. Update badges
    setBadges((prevBadges) => {
      let badgeTriggered = false;
      const newBadges = prevBadges.map((badge) => {
        if (badge.unlocked) return badge;

        let shouldUnlock = false;

        if (badge.id === 'first_calc' && hasCalc) {
          shouldUnlock = true;
        } else if (badge.id === 'first_action' && nextLogs.some((l) => l.actions.length > 0)) {
          shouldUnlock = true;
        } else if (badge.id === 'streak_3' && nextStreak >= 3) {
          shouldUnlock = true;
        } else if (badge.id === 'streak_7' && nextStreak >= 7) {
          shouldUnlock = true;
        } else if (badge.id === 'offset_10' && nextCo2OffsetTotal >= 10) {
          shouldUnlock = true;
        } else if (badge.id === 'offset_50' && nextCo2OffsetTotal >= 50) {
          shouldUnlock = true;
        } else if (badge.id === 'diversity_hero') {
          const loggedCategories = new Set(
            Array.from(ids).map((id) => AVAILABLE_ACTIONS.find((a) => a.id === id)?.category)
          );
          if (loggedCategories.size >= 5) {
            shouldUnlock = true;
          }
        }

        if (shouldUnlock) {
          badgeTriggered = true;
          // Trigger confetti
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

      return badgeTriggered ? newBadges : prevBadges;
    });
  };

  const updateCalculator = (data: Partial<CalculatorData>) => {
    setCalculatorData((prev) => ({ ...prev, ...data }));
  };

  const setCalculatorCompleted = () => {
    setHasCalculated(true);
    checkAndUnlockBadges(dailyLogs, true);
  };

  const toggleAction = (date: string, actionId: string) => {
    const existingLogIdx = dailyLogs.findIndex((log) => log.date === date);
    let nextLogs: DailyLog[];

    if (existingLogIdx > -1) {
      const existingLog = dailyLogs[existingLogIdx];
      const isActionLogged = existingLog.actions.includes(actionId);

      let newActions: string[];
      if (isActionLogged) {
        newActions = existingLog.actions.filter((id) => id !== actionId);
      } else {
        newActions = [...existingLog.actions, actionId];
      }

      const updatedLogs = [...dailyLogs];
      updatedLogs[existingLogIdx] = { ...existingLog, actions: newActions };
      nextLogs = updatedLogs.filter((log) => log.actions.length > 0);
    } else {
      nextLogs = [...dailyLogs, { date, actions: [actionId] }];
    }

    setDailyLogs(nextLogs);
    checkAndUnlockBadges(nextLogs, hasCalculated);
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
