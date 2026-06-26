import React, { useState } from 'react';
import { 
  Settings, Search, Volume2, Sliders, DownloadCloud, HardDrive, 
  PlayCircle, Repeat, Shuffle, Palette, Moon, Sun, Bell, 
  ShieldCheck, EyeOff, Wifi, Radio, Smartphone, Bluetooth, 
  Sparkles, Globe, Terminal, Wrench, Info, FileText, HelpCircle, 
  ChevronRight, ChevronDown, Check, Trash2, Activity, Zap, 
  Headphones, Share2, Star, Link, RefreshCw, AudioLines, MoveRight, Music
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

// Reusable Components

const SettingSection = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="mb-10 animate-fade-in-up">
    <div className="flex items-center gap-3 mb-5 px-1">
      <div className="w-10 h-10 rounded-2xl bg-[#bc8aff]/10 flex items-center justify-center border border-[#bc8aff]/20 shadow-[0_0_15px_rgba(188,138,255,0.1)]">
        <Icon className="w-5 h-5 text-[#bc8aff]" />
      </div>
      <h2 className="text-xl font-display font-bold text-white tracking-wide">{title}</h2>
    </div>
    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[28px] overflow-hidden shadow-2xl">
      <div className="divide-y divide-white/5">
        {children}
      </div>
    </div>
  </div>
);

