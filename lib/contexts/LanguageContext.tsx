'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'home': 'Home',
    'search': 'Search',
    'updates': 'Updates',
    'profile': 'Profile',
    'logout': 'Logout',
    'welcome': 'Welcome',
    'search_placeholder': 'Search for schemes, subsidies, and benefits...',
    'popular_schemes': 'Popular Schemes',
    'view_all': 'View All',
    'categories': 'Categories',
    'top_categories': 'Top Categories',
    'all_categories': 'All Categories',
    'schemes_for': 'Schemes for',
    'apply_now': 'Apply Now',
    'get_help': 'Get Help',
    'key_benefits': 'Key Benefits',
    'eligibility': 'Eligibility Criteria',
    'documents_required': 'Required Documents',
    'how_to_apply': 'How to Apply',
    'back_to_home': 'Back to Home',
    'login': 'Login',
    'signup': 'Sign Up',
    'email_or_phone': 'Email or Phone',
    'password': 'Password',
    'light_mode': 'Light',
    'dark_mode': 'Dark',
    'language': 'Language',
    'english': 'English',
    'hindi': 'Hindi',
    'hinglish': 'Hinglish',
    'discover_schemes': 'Discover Government Schemes',
    'discover_schemes_desc': 'Central & state schemes simplified — search eligibility, benefits and how to apply.',
    'trending_now': 'Trending Now',
    'clear': 'Clear',
    'clear_search': 'Clear Search',
    'search_results': 'Search Results',
    'found': 'Found',
    'scheme': 'scheme',
    'schemes': 'schemes',
    'for': 'for',
    'no_schemes_found': 'No schemes found',
    'try_different_keywords': 'Try searching with different keywords like scheme name, ministry, or benefit type.',
    'see_all': 'See All',
    'oops': 'Oops!',
    'refresh': 'Refresh',
    'no_data': 'No schemes',
    'run_seed': 'Run: npm run db:seed',
  },
  hi: {
    'home': 'होम',
    'search': 'खोजें',
    'updates': 'अपडेट',
    'profile': 'प्रोफाइल',
    'logout': 'लॉगआउट',
    'welcome': 'स्वागत है',
    'search_placeholder': 'योजनाएं, सब्सिडी और लाभ खोजें...',
    'popular_schemes': 'लोकप्रिय योजनाएं',
    'view_all': 'सभी देखें',
    'categories': 'श्रेणियां',
    'top_categories': 'शीर्ष श्रेणियां',
    'all_categories': 'सभी श्रेणियां',
    'schemes_for': 'योजनाएं',
    'apply_now': 'अभी आवेदन करें',
    'get_help': 'सहायता लें',
    'key_benefits': 'मुख्य लाभ',
    'eligibility': 'पात्रता मानदंड',
    'documents_required': 'आवश्यक दस्तावेज़',
    'how_to_apply': 'आवेदन कैसे करें',
    'back_to_home': 'होम पर वापस जाएं',
    'login': 'लॉगिन',
    'signup': 'साइन अप',
    'email_or_phone': 'ईमेल या फोन',
    'password': 'पासवर्ड',
    'light_mode': 'लाइट',
    'dark_mode': 'डार्क',
    'language': 'भाषा',
    'english': 'अंग्रेज़ी',
    'hindi': 'हिंदी',
    'hinglish': 'हिंग्लिश',
    'discover_schemes': 'सरकारी योजनाएं खोजें',
    'discover_schemes_desc': 'केंद्र और राज्य की योजनाएं सरल भाषा में — पात्रता, लाभ और आवेदन की जानकारी।',
    'trending_now': 'ट्रेंडिंग',
    'clear': 'साफ़ करें',
    'clear_search': 'खोज साफ़ करें',
    'search_results': 'खोज परिणाम',
    'found': 'मिले',
    'scheme': 'योजना',
    'schemes': 'योजनाएं',
    'for': 'के लिए',
    'no_schemes_found': 'कोई योजना नहीं मिली',
    'try_different_keywords': 'योजना का नाम, मंत्रालय, या लाभ के प्रकार जैसे अलग कीवर्ड से खोजें।',
    'see_all': 'सभी देखें',
    'oops': 'उफ़!',
    'refresh': 'रिफ्रेश करें',
    'no_data': 'कोई योजना नहीं',
    'run_seed': 'चलाएं: npm run db:seed',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'hi'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
