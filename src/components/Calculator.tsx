import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import {
  Car, Plane, Zap, Flame, ShoppingBag,
  ChevronRight, ChevronLeft, Award, Leaf, Compass, Smartphone
} from 'lucide-react';

export const Calculator: React.FC = () => {
  const { calculatorData, updateCalculator, setCalculatorCompleted } = useCarbon();
  const [step, setStep] = useState<number>(0);

  const steps = [
    { title: 'Welcome', desc: 'Let\'s calculate your yearly carbon emissions' },
    { title: 'Transportation', desc: 'How do you get around?' },
    { title: 'Home Energy', desc: 'What powers your living space?' },
    { title: 'Food Habits', desc: 'What does your daily diet look like?' },
    { title: 'Shopping', desc: 'What are your purchasing habits?' },
    { title: 'Results', desc: 'Here is your carbon footprint estimate' }
  ];

  // Helper to calculate live emissions estimate
  const getLiveEstimate = () => {
    let transport = 0;
    const carFactors = { none: 0, electric: 0.08, hybrid: 0.18, compact: 0.32, suv: 0.48 };
    transport += calculatorData.carKm * 52 * carFactors[calculatorData.carType];
    transport += calculatorData.transitHours * 52 * 2.2;
    transport += calculatorData.flightsShort * 220 + calculatorData.flightsLong * 950;

    let energy = 0;
    energy += calculatorData.electricityKwh * 12 * 0.38;
    const heatingFactors = { none: 0, electricity: 300, gas: 1200, oil: 2400 };
    energy += heatingFactors[calculatorData.heatingSource];
    energy += calculatorData.gasBill * 12 * 2.5;

    let food = 0;
    const dietMap = { vegan: 900, vegetarian: 1300, 'low-meat': 1900, 'high-meat': 3100 };
    food += dietMap[calculatorData.diet];
    const wasteMap = { minimal: 40, average: 180, high: 450 };
    food += wasteMap[calculatorData.waste];

    let shopping = 0;
    const shoppingMap = { minimalist: 250, average: 700, shopper: 1600 };
    shopping += shoppingMap[calculatorData.shoppingHabits];
    const electronicsMap = { rarely: 80, average: 250, frequently: 650 };
    shopping += electronicsMap[calculatorData.electronics];

    const totalKg = transport + energy + food + shopping;
    return Number((totalKg / 1000).toFixed(1)); // tons
  };

  const liveTons = getLiveEstimate();

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setCalculatorCompleted();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const getSliderColor = (value: number, max: number) => {
    const ratio = value / max;
    if (ratio < 0.33) return '#10b981'; // green
    if (ratio < 0.66) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>

      {/* Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '15px', left: '0', right: '0', height: '2px',
          backgroundColor: 'rgba(255,255,255,0.08)', zIndex: 1
        }}>
          <div style={{
            height: '100%', width: `${(step / (steps.length - 1)) * 100}%`,
            background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            transition: 'width var(--transition-normal)'
          }} />
        </div>

        {steps.map((s, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              zIndex: 2, cursor: idx < step ? 'pointer' : 'default'
            }}
            onClick={() => idx < step && setStep(idx)}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: idx <= step ? 'var(--bg-deep)' : 'rgba(15, 23, 42, 0.9)',
              border: `2px solid ${idx <= step ? 'var(--color-primary)' : 'var(--border-glass)'}`,
              color: idx <= step ? 'var(--color-primary)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '0.85rem',
              boxShadow: idx === step ? 'var(--shadow-glow)' : 'none',
              transition: 'all var(--transition-normal)'
            }}>
              {idx < step ? '✓' : idx + 1}
            </div>
            <span style={{
              fontSize: '0.75rem', marginTop: '0.5rem',
              color: idx === step ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: idx === step ? '600' : 'normal',
              display: 'none' // Hide on tiny screens
            }} className="md-block">
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{steps[step].title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{steps[step].desc}</p>
      </div>

      {/* Step Content */}
      <div style={{ minHeight: '320px', marginBottom: '2rem' }}>

        {/* STEP 0: Welcome / Onboarding Intro */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)', border: '1px solid rgba(16, 185, 129, 0.25)',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Compass size={45} style={{ animation: 'float 3s ease-in-out infinite' }} />
            </div>
            <h3 style={{ fontSize: '1.4rem' }}>Discover Your Ecological Footprint</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: '1.6' }}>
              Our lifestyles shape the planet. Answer a few simple questions about your transit, energy use, diet, and shopping to find out your annual carbon footprint and get a personalized plan to shrink it.
            </p>
            <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: '1rem', width: '200px' }}>
              Start Assessment <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 1: Transportation */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Vehicle Type Card Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                What type of vehicle do you drive?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                {[
                  { id: 'none', label: 'No Car', icon: <Leaf size={20} /> },
                  { id: 'electric', label: 'Electric', icon: <Zap size={20} /> },
                  { id: 'hybrid', label: 'Hybrid', icon: <Compass size={20} /> },
                  { id: 'compact', label: 'Compact Gas', icon: <Car size={20} /> },
                  { id: 'suv', label: 'SUV/Truck', icon: <Car size={20} /> },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card ${calculatorData.carType === item.id ? 'active' : ''}`}
                    onClick={() => updateCalculator({ carType: item.id as any })}
                    style={{
                      cursor: 'pointer', textAlign: 'center', padding: '1rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    <div style={{ color: calculatorData.carType === item.id ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Car Miles Slider */}
            {calculatorData.carType !== 'none' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Weekly driving distance:</span>
                  <span style={{ fontWeight: '600', color: getSliderColor(calculatorData.carKm, 500) }}>
                    {calculatorData.carKm} Km / week
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={calculatorData.carKm}
                  onChange={(e) => updateCalculator({ carKm: parseInt(e.target.value) })}
                  className="glass-slider"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span>0 miles</span>
                  <span>500 miles</span>
                </div>
              </div>
            )}

            {/* Public Transit Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Weekly public transit use:</span>
                <span style={{ fontWeight: '600', color: 'var(--color-secondary)' }}>
                  {calculatorData.transitHours} hours / week
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={calculatorData.transitHours}
                onChange={(e) => updateCalculator({ transitHours: parseInt(e.target.value) })}
                className="glass-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>0 hrs</span>
                <span>40 hrs</span>
              </div>
            </div>

            {/* Flights Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Short Flights/yr (&lt;3 hrs)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={calculatorData.flightsShort}
                    onChange={(e) => updateCalculator({ flightsShort: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="glass-input"
                  />
                  <Plane size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Long Flights/yr (&gt;3 hrs)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={calculatorData.flightsLong}
                    onChange={(e) => updateCalculator({ flightsLong: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="glass-input"
                  />
                  <Plane size={20} style={{ color: 'var(--text-muted)', transform: 'rotate(45deg)' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Home Energy */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Electricity Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Monthly electricity usage:</span>
                <span style={{ fontWeight: '600', color: getSliderColor(calculatorData.electricityKwh, 1500) }}>
                  {calculatorData.electricityKwh} kWh / month
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1500"
                step="25"
                value={calculatorData.electricityKwh}
                onChange={(e) => updateCalculator({ electricityKwh: parseInt(e.target.value) })}
                className="glass-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>0 kWh</span>
                <span>1500 kWh (High)</span>
              </div>
            </div>

            {/* Heating Source Card Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                What is your primary home heating source?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                {[
                  { id: 'none', label: 'None/Solar', icon: <Leaf size={20} /> },
                  { id: 'electricity', label: 'Heat Pump', icon: <Zap size={20} /> },
                  { id: 'gas', label: 'Natural Gas', icon: <Flame size={20} /> },
                  { id: 'oil', label: 'Heating Oil', icon: <Flame size={20} /> },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card ${calculatorData.heatingSource === item.id ? 'active' : ''}`}
                    onClick={() => updateCalculator({ heatingSource: item.id as any })}
                    style={{
                      cursor: 'pointer', textAlign: 'center', padding: '1rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    <div style={{ color: calculatorData.heatingSource === item.id ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gas Bill Slider */}
            {calculatorData.heatingSource === 'gas' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Monthly gas bill (est. USD):</span>
                  <span style={{ fontWeight: '600', color: getSliderColor(calculatorData.gasBill, 150) }}>
                    ${calculatorData.gasBill} / month
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="5"
                  value={calculatorData.gasBill}
                  onChange={(e) => updateCalculator({ gasBill: parseInt(e.target.value) })}
                  className="glass-slider"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span>$0</span>
                  <span>$150+</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Food Habits */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Diet Card Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                Which best describes your diet?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                {[
                  { id: 'vegan', label: '🌱 Vegan', desc: 'No animal products' },
                  { id: 'vegetarian', label: '🥚 Vegetarian', desc: 'Dairy/eggs, no meat' },
                  { id: 'low-meat', label: '🍗 Flexitarian', desc: 'Occasional meat' },
                  { id: 'high-meat', label: '🥩 Meat Lover', desc: 'Frequent beef/pork' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card ${calculatorData.diet === item.id ? 'active' : ''}`}
                    onClick={() => updateCalculator({ diet: item.id as any })}
                    style={{
                      cursor: 'pointer', padding: '1.2rem 1rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{item.label.split(' ')[0]}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.label.split(' ')[1] || item.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Waste Card Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                How much food gets thrown away in your household?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                {[
                  { id: 'minimal', label: 'Minimal', desc: 'Eat leftovers, compost' },
                  { id: 'average', label: 'Average', desc: 'Standard waste' },
                  { id: 'high', label: 'Significant', desc: 'Throw out expired food' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card ${calculatorData.waste === item.id ? 'active' : ''}`}
                    onClick={() => updateCalculator({ waste: item.id as any })}
                    style={{
                      cursor: 'pointer', padding: '1rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Shopping / Consumption */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Goods Shopping Habits */}
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                How would you describe your clothing and general shopping habits?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                {[
                  { id: 'minimalist', label: 'Minimalist', desc: 'Rare purchases, high durability' },
                  { id: 'average', label: 'Standard', desc: 'Seasonal purchases, moderate' },
                  { id: 'shopper', label: 'Avid Shopper', desc: 'Frequent fast fashion/items' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card ${calculatorData.shoppingHabits === item.id ? 'active' : ''}`}
                    onClick={() => updateCalculator({ shoppingHabits: item.id as any })}
                    style={{
                      cursor: 'pointer', padding: '1.2rem 1rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center'
                    }}
                  >
                    <ShoppingBag size={22} style={{ color: calculatorData.shoppingHabits === item.id ? 'var(--color-primary)' : 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Electronics Lifecycle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                How often do you replace phones, computers, or gadgets?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                {[
                  { id: 'rarely', label: 'Only if broken', desc: 'Keep devices 5+ years' },
                  { id: 'average', label: 'Standard Cycle', desc: 'Upgrade every 3-4 years' },
                  { id: 'frequently', label: 'Early Adopter', desc: 'Upgrade every 1-2 years' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card ${calculatorData.electronics === item.id ? 'active' : ''}`}
                    onClick={() => updateCalculator({ electronics: item.id as any })}
                    style={{
                      cursor: 'pointer', padding: '1.2rem 1rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center'
                    }}
                  >
                    <Smartphone size={22} style={{ color: calculatorData.electronics === item.id ? 'var(--color-primary)' : 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Results & Completion */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)', border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Award size={40} style={{ filter: 'drop-shadow(0 0 10px var(--color-primary))' }} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>All Set!</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '450px' }}>
              We have compiled your ecological profile. Your estimated yearly footprint is:
            </p>

            <div style={{ margin: '1rem 0' }}>
              <span style={{ fontSize: '4rem', fontWeight: '800', display: 'block', lineHeight: 1 }} className="gradient-text">
                {liveTons}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Metric Tons CO₂e / Year
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
              {liveTons < 5 ?
                '🎉 Excellent! You are well below the national average. Let\'s get you down to the 2.0 ton carbon-neutral target!' :
                liveTons < 12 ?
                  '👍 Good start. You are in line with average energy usage, but there is substantial room to optimize your footprint.' :
                  '⚠️ Your footprint is above average. Don\'t worry—our daily offset actions and insights will help you shave off tons of emissions.'
              }
            </p>

            <button className="btn btn-primary" onClick={handleNext} style={{ width: '220px', marginTop: '1rem' }}>
              Go to Dashboard <Leaf size={18} />
            </button>
          </div>
        )}

      </div>

      {/* Calculator Bottom live footer - only show for active questions (steps 1-4) */}
      {step > 0 && step < 5 && (
        <div style={{
          borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Live Projection
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: liveTons < 5 ? 'var(--color-primary)' : liveTons < 12 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                {liveTons}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>tons CO₂e / yr</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={handlePrev}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Welcome page footer navigation */}
      {step === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', gap: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.2rem' }}>
          <Compass size={14} /> Designed to reflect global carbon reporting guidelines.
        </div>
      )}

    </div>
  );
};
