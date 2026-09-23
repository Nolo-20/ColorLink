import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
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
  const [stockList, setStockList] = useState<any[]>([]);
  const [catalogList, setCatalogList] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('todas');
  const [stockAdjustmentNotice, setStockAdjustmentNotice] = useState('');

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCatalogList(data.productos);
          setStockList(data.stock);
        }
      })
      .finally(() => setLoadingInventory(false));
  }, []);

  // Quick increment/decrement for Admin role — ahora persiste de verdad en Postgres
  const handleAdjustStock = async (id: string, delta: number) => {
    if (user.role !== 'administrador') return;
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      const data = await response.json();
      if (data.success) {
        setStockList(prev => prev.map(item => item.inventarioId === id ? data.item : item));
        setStockAdjustmentNotice('Inventario actualizado en la base de datos.');
        setTimeout(() => setStockAdjustmentNotice(''), 2500);
      }
    } catch (err) {
      console.error('Error ajustando stock:', err);
    }
  };

  const getEstado = (cantidad: number): 'disponible' | 'bajo_stock' | 'agotado' => {
    if (cantidad === 0) return 'agotado';
    if (cantidad <= 10) return 'bajo_stock';
    return 'disponible';
  };

  const presentacionLabel = (presentacion?: string) => {
    if (presentacion === 'cunete_5gal') return 'Cuñete 5 Gal';
    if (presentacion === 'galon_1gal') return 'Galón 1 Gal';
    return presentacion || 'N/A';
  };

  const filteredStock = stockList.filter(item => {
    const matchesSearch =
      (item.producto?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nombreBodega || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.numeroLote || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWh = selectedWarehouse === 'todas' || (item.nombreBodega || '').includes(selectedWarehouse);
    return matchesSearch && matchesWh;
  });

  const filteredCatalog = catalogList.filter(prod =>
    (prod.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (prod.categoria || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Base de Datos de Inventario • PostgreSQL</span>
          </div>
          <h1 className="text-2xl font-black">Control de Stock & Lotes en Bodegas Medellín</h1>
          <p className="text-xs text-slate-300">
            Trazabilidad en tiempo real de lotes de tintometría en Itagüí, Guayabal y Rionegro.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 shrink-0">
          <Truck className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold block">Registros de Stock</span>
            <span className="text-xs font-black text-white">{loadingInventory ? '...' : stockList.length} activos</span>
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

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('bodegas')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeSubTab === 'bodegas' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            📦 Stock Físico por Bodega
          </button>
          <button
            onClick={() => setActiveSubTab('catalogo')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeSubTab === 'catalogo' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            📋 Catálogo Técnico
          </button>
        </div>

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
              placeholder="Buscar producto o lote..."
              className="pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
            />
          </div>
        </div>

      </div>

      {loadingInventory && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center text-slate-400 text-sm">
          Cargando inventario...
        </div>
      )}

      {/* 1. PHYSICAL WAREHOUSES VIEW */}
      {!loadingInventory && activeSubTab === 'bodegas' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Existencias Físicas en Almacén</h3>
              <p className="text-xs text-slate-500">Muestra cantidades disponibles por lote activo.</p>
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
                  <th className="p-4">Producto</th>
                  <th className="p-4">Ubicación Bodega</th>
                  <th className="p-4">Lote Tintometría</th>
                  <th className="p-4">Stock Disponible</th>
                  <th className="p-4">Despacho</th>
                  <th className="p-4">Estado</th>
                  {user.role === 'administrador' && <th className="p-4 text-center">Ajuste Rápido</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStock.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No hay registros de inventario que coincidan con tu búsqueda.
                    </td>
                  </tr>
                )}
                {filteredStock.map((item) => {
                  const estado = getEstado(item.cantidadDisponible || 0);
                  return (
                    <tr key={item.inventarioId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 block">
                          {item.producto?.nombre || 'Producto sin nombre'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Presentación: {presentacionLabel(item.producto?.presentacion)}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{item.nombreBodega}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.ciudad?.ciudad || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                          {item.numeroLote}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.fechaTinturado ? new Date(item.fechaTinturado).toLocaleDateString('es-CO') : 'N/A'}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-extrabold text-sm text-slate-900">
                        {item.cantidadDisponible ?? 0} Und
                      </td>

                      <td className="p-4 text-slate-600 font-medium">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.tiempoDespacho ?? '—'}h a obra</span>
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${estado === 'disponible' ? 'bg-emerald-100 text-emerald-800' : estado === 'bajo_stock' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {estado.replace('_', ' ')}
                        </span>
                      </td>

                      {user.role === 'administrador' && (
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <button
                              onClick={() => handleAdjustStock(item.inventarioId, -1)}
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-black shadow-xs cursor-pointer"
                              title="Restar 1"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item.inventarioId, 5)}
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

      {/* 2. PRODUCT CATALOG VIEW */}
      {!loadingInventory && activeSubTab === 'catalogo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.length === 0 && (
            <div className="col-span-full text-center text-slate-400 text-xs py-8">
              No hay productos que coincidan con tu búsqueda.
            </div>
          )}
          {filteredCatalog.map((prod) => (
            <div
              key={prod.productoId}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {prod.productoId.slice(0, 8)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                    {(prod.categoria || '').replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900">{prod.nombre}</h3>
                {prod.acabado && (
                  <p className="text-xs text-slate-600">Acabado: <span className="font-semibold capitalize">{prod.acabado}</span></p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Rendimiento:</span>
                  <span className="font-bold text-slate-900">{prod.rendimientoM2 > 0 ? `${prod.rendimientoM2} m²/gal` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Presentación:</span>
                  <span className="font-bold text-slate-900">{presentacionLabel(prod.presentacion)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-bold">Precio Lista:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    ${(prod.precio || 0).toLocaleString('es-CO')} COP
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
