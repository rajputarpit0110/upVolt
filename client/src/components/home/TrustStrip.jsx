import React from 'react';
import {
  GraduationCap,
  Package,
  Lightbulb,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import './TrustStrip.css';

export const TrustStrip = () => {
  const items = [
    {
      icon: <GraduationCap size={20} />,
      title: 'Student-First',
      desc: 'Pricing for college budgets'
    },
    {
      icon: <Package size={20} />,
      title: 'Wide Range',
      desc: 'of IoT & electronic modules'
    },
    {
      icon: <Lightbulb size={20} />,
      title: 'Project Support',
      desc: '& circuit guidance'
    },
    {
      icon: <Truck size={20} />,
      title: 'Easy College',
      desc: 'Hostel & campus delivery'
    },
    {
      icon: <WhatsAppIcon size={20} />,
      title: 'WhatsApp',
      desc: 'Direct student support'
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'Genuine',
      desc: '& Reliable tested components'
    },
  ];

  return (
    <section className="cc-trust-strip">
      <div className="container cc-trust-strip__container">
        <div className="cc-trust-strip__grid">
          {items.map((item, index) => (
            <div key={index} className="cc-trust-card">
              <div className="cc-trust-card__icon">{item.icon}</div>
              <div className="cc-trust-card__info">
                <span className="cc-trust-card__title">{item.title}</span>
                <span className="cc-trust-card__desc">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
