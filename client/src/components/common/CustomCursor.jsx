import React, { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [auraPos, setAuraPos] = useState({ x: -100, y: -100 });
  const [isHover, setIsHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on pointer-fine devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let frameId;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPos({ x: targetX, y: targetY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const checkHover = (e) => {
      const target = e.target;
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('.clickable') ||
        target.closest('.product-card')
      ) {
        setIsHover(true);
        document.body.classList.add('cursor-hover');
      } else {
        setIsHover(false);
        document.body.classList.remove('cursor-hover');
      }
    };

    const animateAura = () => {
      // Smooth lerp trailing
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;
      setAuraPos({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(animateAura);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', checkHover);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    frameId = requestAnimationFrame(animateAura);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', checkHover);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(frameId);
      document.body.classList.remove('cursor-hover');
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="custom-cursor-dot"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      />
      <div
        className="custom-cursor-aura"
        style={{ left: `${auraPos.x}px`, top: `${auraPos.y}px` }}
      />
    </>
  );
};
