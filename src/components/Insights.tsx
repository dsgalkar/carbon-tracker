import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import {
  DollarSign, Leaf, Sparkles,
  ArrowRight, CheckCircle2
} from 'lucide-react';

export const Insights: React.FC = () => {
  const { calculatorData, getEmissionsByCategory, getTotalEmissions } = useCarbon();

  // Baseline metrics
  const categories = getEmissionsByCategory();
  const totalEmissions = getTotalEmissions();

  // Simulator State
  const [simEV, setSimEV] = useState<boolean>(false);
  const [simDiet, setSimDiet] = useState<boolean>(false);
  const [simDriveLess, setSimDriveLess] = useState<boolean>(false);
  const [simSolar, setSimSolar] = useState<boolean>(false);
  const [simNoFlights, setSimNoFlights] = useState<boolean>(false);

  // 1. Identify Highest Emission Category
  const getPriorityCategory = () => {
    const arr = [
      { name: 'Transportation', value: categories.transport, tip: 'Optimize transit', desc: 'Your vehicle use and flight history are the largest contributors to your ecological footprint.' },
      { name: 'Home Energy', value: categories.energy, tip: 'Improve home efficiency', desc: 'Heating, lighting, and power draw in your household make up the bulk of your carbon output.' },
      { name: 'Food Habits', value: categories.food, tip: 'Shift toward plant-rich foods', desc: 'Your grocery list and food waste profile represent your largest carbon reduction opportunity.' },
      { name: 'Shopping & Consumption', value: categories.shopping, tip: 'Practice circular buying', desc: 'Manufacturing clothes, electronics, and goods is resource-intensive and leads to high indirect footprint.' }
    ];

    // Sort descending
    arr.sort((a, b) => b.value - a.value);
    return arr[0];
  };

  const priority = getPriorityCategory();

  // 2. Calculate simulated reductions
  const calculateSimulatedSavings = () => {
    let savedKg = 0;
    let savedMoney = 0;

    const carFactors = { none: 0, electric: 0.08, hybrid: 0.18, compact: 0.32, suv: 0.48 };

    // Simulator: Switch to EV
    if (simEV && calculatorData.carType !== 'none' && calculatorData.carType !== 'electric') {
      const currentFactor = carFactors[calculatorData.carType];
      const evFactor = carFactors['electric'];
      const annualCarMiles = calculatorData.carKm * 52;
      savedKg += annualCarMiles * (currentFactor - evFactor);
      savedMoney += annualCarMiles * 0.12; // estimate 12c saved per mile on fuel vs charging
    }

    // Simulator: Drive 50% less
    if (simDriveLess && calculatorData.carType !== 'none') {
      const currentFactor = carFactors[simEV ? 'electric' : calculatorData.carType];
      const annualCarMiles = calculatorData.carKm * 52;
      savedKg += (annualCarMiles * 0.5) * currentFactor;
      savedMoney += (annualCarMiles * 0.5) * 0.15; // fuel/maintenance cost savings
    }

    // Simulator: Switch to Vegetarian/Vegan
    if (simDiet && calculatorData.diet !== 'vegan') {
      const dietMap = { vegan: 900, vegetarian: 1300, 'low-meat': 1900, 'high-meat': 3100 };
      const currentDietEmissions = dietMap[calculatorData.diet];
      const targetDietEmissions = dietMap['vegetarian']; // Assume vegetarian for standard simulation
      if (currentDietEmissions > targetDietEmissions) {
        savedKg += (currentDietEmissions - targetDietEmissions);
        savedMoney += 350; // Average grocery bill savings per year on meat alternatives
      }
    }

    // Simulator: Solar panel installation
    if (simSolar) {
      // Offset 75% of electric emissions and gas bills
      const electricEmissions = calculatorData.electricityKwh * 12 * 0.38;
      const gasEmissions = calculatorData.gasBill * 12 * 2.5;
      savedKg += (electricEmissions + gasEmissions) * 0.75;
      savedMoney += (calculatorData.electricityKwh * 12 * 0.15 + calculatorData.gasBill * 12) * 0.75; // utility bill savings
    }

    // Simulator: No flights
    if (simNoFlights) {
      savedKg += calculatorData.flightsShort * 220 + calculatorData.flightsLong * 950;
      savedMoney += (calculatorData.flightsShort * 150 + calculatorData.flightsLong * 600); // flight ticket savings
    }

    const savedTons = Number((savedKg / 1000).toFixed(2));
    const newTotal = Math.max(0, Number((totalEmissions - savedTons).toFixed(2)));
    const percentReduced = totalEmissions > 0 ? Math.round((savedTons / totalEmissions) * 100) : 0;
    const treesSaved = Math.round(savedKg / 22);

    return {
      savedTons,
      newTotal,
      percentReduced,
      treesSaved,
      savedMoney: Math.round(savedMoney)
    };
  };

  const sim = calculateSimulatedSavings();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="app-content animate-fade-in">

      {/* Priority Card */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.6rem',
          background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)',
          borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          Priority Area
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            Personalized Diagnostic
          </span>
          <h3 style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>
            Focus on {priority.name}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '650px', lineHeight: '1.5' }}>
            {priority.desc} Adopting smarter routines in this area will yield your highest carbon returns.
          </p>
        </div>

        {/* Dynamic Action List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {[
            { title: 'Short commutive switches', detail: 'Using a bicycle or walking for journeys under 2 miles cuts up to 300kg of CO2 per year.' },
            { title: 'Smart thermostat control', detail: 'Lowering household heating by just 1°C reduces annual energy footprints by 10%.' },
            { title: 'Incorporate Meatless Days', detail: 'Skipping beef or pork one day a week saves roughly 200kg of CO2 emissions annually.' }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', gap: '0.75rem'
            }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', color: 'var(--text-primary)' }}>{item.title}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

        {/* Left Column: Toggles */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>"What-If" Green Simulator</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Toggle lifestyle adjustments to simulate carbon reductions
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* EV Toggle */}
            {calculatorData.carType !== 'none' && calculatorData.carType !== 'electric' && (
              <div
                className={`glass-card ${simEV ? 'active' : ''}`}
                onClick={() => setSimEV(!simEV)}
                style={{ cursor: 'pointer', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>🔋 Switch to Electric Car</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Simulate swapping your current car for an EV</span>
                </div>
                <div style={{
                  width: '38px', height: '22px', borderRadius: '11px',
                  background: simEV ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: simEV ? '18px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            )}

            {/* Drive Less Toggle */}
            {calculatorData.carType !== 'none' && (
              <div
                className={`glass-card ${simDriveLess ? 'active' : ''}`}
                onClick={() => setSimDriveLess(!simDriveLess)}
                style={{ cursor: 'pointer', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>🚲 Reduce Driving by 50%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Replace half your car mileage with walking/cycling</span>
                </div>
                <div style={{
                  width: '38px', height: '22px', borderRadius: '11px',
                  background: simDriveLess ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: simDriveLess ? '18px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            )}

            {/* Diet Toggle */}
            {calculatorData.diet !== 'vegan' && calculatorData.diet !== 'vegetarian' && (
              <div
                className={`glass-card ${simDiet ? 'active' : ''}`}
                onClick={() => setSimDiet(!simDiet)}
                style={{ cursor: 'pointer', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>🥗 Transition to Vegetarian</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Adopt a vegetarian diet (no meat/fish)</span>
                </div>
                <div style={{
                  width: '38px', height: '22px', borderRadius: '11px',
                  background: simDiet ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: simDiet ? '18px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            )}

            {/* Solar Toggle */}
            <div
              className={`glass-card ${simSolar ? 'active' : ''}`}
              onClick={() => setSimSolar(!simSolar)}
              style={{ cursor: 'pointer', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}
            >
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>☀️ Install Rooftop Solar & Heat Pump</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Offset 75% of electric and gas emissions</span>
              </div>
              <div style={{
                width: '38px', height: '22px', borderRadius: '11px',
                background: simSolar ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background-color 0.2s'
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: '2px', left: simSolar ? '18px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </div>
            </div>

            {/* No Flights Toggle */}
            {(calculatorData.flightsShort > 0 || calculatorData.flightsLong > 0) && (
              <div
                className={`glass-card ${simNoFlights ? 'active' : ''}`}
                onClick={() => setSimNoFlights(!simNoFlights)}
                style={{ cursor: 'pointer', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>✈️ Skip Aviation This Year</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Eliminate flights (rely on trains/virtual meetings)</span>
                </div>
                <div style={{
                  width: '38px', height: '22px', borderRadius: '11px',
                  background: simNoFlights ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: simNoFlights ? '18px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between', border: '1px solid rgba(16, 185, 129, 0.15)', background: 'rgba(16, 185, 129, 0.02)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
              <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '1.25rem' }}>Projected Savings</h3>
            </div>

            {/* Large savings metric */}
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>
                Total Annual Reduction
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.2rem 0' }}>
                <span className="gradient-text" style={{ fontSize: '3.6rem', fontWeight: '800', lineHeight: 1 }}>
                  {sim.savedTons}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Tons CO₂e</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                -{sim.percentReduced}% reduction from your current footprint
              </span>
            </div>

            {/* Equivalencies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Tree equivalent */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)'
                }}>
                  <Leaf size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Tree Equivalent</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Equivalent to planting {sim.treesSaved} trees</span>
                </div>
              </div>

              {/* Financial Savings equivalent */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)'
                }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Financial Savings</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-secondary)' }}>
                    Save ~${sim.savedMoney.toLocaleString()} / year
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footprint Transition indicator */}
          <div style={{
            borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', marginTop: '2rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Current Profile</span>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{totalEmissions} tons</span>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Simulated Profile</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary)' }}>{sim.newTotal} tons</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
