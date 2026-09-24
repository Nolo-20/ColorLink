import React from 'react';

interface FloatingAssistantButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingAssistantButton: React.FC<FloatingAssistantButtonProps> = ({
  onClick,
  isOpen
}) => {
  if (isOpen) return null;

  return (
    <aside 
      aria-label="Asistente Virtual" 
      className="fixed bottom-5 right-5 z-40 font-sans pointer-events-auto"
    >
      {/* Sleek, Non-intrusive Floating Robot Icon Button */}
      <button
        type="button"
        onClick={onClick}
        title="Asistente Virtual de Pinturas (Robot de ayuda)"
        aria-label="Abrir Asistente Virtual"
        className="relative group w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#0F224A] via-[#0A1A36] to-[#040C1A] text-white border border-cyan-400/40 shadow-xl hover:shadow-cyan-500/25 hover:border-cyan-300 hover:scale-108 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {/* Subtle ambient glow on hover */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 blur-sm opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Crisp Enterprise Robot Icon */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg 
            viewBox="0 0 36 36" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-7 h-7 text-cyan-300 group-hover:text-cyan-200 transition-transform group-hover:scale-105 duration-200"
          >
            {/* Antenna & Signal Beacon */}
            <line x1="18" y1="3" x2="18" y2="7.5" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="2.5" r="1.8" fill="#10B981" />
            
            {/* Robot Head Shell */}
            <rect x="6.5" y="7.5" width="23" height="18.5" rx="5.5" fill="#0B162C" stroke="#38BDF8" strokeWidth="1.6" />
            
            {/* Ear Sensors */}
            <rect x="4" y="13" width="2.5" height="7" rx="1.2" fill="#38BDF8" opacity="0.8" />
            <rect x="29.5" y="13" width="2.5" height="7" rx="1.2" fill="#38BDF8" opacity="0.8" />
            
            {/* Dark Digital Visor Screen */}
            <rect x="9.5" y="11.5" width="17" height="7.5" rx="2.8" fill="#020617" />
            
            {/* Glowing Digital Eyes */}
            <circle cx="13.5" cy="15.2" r="1.7" fill="#10B981" />
            <circle cx="22.5" cy="15.2" r="1.7" fill="#10B981" />
            <circle cx="13.5" cy="15.2" r="0.7" fill="#FFFFFF" />
            <circle cx="22.5" cy="15.2" r="0.7" fill="#FFFFFF" />
            
            {/* Expressive Smile / Grille */}
            <path d="M12.5 21.5H23.5" stroke="#38BDF8" strokeWidth="1.3" strokeLinecap="round" />
            
            {/* Mechanical Collar */}
            <rect x="12" y="27" width="12" height="4" rx="1.5" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          </svg>
        </div>

        {/* Tiny Status Dot (Online/Active) */}
        <span className="absolute top-1 right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0B162C]" />
        </span>
      </button>
    </aside>
  );
};
