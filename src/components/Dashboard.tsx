import React from 'react';
import { useCarbon } from '../context/CarbonContext';
import { 
  Car, Zap, Utensils, ShoppingBag, TreePine, 
  TrendingDown, RefreshCw, AlertCircle 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    getTotalEmissions, 
    getEmissionsByCategory, 
    co2OffsetTotal, 
    streak, 
    points,
    resetData 
  } = useCarbon();

  const totalEmissions = getTotalEmissions(); // metric tons
  const categories = getEmissionsByCategory(); // kg CO2
  
  const totalKg = categories.transport + categories.energy + categories.food + categories.shopping;
  const treesNeeded = Math.round(totalKg / 22); // 1 mature tree absorbs ~22kg CO2/year

  // Comparison metrics
  const US_AVERAGE = 16.0;
  const EU_AVERAGE = 7.0;
  const GLOBAL_AVERAGE = 4.5;
  const TARGET_EMISSIONS = 2.0;

  // Percentage calculations
  const getPercentage = (value: number) => {
    if (totalKg === 0) return 0;
    return Math.round((value / totalKg) * 100);
  };

  // Compare user to global averages
  const getComparisonText = () => {
    if (totalEmissions <= TARGET_EMISSIONS) {
      return {
        text: 'Outstanding! You are already at or below the sustainable global target.',
        color: 'var(--color-primary)'
      };
    }
    if (totalEmissions <= GLOBAL_AVERAGE) {
      return {
        text: 'Excellent! Your emissions are below the global average. You are close to the target.',
        color: 'var(--color-secondary)'
      };
    }
    if (totalEmissions <= EU_AVERAGE) {
      return {
        text: 'Good. You are below the average European footprint, but still above the sustainable limit.',
        color: 'var(--color-warning)'
      };
    }
    if (totalEmissions <= US_AVERAGE) {
      return {
        text: 'Your footprint is lower than the US average, but high globally. There is substantial room to optimize.',
        color: 'var(--color-warning)'
      };
    }
    return {
      text: 'Your carbon footprint is higher than average. Try adjusting your transport or energy habits!',
      color: 'var(--color-danger)'
    };
  };

  const comparison = getComparisonText();

  // Data for the custom SVG bar chart
  const chartData = [
    { label: 'Your Footprint', value: totalEmissions, color: 'url(#userGrad)', isUser: true },
    { label: 'US Average', value: US_AVERAGE, color: 'rgba(255,255,255,0.08)', isUser: false },
    { label: 'EU Average', value: EU_AVERAGE, color: 'rgba(255,255,255,0.08)', isUser: false },
    { label: 'Global Average', value: GLOBAL_AVERAGE, color: 'rgba(255,255,255,0.08)', isUser: false },
    { label: 'Climate Goal', value: TARGET_EMISSIONS, color: 'url(#targetGrad)', isUser: false },
  ];

  // Max value for scaling SVG chart bars
  const maxChartValue = Math.max(...chartData.map(d => d.value)) * 1.1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="app-content">
      
      {/* Top Banner Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Core Metric Panel */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle decorative background gradient */}
          <div style={{
            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="8"
              />
              {/* Progress Circle (relative to 10 tons max) */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="8"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * Math.min(totalEmissions, 15)) / 15}
                strokeLinecap="round"
                className="progress-ring-circle"
                style={{
                  filter: 'drop-shadow(0 0 6px var(--color-primary))',
                  transition: 'stroke-dashoffset 1s ease-out'
                }}
              />
            </svg>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '120px', height: '120px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1 }}>{totalEmissions}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tons/yr</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Annual Footprint</span>
            <h3 style={{ fontSize: '1.4rem', margin: '0.2rem 0' }}>Carbon Footprint</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Equivalent to the weight of about <strong>{Math.round(totalEmissions * 2)}</strong> cars suspended in the air.
            </p>
          </div>
        </div>

        {/* Tree offsetting statistics */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <TreePine size={30} style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Offset Requirement</span>
            <h3 style={{ fontSize: '1.6rem', margin: '0.2rem 0' }}>{treesNeeded} Trees</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Needed to grow for a full year to completely absorb your carbon output.
            </p>
          </div>
        </div>

        {/* Gamification Summary panel */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(6, 182, 212, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <TrendingDown size={30} style={{ filter: 'drop-shadow(0 0 5px rgba(6, 182, 212, 0.3))' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Active Offsets</span>
            <h3 style={{ fontSize: '1.6rem', margin: '0.2rem 0' }} className="gradient-text-accent">
              {co2OffsetTotal} kg
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Offset from logged daily actions. Streak: <strong>{streak} days</strong> ({points} pts).
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Categories and Comparisons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Category Breakdown list */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Emissions by Category</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Where your carbon emissions originate</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Category: Transport */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                  <Car size={16} style={{ color: 'var(--color-secondary)' }} /> Transportation
                </span>
                <span style={{ fontWeight: '600' }}>
                  {Math.round(categories.transport).toLocaleString()} kg ({getPercentage(categories.transport)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${getPercentage(categories.transport)}%`,
                  background: 'linear-gradient(90deg, var(--color-secondary) 0%, var(--color-accent) 100%)',
                  borderRadius: '4px', transition: 'width 0.8s ease-out'
                }} />
              </div>
            </div>

            {/* Category: Energy */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                  <Zap size={16} style={{ color: 'var(--color-primary)' }} /> Home Energy
                </span>
                <span style={{ fontWeight: '600' }}>
                  {Math.round(categories.energy).toLocaleString()} kg ({getPercentage(categories.energy)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${getPercentage(categories.energy)}%`,
                  background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  borderRadius: '4px', transition: 'width 0.8s ease-out'
                }} />
              </div>
            </div>

            {/* Category: Food */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                  <Utensils size={16} style={{ color: '#ec4899' }} /> Food Habits
                </span>
                <span style={{ fontWeight: '600' }}>
                  {Math.round(categories.food).toLocaleString()} kg ({getPercentage(categories.food)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${getPercentage(categories.food)}%`,
                  background: 'linear-gradient(90deg, #ec4899 0%, var(--color-accent) 100%)',
                  borderRadius: '4px', transition: 'width 0.8s ease-out'
                }} />
              </div>
            </div>

            {/* Category: Shopping */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                  <ShoppingBag size={16} style={{ color: '#f59e0b' }} /> Shopping & Consumption
                </span>
                <span style={{ fontWeight: '600' }}>
                  {Math.round(categories.shopping).toLocaleString()} kg ({getPercentage(categories.shopping)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${getPercentage(categories.shopping)}%`,
                  background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 100%)',
                  borderRadius: '4px', transition: 'width 0.8s ease-out'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Custom SVG Bar Chart comparing user to standards */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Global Footprint Comparison</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your tons of carbon/year vs. reference values</p>
          </div>

          {/* Custom SVG Chart */}
          <div style={{ width: '100%', position: 'relative' }}>
            <svg width="100%" height="220" viewBox="0 0 400 220" preserveAspectRatio="none">
              <defs>
                {/* User bar gradient */}
                <linearGradient id="userGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-secondary)" />
                </linearGradient>
                {/* Target bar gradient */}
                <linearGradient id="targetGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="120" y1="10" x2="120" y2="190" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />
              <line x1="240" y1="10" x2="240" y2="190" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />
              <line x1="360" y1="10" x2="360" y2="190" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />

              {chartData.map((d, index) => {
                const y = 15 + index * 36;
                const width = (d.value / maxChartValue) * 260; // scale to fit inside 400 width
                
                return (
                  <g key={d.label}>
                    {/* Label */}
                    <text
                      x="0"
                      y={y + 14}
                      fill={d.isUser ? 'var(--color-primary)' : 'var(--text-secondary)'}
                      fontSize="11"
                      fontWeight={d.isUser ? '700' : '500'}
                    >
                      {d.label}
                    </text>

                    {/* Bar */}
                    <rect
                      x="120"
                      y={y}
                      width={Math.max(width, 4)} // minimum width of 4px
                      height="18"
                      rx="4"
                      fill={d.color}
                      style={{
                        transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                        filter: d.isUser ? 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))' : 'none'
                      }}
                    />

                    {/* Value label */}
                    <text
                      x={120 + width + 8}
                      y={y + 13}
                      fill={d.isUser ? 'var(--text-primary)' : 'var(--text-muted)'}
                      fontSize="10"
                      fontWeight={d.isUser ? '700' : 'normal'}
                    >
                      {d.value.toFixed(1)} t
                    </text>
                  </g>
                );
              })}

              {/* X Axis line */}
              <line x1="120" y1="190" x2="380" y2="190" stroke="rgba(255,255,255,0.15)" />
              <text x="120" y="206" fill="var(--text-muted)" fontSize="8" textAnchor="middle">0t</text>
              <text x="240" y="206" fill="var(--text-muted)" fontSize="8" textAnchor="middle">{(maxChartValue / 2).toFixed(0)}t</text>
              <text x="360" y="206" fill="var(--text-muted)" fontSize="8" textAnchor="middle">{maxChartValue.toFixed(0)}t</text>
            </svg>
          </div>
        </div>

      </div>

      {/* Advisory Insight Card */}
      <div 
        className="glass-panel" 
        style={{ 
          display: 'flex', gap: '1rem', alignItems: 'center', 
          borderColor: comparison.color, background: `${comparison.color}0a` 
        }}
      >
        <AlertCircle size={22} style={{ color: comparison.color, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>
            {comparison.text}
          </p>
        </div>
      </div>

      {/* Reset & Settings options */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={resetData}
          style={{ fontSize: '0.85rem', gap: '0.4rem', color: 'var(--text-muted)' }}
        >
          <RefreshCw size={14} /> Reset Assessment Data
        </button>
      </div>

    </div>
  );
};