const SettingToggle = ({ title, description, state, setState, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setState(!state)}>
    <div className="flex items-center gap-4 max-w-[75%]">
      {Icon && <Icon className="w-5 h-5 text-neutral-400 shrink-0" />}
      <div className="flex flex-col">
        <span className="text-[15px] font-semibold text-white">{title}</span>
        {description && <span className="text-xs text-neutral-400 mt-1 leading-relaxed">{description}</span>}
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out shrink-0 ${state ? 'bg-[#bc8aff]' : 'bg-white/10 border border-white/10'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${state ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  </div>
);

const SettingSelect = ({ title, description, value, options, onChange, icon: Icon }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.02] transition-colors gap-4">
    <div className="flex items-center gap-4 max-w-[75%]">
      {Icon && <Icon className="w-5 h-5 text-neutral-400 shrink-0" />}
      <div className="flex flex-col">
        <span className="text-[15px] font-semibold text-white">{title}</span>
        {description && <span className="text-xs text-neutral-400 mt-1 leading-relaxed">{description}</span>}
      </div>
    </div>
    <div className="relative shrink-0">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 focus:border-[#bc8aff] focus:outline-none transition-colors w-full sm:w-auto"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-[#0c0c0c]">{opt}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const SettingSlider = ({ title, description, value, min, max, step, onChange, icon: Icon, unit = '' }: any) => (
  <div className="flex flex-col p-5 hover:bg-white/[0.02] transition-colors gap-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {Icon && <Icon className="w-5 h-5 text-neutral-400 shrink-0" />}
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-white">{title}</span>
          {description && <span className="text-xs text-neutral-400 mt-1 leading-relaxed">{description}</span>}
        </div>
      </div>
      <span className="text-sm font-mono font-bold text-[#bc8aff]">{value}{unit}</span>
    </div>
    <input 
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-white/10 accent-[#bc8aff] rounded-full appearance-none cursor-pointer mt-2"
    />
  </div>
);

const SettingAction = ({ title, description, icon: Icon, onClick, danger = false }: any) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-5 hover:bg-white/[0.04] transition-colors cursor-pointer group"
  >
    <div className="flex items-center gap-4 max-w-[80%]">
      {Icon && <Icon className={`w-5 h-5 shrink-0 ${danger ? 'text-red-400 group-hover:text-red-300' : 'text-neutral-400 group-hover:text-white transition-colors'}`} />}
      <div className="flex flex-col">
        <span className={`text-[15px] font-semibold ${danger ? 'text-red-400 group-hover:text-red-300' : 'text-white'}`}>{title}</span>
        {description && <span className={`text-xs mt-1 leading-relaxed ${danger ? 'text-red-400/60' : 'text-neutral-400'}`}>{description}</span>}
      </div>
    </div>
    <ChevronRight className={`w-5 h-5 shrink-0 ${danger ? 'text-red-400/50 group-hover:translate-x-1 transition-transform' : 'text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all'}`} />
  </div>
);


export const SettingsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { settings: s, updateSetting: u } = useSettings();

  return (
    <div className="pb-32 animate-fade-in select-none min-h-screen text-white relative" style={{ backgroundColor: s.theme === 'AMOLED Black' ? '#000000' : s.theme === 'Light' ? '#f5f5f5' : '#08080a' }}>
      
      {/* Absolute Ambient Background glow for AMOLED */}
      {s.theme !== 'Light' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#bc8aff]/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
      )}

      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* Header & Sticky Search */}
        <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-3xl pt-6 pb-6 border-b border-white/5 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between mb-6 px-2">
            <h1 className="text-4xl font-display font-black text-white tracking-tight flex items-center gap-3">
              <Settings className="w-8 h-8 text-[#bc8aff]" />
              <span className={s.theme === 'Light' ? 'text-black' : 'text-white'}>Settings</span>
            </h1>
          </div>
          
          <div className="relative group px-2">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-[#bc8aff] transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-14 pr-4 focus:outline-none focus:border-[#bc8aff] focus:ring-1 focus:ring-[#bc8aff]/50 transition-all font-medium placeholder-neutral-500 shadow-inner"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="px-2" style={{ filter: s.perfMode ? 'none' : 'drop-shadow(0 0 20px rgba(188,138,255,0.05))' }}>
          
          {/* 🎵 AUDIO SECTION */}
          <SettingSection title="Audio" icon={AudioLines}>
            <SettingSelect title="Audio Quality" description="Overall master quality preference" value={s.audioQual} options={['Auto', 'Low', 'Medium', 'High', 'Lossless']} onChange={(v: string) => u('audioQual', v)} icon={Activity} />
            <SettingSelect title="Streaming Quality" description="Quality when using mobile data or Wi-Fi" value={s.streamQual} options={['Standard (96kbps)', 'High (160kbps)', 'Very High (320kbps)', 'Lossless (FLAC)']} onChange={(v: string) => u('streamQual', v)} icon={Wifi} />
            <SettingSelect title="Download Quality" description="Quality of saved offline music" value={s.dlQual} options={['Standard (96kbps)', 'High (160kbps)', 'Very High (320kbps)', 'Lossless (FLAC)']} onChange={(v: string) => u('dlQual', v)} icon={HardDrive} />
            <SettingToggle title="Normalize Volume" description="Set the same volume level for all tracks" state={s.normVol} setState={(v: boolean) => u('normVol', v)} icon={Volume2} />
            <SettingSlider title="Crossfade" description="Smoothly fade between tracks" value={s.crossfade} min={0} max={12} step={1} onChange={(v: number) => u('crossfade', v)} unit="s" icon={MoveRight} />
            <SettingToggle title="Gapless Playback" description="Allow gapless playback between tracks" state={s.gapless} setState={(v: boolean) => u('gapless', v)} icon={Link} />
            <SettingAction title="Studio Equalizer" description="Adjust Bass, Mid, Treble and acoustic presets" icon={Sliders} onClick={() => alert('Browser restriction: Custom EQ is disabled for cross-origin audio streams to prevent muting.')}/>
          </SettingSection>

          {/* 📥 DOWNLOADS SECTION */}
          <SettingSection title="Downloads" icon={DownloadCloud}>
            <SettingToggle title="Download over Wi-Fi only" description="Prevent mobile data usage for downloads" state={s.dlWifi} setState={(v: boolean) => u('dlWifi', v)} icon={Wifi} />
            <SettingToggle title="Smart Downloads" description="Automatically download recommended tracks overnight" state={s.smartDl} setState={(v: boolean) => u('smartDl', v)} icon={Zap} />
            <SettingToggle title="Auto Download Liked Songs" description="Save all your favorite tracks for offline listening" state={s.autoDlLiked} setState={(v: boolean) => u('autoDlLiked', v)} icon={Star} />
            <SettingSelect title="Storage Location" description="Choose where to save offline files" value="Internal Storage" options={['Internal Storage', 'SD Card']} onChange={() => {}} icon={HardDrive} />
            <SettingAction title="Clear Cache" description="Free up temporary storage" icon={Trash2} onClick={() => { localStorage.removeItem('sangeet_cache'); alert('Cache Cleared!'); }} />
            <SettingToggle title="Offline Mode" description="Force app to only show downloaded content" state={s.offlineMode} setState={(v: boolean) => u('offlineMode', v)} icon={Radio} />
          </SettingSection>

          {/* 🎧 PLAYBACK SECTION */}
          <SettingSection title="Playback" icon={PlayCircle}>
            <SettingToggle title="Autoplay Similar Songs" description="Keep playing similar tracks when queue ends" state={s.autoplay} setState={(v: boolean) => u('autoplay', v)} icon={Repeat} />
            <SettingToggle title="Shuffle Default" description="Always shuffle playlists by default" state={s.shuffleDef} setState={(v: boolean) => u('shuffleDef', v)} icon={Shuffle} />
            <SettingToggle title="Canvas Animation" description="Show looping background videos on player" state={s.canvas} setState={(v: boolean) => u('canvas', v)} icon={Sparkles} />
            <SettingToggle title="Lyrics Auto Scroll" description="Sync lyrics smoothly with vocals" state={s.lyricsScroll} setState={(v: boolean) => u('lyricsScroll', v)} icon={FileText} />
            <SettingToggle title="Fade In/Out" description="Soft volume fade on play/pause" state={s.fadeInOut} setState={(v: boolean) => u('fadeInOut', v)} icon={Volume2} />
            <SettingSelect title="Sleep Timer" description="Stop playback after duration" value={s.sleepTimer} options={['Off', '1m', '15m', '30m', '45m', '1h']} onChange={(v: string) => u('sleepTimer', v)} icon={Moon} />
          </SettingSection>

          {/* 🎨 APPEARANCE SECTION */}
          <SettingSection title="Appearance" icon={Palette}>
            <SettingSelect title="Theme Mode" description="Choose the base interface theme" value={s.theme} options={['Light', 'Dark', 'AMOLED Black']} onChange={(v: string) => u('theme', v)} icon={Moon} />
            <SettingSlider title="Glass Effect Intensity" description="Adjust background blur strength" value={s.blurInt} min={0} max={100} step={10} onChange={(v: number) => u('blurInt', v)} unit="px" icon={Palette} />
            <SettingSelect title="Font Size" description="Global text scaling" value={s.fontSize} options={['Small', 'Medium', 'Large', 'Extra Large']} onChange={(v: string) => u('fontSize', v)} icon={FileText} />
          </SettingSection>

          {/* 🔔 NOTIFICATIONS SECTION */}
          <SettingSection title="Notifications" icon={Bell}>
            <SettingToggle title="New Releases" description="Get notified about new music from followed artists" state={s.notifRel} setState={(v: boolean) => u('notifRel', v)} />
            <SettingToggle title="Playlist Updates" description="When saved playlists are updated" state={s.notifUpd} setState={(v: boolean) => u('notifUpd', v)} />
            <SettingToggle title="Recommendations" description="Periodic AI generated track suggestions" state={s.notifRec} setState={(v: boolean) => u('notifRec', v)} />
          </SettingSection>

          {/* 🔒 PRIVACY SECTION */}
          <SettingSection title="Privacy" icon={ShieldCheck}>
            <SettingToggle title="Private Session" description="Listening activity won't be tracked or shared" state={s.privSession} setState={(v: boolean) => u('privSession', v)} icon={EyeOff} />
            <SettingToggle title="Hide Listening Activity" description="Hide your activity from followers" state={s.hideList} setState={(v: boolean) => u('hideList', v)} />
            <SettingToggle title="Explicit Content Filter" description="Block tracks marked as explicit" state={s.explicit} setState={(v: boolean) => u('explicit', v)} />
            <SettingAction title="Clear Search History" description="Remove all past searches" icon={Trash2} onClick={() => { localStorage.removeItem('melody-recent-searches'); alert('Search History Cleared!'); }} />
            <SettingAction title="Clear Recently Played" description="Wipe your listen history" icon={Trash2} danger={true} onClick={() => { localStorage.removeItem('melody-listen-history'); alert('Play History Cleared! Refresh to see changes.'); }} />
          </SettingSection>

          {/* 🌐 NETWORK SECTION */}
          <SettingSection title="Network" icon={Radio}>
            <SettingToggle title="Data Saver" description="Compress images and audio heavily on mobile networks" state={s.dataSaver} setState={(v: boolean) => u('dataSaver', v)} icon={Wifi} />
            <SettingToggle title="Auto Retry Connection" description="Automatically try reconnecting on failure" state={s.autoRetry} setState={(v: boolean) => u('autoRetry', v)} icon={RefreshCw} />
          </SettingSection>

          {/* 📱 DEVICE SECTION */}
          <SettingSection title="Device & Integration" icon={Smartphone}>
            <SettingToggle title="Bluetooth Auto Connect" description="Resume playback when connected to car or headphones" state={s.btAuto} setState={(v: boolean) => u('btAuto', v)} icon={Bluetooth} />
            <SettingToggle title="Lock Screen Controls" description="Show immersive player on lock screen" state={s.lockScreen} setState={(v: boolean) => u('lockScreen', v)} icon={Smartphone} />
            <SettingToggle title="Shake to Skip" description="Shake your phone to play the next track" state={s.shakeSkip} setState={(v: boolean) => u('shakeSkip', v)} icon={Zap} />
          </SettingSection>

          {/* 🤖 AI FEATURES SECTION */}
          <SettingSection title="AI Features (Beta)" icon={Sparkles}>
            <SettingToggle title="AI Music Recommendations" description="Use advanced neural models for better discovery" state={s.aiRecs} setState={(v: boolean) => u('aiRecs', v)} icon={Sparkles} />
            <SettingToggle title="Smart Queue" description="AI predicts what you want to hear next" state={s.smartQueue} setState={(v: boolean) => u('smartQueue', v)} icon={RefreshCw} />
            <SettingToggle title="AI DJ Mode" description="Simulated radio host between tracks" state={s.aiDJ} setState={(v: boolean) => u('aiDJ', v)} icon={Headphones} />
          </SettingSection>

          {/* 🌍 LANGUAGE SECTION */}
          <SettingSection title="Language & Region" icon={Globe}>
            <SettingSelect title="App Language" description="Interface language" value={s.lang} options={['English', 'Hindi', 'Spanish', 'French']} onChange={(v: string) => u('lang', v)} />
            <SettingSelect title="Content Region" description="Trending music region" value={s.region} options={['India', 'United States', 'UK', 'Global']} onChange={(v: string) => u('region', v)} />
          </SettingSection>

          {/* 🛠 ADVANCED SECTION */}
          <SettingSection title="Advanced" icon={Terminal}>
            <SettingToggle title="Developer Mode" description="Enable debugging logs and experimental UI" state={s.devMode} setState={(v: boolean) => u('devMode', v)} icon={Terminal} />
            <SettingToggle title="Performance Mode" description="Disable visual effects for older devices" state={s.perfMode} setState={(v: boolean) => u('perfMode', v)} icon={Zap} />
          </SettingSection>

          {/* ℹ ABOUT SECTION */}
          <SettingSection title="About" icon={Info}>
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <Info className="w-5 h-5 text-neutral-400" />
                <span className="text-[15px] font-semibold text-white">App Version</span>
              </div>
              <span className="text-sm font-mono text-[#bc8aff] font-bold">10.4.0 (Build 992)</span>
            </div>
            <SettingAction title="Factory Reset" description="Reset all settings to default" icon={Trash2} danger={true} onClick={() => { if(confirm('Reset all settings?')) localStorage.removeItem('sangeet_settings'); window.location.reload(); }} />
          </SettingSection>

          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
};
