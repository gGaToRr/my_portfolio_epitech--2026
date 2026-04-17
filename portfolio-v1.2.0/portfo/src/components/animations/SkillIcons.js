import React from 'react';

const SkillIcons = () => {
  const skills = [
    {
      name: "React",
      icon: (
        <svg viewBox="-11.5 -10.23 23 20.46" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="0" cy="0" r="2.05" fill="currentColor"/>
          <g stroke="currentColor" fill="none">
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      )
    },
    {
      name: "Web",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    {
      name: "JS",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h18v18H3zM7 12a2 2 0 0 1 2 2v2a2 2 0 1 0 4 0v-2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2a4 4 0 1 1-8 0v-2a2 2 0 0 1 2-2z"/>
          <circle cx="17" cy="7" r="1" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "Python",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2c2.76 0 5 2.24 5 5v2h2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-2v2c0 2.76-2.24 5-5 5s-5-2.24-5-5v-2H5a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3h2V7c0-2.76 2.24-5 5-5z"/>
          <path d="M9 7V5a1 1 0 0 1 2 0v2"/>
          <path d="M15 17v2a1 1 0 0 1-2 0v-2"/>
        </svg>
      )
    },
    {
      name: "Linux",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3s-4 4-4 9 4 9 4 9 4-4 4-9-4-9-4-9z"/>
          <path d="M8.5 13.5c-1.5 1-2.5 3-2.5 5h12c0-2-1-4-2.5-5"/>
        </svg>
      )
    },
    {
      name: "Sublime",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7.5L3 11.5V16.5L21 12.5V7.5Z"/>
          <path d="M21 12.5L3 16.5V21.5L21 17.5V12.5Z"/>
          <path d="M21 2.5L3 6.5V11.5L21 7.5V2.5Z"/>
        </svg>
      )
    },
    {
      name: "Cloud",
      // Nouvelle icône Cloud (Nuage)
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
        </svg>
      )
    },
    {
      name: "Réseaux",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      )
    },
    {
      name: "AI",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line>
          <line x1="15" y1="1" x2="15" y2="4"></line>
          <line x1="9" y1="20" x2="9" y2="23"></line>
          <line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line>
          <line x1="20" y1="15" x2="23" y2="15"></line>
        </svg>
      )
    },
    {
      name: "Gestion",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M9 14l2 2 4-4"></path>
        </svg>
      )
    }
  ];

  return (
    <>
      <style>{`
        .skill-grid-icons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 5px 0;
        }

        .skill-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 1.5);
          transition: color 0.3s ease, transform 0.3s ease;
          cursor: pointer;
        }

        .skill-item svg {
          width: 24px;
          height: 24px;
          transition: transform 0.3s ease;
        }

        .skill-item span {
          font-size: 0.6rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
        }

        .skill-item:hover {
          color: #61dafb;
          transform: translateY(-5px);
        }

        .skill-item:hover svg {
          transform: scale(1.1);
        }

        .skill-item:hover span {
          opacity: 1;
        }
      `}</style>

      <div className="skill-grid-icons">
        {skills.map((skill, index) => (
          <div key={index} className="skill-item">
            {skill.icon}
            <span>{skill.name}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default SkillIcons;