import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { AVAILABLE_ACTIONS } from '../constants/carbonData'; import {
  Bike, Utensils, Droplets, Wind, Power, Trash2,
  ShoppingBag, Lightbulb, Coffee, Flame, CheckCircle2,
  Calendar
} from 'lucide-react';

export const DailyTracker: React.FC = () => {
  const { dailyLogs, toggleAction, streak, getDailyOffsetForDate } = useCarbon();

  // Create date selections for the last 3 days
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];

      let label = 'Today';
      if (i === 1) label = 'Yesterday';
      if (i === 2) {
        // Format day of week
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      }

      dates.push({ dateStr: str, label });
    }
    return dates;
  };

  const dateSelections = getDates();
  const [selectedDate, setSelectedDate] = useState<string>(dateSelections[0].dateStr);

  const activeLog = dailyLogs.find((l) => l.date === selectedDate);
  const activeActions = activeLog ? activeLog.actions : [];

  const dailyOffset = getDailyOffsetForDate(selectedDate);

  // Dynamic icon picker
  const getIcon = (iconName: string, active: boolean) => {
    const size = 20;
    const color = active ? 'var(--color-primary)' : 'var(--text-secondary)';

    switch (iconName) {
      case 'bike': return <Bike size={size} style={{ color }} aria-hidden="true" />;
      case 'salad': return <Utensils size={size} style={{ color }} aria-hidden="true" />;
      case 'shower': return <Droplets size={size} style={{ color }} aria-hidden="true" />;
      case 'wind': return <Wind size={size} style={{ color }} aria-hidden="true" />;
      case 'power': return <Power size={size} style={{ color }} aria-hidden="true" />;
      case 'trash': return <Trash2 size={size} style={{ color }} aria-hidden="true" />;
      case 'shopping-bag': return <ShoppingBag size={size} style={{ color }} aria-hidden="true" />;
      case 'lightbulb': return <Lightbulb size={size} style={{ color }} aria-hidden="true" />;
      case 'cup-soda': return <Coffee size={size} style={{ color }} aria-hidden="true" />;
      default: return <CheckCircle2 size={size} style={{ color }} aria-hidden="true" />;
    }
  };

  // Format date display
  const getSelectedDateDisplay = () => {
    const selected = dateSelections.find(d => d.dateStr === selectedDate);
    if (selected && selected.label !== 'Today' && selected.label !== 'Yesterday') {
      const d = new Date(selectedDate);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return selected ? selected.label : selectedDate;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="app-content animate-fade-in">

      {/* Tracker Header Widget */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifySelf: 'stretch', justifyContent: 'space-between',
        alignItems: 'center', gap: '1.5rem', background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.5rem'
      }}>
        {/* Date pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} aria-hidden="true" /> Select Logging Date
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {dateSelections.map((item) => (
              <button
                key={item.dateStr}
                className={`btn ${selectedDate === item.dateStr ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedDate(item.dateStr)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Stats Summary */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Carbon Offset Log */}
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Carbon Offset ({getSelectedDateDisplay()})
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)' }}>
              {dailyOffset.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>kg CO₂</span>
            </div>
          </div>

          {/* Streak Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '45px', height: '45px', borderRadius: '50%',
              background: streak > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${streak > 0 ? 'rgba(245, 158, 11, 0.2)' : 'var(--border-glass)'}`,
              color: streak > 0 ? 'var(--color-warning)' : 'var(--text-muted)'
            }}>
              <Flame size={22} aria-hidden="true" style={{ filter: streak > 0 ? 'drop-shadow(0 0 5px var(--color-warning))' : 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                Eco Streak
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                {streak} {streak === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div>
        <div style={{ marginBottom: '1.2rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Daily Actions Checklist</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Check the habits you completed on <strong>{getSelectedDateDisplay()}</strong> to calculate your offsets
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {AVAILABLE_ACTIONS.map((action) => {
            const isChecked = activeActions.includes(action.id);

            return (
              <div
                key={action.id}
                className={`glass-card ${isChecked ? 'active' : ''}`}
                onClick={() => toggleAction(selectedDate, action.id)}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAction(selectedDate, action.id); } }}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                style={{
                  cursor: 'pointer', display: 'flex', gap: '1rem',
                  alignItems: 'flex-start', padding: '1.2rem',
                  position: 'relative'
                }}
              >
                {/* Visual Icon Badge */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: isChecked ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.02)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-glass)'}`,
                  flexShrink: 0, transition: 'all var(--transition-fast)'
                }}>
                  {getIcon(action.icon, isChecked)}
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{action.title}</span>
                    {/* Checkbox indicator */}
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '4px',
                      border: `1px solid ${isChecked ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                      background: isChecked ? 'var(--color-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '10px', fontWeight: 'bold'
                    }}>
                      {isChecked && '✓'}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: '1.4' }}>
                    {action.description}
                  </p>

                  {/* Action Badges/Tags */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                      background: isChecked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.05)',
                      color: 'var(--color-primary)', fontWeight: '600'
                    }}>
                      -{action.co2Offset} kg CO₂
                    </span>
                    <span style={{
                      fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                      background: isChecked ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.05)',
                      color: 'var(--color-secondary)', fontWeight: '600'
                    }}>
                      +{action.points} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivation Tip */}
      <div style={{
        background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-glass)',
        borderRadius: 'var(--radius-md)', padding: '1.2rem', textAlign: 'center',
        color: 'var(--text-secondary)', fontSize: '0.85rem'
      }}>
        💡 <strong>Did you know?</strong> Logging actions daily builds neural connections that make green habits permanent. Keep up the streak!
      </div>

    </div>
  );
};
