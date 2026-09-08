import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('portfolio_lang');
        return saved === 'fr' ? 'fr' : 'en'; // Par défaut en anglais ('en')
    });

    useEffect(() => {
        localStorage.setItem('portfolio_lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const toggleLang = () => {
        setLang((prev) => (prev === 'en' ? 'fr' : 'en'));
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
