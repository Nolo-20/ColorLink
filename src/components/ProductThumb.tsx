import React from 'react';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { PaintCanGraphic } from './PaintCanGraphic';
import { ToolGraphic } from './ToolGraphic';

interface ProductThumbProps {
  productId?: string;
  name: string;
  sizeName?: string;
  colorHex?: string;
  colorName?: string;
  className?: string;
}

const TOOL_RE = /brocha|pincel|rodillo|cinta|enmascarar|esp[aá]tula|rasqueta|bandeja|cubeta|extensi[oó]n|telesc[oó]pica/;

/**
 * Miniatura del producto para carrito, checkout y pedidos: dibuja la misma lata o
 * herramienta del catálogo (con el color y la presentación elegidos) en vez de una foto.
 */
export const ProductThumb: React.FC<ProductThumbProps> = ({ productId, name, sizeName, colorHex, colorName, className = 'w-full h-full' }) => {
  const product =
    STORE_PRODUCTS.find(p => p.id === productId) ||
    STORE_PRODUCTS.find(p => p.name.toLowerCase() === (name || '').toLowerCase());

  const lowerName = (name || product?.name || '').toLowerCase();
  if (product?.category === 'herramientas' || TOOL_RE.test(lowerName)) {
    return <ToolGraphic productName={name || product?.name} className={className} />;
  }

  const defaultColor = product?.colors?.find(c => c.id === product.defaultColorId) || product?.colors?.[0];
  const defaultSize = product?.sizes?.find(s => s.id === product.defaultSizeId) || product?.sizes?.[0];

  return (
    <PaintCanGraphic
      productLine={product?.name || name}
      colorHex={colorHex || defaultColor?.hex || '#F8FAFC'}
      colorName={colorName || defaultColor?.name || 'Color a elección'}
      sizeName={sizeName || defaultSize?.name || '1 Galón'}
      category={product?.category}
      className={className}
    />
  );
};
