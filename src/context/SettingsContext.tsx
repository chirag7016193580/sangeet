import React, { createContext, useContext, useEffect, useState } from 'react';

export interface SettingsState {
  audioQual: string;
  streamQual: string;
  dlQual: string;
  normVol: boolean;
  crossfade: number;
  gapless: boolean;

  dlWifi: boolean;
  smartDl: boolean;
  autoDlLiked: boolean;
  offlineMode: boolean;

  autoplay: boolean;
  shuffleDef: boolean;
  canvas: boolean;
  lyricsScroll: boolean;
  fadeInOut: boolean;
  sleepTimer: string;

  theme: string;
  blurInt: number;
  fontSize: string;

  notifRel: boolean;
  notifUpd: boolean;
  notifRec: boolean;

  privSession: boolean;
  hideList: boolean;
  explicit: boolean;

  dataSaver: boolean;
  autoRetry: boolean;

  btAuto: boolean;
  lockScreen: boolean;
  shakeSkip: boolean;

  aiRecs: boolean;
  aiDJ: boolean;
  smartQueue: boolean;

  lang: string;
  region: string;

  devMode: boolean;
  perfMode: boolean;
}

export const defaultSettings: SettingsState = {
  audioQual: 'High', streamQual: 'High', dlQual: 'Lossless',
  normVol: true, crossfade: 2, gapless: true,
  dlWifi: true, smartDl: false, autoDlLiked: true, offlineMode: false,
  autoplay: true, shuffleDef: false, canvas: true, lyricsScroll: true, fadeInOut: true, sleepTimer: 'Off',
  theme: 'AMOLED Black', blurInt: 80, fontSize: 'Medium',
  notifRel: true, notifUpd: true, notifRec: false,
  privSession: false, hideList: false, explicit: false,
  dataSaver: false, autoRetry: true,
  btAuto: true, lockScreen: true, shakeSkip: false,
  aiRecs: true, aiDJ: false, smartQueue: true,
  lang: 'English', region: 'India',
  devMode: false, perfMode: true
};

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('sangeet_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('sangeet_settings', JSON.stringify(settings));
    
    // Apply global CSS variables based on settings
    document.documentElement.style.setProperty('--glass-blur', `${settings.blurInt}px`);
    
    if (settings.theme === 'Light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark', 'theme-amoled');
    } else if (settings.theme === 'AMOLED Black') {
      document.body.classList.add('theme-amoled');
      document.body.classList.remove('theme-light', 'theme-dark');
    } else {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light', 'theme-amoled');
    }

  }, [settings]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
