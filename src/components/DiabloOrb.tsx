import React from 'react';

interface DiabloOrbProps {
  title: string;
  currentValue: number;
  maxValue: number;
  isLife: boolean;
  onClick?: () => void;
}

export const DiabloOrb: React.FC<DiabloOrbProps> = ({
  title,
  currentValue,
  maxValue,
  isLife,
  onClick,
}) => {
  const fraction =
    maxValue > 0 ? Math.max(0, Math.min(1, currentValue / maxValue)) : 1;
  const fillPercent = Math.round(fraction * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        title={`Click to restore ${title}`}
        className="group relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#3B2F2A] bg-[#0F0B09] transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD464] active:scale-[0.98]"
      >
        {/* Liquid fill layer */}
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-200 ease-out"
          style={{
            height: `${fillPercent}%`,
            background: isLife
              ? 'linear-gradient(180deg, #EE3535 0%, #C82323 48%, #751212 100%)'
              : 'linear-gradient(180deg, #5AA1FF 0%, #2D7BDE 48%, #17427C 100%)',
          }}
        />

        {/* Meniscus highlight line */}
        {fillPercent > 2 && fillPercent < 99 && (
          <div
            className="absolute inset-x-0 h-[2px] opacity-80"
            style={{
              bottom: `${fillPercent}%`,
              background: isLife ? '#FF8B8B' : '#A9D0FF',
            }}
          />
        )}

        {/* Glass orb reflection & vignette */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.06) 28%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.78) 100%)',
          }}
        />

        {/* Numeric readout */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
          <span className="font-mono-tabular text-xl font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {currentValue}
          </span>
          <span className="font-mono-tabular text-xs font-medium text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            / {maxValue}
          </span>
        </div>
      </button>

      <span
        className={`text-xs font-semibold tracking-wide ${
          isLife ? 'text-[#EE3535]' : 'text-[#5AA1FF]'
        }`}
      >
        {title}
      </span>
    </div>
  );
};
