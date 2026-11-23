import React from 'react';

interface GothicCardProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  variant?: 'default' | 'elevated' | 'highlight';
}

export const GothicCard: React.FC<GothicCardProps> = ({
  children,
  className = '',
  borderColor,
  variant = 'default',
}) => {
  const bgClass =
    variant === 'highlight'
      ? 'bg-[#221B18]'
      : variant === 'elevated'
        ? 'bg-[#2C221F]'
        : 'bg-[#161210]';

  return (
    <section
      className={`rounded-xl border p-5 ${bgClass} ${
        borderColor ? '' : 'border-[#3B2F2A]'
      } ${className}`}
      style={borderColor ? { borderColor } : undefined}
    >
      {children}
    </section>
  );
};
