import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  ProjectFormData,
  UserProfile,
  AiDiagnosisResult,
  CalculationBreakdown,
  CartItem,
  StoreProduct,
  StoreProductSize,
  StoreProductColor,
  StoreCategory,
  CustomerOrder
} from './types';
import { INITIAL_USER, EMPTY_PROJECT_FORM, SAMPLE_CALCULATION, DEMO_PROFILES } from './data/mockData';
import { STORE_PRODUCTS } from './data/storeProducts';
import { Navbar } from './components/Navbar';
import { ModernLoginScreen } from './components/ModernLoginScreen';
import { BrandLogo } from './components/BrandLogo';
import { StorefrontHome } from './components/StorefrontHome';
import { CategoryPageView } from './components/CategoryPageView';
import { ProjectsTeaserView } from './components/ProjectsTeaserView';
import { ProductDetailView } from './components/ProductDetailView';
import { TiendasView } from './components/TiendasView';
import { MiniCartDrawer } from './components/MiniCartDrawer';
import { FullCartPage } from './components/FullCartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { CustomerAccountHub } from './components/CustomerAccountHub';
import { PaintCalculatorModal } from './components/PaintCalculatorModal';
import { GeneralStoreCalculatorModal } from './components/GeneralStoreCalculatorModal';
import { BranchLocatorModal } from './components/BranchLocatorModal';
import { RoleDashboard } from './components/RoleDashboard';
import { SmartCaptureForm } from './components/SmartCaptureForm';
import { ClientProjectsManager } from './components/ClientProjectsManager';
import { AutoValidationStep } from './components/AutoValidationStep';
import { AiClassificationStep } from './components/AiClassificationStep';
import { TechnicalEngineStep } from './components/TechnicalEngineStep';
import { TechnicalPdfModal } from './components/TechnicalPdfModal';
import { VirtualAssistantModal } from './components/VirtualAssistantModal';
import { FloatingAssistantButton } from './components/FloatingAssistantButton';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';

