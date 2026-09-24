import { CustomerOrder } from '../types';

export const INITIAL_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-114-6206798-3529831',
    orderNumber: 'CL-114-6206798',
    date: '31 de julio de 2026',
    total: 988403,
    subtotal: 830590,
    shipping: 0,
    tax: 157813,
    recipientName: 'Carlos Mendoza',
    recipientEmail: 'carlos.mendoza@constructorahorizonte.com.co',
    recipientPhone: '+57 312 450-8920',
    shippingAddress: 'Cra 43A # 18 Sur-135, El Poblado, Edificio San Jerónimo',
    city: 'Medellín, Antioquia',
    deliveryMethod: 'domicilio',
    status: 'entregado',
    canCancel: false,
    trackingNumber: 'ENV-MED-9948210',
    carrier: 'Envía Colvanes & Red ColorLink',
    estimatedDelivery: '11 de agosto de 2026',
    items: [
      {
        id: 'item-1',
        productId: 'koraza-sol-lluvia',
        name: 'Koraza Sol & Lluvia Impermeabilizante Fachada',
        sizeName: '1 Cuñete (5 Galones)',
        colorName: 'Verde Betula',
        colorHex: '#7A8B7B',
        price: 545000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'item-2',
        productId: 'viniltex-ultralavable',
        name: 'Viniltex Ultralavable Tipo 1 Acabado Mate',
        sizeName: '1 Galón (3.785 L)',
        colorName: 'Blanco Almendra',
        colorHex: '#FAF9F6',
        price: 128000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'item-3',
        productId: 'rodillo-microfibra-9',
        name: 'Rodillo Antigoteo Microfibra Profesional 9"',
        sizeName: '1 Unidad (9 pulgadas)',
        price: 28500,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'item-4',
        productId: 'cinta-enmascarar-azul',
        name: 'Cinta de Enmascarar Azul Alta Precisión 1.5"',
        sizeName: 'Rollo 40 metros',
        price: 14500,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
      }
    ],
    trackingHistory: [
      {
        status: 'comprado',
        label: 'Comprado',
        description: 'Pedido registrado y pago aprobado vía PSE Bancolombia.',
        date: '31 Jul 2026, 10:24 AM',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'despacho',
        label: 'Despacho',
        description: 'Mercancía alistada en Centro de Distribución Guayabal.',
        date: '02 Ago 2026, 03:15 PM',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'enviado',
        label: 'Enviado',
        description: 'En ruta con transportadora de carga pesada.',
        date: '05 Ago 2026, 08:30 AM',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'entregado',
        label: 'Entregado',
        description: 'Entregado a satisfacción en obra Torre San Jerónimo.',
        date: '11 Ago 2026, 02:45 PM',
        isCompleted: true,
        isCurrent: true
      }
    ]
  },
  {
    id: 'ord-114-8841294-1029381',
    orderNumber: 'CL-114-8841294',
    date: '18 de septiembre de 2026',
    total: 368000,
    subtotal: 309243,
    shipping: 0,
    tax: 58757,
    recipientName: 'Carlos Mendoza',
    recipientEmail: 'carlos.mendoza@constructorahorizonte.com.co',
    recipientPhone: '+57 312 450-8920',
    shippingAddress: 'Cra 43A # 18 Sur-135, El Poblado',
    city: 'Medellín, Antioquia',
    deliveryMethod: 'domicilio',
    status: 'comprado', // Estado donde SÍ se puede cancelar según requerimiento
    canCancel: true,
    trackingNumber: 'CLR-PENDING-04',
    carrier: 'Flota Local ColorLink Express',
    estimatedDelivery: '24 de septiembre de 2026',
    items: [
      {
        id: 'item-5',
        productId: 'pintulux-3en1-negro',
        name: 'Pintulux 3 en 1 Esmalte Sintético Anticorrosivo',
        sizeName: '1 Galón (3.785 L)',
        colorName: 'Negro Brillante',
        colorHex: '#1E2328',
        price: 94000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'item-6',
        productId: 'brocha-cerda-azul-3',
        name: 'Brocha Profesional Cerda Azul Extra Suave 3"',
        sizeName: '1 Unidad (3 pulgadas)',
        price: 18500,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
      }
    ],
    trackingHistory: [
      {
        status: 'comprado',
        label: 'Comprado',
        description: 'Pedido confirmado en plataforma. En cola de tinturación.',
        date: '18 Sep 2026, 09:12 AM',
        isCompleted: true,
        isCurrent: true
      },
      {
        status: 'despacho',
        label: 'Despacho',
        description: 'Tinturación y embalaje en Centro de Distribución.',
        date: 'Pendiente',
        isCompleted: false,
        isCurrent: false
      },
      {
        status: 'enviado',
        label: 'Enviado',
        description: 'Asignado a camión de reparto urbano.',
        date: 'Pendiente',
        isCompleted: false,
        isCurrent: false
      },
      {
        status: 'entregado',
        label: 'Entregado',
        description: 'Entrega final y firma de remisión.',
        date: 'Pendiente',
        isCompleted: false,
        isCurrent: false
      }
    ]
  },
  {
    id: 'ord-114-9912048-7734129',
    orderNumber: 'CL-114-9912048',
    date: '12 de septiembre de 2026',
    total: 1250000,
    subtotal: 1050420,
    shipping: 0,
    tax: 199580,
    recipientName: 'Carlos Mendoza',
    recipientEmail: 'carlos.mendoza@constructorahorizonte.com.co',
    recipientPhone: '+57 312 450-8920',
    shippingAddress: 'Parque Industrial Celta Park, Km 7 Vía Medellín - Bogotá',
    city: 'Guarne / Medellín',
    deliveryMethod: 'domicilio',
    status: 'enviado', // Ya enviado: NO se puede cancelar
    canCancel: false,
    trackingNumber: 'ENV-902341-COL',
    carrier: 'Servientrega Mercancía Industrial',
    estimatedDelivery: '22 de septiembre de 2026',
    items: [
      {
        id: 'item-7',
        productId: 'colorlink-epox-floor',
        name: 'Epóxico Pisos Industriales Alto Tráfico 100% Sólidos',
        sizeName: '1 Cuñete Catalizado (5 Gal)',
        colorName: 'Gris Tráfico NTC',
        colorHex: '#64748B',
        price: 890000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
      }
    ],
    trackingHistory: [
      {
        status: 'comprado',
        label: 'Comprado',
        description: 'Orden confirmada con orden de compra empresarial.',
        date: '12 Sep 2026, 11:05 AM',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'despacho',
        label: 'Despacho',
        description: 'Inspección de calidad y catalizadores verificados.',
        date: '14 Sep 2026, 04:20 PM',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'enviado',
        label: 'Enviado',
        description: 'Vehículo en tránsito intermunicipal hacia Guarne.',
        date: '16 Sep 2026, 07:15 AM',
        isCompleted: true,
        isCurrent: true
      },
      {
        status: 'entregado',
        label: 'Entregado',
        description: 'Entrega programada en bodega principal.',
        date: 'Estimada 22 Sep 2026',
        isCompleted: false,
        isCurrent: false
      }
    ]
  }
];
