import React from 'react';
import { UkFlagIcon, FrFlagIcon } from './FlagIcons';
import './LanguageToggle.css';

function LanguageToggle({ lang, onToggle }) {
    const isEn = lang === 'en';

    return (
        <button
            type="button"
            onClick={onToggle}
            className="lang-toggle"
            aria-label={isEn ? 'Passer en français' : 'Switch to English'}
            title={isEn ? 'Language: English (Switch to French)' : 'Langue : Français (Passer en Anglais)'}
        >
            <span className="lang-toggle__flag-wrap">
                {isEn ? <UkFlagIcon width={22} height={15} /> : <FrFlagIcon width={22} height={15} />}
            </span>
            <span className="lang-toggle__code">{isEn ? 'EN' : 'FR'}</span>
        </button>
    );
}

export default LanguageToggle;
