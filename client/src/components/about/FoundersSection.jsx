import React from 'react';
import { FOUNDERS } from '../../data/foundersData';
import { LinkedInIcon, GitHubIcon, TwitterXIcon, InstagramIcon } from '../common/SocialIcons';
import { Crown, Users, Mail } from 'lucide-react';
import './FoundersSection.css';

export const FoundersSection = () => {
  const founder = FOUNDERS[0];
  const cofounder = FOUNDERS[1];

  return (
    <section className="cc-founders-section" id="founders">
      {/* Header */}
      <div className="cc-pano-header">
        <span className="cc-pano-eyebrow">— OUR FOUNDERS —</span>
        <h2 className="cc-pano-title">
          People Behind the{' '}
          <span className="cc-pano-title-script">Mission</span>
        </h2>
        <p className="cc-pano-subtitle">
          Building tools, communities, and opportunities for every student.
        </p>
      </div>

      {/* Panoramic Unified Showcase */}
      <div className="cc-pano-showcase">
        {/* ================= LEFT: FOUNDER ================= */}
        <div className="cc-pano-profile cc-pano-profile--founder">
          {/* Arch Portrait Frame & Floating Card */}
          <div className="cc-pano-arch-wrap">
            {/* Ambient Fluid Blob */}
            <div className="cc-pano-arch-blob cc-pano-arch-blob--blue" />

            {/* Angled Handwritten Slogan + Curved Arrow */}
            <div className="cc-pano-slogan-box cc-pano-slogan-box--left">
              <div className="cc-pano-slogan-text">{founder.slogan}</div>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cc-pano-slogan-arrow"
              >
                <path d="M4 4c4 10 10 14 16 14m0 0l-5-5m5 5l-5 5" />
              </svg>
            </div>

            {/* Tombstone Arch Photo */}
            <div className="cc-pano-arch-frame">
              {/* 
                📸 NOTE: Replace dummy photo with real photo:
                1. Put photo in client/public/images/founders/
                2. Update 'image' in client/src/data/foundersData.js
              */}
              <img
                src={founder.image}
                alt={founder.name}
                className="cc-pano-arch-img"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    founder.name
                  )}&backgroundColor=1e293b,0f172a&textColor=38bdf8`;
                }}
              />
            </div>

            {/* Overlaid Floating Quote Card */}
            <div className="cc-pano-floating-card cc-pano-floating-card--left">
              <div className="cc-pano-card-header cc-pano-card-header--blue">
                <Crown size={14} />
                <span>Founder</span>
              </div>
              <div className="cc-pano-card-quote">
                "{founder.quote}"
              </div>
            </div>
          </div>

          {/* Founder Details */}
          <div className="cc-pano-details">
            <h3 className="cc-pano-name">{founder.name}</h3>
            <div className="cc-pano-role cc-pano-role--blue">{founder.role}</div>

            {founder.subRole && (
              <div className="cc-pano-subrole cc-pano-subrole--blue">
                <Users size={14} />
                <span>{founder.subRole}</span>
              </div>
            )}

            <p className="cc-pano-bio">{founder.bio}</p>

            {/* Social Buttons */}
            <div className="cc-pano-socials">
              {founder.socialLinks?.linkedin && (
                <a
                  href={founder.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-pano-social-btn cc-pano-social-btn--linkedin"
                  title={`${founder.name}'s LinkedIn`}
                  aria-label={`${founder.name}'s LinkedIn`}
                >
                  <LinkedInIcon size={15} />
                </a>
              )}

              {founder.socialLinks?.instagram && (
                <a
                  href={founder.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-pano-social-btn cc-pano-social-btn--instagram"
                  title={`${founder.name} on Instagram`}
                  aria-label={`${founder.name} on Instagram`}
                >
                  <InstagramIcon size={14} />
                </a>
              )}

              {founder.socialLinks?.github && (
                <a
                  href={founder.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-pano-social-btn cc-pano-social-btn--github"
                  title={`${founder.name}'s GitHub`}
                  aria-label={`${founder.name}'s GitHub`}
                >
                  <GitHubIcon size={14} />
                </a>
              )}

              {founder.socialLinks?.email && (
                <a
                  href={founder.socialLinks.email}
                  className="cc-pano-social-btn cc-pano-social-btn--email"
                  title={`Email ${founder.name}`}
                  aria-label={`Email ${founder.name}`}
                >
                  <Mail size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ================= CENTER: ROUND BADGE / SEAL ================= */}
        <div className="cc-pano-center-seal">
          <div className="cc-pano-seal-text">
            Ideas<br />
            Students<br />
            Impact
          </div>
          <div className="cc-pano-seal-line" />
        </div>

        {/* ================= RIGHT: CO-FOUNDER ================= */}
        <div className="cc-pano-profile cc-pano-profile--cofounder">
          {/* Arch Portrait Frame & Floating Card */}
          <div className="cc-pano-arch-wrap">
            {/* Ambient Fluid Blob */}
            <div className="cc-pano-arch-blob cc-pano-arch-blob--purple" />

            {/* Angled Handwritten Slogan + Curved Arrow */}
            <div className="cc-pano-slogan-box cc-pano-slogan-box--right">
              <div className="cc-pano-slogan-text">{cofounder.slogan}</div>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cc-pano-slogan-arrow"
              >
                <path d="M20 4c-4 10-10 14-16 14m0 0l5-5m-5 5l5 5" />
              </svg>
            </div>

            {/* Tombstone Arch Photo */}
            <div className="cc-pano-arch-frame">
              {/* 
                📸 NOTE: Replace dummy photo with real photo:
                1. Put photo in client/public/images/founders/
                2. Update 'image' in client/src/data/foundersData.js
              */}
              <img
                src={cofounder.image}
                alt={cofounder.name}
                className="cc-pano-arch-img"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    cofounder.name
                  )}&backgroundColor=1e293b,0f172a&textColor=38bdf8`;
                }}
              />
            </div>

            {/* Overlaid Floating Quote Card */}
            <div className="cc-pano-floating-card cc-pano-floating-card--right">
              <div className="cc-pano-card-header cc-pano-card-header--purple">
                <Users size={14} />
                <span>Co-Founder</span>
              </div>
              <div className="cc-pano-card-quote">
                "{cofounder.quote}"
              </div>
            </div>
          </div>

          {/* Co-Founder Details */}
          <div className="cc-pano-details">
            <h3 className="cc-pano-name">{cofounder.name}</h3>
            <div className="cc-pano-role cc-pano-role--purple">{cofounder.role}</div>

            {cofounder.subRole && (
              <div className="cc-pano-subrole cc-pano-subrole--purple">
                <Users size={14} />
                <span>{cofounder.subRole}</span>
              </div>
            )}

            <p className="cc-pano-bio">{cofounder.bio}</p>

            {/* Social Buttons */}
            <div className="cc-pano-socials">
              {cofounder.socialLinks?.linkedin && (
                <a
                  href={cofounder.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-pano-social-btn cc-pano-social-btn--linkedin"
                  title={`${cofounder.name}'s LinkedIn`}
                  aria-label={`${cofounder.name}'s LinkedIn`}
                >
                  <LinkedInIcon size={15} />
                </a>
              )}

              {cofounder.socialLinks?.instagram && (
                <a
                  href={cofounder.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-pano-social-btn cc-pano-social-btn--instagram"
                  title={`${cofounder.name}'s Instagram`}
                  aria-label={`${cofounder.name}'s Instagram`}
                >
                  <InstagramIcon size={14} />
                </a>
              )}

              {cofounder.socialLinks?.github && (
                <a
                  href={cofounder.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-pano-social-btn cc-pano-social-btn--github"
                  title={`${cofounder.name}'s GitHub`}
                  aria-label={`${cofounder.name}'s GitHub`}
                >
                  <GitHubIcon size={14} />
                </a>
              )}

              {cofounder.socialLinks?.email && (
                <a
                  href={cofounder.socialLinks.email}
                  className="cc-pano-social-btn cc-pano-social-btn--email"
                  title={`Email ${cofounder.name}`}
                  aria-label={`Email ${cofounder.name}`}
                >
                  <Mail size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
