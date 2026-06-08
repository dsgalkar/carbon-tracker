export interface CalculatorData {
  carKm: number; // km per week
  carType: 'none' | 'electric' | 'hybrid' | 'compact' | 'suv';
  transitHours: number; // hours per week
  flightsShort: number; // short flights per year (< 3 hours)
  flightsLong: number; // long flights per year (> 3 hours)
  electricityKwh: number; // kWh per month
  heatingSource: 'electricity' | 'gas' | 'oil' | 'none';
  gasBill: number; // therms or equivalent (we can simplify to estimate from dollars/month)
  diet: 'vegan' | 'vegetarian' | 'low-meat' | 'high-meat';
  waste: 'minimal' | 'average' | 'high';
  shoppingHabits: 'minimalist' | 'average' | 'shopper';
  electronics: 'rarely' | 'average' | 'frequently';
}

export interface DailyAction {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'waste' | 'shopping';
  title: string;
  description: string;
  points: number; // Gamification points
  co2Offset: number; // kg of CO2 offset
  icon: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  requirement: string;
  unlocked: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  actions: string[]; // actionIds
}

export interface HistoricalEmissions {
  date: string;
  emissions: number;
}
