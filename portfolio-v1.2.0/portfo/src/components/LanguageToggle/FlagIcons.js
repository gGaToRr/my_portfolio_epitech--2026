import React from 'react';

export function UkFlagIcon({ width = 22, height = 16, className = '' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 60 40"
            width={width}
            height={height}
            className={`flag-svg ${className}`}
            style={{ borderRadius: '3px', display: 'block', overflow: 'hidden' }}
            aria-hidden="true"
        >
            <clipPath id="uk-flag-clip">
                <rect width="60" height="40" rx="3" />
            </clipPath>
            <g clipPath="url(#uk-flag-clip)">
                {/* Blue field */}
                <rect width="60" height="40" fill="#012169" />
                {/* White diagonal saltires */}
                <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
                {/* Red diagonal saltires */}
                <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
                {/* White cross */}
                <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="12" />
                {/* Red cross */}
                <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7.2" />
            </g>
        </svg>
    );
}

export function FrFlagIcon({ width = 22, height = 16, className = '' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 60 40"
            width={width}
            height={height}
            className={`flag-svg ${className}`}
            style={{ borderRadius: '3px', display: 'block', overflow: 'hidden' }}
            aria-hidden="true"
        >
            <clipPath id="fr-flag-clip">
                <rect width="60" height="40" rx="3" />
            </clipPath>
            <g clipPath="url(#fr-flag-clip)">
                {/* Blue stripe */}
                <rect x="0" y="0" width="20" height="40" fill="#002654" />
                {/* White stripe */}
                <rect x="20" y="0" width="20" height="40" fill="#FFFFFF" />
                {/* Red stripe */}
                <rect x="40" y="0" width="20" height="40" fill="#CE1126" />
            </g>
        </svg>
    );
}
