import React from 'react';

interface BrandLogoProps {
  /** Fondo sobre el que va el logo: oscuro (texto blanco) o claro (texto azul marino) */
  on?: 'dark' | 'light';
  iconOnly?: boolean;
  className?: string;
}

/** Logo oficial de ColorLink (ícono de espiral + "ColorLink") */
export const BrandLogo: React.FC<BrandLogoProps> = ({ on = 'dark', iconOnly = false, className = 'h-9' }) => (
  <img
    src={iconOnly ? '/brand/logo-icon.svg' : `/brand/logo-on-${on}.svg`}
    alt="ColorLink"
    className={`${className} w-auto select-none`}
    draggable={false}
  />
);
