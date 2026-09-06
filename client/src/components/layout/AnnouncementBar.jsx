import React from 'react';
import { getWhatsAppLink, WHATSAPP_GROUP_LINK, OFFICIAL_EMAIL } from '../../utils/constants';
import { Truck, GraduationCap, LifeBuoy } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import './AnnouncementBar.css';

export const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="container announcement-bar__container">
        <div className="announcement-bar__left">
          <span className="announcement-item">
            <GraduationCap size={14} className="announcement-icon" />
            <span>Built for Students</span>
          </span>
          <span className="announcement-separator">|</span>
          <span className="announcement-item hide-mobile">
            <Truck size={14} className="announcement-icon" />
            <span>Now delivering to colleges & hostels across Delhi</span>
          </span>
        </div>

        <div className="announcement-bar__center">
          <a
            href={getWhatsAppLink('Hi CampusCircuit! I need quick project help.')}
            target="_blank"
            rel="noopener noreferrer"
            className="announcement-link"
          >
            <WhatsAppIcon size={14} className="announcement-icon" />
            <span>Need help? Chat on WhatsApp ➔</span>
          </a>
        </div>

        <div className="announcement-bar__right hide-mobile">
          <a
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="announcement-group-pill"
          >
            <WhatsAppIcon size={13} color="#25D366" />
            <span>Join WhatsApp Group</span>
          </a>
          <span className="announcement-separator">|</span>
          <a
            href={`mailto:${OFFICIAL_EMAIL}`}
            className="announcement-support"
            title={`Email us at ${OFFICIAL_EMAIL}`}
          >
            <LifeBuoy size={13} className="announcement-icon" />
            <span>Get Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};
