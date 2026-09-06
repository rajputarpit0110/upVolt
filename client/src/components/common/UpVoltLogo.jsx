import React from 'react';

/**
 * Signature UpVolt Electric Cyan Lightning Bolt 'V' Mark
 */
export const UpVoltBoltIcon = ({ width = 18, height = 22, className = '' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 100 120"
    fill="none"
    className={`upvolt-bolt-icon ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="uvBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="60%" stopColor="#00C4FF" />
        <stop offset="100%" stopColor="#0088FF" />
      </linearGradient>
      <filter id="uvGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Left Arm of V */}
    <polygon points="8,40 29,40 50,115 36,115" fill="url(#uvBoltGrad)" />
    {/* Right Arm - Electric Lightning Bolt */}
    <polygon
      points="93,2 78,54 92,55 59,115 44,115 36,68 59,68"
      fill="url(#uvBoltGrad)"
      filter="url(#uvGlow)"
    />
  </svg>
);

export const UpVoltLogo = ({
  size = 'md', // 'sm', 'md', 'lg'
  className = ''
}) => {
  const heights = {
    sm: '32px',
    md: '38px',
    lg: '50px'
  };

  const h = heights[size] || heights.md;

  return (
    <div className={`upvolt-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img
        src="/images/upvolt-logo-dark.png"
        alt="upVolt - Powering Ideas. Connecting Possibilities."
        className="cc-brand__logo-img cc-brand__logo-img--dark"
        style={{ height: h, width: 'auto', objectFit: 'contain' }}
      />
      <img
        src="/images/upvolt-logo-light.png"
        alt="upVolt - Powering Ideas. Connecting Possibilities."
        className="cc-brand__logo-img cc-brand__logo-img--light"
        style={{ height: h, width: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
};
