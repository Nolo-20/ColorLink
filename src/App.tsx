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
import { INITIAL_USER, INITIAL_SAMPLE_PROJECT, SAMPLE_CALCULATION, DEMO_PROFILES } from './data/mockData';
import { STORE_PRODUCTS } from './data/storeProducts';
import { INITIAL_CUSTOMER_ORDERS } from './data/mockOrders';
import { Navbar } from './components/Navbar';
import { ModernLoginScreen } from './components/ModernLoginScreen';
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
import { AdvisorProjectManager } from './components/AdvisorProjectManager';
import { QualityReviewModule } from './components/QualityReviewModule';
import { InventoryModule } from './components/InventoryModule';
import { SmartCaptureForm } from './components/SmartCaptureForm';
import { ClientProjectsManager } from './components/ClientProjectsManager';
import { AutoValidationStep } from './components/AutoValidationStep';
import { AiClassificationStep } from './components/AiClassificationStep';
import { TechnicalEngineStep } from './components/TechnicalEngineStep';
import { PipelineTraceability } from './components/PipelineTraceability';
import { TechnicalPdfModal } from './components/TechnicalPdfModal';
import { VirtualAssistantModal } from './components/VirtualAssistantModal';
import { FloatingAssistantButton } from './components/FloatingAssistantButton';
import { WelcomeLanding } from './components/WelcomeLanding';

