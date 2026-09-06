import React, { useState, useEffect } from 'react';
import { MENTORS } from '../../data/mentorsData';
import { fetchMentors } from '../../services/mentorService';
import { WhatsAppIcon, LinkedInIcon } from '../common/SocialIcons';
import { CheckCircle, Sparkles, Crown } from 'lucide-react';
import './MentorsSection.css';

export const MentorsSection = () => {
  const [mentors, setMentors] = useState(MENTORS);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await fetchMentors();
        if (isMounted && data?.mentors && data.mentors.length > 0) {
          setMentors(data.mentors);
        }
      } catch (err) {
        console.warn('Using default mentor data:', err);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Separate Lead Mentor and General Mentors
  const leadMentor = mentors.find(m => m.isLead || m.role?.toLowerCase().includes('lead')) || mentors[0];
  const generalMentors = mentors.filter(m => (m._id || m.id) !== (leadMentor?._id || leadMentor?.id));

  return (
    <section className="cc-mentors-section" id="mentors">
      <div className="container cc-mentors__container">
        {/* Section Header */}
        <div className="cc-mentors-header text-center">
          <div className="cc-mentors-badge">
            <Sparkles size={14} />
            <span>1-on-1 Student Guidance</span>
          </div>
          <h2 className="cc-mentors-title">
            Connect With Our Hardware &{' '}
            <span className="gradient-text-blue">IoT Mentors</span>
          </h2>
          <p className="cc-mentors-subtitle">
            Stuck on pinouts, sensor interfacing, or firmware code? Connect directly with experienced student makers and engineers across WhatsApp and LinkedIn.
          </p>
        </div>

        {/* 1. Lead Mentor (Prominent card with Photo) */}
        {leadMentor && (
          <div className="cc-lead-mentor-wrap">
            <div className="cc-lead-mentor-card glass-panel">
              <div className="cc-lead-mentor-img-col">
                <div className="cc-lead-mentor-img-wrap">
                  <img
                    src={leadMentor.image || '/images/mentors/arjun_sharma.jpg'}
                    alt={leadMentor.name}
                    className="cc-lead-mentor-img"
                  />
                  <div className="cc-mentor-status-badge">
                    <span className="cc-mentor-status-dot" />
                    <span>Lead Mentor</span>
                  </div>
                </div>
              </div>

              <div className="cc-lead-mentor-content">
                <div className="cc-lead-top-row">
                  <span className="cc-lead-pill">
                    <Crown size={13} />
                    <span>Lead Hardware Architect</span>
                  </span>
                  <div className="cc-mentor-status-chip hide-mobile">
                    <span className="cc-mentor-status-dot" />
                    <span>Available for 1-on-1 Help</span>
                  </div>
                </div>

                <div className="cc-lead-name-row">
                  <h3 className="cc-lead-name">{leadMentor.name}</h3>
                  <CheckCircle size={20} className="cc-mentor-verified-icon" title="Verified Lead Mentor" />
                </div>

                <p className="cc-lead-bio">{leadMentor.bio || leadMentor.description}</p>

                <div className="cc-lead-connect-row">
                  <div className="cc-mentor-social-buttons">
                    {leadMentor.socialLinks?.whatsapp && (
                      <a
                        href={leadMentor.socialLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cc-mentor-btn cc-mentor-btn--whatsapp"
                        title={`Chat with ${leadMentor.name} on WhatsApp`}
                        aria-label={`Chat with ${leadMentor.name} on WhatsApp`}
                      >
                        <WhatsAppIcon size={16} />
                        <span>Chat with Lead Mentor</span>
                      </a>
                    )}

                    {leadMentor.socialLinks?.linkedin && (
                      <a
                        href={leadMentor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cc-mentor-btn cc-mentor-btn--linkedin"
                        title={`${leadMentor.name}'s LinkedIn`}
                        aria-label={`${leadMentor.name}'s LinkedIn`}
                      >
                        <LinkedInIcon size={16} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Three General Mentors (Under Lead Mentor - NO PHOTOS) */}
        {generalMentors.length > 0 && (
          <div className="cc-general-mentors-block">
            <div className="cc-general-mentors-header">
              <div className="cc-general-mentors-divider">
                <span className="cc-general-mentors-divider-line" />
                <span className="cc-general-mentors-divider-text">Domain Specialists & Mentors</span>
                <span className="cc-general-mentors-divider-line" />
              </div>
            </div>

            <div className="cc-general-mentors-grid">
              {generalMentors.map((mentor) => (
                <div key={mentor._id || mentor.id} className="cc-general-mentor-card glass-panel">
                  <div className="cc-general-mentor-body">
                    <div className="cc-general-mentor-top">
                      <span className="cc-general-mentor-role-badge">Mentor</span>
                      <div className="cc-mentor-mini-status" title="Available">
                        <span className="cc-mentor-status-dot" />
                      </div>
                    </div>

                    <div className="cc-mentor-name-row">
                      <h4 className="cc-mentor-name">{mentor.name}</h4>
                      <CheckCircle size={16} className="cc-mentor-verified-icon" title="Verified Mentor" />
                    </div>

                    <p className="cc-mentor-bio">{mentor.bio || mentor.description}</p>

                    <div className="cc-mentor-connect-section">
                      <div className="cc-mentor-social-buttons">
                        {mentor.socialLinks?.whatsapp && (
                          <a
                            href={mentor.socialLinks.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cc-mentor-btn cc-mentor-btn--whatsapp"
                            title={`Chat with ${mentor.name} on WhatsApp`}
                            aria-label={`Chat with ${mentor.name} on WhatsApp`}
                          >
                            <WhatsAppIcon size={16} />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {mentor.socialLinks?.linkedin && (
                          <a
                            href={mentor.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cc-mentor-btn cc-mentor-btn--linkedin"
                            title={`${mentor.name}'s LinkedIn`}
                            aria-label={`${mentor.name}'s LinkedIn`}
                          >
                            <LinkedInIcon size={16} />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

