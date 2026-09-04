import React, { useState } from 'react';
import { UserProfile, ProductCatalogItem, WarehouseStockItem } from '../types';
import { PRODUCT_CATALOG, WAREHOUSE_STOCKS } from '../data/mockData';
import { 
  Package, 
  Layers, 
  Truck, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Search, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Database,
  RefreshCw,
  Clock
} from 'lucide-react';

interface InventoryModuleProps {
  user: UserProfile;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bodegas' | 'catalogo'>('bodegas');
  const [stockList, setStockList] = useState<WarehouseStockItem[]>(WAREHOUSE_STOCKS);
  const [catalogList, setCatalogList] = useState<ProductCatalogItem[]>(PRODUCT_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('todas');
  const [stockAdjustmentNotice, setStockAdjustmentNotice] = useState('');

  // Quick increment/decrement for Admin / Bodega role
  const handleAdjustStock = (id: string, delta: number) => {
    if (user.role !== 'administrador') return;
    setStockList(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.stockDisponible + delta);
        return {
          ...item,
          stockDisponible: newQty,
          estado: newQty === 0 ? 'agotado' : newQty <= item.stockMinimoAlerta ? 'bajo_stock' : 'disponible'
        };
      }
      return item;
    }));
    setStockAdjustmentNotice('Inventario actualizado en base de datos PostgreSQL.');
    setTimeout(() => setStockAdjustmentNotice(''), 2500);
  };

  const filteredStock = stockList.filter(item => {
    const matchesSearch = item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bodegaNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.numeroLote.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWh = selectedWarehouse === 'todas' || item.bodegaNombre.includes(selectedWarehouse);
    return matchesSearch && matchesWh;
  });

  const filteredCatalog = catalogList.filter(prod => 
    prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Base de Datos de Inventario • INVENTARIO_BODEGA & PRODUCTOS</span>
          </div>
          <h1 className="text-2xl font-black">Control de Stock & Lotes en Bodegas Medellín</h1>
          <p className="text-xs text-slate-300">
            Trazabilidad en tiempo real de lotes de tintometría en Itagüí, Guayabal y Rionegro con despacho en 24h.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 shrink-0">
          <Truck className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold block">Capacidad de Despacho</span>
            <span className="text-xs font-black text-white">100% Operativo Aburrá</span>
          </div>
        </div>
      </div>

      {/* Role Alert / Notice */}
      {stockAdjustmentNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{stockAdjustmentNotice}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Toggle sub-tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('bodegas')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeSubTab === 'bodegas' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            📦 Stock Físico por Bodega (INVENTARIO_BODEGA)
          </button>
          <button
            onClick={() => setActiveSubTab('catalogo')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeSubTab === 'catalogo' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            📋 Catálogo Técnico (PRODUCTOS)
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {activeSubTab === 'bodegas' && (
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-3 py-2 bg-slate-50 text-xs text-slate-800 font-medium rounded-xl border border-slate-300 focus:outline-none"
            >
              <option value="todas">Todas las Bodegas</option>
              <option value="Itagüí">Bodega Central Itagüí</option>
              <option value="Guayabal">Centro Logístico Guayabal</option>
              <option value="Rionegro">Hub Rionegro</option>
            </select>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar SKU o lote..."
              className="pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
            />
          </div>
        </div>

      </div>

      {/* 1. PHYSICAL WAREHOUSES VIEW (`INVENTARIO_BODEGA`) */}
      {activeSubTab === 'bodegas' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Existencias Físicas en Almacén</h3>
              <p className="text-xs text-slate-500">Muestra cantidades disponibles en Cuñetes y Galones por lote activo.</p>
            </div>

            {user.role === 'administrador' ? (
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✏️ Modo Administrador: Puedes ajustar stock
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                👁️ Modo Lectura / Reserva
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">SKU / Producto</th>
                  <th className="p-4">Ubicación Bodega</th>
                  <th className="p-4">Lote Tintometría</th>
                  <th className="p-4">Stock Disponible</th>
                  <th className="p-4">Despacho</th>
                  <th className="p-4">Estado</th>
                  {user.role === 'administrador' && <th className="p-4 text-center">Ajuste Rápido</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStock.map((item) => {
                  const productInfo = catalogList.find(p => p.sku === item.sku);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block w-max">
                          {item.sku}
                        </span>
                        <span className="font-extrabold text-slate-900 block mt-1">
                          {productInfo?.nombre || item.sku}
                        </span>
                        <span className="text-[10px] text-slate-500 capitalize">
                          Presentación: {productInfo?.presentacion.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{item.bodegaNombre}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.municipio}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                          {item.numeroLote}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Fecha: {item.fechaLote}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-extrabold text-sm text-slate-900">
                        {item.stockDisponible} Und
                      </td>

                      <td className="p-4 text-slate-600 font-medium">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.tiempoDespachoHoras}h a obra</span>
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.estado === 'disponible' ? 'bg-emerald-100 text-emerald-800' : item.estado === 'bajo_stock' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {item.estado.replace('_', ' ')}
                        </span>
                      </td>

                      {user.role === 'administrador' && (
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <button
                              onClick={() => handleAdjustStock(item.id, -1)}
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-black shadow-xs cursor-pointer"
                              title="Restar 1"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item.id, 5)}
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-black shadow-xs cursor-pointer"
                              title="Sumar 5"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PRODUCT CATALOG VIEW (`PRODUCTOS`) */}
      {activeSubTab === 'catalogo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map((prod) => (
            <div 
              key={prod.sku} 
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {prod.sku}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                    {prod.categoria.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900">{prod.nombre}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{prod.descripcionCorta}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Rendimiento:</span>
                  <span className="font-bold text-slate-900">{prod.rendimientoM2Galon > 0 ? `${prod.rendimientoM2Galon} m²/gal` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Presentación:</span>
                  <span className="font-bold text-slate-900 capitalize">{prod.presentacion.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-bold">Precio Lista:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    ${prod.precioBaseCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