export default function App() {
  // Authentication & Navigation State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tienda');
  const [user, setUser] = useState<UserProfile>(DEMO_PROFILES.cliente);

  // E-commerce Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-1',
      productId: 'viniltex-ultralavable',
      name: 'Viniltex Ultralavable',
      sizeId: 'galon-1',
      sizeName: '1 Galón (3.785 L)',
      price: 128000,
      originalPrice: 145000,
      quantity: 2,
      colorId: 'col-blanco',
      colorName: 'Blanco Almendra',
      colorCode: '1001',
      colorHex: '#FAF9F6',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
      selectedForCheckout: true
    },
    {
      id: 'cart-2',
      productId: 'rodillo-microfibra-9',
      name: 'Rodillo Antigoteo Microfibra 9"',
      sizeId: 'unidad-1',
      sizeName: '1 Unidad (9 pulgadas)',
      price: 28500,
      originalPrice: 35000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80',
      selectedForCheckout: true
    }
  ]);

  // Store Exploration State
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct>(STORE_PRODUCTS[0]);
  const [selectedColorForDetail, setSelectedColorForDetail] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>('todos');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modals State
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isCheckoutLoginPrompt, setIsCheckoutLoginPrompt] = useState<boolean>(false);
  const [isBranchLocatorOpen, setIsBranchLocatorOpen] = useState<boolean>(false);
  const [isPaintCalcOpen, setIsPaintCalcOpen] = useState<boolean>(false);
  const [calcProduct, setCalcProduct] = useState<StoreProduct | undefined>(undefined);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState<boolean>(false);

  // Customer Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_CUSTOMER_ORDERS);

  // Auto-scroll to top on view changes (Product detail, Checkout, Cart, Orders)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab, selectedProduct?.id]);

  // Technical Project Data (Existing Architecture Preserved)
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_SAMPLE_PROJECT);
  const [aiResult, setAiResult] = useState<AiDiagnosisResult | null>(null);
  const [calculation, setCalculation] = useState<CalculationBreakdown>(SAMPLE_CALCULATION);

  // Recalculate technical engine materials dynamically
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
    if (discountPct > 0) {
      costoPintura = costoPintura * (1 - discountPct / 100);
    }
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

  // Cart Operations
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
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          name: product.name,
          sizeId: size.id,
          sizeName: size.name,
          price: size.price,
          originalPrice: size.originalPrice,
          quantity: quantity,
          colorId: color?.id,
          colorName: color?.name,
          colorCode: color?.code,
          colorHex: color?.hex,
          image: product.image,
          selectedForCheckout: true
        };
        return [...prev, newItem];
      }
    });

    // Open slide-over mini-cart drawer for immediate visual confirmation
    setIsMiniCartOpen(true);
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
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, selectedForCheckout: !item.selectedForCheckout } : item
    ));
  };

  const handleSelectAllCartItems = (selected: boolean) => {
    setCartItems(prev => prev.map(item => ({ ...item, selectedForCheckout: selected })));
  };

  // Order Management Handlers (Tracking & Cancellation)
  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId && o.status === 'comprado') {
        return {
          ...o,
          status: 'cancelado' as const,
          canCancel: false,
          trackingHistory: [
            ...o.trackingHistory,
            {
              status: 'cancelado' as const,
              label: 'Pedido Cancelado',
              description: 'Cancelación procesada antes de despacho en bodega.',
              date: 'Hoy',
              isCompleted: true,
              isCurrent: true
            }
          ]
        };
      }
      return o;
    }));
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

  const handleUpdateUserProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  const handleOrderCompleted = (orderNumber: string, orderDetails?: any) => {
    const purchasedItems = cartItems.filter(item => item.selectedForCheckout);
    setCartItems(prev => prev.filter(item => !item.selectedForCheckout));

    const total = purchasedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const subtotal = Math.round(total / 1.19);
    const tax = total - subtotal;
    const isPickup = orderDetails?.deliveryMethod === 'sucursal' || orderDetails?.deliveryMethod === 'pickup';
    const pickupCode = orderDetails?.pickupCode || `PK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNumber || `CL-${Date.now().toString().slice(-7)}`,
      date: 'Hoy',
      total,
      subtotal,
      shipping: 0,
      tax,
      recipientName: user.name,
      recipientEmail: user.email,
      recipientPhone: user.phone,
      shippingAddress: orderDetails?.shippingAddress || (user.address || 'Medellín, Antioquia'),
      city: orderDetails?.city || (user.city || 'Medellín'),
      deliveryMethod: isPickup ? 'sucursal' : 'domicilio',
      pickupStore: isPickup ? (orderDetails?.pickupStore || 'Tienda ColorLink Guayabal - Cra. 52 # 14-80, Medellín') : undefined,
      branchName: isPickup ? (orderDetails?.branchName || 'Tienda ColorLink Guayabal') : undefined,
      pickupCode: isPickup ? pickupCode : undefined,
      transactionId: `${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: 'comprado',
      canCancel: true,
      carrier: isPickup ? 'Retiro en Sucursal Asignada' : 'Flota ColorLink',
      trackingNumber: isPickup ? pickupCode : undefined,
      estimatedDelivery: isPickup ? 'Disponible hoy mismo en tienda' : 'Próximas 24-48 horas',
      items: purchasedItems.map(it => ({
        id: it.id,
        productId: it.productId,
        name: it.name,
        sizeName: it.sizeName,
        colorName: it.colorName,
        colorHex: it.colorHex,
        price: it.price,
        quantity: it.quantity,
        image: it.image
      })),
      trackingHistory: [
        {
          status: 'comprado',
          label: isPickup ? 'Comprado — Listo para Retiro' : 'Comprado',
          description: isPickup 
            ? `Pedido confirmado. Reclama tu pedido presentando el código QR o código ${pickupCode} en la sucursal.` 
            : 'Orden confirmada y validada en sistema ColorLink.',
          date: 'Hoy',
          isCompleted: true,
          isCurrent: true
        },
        {
          status: 'despacho',
          label: isPickup ? 'Preparación en Sucursal' : 'Despacho',
          description: isPickup 
            ? 'Alistamiento de latas y tintometría en punto de venta.' 
            : 'Preparación de cubetas y tintometría computarizada.',
          isCompleted: isPickup,
          isCurrent: isPickup
        },
        {
          status: 'enviado',
          label: isPickup ? 'Listo para Entregar' : 'Enviado',
          description: isPickup 
            ? 'Disponible en mostrador con tu documento y código QR.' 
            : 'En camión especializado de reparto ColorLink.',
          isCompleted: false,
          isCurrent: false
        },
        {
          status: 'entregado',
          label: 'Entregado',
          description: isPickup ? 'Retirado en sucursal con comprobante validado.' : 'Entrega en destino o recepción de obra.',
          isCompleted: false,
          isCurrent: false
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveTab('pedidos');
  };

  // Checkout Flow Logic: Verify login at point of payment!
  const handleProceedToCheckout = () => {
    if (!isLoggedIn) {
      // User is not logged in: request login before proceeding to checkout
      setIsCheckoutLoginPrompt(true);
      setIsLoginModalOpen(true);
    } else {
      setActiveTab('checkout');
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
      // Direct to main page ('tienda') on normal login
      setActiveTab('tienda');
    }

    if (authenticatedUser.company) {
      setFormData(prev => ({
        ...prev,
        cliente: authenticatedUser.company || prev.cliente,
        emailContacto: authenticatedUser.email || prev.emailContacto,
        telefonoContacto: authenticatedUser.phone || prev.telefonoContacto,
        ciudad: authenticatedUser.city || prev.ciudad
      }));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(DEMO_PROFILES.cliente);
    setActiveTab('tienda');
  };

  const handleLoadSampleCase = () => {
    setFormData(INITIAL_SAMPLE_PROJECT);
    updateCalculationForArea(85.0);
    setIsLoggedIn(true);
    setActiveTab('captura');
  };

  const handleAdvisorUpdateProject = (updated: ProjectFormData) => {
    setFormData(updated);
    updateCalculationForArea(updated.areaM2, updated.descuentoAsesorPct || 0);
  };

  const handleQualityVerdict = (verdict: { aprobado: boolean; perito: string; fecha: string; notas: string }) => {
    setFormData(prev => ({
      ...prev,
      dictamenCalidad: {
        aprobado: verdict.aprobado,
        perito: verdict.perito,
        fechaRevision: verdict.fecha,
        observacionSustrato: verdict.notas
      },
      estadoPipeline: verdict.aprobado ? 'aprobado_calidad' : 'revision_asesor'
    }));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Universal Top Navigation Bar */}
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
          if (cat === 'todos') {
            setActiveTab('tienda');
          } else {
            setActiveTab('categoria');
          }
        }}
        onLoadSampleCase={handleLoadSampleCase}
        hasValidatedData={Boolean(formData.id)}
        onLogout={handleLogout}
        onOpenVirtualAssistant={() => setIsAssistantModalOpen(true)}
      />

      {/* 2. Main Routing Section */}
      <main className="flex-1">
        
        {/* PUBLIC STOREFRONT (Pintuco Style - Image 1) */}
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
            onNavigateToProjects={() => {
              if (!isLoggedIn) {
                setActiveTab('proyectos_teaser');
              } else {
                setActiveTab('dashboard');
              }
            }}
            onOpenCalculator={(prod) => {
              setCalcProduct(prod);
              setIsPaintCalcOpen(true);
            }}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              if (cat === 'todos') {
                setActiveTab('tienda');
              } else {
                setActiveTab('categoria');
              }
            }}
            searchFilter={searchFilter}
          />
        )}

        {/* CATEGORY SPECIFIC VIEW (With Purpose, Lines, Color Cards - Image 2) */}
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

        {/* PROJECTS TEASER VIEW (Motivation & Preview for Unauthenticated Users) */}
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

        {/* PRODUCT DETAIL VIEW (Interactive Swatches, Can preview, Calculator - Image 5) */}
        {activeTab === 'producto_detalle' && (
          <ProductDetailView
            product={selectedProduct}
            initialColorId={selectedColorForDetail}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onBackToCatalog={() => setActiveTab('tienda')}
            onNavigateToStores={() => setActiveTab('tiendas')}
          />
        )}

        {/* STORE & BRANCH LOCATOR VIEW (Matching user's Image 1 design: departments filter, list & map interactive) */}
        {activeTab === 'tiendas' && (
          <TiendasView
            onSelectBranch={(branch) => {
              setActiveTab('tienda');
            }}
          />
        )}

        {/* FULL CART VIEW (With item unchecking & subtotal recalculation - Image 3) */}
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

        {/* CHECKOUT PAYMENT VIEW (Delivery vs Branch Pickup, COP pricing, DIAN NIT - Image 4) */}
        {activeTab === 'checkout' && (
          <CheckoutPage
            cartItems={cartItems}
            user={user}
            onBackToCart={() => setActiveTab('carrito')}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {/* CUSTOMER ORDERS & TRACKING VIEW (Tracking timeline, order status, cancelable if 'comprado') */}
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

        {/* CUSTOMER ACCOUNT & PROFILE HUB (Modal details: Profile, Security, Branches, Payments) */}
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

        {/* TECHNICAL & PROJECT PLATFORM (Preserved rich engineering features) */}
        {activeTab === 'dashboard' && (
          isLoggedIn ? (
            <RoleDashboard
              user={user}
              formData={formData}
              calculation={calculation}
              setActiveTab={setActiveTab}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              onOpenAssistant={() => setIsAssistantModalOpen(true)}
            />
          ) : (
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
          )
        )}

        {activeTab === 'proyectos_asesor' && (
          <AdvisorProjectManager
            user={user}
            activeProject={formData}
            onUpdateProject={handleAdvisorUpdateProject}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}

        {activeTab === 'calidad_revision' && (
          <QualityReviewModule
            user={user}
            formData={formData}
            onUpdateQualityVerdict={handleQualityVerdict}
          />
        )}

        {activeTab === 'inventario' && (
          <InventoryModule
            user={user}
          />
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
          )
        )}

        {activeTab === 'validacion' && (
          <AutoValidationStep
            formData={formData}
            onProceedToAi={() => setActiveTab('ia_clasificacion')}
            onBackToCapture={() => setActiveTab('captura')}
          />
        )}

        {activeTab === 'ia_clasificacion' && (
          <AiClassificationStep
            formData={formData}
            aiResult={aiResult}
            setAiResult={setAiResult}
            onProceedToEngine={() => setActiveTab('motor_tecnico')}
            onBackToValidation={() => setActiveTab('validacion')}
          />
        )}

        {activeTab === 'motor_tecnico' && (
          <TechnicalEngineStep
            formData={formData}
            calculation={calculation}
            onProceedToPipeline={() => setActiveTab('trazabilidad_arquitectura')}
            onOpenPdf={() => setIsPdfModalOpen(true)}
          />
        )}

        {activeTab === 'trazabilidad_arquitectura' && (
          <PipelineTraceability
            formData={formData}
            calculation={calculation}
            onOpenPdf={() => setIsPdfModalOpen(true)}
            onOpenAssistant={() => setIsAssistantModalOpen(true)}
          />
        )}

      </main>

      {/* 3. Slide-over Mini-Cart Drawer (Visual confirmation on quick add - Image 2) */}
      <MiniCartDrawer
        isOpen={isMiniCartOpen}
        onClose={() => setIsMiniCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onNavigateToCart={() => setActiveTab('carrito')}
        onNavigateToCheckout={handleProceedToCheckout}
      />

      {/* 4. Login Modal for Authentication */}
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

      {/* 5. Paint Calculator Modal (Product-Specific vs General Store-Wide) */}
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
            setActiveTab('producto');
          }}
        />
      )}

      {/* 6. Branch Locator Modal */}
      <BranchLocatorModal
        isOpen={isBranchLocatorOpen}
        onClose={() => setIsBranchLocatorOpen(false)}
      />

      {/* 7. PDF Technical Sheet Modal */}
      <TechnicalPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        formData={formData}
        calculation={calculation}
        aiResult={aiResult}
        user={user}
      />

      {/* 8. Virtual Assistant Modal */}
      <VirtualAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        user={user}
        formData={formData}
        onOpenCalculator={() => {
          setIsAssistantModalOpen(false);
          setCalcProduct(undefined);
          setIsPaintCalcOpen(true);
        }}
        onOpenBranchLocator={() => {
          setIsAssistantModalOpen(false);
          setIsBranchLocatorOpen(true);
        }}
        onNavigateCategory={(cat) => {
          setIsAssistantModalOpen(false);
          setSelectedCategory(cat);
          setActiveTab('categoria');
        }}
      />

      {/* Floating Robot Virtual Assistant Button (Bottom-Right) */}
      <FloatingAssistantButton
        isOpen={isAssistantModalOpen}
        onClick={() => setIsAssistantModalOpen(true)}
      />

      {/* 9. Commercial Footer */}
      <footer className="bg-[#081224] border-t border-slate-800/90 text-slate-400 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <rect x="2" y="2" width="36" height="36" rx="9" fill="#060E1D" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.2" />
                  <path d="M12 25L20 10L28 25H12Z" fill="#2563EB" opacity="0.4" />
                  <path d="M20 12C20 12 14.5 20.5 14.5 24.5C14.5 27.5 17 29.5 20 29.5C23 29.5 25.5 27.5 25.5 24.5C25.5 20.5 20 12 20 12Z" fill="#10B981" />
                  <circle cx="18" cy="23" r="1.3" fill="#FFFFFF" opacity="0.9" />
                </svg>
              </div>
              <span className="font-extrabold text-white text-base tracking-tight font-sans">
                COLOR<span className="text-emerald-400">LINK</span>
                <span className="text-[8px] font-black text-cyan-300 ml-1.5 px-1 py-0.2 rounded bg-cyan-950 border border-cyan-800/60 uppercase tracking-widest">
                  PRO
                </span>
              </span>
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
              <li><button type="button" onClick={() => { if (!isLoggedIn) setActiveTab('proyectos_teaser'); else setActiveTab('captura'); }} className="hover:text-white cursor-pointer">Cubicaje & Cotizador de Cuñetes</button></li>
              <li><button type="button" onClick={() => { if (!isLoggedIn) setActiveTab('proyectos_teaser'); else setActiveTab('ia_clasificacion'); }} className="hover:text-white cursor-pointer">Diagnóstico de Patologías con IA</button></li>
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
