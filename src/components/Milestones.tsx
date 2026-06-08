import React from 'react';
import { useCarbon } from '../context/CarbonContext';
import { 
  Award, Lock, Compass, Footprints, Flame, 
  Zap, Leaf, Shield, Layers 
} from 'lucide-react';

export const Milestones: React.FC = () => {
  const { badges, points, co2OffsetTotal } = useCarbon();

  // Gamification Level calculations: 250 points per level
  const POINTS_PER_LEVEL = 250;
  const level = Math.floor(points / POINTS_PER_LEVEL) + 1;
  const pointsInCurrentLevel = points % POINTS_PER_LEVEL;
  const progressPercent = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
  const pointsToNextLevel = POINTS_PER_LEVEL - pointsInCurrentLevel;

  // Level Titles
  const getLevelTitle = (lvl: number) => {
    if (lvl === 1) return 'Eco-Novice';
    if (lvl === 2) return 'Carbon Cutter';
    if (lvl === 3) return 'Climate Scout';
    if (lvl === 4) return 'Earth Guardian';
    if (lvl === 5) return 'Green Advocate';
    return 'Climate Champion';
  };

  // Dynamic Badge Icon Picker
  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    const size = 30;
    const color = unlocked ? 'var(--color-primary)' : 'var(--text-muted)';
    
    switch (iconName) {
      case 'Compass': return <Compass size={size} style={{ color }} />;
      case 'Footprints': return <Footprints size={size} style={{ color }} />;
      case 'Flame': return <Flame size={size} style={{ color }} />;
      case 'Zap': return <Zap size={size} style={{ color }} />;
      case 'Leaf': return <Leaf size={size} style={{ color }} />;
      case 'Shield': return <Shield size={size} style={{ color }} />;
      case 'Layers': return <Layers size={size} style={{ color }} />;
      default: return <Award size={size} style={{ color }} />;
    }
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="app-content animate-fade-in">
      
      {/* Level Card Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
        
        {/* Left Info */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '700', textTransform: 'uppercase' }}>
              Climate Ranking
            </span>
            <h3 style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>
              Level {level}: {getLevelTitle(level)}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Total Points: <strong>{points} XP</strong></span>
            <span>Carbon Deflected: <strong>{co2OffsetTotal} kg</strong></span>
            <span>Badges Unlocked: <strong>{unlockedCount} / {badges.length}</strong></span>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Level Progress</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                {pointsInCurrentLevel} / {POINTS_PER_LEVEL} XP ({pointsToNextLevel} XP to Level {level + 1})
              </span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                borderRadius: '5px', transition: 'width 0.5s ease-out'
              }} />
            </div>
          </div>
        </div>

        {/* Right level badge decoration */}
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary)', border: '2px solid rgba(16, 185, 129, 0.25)',
          boxShadow: 'var(--shadow-glow)', alignSelf: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{level}</span>
        </div>

      </div>

      {/* Badges Cabinet */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Achievements Cabinet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Unlock specific badges by logging daily green actions and trimming carbon footprint metrics
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.2rem'
        }}>
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className="glass-card"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  padding: '1.8rem 1.2rem', gap: '0.8rem', position: 'relative',
                  opacity: badge.unlocked ? 1 : 0.6,
                  border: badge.unlocked ? '1px solid var(--border-glass-active)' : '1px solid var(--border-glass)',
                  background: badge.unlocked ? 'rgba(16, 185, 129, 0.02)' : 'transparent',
                  transition: 'all var(--transition-normal)'
                }}
              >
                {/* Lock icon overlay for locked badges */}
                {!badge.unlocked && (
                  <div style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <Lock size={14} />
                  </div>
                )}

                {/* Badge Icon Circle */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: badge.unlocked ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${badge.unlocked ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glass)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: badge.unlocked ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none',
                  transition: 'all var(--transition-normal)'
                }}>
                  {getBadgeIcon(badge.iconName, badge.unlocked)}
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <h4 style={{
                    fontSize: '1rem', fontWeight: '700',
                    color: badge.unlocked ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {badge.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minHeight: '36px', lineHeight: '1.4' }}>
                    {badge.description}
                  </p>
                </div>

                {/* Requirement Tag */}
                <div style={{
                  fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                  background: badge.unlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: badge.unlocked ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontWeight: '600', marginTop: '0.2rem'
                }}>
                  {badge.unlocked ? '✓ Unlocked' : badge.requirement}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
