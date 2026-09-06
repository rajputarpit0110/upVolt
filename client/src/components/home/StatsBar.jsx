import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Package,
  Heart,
  Star,
  Award,
  ShieldCheck,
  TrendingUp,
  Truck,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { fetchStatsSettings, DEFAULT_STATS } from '../../services/settingsService';
import './StatsBar.css';

export const renderStatIcon = (iconName, size = 24) => {
  switch (iconName) {
    case 'users':
      return <Users size={size} />;
    case 'graduation':
      return <GraduationCap size={size} />;
    case 'package':
      return <Package size={size} />;
    case 'heart':
      return <Heart size={size} />;
    case 'star':
      return <Star size={size} />;
    case 'award':
      return <Award size={size} />;
    case 'shield':
      return <ShieldCheck size={size} />;
    case 'trending':
      return <TrendingUp size={size} />;
    case 'truck':
      return <Truck size={size} />;
    case 'zap':
      return <Zap size={size} />;
    case 'clock':
      return <Clock size={size} />;
    case 'sparkles':
      return <Sparkles size={size} />;
    default:
      return <Users size={size} />;
  }
};

export const StatsBar = () => {
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    let isMounted = true;
    fetchStatsSettings().then((data) => {
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        setStats(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="cc-stats-section">
      <div className="container cc-stats-section__container">
        <div className="cc-stats-grid">
          {stats.map((stat, index) => (
            <div key={stat.id || index} className="cc-stat-card">
              <div className="cc-stat-card__icon">
                {renderStatIcon(stat.icon)}
              </div>
              <div className="cc-stat-card__content">
                <span className="cc-stat-card__number">{stat.number}</span>
                <span className="cc-stat-card__label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
