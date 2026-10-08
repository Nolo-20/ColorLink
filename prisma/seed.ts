import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Roles base
  const roles = ['cliente', 'asesor', 'calidad', 'despachos', 'administrador'];
  for (const rol of roles) {
    await prisma.rol.upsert({ where: { rol }, update: {}, create: { rol } });
  }

  // Ciudades donde tienes bodega
  const ciudades = ['Itagüí', 'Medellín', 'Rionegro'];
  const ciudadMap: Record<string, number> = {};
  for (const nombre of ciudades) {
    const c = await prisma.ciudad.upsert({
      where: { ciudadId: -1 }, // fuerza a buscar por findFirst manualmente abajo
      update: {},
      create: { ciudad: nombre }
    }).catch(async () => {
      const existing = await prisma.ciudad.findFirst({ where: { ciudad: nombre } });
      return existing || prisma.ciudad.create({ data: { ciudad: nombre } });
    });
    ciudadMap[nombre] = c.ciudadId;
  }

  // Productos del catálogo real de ColorLink
  const productos = [
    { sku: 'CLK-EXT-KORAZA-5G', nombre: 'ColorLink Koraza Tech Fachada 100% Acrílica', categoria: 'acabado_exterior', presentacion: 'cunete_5gal', rendimientoM2: 28.5, acabado: 'mate', precio: 485000 },
    { sku: 'CLK-EXT-KORAZA-1G', nombre: 'ColorLink Koraza Tech Fachada 100% Acrílica', categoria: 'acabado_exterior', presentacion: 'galon_1gal', rendimientoM2: 28.5, acabado: 'mate', precio: 115000 },
    { sku: 'CLK-IMP-SEAL-5G', nombre: 'Imprimante Sellador Antialcalino e Hidrofugante', categoria: 'preparacion', presentacion: 'cunete_5gal', rendimientoM2: 35, acabado: null, precio: 320000 },
    { sku: 'CLK-MAS-ELAST-1G', nombre: 'Masilla Acrílica Elastomérica Antifisuras', categoria: 'preparacion', presentacion: 'galon_1gal', rendimientoM2: 0, acabado: null, precio: 88000 },
    { sku: 'CLK-INT-VINIL-5G', nombre: 'Vinilo Acrílico Tipo 1 Lavable Satinado', categoria: 'acabado_interior', presentacion: 'cunete_5gal', rendimientoM2: 32, acabado: 'satinado', precio: 410000 }
  ];

  const productoMap: Record<string, string> = {};
  for (const p of productos) {
    const existing = await prisma.producto.findFirst({ where: { nombre: p.nombre, presentacion: p.presentacion } });
    const created = existing || await prisma.producto.create({
      data: { nombre: p.nombre, categoria: p.categoria, presentacion: p.presentacion, rendimientoM2: p.rendimientoM2, acabado: p.acabado, precio: p.precio }
    });
    productoMap[p.sku] = created.productoId;
  }

  // Stock físico por bodega (datos realistas, ajústalos a tu inventario real cuando lo tengas)
  const stock = [
    { sku: 'CLK-EXT-KORAZA-5G', bodega: 'Bodega Central Itagüí', ciudad: 'Itagüí', lote: 'LOT-2026-MED-08A', cantidad: 38, fecha: new Date('2026-08-25'), despachoHoras: 24 },
    { sku: 'CLK-EXT-KORAZA-1G', bodega: 'Centro Logístico Guayabal', ciudad: 'Medellín', lote: 'LOT-2026-MED-08A', cantidad: 124, fecha: new Date('2026-08-25'), despachoHoras: 24 },
    { sku: 'CLK-IMP-SEAL-5G', bodega: 'Bodega Central Itagüí', ciudad: 'Itagüí', lote: 'LOT-2026-IMP-14B', cantidad: 19, fecha: new Date('2026-08-20'), despachoHoras: 24 },
    { sku: 'CLK-MAS-ELAST-1G', bodega: 'Centro Logístico Guayabal', ciudad: 'Medellín', lote: 'LOT-2026-MAS-03C', cantidad: 45, fecha: new Date('2026-08-18'), despachoHoras: 24 },
    { sku: 'CLK-INT-VINIL-5G', bodega: 'Hub Oriente Rionegro', ciudad: 'Rionegro', lote: 'LOT-2026-VIN-22A', cantidad: 6, fecha: new Date('2026-08-12'), despachoHoras: 48 }
  ];

  for (const s of stock) {
    const existing = await prisma.inventarioProducto.findFirst({
      where: { productoId: productoMap[s.sku], numeroLote: s.lote }
    });
    if (!existing) {
      await prisma.inventarioProducto.create({
        data: {
          productoId: productoMap[s.sku],
          ciudadId: ciudadMap[s.ciudad],
          nombreBodega: s.bodega,
          numeroLote: s.lote,
          cantidadDisponible: s.cantidad,
          fechaTinturado: s.fecha,
          tiempoDespacho: s.despachoHoras
        }
      });
    }
  }

  console.log('✅ Roles, productos e inventario sembrados');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());