export default function App() {
  // ---------- Sesión real ----------
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tienda');
  const [user, setUser] = useState<UserProfile>(DEMO_PROFILES.cliente);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.success) {
          setUser(data.user);
          setIsLoggedIn(true);
        }
      })
      .finally(() => setIsCheckingSession(false));
  }, []);

  // ---------- Carrito (100% cliente, como lo diseñó AI Studio) ----------
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | undefined>(undefined);
  const [selectedColorForDetail, setSelectedColorForDetail] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>('todos');
  const [searchFilter, setSearchFilter] = useState('');
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isCheckoutLoginPrompt, setIsCheckoutLoginPrompt] = useState<boolean>(false);
  const [isBranchLocatorOpen, setIsBranchLocatorOpen] = useState<boolean>(false);
  const [isPaintCalcOpen, setIsPaintCalcOpen] = useState<boolean>(false);
  const [calcProduct, setCalcProduct] = useState<StoreProduct | undefined>(undefined);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState<boolean>(false);

  // ---------- Órdenes reales (ya no es data inventada) ----------
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadRealOrders = () => {
    if (!isLoggedIn) return;
    setLoadingOrders(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mapped: CustomerOrder[] = data.orders.map((o: any) => {
            const estadoLabels: Record<string, string> = {
              confirmado: 'Comprado', en_alistamiento: 'Preparación', en_camino: 'Enviado',
              listo_recoger: 'Listo para Retiro', entregado: 'Entregado', cancelado: 'Cancelado'
            };
            // Texto para el cliente: nunca mostramos quién del equipo movió el pedido ni notas internas
            const descripcionCliente = (estado: string, comentario: string | null, isPickup: boolean): string => {
              switch (estado) {
                case 'confirmado': return 'Recibimos tu pedido y tu pago.';
                case 'en_alistamiento': return 'Estamos preparando tu pedido en bodega.';
                case 'en_camino': return 'Tu pedido salió hacia la dirección de entrega.';
                case 'listo_recoger': return 'Tu pedido está listo. Presenta tu código de retiro en la tienda.';
                case 'entregado': return isPickup ? 'Retiraste tu pedido en tienda.' : 'Tu pedido fue entregado.';
                case 'cancelado': return comentario === 'Cancelado por el cliente.' ? 'Cancelaste este pedido.' : 'El pedido fue cancelado.';
                default: return '';
              }
            };
            const estadoCliente = (estado: string): 'comprado' | 'despacho' | 'enviado' | 'entregado' | 'cancelado' => {
              switch (estado) {
                case 'en_alistamiento':
                case 'listo_recoger': return 'despacho';
                case 'en_camino': return 'enviado';
                case 'entregado': return 'entregado';
                case 'cancelado': return 'cancelado';
                default: return 'comprado';
              }
            };
            const isPickup = o.metodoEntrega === 'recoger_tienda';
            return {
              id: o.ordenId,
              orderNumber: `CL-${o.ordenId.slice(0, 8).toUpperCase()}`,
              date: new Date(o.createdAt).toLocaleDateString('es-CO'),
              total: o.total,
              subtotal: Math.round(o.total / 1.19),
              shipping: 0,
              tax: o.total - Math.round(o.total / 1.19),
              recipientName: user.name,
              recipientEmail: user.email,
              recipientPhone: user.phone,
              shippingAddress: o.direccionEntrega || (user.address || 'Medellín, Antioquia'),
              city: user.city || 'Medellín',
              deliveryMethod: isPickup ? 'sucursal' : 'domicilio',
              pickupCode: isPickup ? o.qrToken.slice(0, 8).toUpperCase() : undefined,
              transactionId: o.ordenId,
              status: estadoCliente(o.estado),
              readyForPickup: o.estado === 'listo_recoger',
              canCancel: o.estado === 'confirmado',
              carrier: isPickup ? 'Retiro en Sucursal Asignada' : 'Flota ColorLink',
              estimatedDelivery: isPickup ? 'Disponible en tienda' : 'Próximas 24-48 horas',
              items: (o.items || []).map((it: any) => {
                const catalogProduct = STORE_PRODUCTS.find(p => p.id === it.codigoProductoExterno);
                return {
                  id: it.ordenItemId,
                  productId: it.codigoProductoExterno || '',
                  name: it.nombreProducto,
                  sizeName: catalogProduct?.sizes?.[0]?.name || '',
                  colorName: '',
                  colorHex: '',
                  price: it.precioUnitario,
                  quantity: it.cantidad,
                  image: catalogProduct?.image || ''
                };
              }),
              trackingHistory: (o.historial || []).map((h: any) => ({
                status: h.estado,
                label: estadoLabels[h.estado] || h.estado,
                description: descripcionCliente(h.estado, h.comentario, isPickup),
                date: new Date(h.fecha).toLocaleDateString('es-CO'),
                isCompleted: true,
                isCurrent: h.estado === o.estado
              }))
            } as CustomerOrder;
          });
          setOrders(mapped);
        }
      })
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    if (isLoggedIn) loadRealOrders();
  }, [isLoggedIn]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab, selectedProduct?.id]);

  // ---------- Proyectos / Cotizaciones con IA (backend real, ya construido) ----------
  const [formData, setFormData] = useState<ProjectFormData>(EMPTY_PROJECT_FORM);
  const [aiResult, setAiResult] = useState<AiDiagnosisResult | null>(null);
  const [calculation, setCalculation] = useState<CalculationBreakdown>(SAMPLE_CALCULATION);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [saveProjectError, setSaveProjectError] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('reset_token')
  );

  const updateCalculationForArea = (area: number, discountPct: number = 0) => {
    const areaEfectiva = area * 2;
    const rendimiento = 28.5;
    const desperdicio = 0.10;
    const exactGal = (areaEfectiva / rendimiento) * (1 + desperdicio);
    const cunetes5G = Math.floor(exactGal / 5);
    const galones1G = Math.ceil(exactGal % 5);
    const cunetesImprimante = Math.ceil((area / 35) / 5) || 1;
    const galonesMasilla = Math.max(1, Math.ceil(area * 0.025));
    let costoPintura = (cunetes5G * 485000) + (galones1G * 115000);
    if (discountPct > 0) costoPintura = costoPintura * (1 - discountPct / 100);
    const costoImprimante = cunetesImprimante * 320000;
    const costoMasilla = galonesMasilla * 88000;
    const costoAccesorios = 180300;
    const subtotal = costoPintura + costoImprimante + costoMasilla + costoAccesorios;
    const iva19 = subtotal * 0.19;

    setCalculation({
      ...calculation,
      areaM2: area,
      manos: 2,
      areaEfectivaTotalM2: areaEfectiva,
      galonesPinturaExactos: parseFloat(exactGal.toFixed(2)),
      cunetesPintura5Gal: cunetes5G,
      galonesPintura1Gal: galones1G,
      cunetesImprimante5Gal: cunetesImprimante,
      galonesMasillaElastomerica: galonesMasilla,
      costoEstimadoCOP: {
        pinturaAcabado: Math.round(costoPintura),
        imprimanteSellador: costoImprimante,
        masillaFisuras: costoMasilla,
        accesorios: costoAccesorios,
        subtotal: Math.round(subtotal),
        iva19: Math.round(iva19),
        totalCOP: Math.round(subtotal + iva19)
      }
    });
  };

  const handleSaveProjectAndProceed = async () => {
    setIsSavingProject(true);
    setSaveProjectError('');
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreProyecto: formData.proyecto,
          ciudad: formData.ciudad,
          area: formData.areaM2,
          tipoSuperficie: formData.superficie,
          ambiente: formData.ambiente,
          color: formData.color,
          colorHex: formData.colorHex,
          cunetes5g: calculation.cunetesPintura5Gal,
          galones1g: calculation.galonesPintura1Gal,
          subtotal: calculation.costoEstimadoCOP.subtotal,
          iva: calculation.costoEstimadoCOP.iva19,
          total: calculation.costoEstimadoCOP.totalCOP,
          diagnosticoPatologia: aiResult?.diagnostico_patologia,
          severidad: aiResult?.severidad,
          sistemaRecomendado: aiResult?.sistema_recomendado,
          manoRecomendada: aiResult?.manos_recomendadas,
          rendimientoEstimado: aiResult?.rendimiento_estimado_m2_gal,
          confianzaIaPct: aiResult?.nivel_confianza_ia_pct,
          requiereVisitaHumana: aiResult?.requiere_visita_especialista_human_in_the_loop,
          imageBase64: formData.fotos[0]?.base64 || null
        })
      });
      const data = await response.json();
      if (!data.success) {
        setSaveProjectError(data.error || 'No se pudo guardar el proyecto');
        return;
      }
      setFormData(prev => ({ ...prev, id: data.project.proyectoId }));
      setActiveTab('captura');
    } catch {
      setSaveProjectError('Error de conexión al guardar el proyecto');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleAdvisorUpdateProject = (updated: ProjectFormData) => {
    setFormData(updated);
    updateCalculationForArea(updated.areaM2, updated.descuentoAsesorPct || 0);
  };

  // ---------- Carrito: operaciones (idénticas a AI Studio) ----------
  const handleAddToCart = (
    product: StoreProduct,
    size: StoreProductSize,
    color?: StoreProductColor,
    quantity: number = 1
  ) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item =>
        item.productId === product.id &&
        item.sizeId === size.id &&
        item.colorId === color?.id
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + quantity };
        return updated;
      }
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        name: product.name,
        sizeId: size.id,
        sizeName: size.name,
        price: size.price,
        originalPrice: size.originalPrice,
        quantity,
        colorId: color?.id,
        colorName: color?.name,
        colorCode: color?.code,
        colorHex: color?.hex,
        image: product.image,
        selectedForCheckout: true
      };
      return [...prev, newItem];
    });
    setIsMiniCartOpen(true);
  };

  const handleProceedToCheckout = () => {
    if (!isLoggedIn) {
      setIsCheckoutLoginPrompt(true);
      setIsLoginModalOpen(true);
    } else {
      setActiveTab('checkout');
    }
  };

  const handleBuyNow = (
    product: StoreProduct,
    size: StoreProductSize,
    color?: StoreProductColor,
    quantity: number = 1
  ) => {
    handleAddToCart(product, size, color, quantity);
    setIsMiniCartOpen(false);
    handleProceedToCheckout();
  };

  const handleUpdateCartQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleSelectCartItem = (id: string) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, selectedForCheckout: !item.selectedForCheckout } : item));
  };

  const handleSelectAllCartItems = (selected: boolean) => {
    setCartItems(prev => prev.map(item => ({ ...item, selectedForCheckout: selected })));
  };

  const handleBuyAgain = (item: CustomerOrder['items'][0]) => {
    const product = STORE_PRODUCTS.find(p => p.id === item.productId);
    if (product) {
      const size = product.sizes.find(s => s.name === item.sizeName) || product.sizes[0];
      const color = product.colors.find(c => c.name === item.colorName);
      handleAddToCart(product, size, color, 1);
      setIsMiniCartOpen(true);
    }
  };

  const handleUpdateUserProfile = async (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated })); // actualiza la UI de inmediato
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user); // confirma con lo que realmente quedó guardado
      }
    } catch (err) {
      console.error('Error guardando el perfil:', err);
    }
  };

  // ---------- Checkout REAL: crea la orden de verdad en Postgres ----------
  const handleOrderCompleted = async (orderNumber: string, orderDetails?: any) => {
    const purchasedItems = cartItems.filter(item => item.selectedForCheckout);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: purchasedItems.map(it => ({ productId: it.productId, name: it.name, price: it.price, cantidad: it.quantity })),
          metodoEntrega: (orderDetails?.deliveryMethod === 'sucursal' || orderDetails?.deliveryMethod === 'pickup') ? 'recoger_tienda' : 'domicilio',
          direccionEntrega: orderDetails?.shippingAddress || undefined
        })
      });
      const data = await response.json();

      if (data.success) {
        setCartItems(prev => prev.filter(item => !item.selectedForCheckout));
        loadRealOrders();
      }
    } catch (err) {
      console.error('Error creando la orden real:', err);
    }

    setActiveTab('pedidos');
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'No se pudo cancelar el pedido');
        return;
      }
      loadRealOrders();
    } catch (err) {
      console.error('Error cancelando la orden:', err);
    }
  };

  const handleLoginSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);

    if (isCheckoutLoginPrompt) {
      setIsCheckoutLoginPrompt(false);
      setActiveTab('checkout');
    } else {
      setActiveTab('tienda');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    setIsLoggedIn(false);
    setUser(DEMO_PROFILES.cliente);
    setOrders([]);
    setActiveTab('tienda');
  };

  const handleLoadSampleCase = () => {
    setFormData(EMPTY_PROJECT_FORM);
    updateCalculationForArea(85.0);
    setActiveTab('captura');
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (resetToken) {
    const leaveResetScreen = () => {
      window.history.replaceState({}, '', window.location.pathname);
      setResetToken(null);
      setActiveTab('tienda');
    };

    return (
      <ResetPasswordScreen
        token={resetToken}
        onBackToStore={leaveResetScreen}
        onGoToLogin={() => {
          leaveResetScreen();
          setIsCheckoutLoginPrompt(false);
          setIsLoginModalOpen(true);
        }}
      />
    );
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <span className="text-slate-400 text-sm">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isLoggedIn={isLoggedIn}
        cartItemsCount={totalCartCount}
        onOpenCart={() => setIsMiniCartOpen(true)}
        onOpenLogin={() => {
          setIsCheckoutLoginPrompt(false);
          setIsLoginModalOpen(true);
        }}
        onOpenBranchLocator={() => setIsBranchLocatorOpen(true)}
        onOpenCalculator={() => {
          setCalcProduct(undefined);
          setIsPaintCalcOpen(true);
        }}
        searchFilter={searchFilter}
        selectedCategory={selectedCategory}
        onSearchChange={(query) => setSearchFilter(query)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab(cat === 'todos' ? 'tienda' : 'categoria');
        }}
        onLoadSampleCase={handleLoadSampleCase}
        hasValidatedData={Boolean(formData.id)}
        onLogout={handleLogout}
        onOpenVirtualAssistant={() => setIsAssistantModalOpen(true)}
      />

      <main className="flex-1">

        {activeTab === 'tienda' && (
          <StorefrontHome
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setSelectedColorForDetail(undefined);
              setActiveTab('producto_detalle');
            }}
            onQuickAddToCart={(prod) => {
              const defaultSize = prod.sizes.find(s => s.id === prod.defaultSizeId) || prod.sizes[0];
              const defaultColor = prod.colors?.find(c => c.id === prod.defaultColorId) || prod.colors?.[0];
              handleAddToCart(prod, defaultSize, defaultColor, 1);
            }}
            onNavigateToProjects={() => setActiveTab(isLoggedIn ? 'dashboard' : 'proyectos_teaser')}
            onOpenCalculator={(prod) => {
              setCalcProduct(prod);
              setIsPaintCalcOpen(true);
            }}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveTab(cat === 'todos' ? 'tienda' : 'categoria');
            }}
            searchFilter={searchFilter}
          />
        )}

        {activeTab === 'categoria' && (
          <CategoryPageView
            category={selectedCategory}
            onSelectProduct={(prod, initialColorId) => {
              setSelectedProduct(prod);
              setSelectedColorForDetail(initialColorId);
              setActiveTab('producto_detalle');
            }}
            onQuickAddToCart={(prod, color) => {
              const defaultSize = prod.sizes.find(s => s.id === prod.defaultSizeId) || prod.sizes[0];
              handleAddToCart(prod, defaultSize, color, 1);
            }}
            onBackToStore={() => {
              setSelectedCategory('todos');
              setActiveTab('tienda');
            }}
            onOpenCalculator={(prod) => {
              setCalcProduct(prod);
              setIsPaintCalcOpen(true);
            }}
          />
        )}

        {activeTab === 'proyectos_teaser' && (
          <ProjectsTeaserView
            onOpenLogin={() => {
              setIsCheckoutLoginPrompt(false);
              setIsLoginModalOpen(true);
            }}
            onExploreStore={() => {
              setSelectedCategory('todos');
              setActiveTab('tienda');
            }}
            onOpenDemoProject={handleLoadSampleCase}
            onOpenCalculator={() => {
              setCalcProduct(undefined);
              setIsPaintCalcOpen(true);
            }}
          />
        )}

        {activeTab === 'producto_detalle' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            initialColorId={selectedColorForDetail}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onBackToCatalog={() => setActiveTab('tienda')}
            onNavigateToStores={() => setActiveTab('tiendas')}
          />
        )}

        {activeTab === 'tiendas' && (
          <TiendasView onNavigateToCatalog={() => setActiveTab('tienda')} />
        )}

        {activeTab === 'carrito' && (
          <FullCartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onToggleSelectItem={handleToggleSelectCartItem}
            onSelectAllItems={handleSelectAllCartItems}
            onNavigateToStore={() => setActiveTab('tienda')}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutPage
            cartItems={cartItems}
            user={user}
            onBackToCart={() => setActiveTab('carrito')}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {activeTab === 'pedidos' && (
          <CustomerOrdersView
            orders={orders}
            onCancelOrder={handleCancelOrder}
            onBuyAgain={handleBuyAgain}
            onNavigateToStore={() => {
              setSelectedCategory('todos');
              setActiveTab('tienda');
            }}
            onOpenSupport={() => setIsAssistantModalOpen(true)}
          />
        )}

        {activeTab === 'mi_cuenta' && (
          <CustomerAccountHub
            user={user}
            onUpdateUser={handleUpdateUserProfile}
            onNavigateToOrders={() => setActiveTab('pedidos')}
            onNavigateToProjects={() => setActiveTab(isLoggedIn ? 'dashboard' : 'proyectos_teaser')}
            onNavigateToStore={() => {
              setSelectedCategory('todos');
              setActiveTab('tienda');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          isLoggedIn ? (
            <RoleDashboard
              user={user}
              formData={formData}
              calculation={calculation}
              setActiveTab={setActiveTab}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              onOpenAssistant={() => setIsAssistantModalOpen(true)}
              onStartNewAiQuote={() => setActiveTab('nueva_cotizacion_ia')}
            />
          ) : (
            <ProjectsTeaserView
              onOpenLogin={() => { setIsCheckoutLoginPrompt(false); setIsLoginModalOpen(true); }}
              onNavigateToStore={() => { setSelectedCategory('todos'); setActiveTab('tienda'); }}
              onLoadDemo={handleLoadSampleCase}
            />
          )
        )}

        {activeTab === 'captura' && (
          isLoggedIn ? (
            <ClientProjectsManager
              formData={formData}
              setFormData={(newVal) => {
                setFormData(newVal);
                if (typeof newVal === 'function') {
                  const updated = newVal(formData);
                  updateCalculationForArea(updated.areaM2, updated.descuentoAsesorPct || 0);
                } else {
                  updateCalculationForArea(newVal.areaM2, newVal.descuentoAsesorPct || 0);
                }
              }}
              calculation={calculation}
              user={user}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              onOpenAssistant={() => setIsAssistantModalOpen(true)}
            />
          ) : (
            <ProjectsTeaserView
              onOpenLogin={() => { setIsCheckoutLoginPrompt(false); setIsLoginModalOpen(true); }}
              onExploreStore={() => { setSelectedCategory('todos'); setActiveTab('tienda'); }}
              onOpenDemoProject={handleLoadSampleCase}
              onOpenCalculator={() => { setCalcProduct(undefined); setIsPaintCalcOpen(true); }}
            />
          )
        )}

        {activeTab === 'nueva_cotizacion_ia' && (
          <SmartCaptureForm
            formData={formData}
            setFormData={setFormData}
            user={user}
            onSubmitToValidation={() => setActiveTab('validacion')}
            onLoadHorizontePreset={() => {
              setFormData(EMPTY_PROJECT_FORM);
              updateCalculationForArea(85.0);
            }}
          />
        )}

        {activeTab === 'validacion' && (
          <AutoValidationStep
            formData={formData}
            onProceedToAi={() => setActiveTab('ia_clasificacion')}
            onBackToCapture={() => setActiveTab('nueva_cotizacion_ia')}
          />
        )}

        {activeTab === 'ia_clasificacion' && (
          <AiClassificationStep
            formData={formData}
            aiResult={aiResult}
            setAiResult={setAiResult}
            onProceedToTechnicalEngine={() => setActiveTab('motor_tecnico')}
            onBackToValidation={() => setActiveTab('validacion')}
            onGoFixPhoto={() => setActiveTab('nueva_cotizacion_ia')}
          />
        )}

        {activeTab === 'motor_tecnico' && (
          <TechnicalEngineStep
            formData={formData}
            aiResult={aiResult}
            calculation={calculation}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onProceedToPipeline={handleSaveProjectAndProceed}
            onBackToAi={() => setActiveTab('ia_clasificacion')}
            isSaving={isSavingProject}
            saveError={saveProjectError}
          />
        )}

      </main>

      <MiniCartDrawer
        isOpen={isMiniCartOpen}
        onClose={() => setIsMiniCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onNavigateToCart={() => setActiveTab('carrito')}
        onNavigateToCheckout={handleProceedToCheckout}
      />

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-5xl my-auto">
            <ModernLoginScreen
              onLoginSuccess={handleLoginSuccess}
              onClose={() => {
                setIsLoginModalOpen(false);
                setIsCheckoutLoginPrompt(false);
              }}
              checkoutNotice={isCheckoutLoginPrompt}
            />
          </div>
        </div>
      )}

      {calcProduct ? (
        <PaintCalculatorModal
          isOpen={isPaintCalcOpen}
          onClose={() => {
            setIsPaintCalcOpen(false);
            setCalcProduct(undefined);
          }}
          product={calcProduct}
          onApplyQuantity={(qtyGal, recSizeId, targetProd) => {
            const p = targetProd || calcProduct || STORE_PRODUCTS[0];
            const targetSize = p.sizes.find(s => s.id === recSizeId) || p.sizes.find(s => s.id === 'galon') || p.sizes[0];
            const defColor = p.colors?.[0];
            const count = recSizeId === 'cunete' ? Math.max(1, Math.ceil(qtyGal / 5)) : qtyGal;
            handleAddToCart(p, targetSize, defColor, count);
          }}
        />
      ) : (
        <GeneralStoreCalculatorModal
          isOpen={isPaintCalcOpen}
          onClose={() => setIsPaintCalcOpen(false)}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setActiveTab('producto_detalle');
          }}
          onAddToCart={(product, size, color, quantity) => {
            handleAddToCart(product, size, color, quantity);
            setIsPaintCalcOpen(false);
          }}
        />
      )}

      <BranchLocatorModal
        isOpen={isBranchLocatorOpen}
        onClose={() => setIsBranchLocatorOpen(false)}
      />

      <TechnicalPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        formData={formData}
        calculation={calculation}
        aiResult={aiResult}
        user={user}
      />

      <VirtualAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        user={user}
        formData={formData}
      />

      <FloatingAssistantButton
        isOpen={isAssistantModalOpen}
        onClick={() => setIsAssistantModalOpen(true)}
      />

      <footer className="bg-[#081224] border-t border-slate-800/90 text-slate-400 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <BrandLogo on="dark" className="h-8" />
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Soluciones integrales de recubrimientos arquitectónicos e industriales. Venta directa y acompañamiento técnico para obras en Colombia.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Líneas de Producto</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button type="button" onClick={() => { setSelectedCategory('hogar'); setActiveTab('categoria'); }} className="hover:text-white cursor-pointer">Vinilos & Decoración Hogar</button></li>
              <li><button type="button" onClick={() => { setSelectedCategory('construccion'); setActiveTab('categoria'); }} className="hover:text-white cursor-pointer">Impermeabilizantes Koraza</button></li>
              <li><button type="button" onClick={() => { setSelectedCategory('automotriz'); setActiveTab('categoria'); }} className="hover:text-white cursor-pointer">Poliuretanos 2K Automotriz</button></li>
              <li><button type="button" onClick={() => { setSelectedCategory('industrial'); setActiveTab('categoria'); }} className="hover:text-white cursor-pointer">Pisos & Epóxicos Industriales</button></li>
              <li><button type="button" onClick={() => { setSelectedCategory('herramientas'); setActiveTab('categoria'); }} className="hover:text-white cursor-pointer">Brochas, Rodillos y Cintas</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Servicios para Obras</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button type="button" onClick={() => setActiveTab(isLoggedIn ? 'captura' : 'proyectos_teaser')} className="hover:text-white cursor-pointer">Cubicaje & Cotizador de Cuñetes</button></li>
              <li><button type="button" onClick={() => setActiveTab(isLoggedIn ? 'nueva_cotizacion_ia' : 'proyectos_teaser')} className="hover:text-white cursor-pointer">Diagnóstico de Patologías con IA</button></li>
              <li><button type="button" onClick={() => { setCalcProduct(undefined); setIsPaintCalcOpen(true); }} className="hover:text-white cursor-pointer">Calculadora de Pintura por m²</button></li>
              <li><button type="button" onClick={() => setIsBranchLocatorOpen(true)} className="hover:text-white cursor-pointer">Puntos de Venta & Retiro Express</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Contacto & Sedes</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Línea Comercial: <strong>(604) 448-9200</strong><br />
              WhatsApp Obras: <strong>+57 314 789-2045</strong><br />
              Sede Principal: Cra 52 # 14-85, Guayabal, Medellín.<br />
              Despacho directo a Medellín, Bogotá y Área Metropolitana.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800/80 py-4 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} ColorLink Recubrimientos S.A.S. Todos los derechos reservados. Precios expresados en Pesos Colombianos (COP).
        </div>
      </footer>

    </div>
  );
}