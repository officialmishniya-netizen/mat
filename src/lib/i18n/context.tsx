"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import fr from "./dictionaries/fr.json";
import de from "./dictionaries/de.json";
import pt from "./dictionaries/pt.json";
import ru from "./dictionaries/ru.json";

const dictionaries: Record<string, any> = { en, es, fr, de, pt, ru };

type Language = "en" | "es" | "fr" | "de" | "pt" | "ru";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("app_lang") as Language;
        if (saved && dictionaries[saved]) {
            setLanguageState(saved);
        }
        setMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("app_lang", lang);
    };

    const t = (path: string) => {
        const keys = path.split(".");
        let result = dictionaries[language];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path; // Fallback to key name
            }
        }

        return result as string;
    };

    // Prevent hydration mismatch - but ALWAYS provide the context provider
    // during SSR so that useTranslation() doesn't throw.
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            <div className={mounted ? "" : "opacity-0"}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}
