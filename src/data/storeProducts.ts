import { StoreProduct, StoreBranch } from '../types';

export const STORE_BRANCHES: StoreBranch[] = [
  // Bogotá D.C.
  {
    id: 'bogota-galerias',
    city: 'Bogotá D.C.',
    department: 'Cundinamarca / Bogotá D.C.',
    name: 'Tienda ColorLink Galerías',
    address: 'CRA 24 # 45 C 90, Barrio Galerías',
    phone: '312 351 6213',
    email: 'distribuidorapabetsas@gmail.com',
    schedule: 'Lunes a viernes: 8:00 a.m. – 1:00 p.m. y 2:00 p.m. – 5:00 p.m. · Sábados: 8:00 a.m. – 2:00 p.m. · Domingos y festivos: cerrado',
    readyInHours: 2,
    lat: 4.6432,
    lng: -74.0754
  },
  {
    id: 'bogota-bulevar',
    city: 'Bogotá D.C.',
    department: 'Cundinamarca / Bogotá D.C.',
    name: 'Tienda ColorLink Bulevar',
    address: 'Calle 125 # 60-3, Sector Bulevar Niza',
    phone: '311 343 6036',
    email: 'tiendacolorlinkbulevar@grupodefa.co',
    schedule: 'Lunes a viernes: 8:00 a.m. – 5:00 p.m. (jornada continua) · Sábados: 8:00 a.m. – 12:15 p.m. · Domingos y festivos: cerrado',
    readyInHours: 2,
    lat: 4.7115,
    lng: -74.0682
  },
  {
    id: 'bogota-fontibon',
    city: 'Bogotá D.C.',
    department: 'Cundinamarca / Bogotá D.C.',
    name: 'Hub Industrial ColorLink Fontibón',
    address: 'Av. Calle 26 # 92-32, Bodega 4',
    phone: '(601) 745-8890',
    email: 'fontibon@colorlink.com.co',
    schedule: 'Lunes a viernes: 7:30 a.m. – 5:00 p.m. · Sábados: 8:00 a.m. – 1:00 p.m.',
    readyInHours: 2,
    lat: 4.6789,
    lng: -74.1245
  },

  // Antioquia
  {
    id: 'antioquia-copacabana',
    city: 'Copacabana',
    department: 'Antioquia',
    name: 'Tienda ColorLink Copacabana',
    address: 'Cra. 48 # 52-47, Copacabana',
    phone: '312 755 3866',
    email: 'tiendacolorlinkcopacabana@gmail.com',
    schedule: 'Lunes a viernes: 8:00 a.m. – 5:00 p.m. (jornada continua) · Sábados: 8:00 a.m. – 12:00 m. · Domingos y festivos: cerrado',
    readyInHours: 2,
    lat: 6.3475,
    lng: -75.5098
  },
  {
    id: 'medellin-guayabal',
    city: 'Medellín',
    department: 'Antioquia',
    name: 'Tienda ColorLink Sede Principal Guayabal',
    address: 'Cra. 52 # 14-80, Zona Industrial Guayabal',
    phone: '(604) 448-9200',
    email: 'guayabal@colorlink.com.co',
    schedule: 'Lunes a viernes: 7:30 a.m. – 5:30 p.m. · Sábados: 8:00 a.m. – 1:00 p.m.',
    readyInHours: 2,
    lat: 6.2185,
    lng: -75.5784
  },
  {
    id: 'medellin-poblado',
    city: 'Medellín',
    department: 'Antioquia',
    name: 'Centro Tintométrico El Poblado',
    address: 'Calle 10A # 36-24, Sector Provenza',
    phone: '(604) 448-9201',
    email: 'elpoblado@colorlink.com.co',
    schedule: 'Lunes a sábado: 8:00 a.m. – 6:00 p.m.',
    readyInHours: 2,
    lat: 6.2088,
    lng: -75.5672
  },
  {
    id: 'itagui-autopista',
    city: 'Itagüí',
    department: 'Antioquia',
    name: 'Centro Logístico Mayorista Autopista Sur',
    address: 'Autopista Sur Km 8 # 50-32 (Frente a Mayorista)',
    phone: '(604) 372-1100',
    email: 'mayorista@colorlink.com.co',
    schedule: 'Lunes a viernes: 7:00 a.m. – 5:00 p.m. · Sábados: 7:30 a.m. – 12:30 p.m.',
    readyInHours: 2,
    lat: 6.1754,
    lng: -75.6021
  },
  {
    id: 'sabaneta-vegas',
    city: 'Sabaneta',
    department: 'Antioquia',
    name: 'Punto Express Las Vegas',
    address: 'Cra. 48 # 75 Sur - 12 (Av. Las Vegas)',
    phone: '(604) 288-4500',
    email: 'sabaneta@colorlink.com.co',
    schedule: 'Lunes a sábado: 8:00 a.m. – 5:30 p.m.',
    readyInHours: 2,
    lat: 6.1523,
    lng: -75.6142
  },

  // Caldas
  {
    id: 'caldas-manizales-centro',
    city: 'Manizales',
    department: 'Caldas',
    name: 'Tienda ColorLink Centro Manizales 2',
    address: 'Calle 26 # 18-43, Manizales',
    phone: '305 241 3508',
    email: 'pintacasavcentro@gmail.com',
    schedule: 'Lunes a viernes: 8:00 a.m. – 12:30 p.m. y 2:00 p.m. – 5:00 p.m. · Sábados: 8:00 a.m. – 12:30 p.m. · Domingos y festivos: cerrado',
    readyInHours: 2,
    lat: 5.0689,
    lng: -75.5174
  },

  // Valle del Cauca
  {
    id: 'valle-la16',
    city: 'Cali',
    department: 'Valle del Cauca',
    name: 'Tienda ColorLink La 16',
    address: 'Carrera 16 # 28 - 21, Barrio Belalcázar',
    phone: '315 700 6162',
    email: 'tiendacolorlink16@gmail.com',
    schedule: 'Lunes a viernes: 8:15 a.m. a 12:30 p.m. y de 2:00 p.m. a 6:00 p.m. · Sábados: 8:00 a.m. a 1:00 p.m.',
    readyInHours: 2,
    lat: 3.4412,
    lng: -76.5284
  },
  {
    id: 'cali-yumbo',
    city: 'Yumbo / Cali',
    department: 'Valle del Cauca',
    name: 'Sucursal Industrial Yumbo',
    address: 'Calle 15 # 2-85, Acopi Yumbo',
    phone: '(602) 669-1220',
    email: 'yumbo@colorlink.com.co',
    schedule: 'Lunes a viernes: 7:30 a.m. – 5:00 p.m.',
    readyInHours: 3,
    lat: 3.5321,
    lng: -76.5043
  },

  // Sucre
  {
    id: 'sucre-covenas',
    city: 'Coveñas',
    department: 'Sucre',
    name: 'Tienda ColorLink Coveñas',
    address: 'Calle 3 5A 122 Isla Gallinazo',
    phone: '304 648 1016',
    email: 'ferreterocovenas@tfaz.com.co',
    schedule: 'Lunes a viernes: 7:30 a.m. a 5:30 p.m. · Domingos y festivos de 8:00 a.m. a 1:00 p.m.',
    readyInHours: 2,
    lat: 9.4082,
    lng: -75.6821
  },

  // Atlántico
  {
    id: 'barranquilla-prado',
    city: 'Barranquilla',
    department: 'Atlántico',
    name: 'Tienda ColorLink El Prado',
    address: 'Cra. 54 # 70-120, Barrio El Prado',
    phone: '318 224 5500',
    email: 'barranquilla@colorlink.com.co',
    schedule: 'Lunes a viernes: 7:30 a.m. a 5:30 p.m. · Sábados: 8:00 a.m. a 1:00 p.m.',
    readyInHours: 2,
    lat: 10.9984,
    lng: -74.8012
  },

  // Santander
  {
    id: 'bucaramanga-cabecera',
    city: 'Bucaramanga',
    department: 'Santander',
    name: 'Tienda ColorLink Cabecera del Llano',
    address: 'Cra. 33 # 48-15, Cabecera',
    phone: '313 904 8800',
    email: 'bucaramanga@colorlink.com.co',
    schedule: 'Lunes a viernes: 8:00 a.m. a 5:30 p.m. · Sábados: 8:00 a.m. a 1:30 p.m.',
    readyInHours: 2,
    lat: 7.1194,
    lng: -73.1118
  }
];

export const STORE_PRODUCTS: StoreProduct[] = [
  // 1. VINILTEX ULTRALAVABLE (Hogar / Interior)
  {
    id: 'viniltex-ultralavable',
    sku: 'VTX-ULTRALAVABLE',
    name: 'Viniltex Ultralavable',
    brand: 'ColorLink Recubrimientos',
    subtitle: 'Látex interior mate con Tecnología Ultra Protect Resist que repele líquidos y manchas',
    category: 'hogar',
    categoryLabel: 'Pintura Interior',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Ultralavable',
    description: 'Pintura vinil acrílica premium tipo 1 con tecnología Ultra Protect Resist que genera una película hidrofóbica capaz de repeler manchas difíciles como salsas, café, grasa y crayones. Permite lavado constante con trapo húmedo y detergente suave sin desgastar el acabado mate aterciopelado ni alterar la intensidad del tono.',
    features: [
      'Máxima lavabilidad: repele líquidos y manchas antes de que penetren',
      'Elimina 99.9% de bacterias con escudo antimicrobiano activo',
      'Excelente poder cubriente y nivelación sin salpique',
      'Bajo olor y formulación eco-amigable con cero VOC añadidos',
      'Cumple norma técnica colombiana NTC 1335 tipo 1'
    ],
    specs: {
      rendimiento: '50 a 60 m² por galón a 1 mano / 25 a 30 m² a 2 manos',
      secado: 'Al tacto 30 min | Segundas manos 2 a 3 horas | Curado final 7 días',
      base: 'Acuosa (Emulsión Vinil Acrílica Modificada)',
      acabado: 'Mate Elegante Antirreflejo',
      solvente: 'Agua potable limpia (máx 10%)'
    },
    colors: [
      { id: 'malteada-melon', name: 'Malteada De Melón', hex: '#E6A892', code: 'RJ129P', inStock: true },
      { id: 'vela-vainilla', name: 'Vela De Vainilla', hex: '#B5A99B', code: 'NE164P', inStock: true },
      { id: 'blanco-nieve', name: 'Blanco Nieve', hex: '#FFFFFF', code: 'CL-1001', inStock: true },
      { id: 'gris-niebla', name: 'Gris Niebla', hex: '#D1D5DB', code: 'CL-7035', inStock: true },
      { id: 'azul-zafiro', name: 'Azul Zafiro Profundo', hex: '#1E3A8A', code: 'CL-5002', inStock: true },
      { id: 'verde-selva', name: 'Verde Eucalipto', hex: '#2D6A4F', code: 'CL-6005', inStock: true },
      { id: 'almendra-suave', name: 'Almendra Suave', hex: '#F3E8DC', code: 'CL-1015', inStock: true },
      { id: 'terracota-colonial', name: 'Terracota Cálido', hex: '#C2593F', code: 'CL-3016', inStock: true },
      { id: 'amarillo-mostaza', name: 'Ocre Mostaza', hex: '#E0A96D', code: 'CL-1024', inStock: false },
      { id: 'negro-onix', name: 'Negro Mate Grafito', hex: '#1F2937', code: 'CL-9005', inStock: true }
    ],
    sizes: [
      { id: 'cuarto', name: '1/4 Galón', price: 38500, inStock: true, capacityLiters: 0.95 },
      { id: 'galon', name: '1 Galón', price: 115000, inStock: true, capacityLiters: 3.785 },
      { id: 'canete', name: '2.5 Galones', price: 268000, inStock: false },
      { id: 'cunete', name: '5 Galones (Cuñete)', price: 485000, inStock: true, capacityLiters: 18.92 }
    ],
    defaultColorId: 'blanco-nieve',
    defaultSizeId: 'galon',
    image: '/products/viniltex-galon.webp',
    coverageM2PerGallon: 50,
    defaultCoats: 2
  },

  // 2. KORAZA PROTECCIÓN SOL & LLUVIA (Construcción / Fachadas)
  {
    id: 'koraza-sol-lluvia',
    sku: 'KRZ-SOL-LLUVIA',
    name: 'Koraza Protección Sol & Lluvia',
    brand: 'ColorLink Recubrimientos',
    subtitle: 'Pintura impermeabilizante elastomérica de máxima duración ante intemperie y rayos UV',
    category: 'construccion',
    categoryLabel: 'Fachadas & Exterior',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Máxima Duración',
    description: 'Pintura exterior 100% acrílica base agua de alta tecnología hidrorrepelente y elastomérica. Sella microfisuras vivas de hasta 1 mm gracias a su polímero flexible que acompaña los movimientos térmicos de contracción y dilatación del revoque sin agrietarse ni desprenderse. Diseñada con pigmentos UV-Shield que no decoloran bajo radiación solar intensa ni climas costeros salinos.',
    features: [
      'Garantía de película intemperie hasta por 10 años certificados',
      'Película elástica microfisuras-proof (puentea grietas de 1 mm)',
      'Escudo antihongos, antialgas y resistencia al caleo o entizamiento',
      'Autolavable con el agua de lluvia: el polvo no se adhiere a la película',
      'No requiere imprimante previo sobre revoques curados en buen estado'
    ],
    specs: {
      rendimiento: '30 a 35 m² por galón a 2 manos sobre superficie lisa',
      secado: 'Al tacto 1 hora | Entre manos 3 a 4 horas | Secado total 24 horas',
      base: 'Polímero 100% Acrílico Puro Elastomérico',
      acabado: 'Semimate Satinado Exterior',
      solvente: 'Agua potable (máx 5% en primera mano)'
    },
    colors: [
      { id: 'malteada-melon', name: 'Malteada De Melón', hex: '#E6A892', code: 'RJ129P', inStock: true },
      { id: 'vela-vainilla', name: 'Vela De Vainilla', hex: '#B5A99B', code: 'NE164P', inStock: true },
      { id: 'blanco-puro', name: 'Blanco Puro Fachada', hex: '#FFFFFF', code: 'CL-1000', inStock: true },
      { id: 'arena-mediterraneo', name: 'Arena Mediterráneo', hex: '#E7DFD5', code: 'CL-1013', inStock: true },
      { id: 'gris-basalto', name: 'Gris Basalto Urbano', hex: '#6B7280', code: 'CL-7024', inStock: true },
      { id: 'ladrillo-colonial', name: 'Ladrillo Colonial', hex: '#B91C1C', code: 'CL-3001', inStock: true },
      { id: 'verde-oliva', name: 'Verde Finca', hex: '#365314', code: 'CL-6003', inStock: true },
      { id: 'azul-marino', name: 'Azul Colonial Costa', hex: '#1E3A5F', code: 'CL-5011', inStock: true }
    ],
    sizes: [
      { id: 'cuarto', name: '1/4 Galón', price: 44500, inStock: true, capacityLiters: 0.95 },
      { id: 'galon', name: '1 Galón', price: 142000, inStock: true, capacityLiters: 3.785 },
      { id: 'cunete', name: '5 Galones (Cuñete)', price: 595000, inStock: true, capacityLiters: 18.92 }
    ],
    defaultColorId: 'blanco-puro',
    defaultSizeId: 'galon',
    image: '/products/koraza-galon.webp',
    coverageM2PerGallon: 60,
    defaultCoats: 2
  },

  // 3. PINTULUX ESMALTE SINTÉTICO (Metal y Madera)
  {
    id: 'pintulux-esmalte-brillante',
    sku: 'PTX-ESM-BRILLANTE',
    name: 'Pintulux Esmalte Sintético Brillante',
    brand: 'ColorLink Recubrimientos',
    subtitle: 'Esmalte alquídico de máxima adherencia anticorrosiva para puertas, ventanas y rejas metálicas',
    category: 'hogar',
    categoryLabel: 'Esmalte & Metales',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Brillo Espejo',
    description: 'Esmalte sintético brillante a base de resinas alquídicas modificadas que ofrecen una nivelación impecable sin marcas de brocha y un brillo tipo espejo de altísima retención. Protege estructuras metálicas contra la oxidación y embellece maderas interiores y exteriores.',
    features: [
      'Acabado espejo de alto brillo y extraordinaria nivelación',
      'Protección anticorrosiva sobre hierro y acero debidamente fondeados',
      'Lavable, resistente a grasas, humedad y detergentes domésticos',
      'Excelente retención de color sin amarillamiento prematuro'
    ],
    specs: {
      rendimiento: '45 a 55 m² por galón a 1 mano / 25 a 30 m² a 2 manos',
      secado: 'Al tacto 4 horas | Repinte 12 horas | Curado duro 48 horas',
      base: 'Alquídica con solvente aromático balanceado',
      acabado: 'Brillante Espejo (>85 UB a 60°)',
      solvente: 'Ajustador Varsol o Thinner fino (10% a 15%)'
    },
    colors: [
      { id: 'blanco-brillante', name: 'Blanco Puro', hex: '#FFFFFF', code: 'PX-01', inStock: true },
      { id: 'negro-brillante', name: 'Negro Piano', hex: '#0A0A0A', code: 'PX-02', inStock: true },
      { id: 'rojo-fiesta', name: 'Rojo Bermellón', hex: '#DC2626', code: 'PX-03', inStock: true },
      { id: 'azul-real', name: 'Azul Real Náutico', hex: '#2563EB', code: 'PX-04', inStock: true },
      { id: 'gris-maquinaria', name: 'Gris Industrial', hex: '#4B5563', code: 'PX-05', inStock: true },
      { id: 'verde-esmeralda', name: 'Verde Botella', hex: '#047857', code: 'PX-06', inStock: true },
      { id: 'amarillo-transito', name: 'Amarillo Cromo', hex: '#FACC15', code: 'PX-07', inStock: true }
    ],
    sizes: [
      { id: 'cuarto', name: '1/4 Galón', price: 34900, inStock: true, capacityLiters: 0.95 },
      { id: 'galon', name: '1 Galón', price: 108000, inStock: true, capacityLiters: 3.785 },
      { id: 'cunete', name: '5 Galones (Cuñete)', price: 475000, inStock: true, capacityLiters: 18.92 }
    ],
    defaultColorId: 'blanco-brillante',
    defaultSizeId: 'galon',
    image: '/products/pintulux-galon.webp',
    coverageM2PerGallon: 45,
    defaultCoats: 2
  },

  // 4. POLIURETANO AUTOMOTRIZ 2K (Automotriz)
  {
    id: 'poliuretano-automotriz-2k',
    sku: 'AUT-POL-2K',
    name: 'Poliuretano Automotriz 2K Alto Brillo',
    brand: 'ColorLink AutoTech',
    subtitle: 'Esmalte poliuretano bicomponente para repintado automotriz, motos y flotas de transporte',
    category: 'automotriz',
    categoryLabel: 'Línea Automotriz 2K',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Calidad OEM',
    description: 'Sistema de acabado poliuretano acrílico bicomponente (2K) formulado para el repintado profesional de vehículos particulares, comerciales y maquinaria pesada. Ofrece resistencia superior a la gasolina, químicos de lavado a presión, lluvia ácida y rayones superficiales.',
    features: [
      'Dureza superficial tipo fábrica automotriz (Shore D >80)',
      'Filtro UV estabilizador HALS contra decoloración solar',
      'Curado rápido al aire o acelerado en cabina de horneado (60°C)',
      'Permite pulido y brillado a las 24 horas de aplicado'
    ],
    specs: {
      rendimiento: '35 a 40 m² por galón a 2 manos con pistola HVLP',
      secado: 'Libre de polvo 15 min | Para manipulación 4 horas | Pulible 24 horas',
      base: 'Poliuretano Acrílico Hidroxilado + Isocianato Alifático',
      acabado: 'Alto Brillo Cristalline (>95 UB)',
      solvente: 'Thinner Poliuretano Uretano Grado Reactivo'
    },
    colors: [
      { id: 'negro-ebano', name: 'Negro Profundo Metalizado', hex: '#0B0B0B', code: 'AUT-9005', inStock: true },
      { id: 'blanco-polar', name: 'Blanco Nevada Cristal', hex: '#F8FAFC', code: 'AUT-1001', inStock: true },
      { id: 'plata-titanio', name: 'Plata Plataforma Fina', hex: '#94A3B8', code: 'AUT-7001', inStock: true },
      { id: 'rojo-monza', name: 'Rojo Rubí Perlado', hex: '#B91C1C', code: 'AUT-3020', inStock: true },
      { id: 'azul-electrico', name: 'Azul Cobalto Mica', hex: '#1D4ED8', code: 'AUT-5005', inStock: true },
      { id: 'verde-esmeralda', name: 'Verde Esmeralda Deportivo', hex: '#047857', code: 'AUT-6010', inStock: true },
      { id: 'amarillo-gt', name: 'Amarillo Cónsul Racing GT', hex: '#FACC15', code: 'AUT-1021', inStock: true }
    ],
    sizes: [
      { id: 'aerosol-400ml', name: 'Aerosol Automotriz 400ml (Retoque Express 2K)', price: 38500, inStock: true, capacityLiters: 0.4 },
      { id: 'octavo', name: '1/8 Galón Kit (Pinta 473ml + Catalizador 120ml)', price: 49000, inStock: true, capacityLiters: 0.473 },
      { id: 'cuarto', name: '1/4 Galón Kit (Poliuretano + Endurecedor 250ml)', price: 79000, inStock: true, capacityLiters: 0.95 },
      { id: 'galon', name: '1 Galón Kit (Poliuretano + Endurecedor 1L)', price: 245000, inStock: true, capacityLiters: 3.785 }
    ],
    defaultColorId: 'negro-ebano',
    defaultSizeId: 'cuarto',
    image: '/products/poliuretano-cuarto.webp',
    coverageM2PerGallon: 70,
    defaultCoats: 2
  },

  // 5. EPÓXICO ALTOS SÓLIDOS PISOS (Industrial)
  {
    id: 'epoxico-altos-solidos-pisos',
    sku: 'IND-EPX-PISOS',
    name: 'Epóxico Altos Sólidos Pisos Industriales',
    brand: 'ColorLink HeavyDuty',
    subtitle: 'Recubrimiento epoxi poliamida 100% sólidos para bodegas, clínicas y tráfico pesado',
    category: 'industrial',
    categoryLabel: 'Línea Industrial & Pisos',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Tráfico Pesado',
    description: 'Sistema epóxico bicomponente de altos sólidos diseñado para pisos de concreto en plantas industriales, talleres automotrices, bodegas logísticas y zonas limpias hospitalarias. Forma una superficie monolítica sin juntas, antipolvo, impermeable y resistente a montacargas y derrames químicos continuos.',
    features: [
      'Resistencia a tráfico vehicular de montacargas con ruedas de poliuretano',
      'Cumple normatividad sanitaria Invima / FDA para plantas de alimentos',
      'Inmune a aceites hidráulicos, ácido de baterías y desinfectantes',
      'Cero emisión de solventes tóxicos durante el curado (Ultra Bajo VOC)'
    ],
    specs: {
      rendimiento: '18 a 22 m² por galón a 10 mils de espesor de película seca',
      secado: 'Peatonal 24 horas | Tráfico vehicular 72 horas | Curado químico 7 días',
      base: 'Resina Epóxica Bisfenol A + Endurecedor Cicloalifático',
      acabado: 'Brillante Vitrificado Antiderrapante',
      solvente: 'Ajustador Epóxico Especial'
    },
    colors: [
      { id: 'gris-maquina', name: 'Gris Tráfico 7038', hex: '#9CA3AF', code: 'RAL-7038', inStock: true },
      { id: 'verde-seguridad', name: 'Verde Zona Segura', hex: '#15803D', code: 'RAL-6029', inStock: true },
      { id: 'amarillo-demarcacion', name: 'Amarillo Seguridad Vial', hex: '#EAB308', code: 'RAL-1023', inStock: true },
      { id: 'azul-operativo', name: 'Azul Pasillo Peatonal', hex: '#2563EB', code: 'RAL-5015', inStock: true }
    ],
    sizes: [
      { id: 'cuarto', name: '1/4 Galón Kit A+B', price: 68000, inStock: true, capacityLiters: 0.95 },
      { id: 'galon', name: '1 Galón Kit (Parte A + B)', price: 185000, inStock: true, capacityLiters: 3.785 },
      { id: 'cunete', name: '5 Galones Kit Industrial', price: 790000, inStock: true, capacityLiters: 18.92 }
    ],
    defaultColorId: 'gris-maquina',
    defaultSizeId: 'galon',
    image: '/products/epoxico-galon.webp',
    coverageM2PerGallon: 18,
    defaultCoats: 2
  },

  // 6. IMPERMEABILIZANTE PINTUCO FILL 7 AÑOS (Construcción)
  {
    id: 'pintucofill-7-anos',
    sku: 'KRZ-FILL-7A',
    name: 'Pintuco Fill Fibratado 7 Años',
    brand: 'ColorLink Recubrimientos',
    subtitle: 'Impermeabilizante elastomérico con fibras incorporadas que no requiere tela de refuerzo',
    category: 'construccion',
    categoryLabel: 'Impermeabilizantes',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Con Fibras Activas',
    description: 'Impermeabilizante acrílico líquido formulado con microfibras de polipropileno entrelazadas que forman una membrana elástica continua sobre cubiertas, terrazas, losas de concreto y tejas de asbesto o zinc. Elimina la necesidad de tender telas de poliéster en superficies transitables.',
    features: [
      'Garantía de estanqueidad de 7 años sin filtraciones',
      'Puentea grietas activas hasta de 2 mm por tensión térmica',
      'Fibras de polipropileno entrelazadas para máxima resistencia mecánica',
      'Reduce hasta 6°C la temperatura interna del inmueble en color blanco'
    ],
    specs: {
      rendimiento: '1.2 a 1.5 litros por m² en sistema completo de 3 manos cruzadas',
      secado: 'Al tacto 2 horas | Entre manos 4 horas | Lluvia segura 12 horas',
      base: 'Resinas Estireno Acrílicas Modificadas con Microfibras',
      acabado: 'Membrana Caucho Satinada',
      solvente: 'Agua limpia (solo 10% en mano de imprimación)'
    },
    colors: [
      { id: 'blanco-termico', name: 'Blanco Termo-Reflectivo', hex: '#FFFFFF', code: 'PF-01', inStock: true },
      { id: 'rojo-teja', name: 'Rojo Teja Colonial', hex: '#991B1B', code: 'PF-02', inStock: true },
      { id: 'gris-terraza', name: 'Gris Placa', hex: '#64748B', code: 'PF-03', inStock: true }
    ],
    sizes: [
      { id: 'cuarto', name: '1/4 Galón', price: 46000, inStock: true, capacityLiters: 0.95 },
      { id: 'galon', name: '1 Galón', price: 148000, inStock: true, capacityLiters: 3.785 },
      { id: 'cunete', name: '5 Galones (Cuñete)', price: 620000, inStock: true, capacityLiters: 18.92 }
    ],
    defaultColorId: 'blanco-termico',
    defaultSizeId: 'galon',
    image: '/products/pintucofill-galon.webp',
    coverageM2PerGallon: 8.4,
    defaultCoats: 3
  },

  // -------------------------------------------------------------
  // HERRAMIENTAS & BROCHAS (CON FOTOS REALES VERIFICADAS Y DEDICADAS)
  // -------------------------------------------------------------

  // 7. BROCHA PROFESIONAL MONOPOL CERDA RUBIA 3"
  {
    id: 'brocha-monopol-3pulg',
    sku: 'HRR-BR-30',
    name: 'Brocha Profesional Cerda Rubia 3 Pulgadas',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Brocha clásica de cerda rubia natural vulcanizada y mango de madera para recortar paredes, esquinas y molduras',
    category: 'herramientas',
    categoryLabel: 'Brochas & Rodillos',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Cero Desprendimiento',
    description: 'Brocha profesional para pintar paredes y techos, fabricada con cerdas rubias naturales seleccionadas, tratadas y vulcanizadas con resina epóxica en virola de acero inoxidable remachada. Diseñada para recortes limpios en uniones de pared y techo, marcos y zócalos con pinturas vinílicas, esmaltes y barnices.',
    features: [
      'Cerdas largas con puntas abiertas (flagged) que retienen abundante carga de pintura',
      'Virola de acero inoxidable antioxidante remachada sólidamente al cabo',
      'Mango anatómico en madera de pino pulida con orificio para colgar',
      'Apta para vinilos de pared base agua, esmaltes y barnices sin dejar marcas de brochazo'
    ],
    specs: {
      rendimiento: 'Reutilizable +150 lavados profesionales',
      secado: 'N/A',
      base: 'Cerda Natural Vulcanizada en Epoxi',
      acabado: 'Profesional liso sin marcas de pasada',
      solvente: 'Lavable con agua tibia o varsol según el producto'
    },
    colors: [
      { id: 'natural', name: 'Cerda Rubia Natural', hex: '#D4AF37', code: 'STD', inStock: true }
    ],
    sizes: [
      { id: 'unidad-3in', name: '3 Pulgadas (76 mm)', price: 16500, inStock: true }
    ],
    defaultSizeId: 'unidad-3in',
    image: '/products/tool-brocha-3.webp',
    isTool: true
  },

  // 8. BROCHA ANGULAR DE PRECISIÓN 1.5"
  {
    id: 'brocha-angular-15pulg',
    sku: 'HRR-BR-15',
    name: 'Brocha Angular de Precisión 1.5 Pulgadas',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Brocha de corte en ángulo para filetear esquinas de zócalos, molduras y marcos',
    category: 'herramientas',
    categoryLabel: 'Brochas & Rodillos',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Alta Precisión',
    description: 'Brocha de corte biselado de 1.5 pulgadas para trabajos de precisión milimétrica en paredes. Sus cerdas elásticas permiten pintar líneas de unión entre techo y pared con pulso limpio sin manchar superficies contiguas.',
    features: [
      'Corte de cerda biselado para esquinas y encuentros agudos de pared',
      'Virola delgada niquelada para mejor ángulo de visión del trazo',
      'Excelente flujo de descarga uniforme sin chorreos'
    ],
    specs: {
      rendimiento: 'Alta durabilidad para acabados finos en paredes',
      secado: 'N/A',
      base: 'Mezcla Cerda Natural & Poliéster Cónico',
      acabado: 'Fileteado Recto sin Cinta',
      solvente: 'Agua o Thinner'
    },
    colors: [
      { id: 'natural', name: 'Cerda Fina', hex: '#E5D3B3', code: 'ANG', inStock: true }
    ],
    sizes: [
      { id: 'unidad-15in', name: '1.5 Pulgadas (38 mm)', price: 11200, inStock: true }
    ],
    defaultSizeId: 'unidad-15in',
    image: '/products/tool-brocha-angular.webp',
    isTool: true
  },

  // 9. BROCHA MAESTRA ANCHA PARA FACHADAS 4"
  {
    id: 'brocha-maestra-4pulg',
    sku: 'HRR-BR-40',
    name: 'Brocha Maestra Ancha para Paredes y Fachadas 4 Pulgadas',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Brocha ancha de alta carga de pintura para revoques rústicos, ladrillo, muros y fachadas',
    category: 'herramientas',
    categoryLabel: 'Brochas & Rodillos',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Carga Pesada',
    description: 'Brocha de 4 pulgadas de espesor reforzado con cerdas densas de gran retención para pintura arquitectónica. Diseñada especialmente para penetrar en las porosidades de muros exteriores, ladrillos a la vista y texturas de revoque sin desgastar las puntas rápidamente.',
    features: [
      'Gran espesor de bloque para retener hasta 3 veces más pintura por inmersión',
      'Cerdas resistentes a la abrasión del revoque, cal y texturas',
      'Mango largo ergonómico con agujero para colgar'
    ],
    specs: {
      rendimiento: 'Especial para exteriores y grandes superficies de pared',
      secado: 'N/A',
      base: 'Cerda Negra Resistente a la Abrasión',
      acabado: 'Penetración Profunda en Poros',
      solvente: 'Agua, Solvente o Varsol'
    },
    colors: [
      { id: 'negra', name: 'Cerda Negra Extra Fuerte', hex: '#262626', code: 'HD-40', inStock: true }
    ],
    sizes: [
      { id: 'unidad-4in', name: '4 Pulgadas (100 mm)', price: 23500, inStock: true }
    ],
    defaultSizeId: 'unidad-4in',
    image: '/products/tool-brocha-4.webp',
    isTool: true
  },

  // 10. RODILLO ANTIGOTEO MICROFIBRA PRO 9"
  {
    id: 'rodillo-antigoteo-microfibra-9',
    sku: 'HRR-RD-90M',
    name: 'Rodillo Antigoteo Microfibra Pro 9 Pulgadas',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Tubo de polipropileno indeformable con felpa de microfibra de alta densidad y cero salpique',
    category: 'herramientas',
    categoryLabel: 'Rodillos & Felpas',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Cero Salpique',
    description: 'Rodillo profesional de 9 pulgadas (23 cm) confeccionado con tejido de microfibra de filamento continuo térmicamente fusionado al tubo interior. Garantiza máxima absorción de pintura, descarga pareja y una reducción del 90% del salpique en techos y muros altos comparado con rodillos convencionales de poliéster.',
    features: [
      'Microfibra premium de alta retención que no suelta pelusa en la pared',
      'Tubo reforzado con balineras que ruedan suavemente sin trabarse',
      'Excelente rendimiento de metros cuadrados por hora',
      'Incluye manilar ergonómico de acero zincado de 6 mm compatible con varillas de extensión'
    ],
    specs: {
      rendimiento: 'Rinde 30% más rápido que rodillos estándar',
      secado: 'N/A',
      base: 'Microfibra de Alta Densidad Térmicamente Fusionada',
      acabado: 'Aterciopelado Extra Liso Antirreflejo',
      solvente: 'Apto para vinilos base agua y esmaltes sintéticos'
    },
    colors: [
      { id: 'microfibra', name: 'Microfibra Rayas Azul/Blanco', hex: '#3B82F6', code: 'MF-09', inStock: true }
    ],
    sizes: [
      { id: 'kit-rodillo-9', name: 'Rodillo Completo 9" (Manilar + Felpa)', price: 24500, inStock: true },
      { id: 'repuesto-felpa-9', name: 'Repuesto Felpa 9" (2 Unidades)', price: 18900, inStock: true }
    ],
    defaultSizeId: 'kit-rodillo-9',
    image: '/products/tool-rodillo-9.webp',
    isTool: true
  },

  // 11. MINI RODILLO DE ESPUMA DE ALTA DENSIDAD 4" (Acabados Lacas y Esmaltes)
  {
    id: 'mini-rodillo-espuma-4pulg',
    sku: 'HRR-RD-40F',
    name: 'Mini Rodillo Espuma de Alta Densidad 4 Pulgadas',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Rodillo de poro cerrado para puertas tamboradas, muebles y rejas sin burbujas',
    category: 'herramientas',
    categoryLabel: 'Rodillos & Felpas',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Acabado Lacado',
    description: 'Mini rodillo de espuma de poliuretano de celda cerrada y alta densidad. Aplica capas ultra delgadas y uniformes de esmaltes brillantes, barnices y poliuretanos sin dejar burbujas ni marcas de textura.',
    features: [
      'Espuma de celda cerrada que no genera microburbujas de aire',
      'Ambos extremos redondeados para no dejar marcas laterales de pasada',
      'Varilla delgada con mango ergonómico antideslizante'
    ],
    specs: {
      rendimiento: 'Ideal para puertas, gabinetes y muebles de madera',
      secado: 'N/A',
      base: 'Espuma de Poliuretano Alta Resistencia',
      acabado: 'Liso Tipo Espejo',
      solvente: 'Resistente a solventes sintéticos'
    },
    colors: [
      { id: 'espuma-blanca', name: 'Espuma Poro Fino', hex: '#E2E8F0', code: 'F-04', inStock: true }
    ],
    sizes: [
      { id: 'kit-mini-4', name: 'Kit Completo (Manilar + 2 Rodillos)', price: 15500, inStock: true },
      { id: 'pack-repuestos-4', name: 'Pack x 4 Rodillos Repuesto', price: 14000, inStock: true }
    ],
    defaultSizeId: 'kit-mini-4',
    image: '/products/tool-mini-rodillo.webp',
    isTool: true
  },

  // 12. BANDEJA PLÁSTICA REFORZADA 9"
  {
    id: 'bandeja-pintura-9pulg',
    sku: 'HRR-BD-90',
    name: 'Bandeja Plástica Reforzada para Pintura 9"',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Bandeja resistente con escurridor acanalado de alta tracción y pico vertedor antigoteo',
    category: 'herramientas',
    categoryLabel: 'Bandejas & Cubetas',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Uso Rudo',
    description: 'Bandeja moldeada en polipropileno virgen de alto impacto que no se deforma bajo el peso de galones llenos. Cuenta con una rampa escurridora estriada con ángulo óptimo para dosificar la cantidad de pintura en el rodillo sin derrames.',
    features: [
      'Pico vertedor lateral para devolver sobrantes al galón fácilmente sin regueros',
      'Ranura porta brocha integrada en el borde superior',
      'Patas antideslizantes que estabilizan la bandeja en escaleras y andamios'
    ],
    specs: {
      rendimiento: 'Capacidad nominal 2.5 litros de pintura',
      secado: 'N/A',
      base: 'Polipropileno Virgen de Alto Impacto',
      acabado: 'Superficie lisa antiadherente de fácil lavado',
      solvente: 'Resistente a agua, varsol y solventes minerales'
    },
    colors: [
      { id: 'azul-colorlink', name: 'Azul Marino ColorLink', hex: '#0B1528', code: 'BD-BL', inStock: true }
    ],
    sizes: [
      { id: 'unidad-bandeja', name: 'Bandeja 9" (Capacidad 2.5L)', price: 12900, inStock: true }
    ],
    defaultSizeId: 'unidad-bandeja',
    image: '/products/tool-bandeja.webp',
    isTool: true
  },

  // 13. CINTA DE ENMASCARAR AZUL DE PINTOR 1"
  {
    id: 'cinta-azul-pintor-1pulg',
    sku: 'HRR-CT-10A',
    name: 'Cinta de Enmascarar Azul de Pintor 1 Pulgada (24 mm x 50 m)',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Remoción limpia hasta por 14 días sin dejar residuos de adhesivo ni levantar pintura',
    category: 'herramientas',
    categoryLabel: 'Cintas & Protección',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Remoción Limpia 14 Días',
    description: 'Cinta de papel crepé azul con tratamiento UV y adhesivo acrílico de adherencia media controlada. Desarrollada para enmascarar zócalos, marcos de puertas, aluminio, vidrio y pisos sin filtrar pintura por debajo del borde.',
    features: [
      'Líneas de pintura nítidas y definidas sin sangrado de color',
      'Remoción limpia hasta por 14 días incluso expuesta a luz solar directa',
      'No rompe el papel ni levanta la pintura de la pared previa al despegar'
    ],
    specs: {
      rendimiento: '50 metros lineales de protección continua',
      secado: 'N/A',
      base: 'Papel Crepé Washi con Adhesivo Acrílico UV',
      acabado: 'Bordes Nítidos Profesionales',
      solvente: 'Resistente a pinturas acuosas y solventes'
    },
    colors: [
      { id: 'azul-cinta', name: 'Azul Pintor UV', hex: '#2563EB', code: 'CT-UV', inStock: true }
    ],
    sizes: [
      { id: 'rollo-individual', name: 'Rollo 1" (24 mm x 50 m)', price: 11200, inStock: true },
      { id: 'pack-3-rollos', name: 'Pack Económico x 3 Rollos', price: 29500, inStock: true }
    ],
    defaultSizeId: 'rollo-individual',
    image: '/products/tool-cinta.webp',
    isTool: true
  },

  // 14. ESPÁTULA FLEXIBLE EN ACERO INOXIDABLE 4"
  {
    id: 'espatula-inox-4pulg',
    sku: 'HRR-ESP-40',
    name: 'Espátula Flexible Acero Inoxidable 4 Pulgadas',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Hoja espejo pulida con flexión calibrada para estuco, masilla de drywall y resanes',
    category: 'herramientas',
    categoryLabel: 'Preparación de Superficies',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Acero Inoxidable',
    description: 'Espátula profesional con hoja de acero inoxidable templado con acabado brillante espejo que evita la oxidación al contacto con estucos acuosos y masillas. Hoja biselada para aplicar y nivelar empastes con gran suavidad.',
    features: [
      'Hoja de acero inoxidable que nunca se oxida ni mancha el estuco blanco',
      'Flexibilidad justa para presionar y dejar superficies completamente lisas',
      'Mango bimaterial con cabeza metálica de golpe para asentar tornillos'
    ],
    specs: {
      rendimiento: 'Resistente a deformaciones mecánicas',
      secado: 'N/A',
      base: 'Acero Inoxidable Templado y Pulido',
      acabado: 'Biselado de Precisión',
      solvente: 'Lavable con agua tibia'
    },
    colors: [
      { id: 'acero', name: 'Acero Inox Brillante', hex: '#CBD5E1', code: 'SS-04', inStock: true }
    ],
    sizes: [
      { id: 'unidad-4in', name: '4 Pulgadas (10 cm)', price: 14800, inStock: true },
      { id: 'unidad-6in', name: '6 Pulgadas (15 cm)', price: 18900, inStock: true }
    ],
    defaultSizeId: 'unidad-4in',
    image: '/products/tool-espatula.webp',
    isTool: true
  },

  // 15. VARILLA DE EXTENSIÓN TELESCÓPICA EN ALUMINIO 2 METROS
  {
    id: 'extension-telescopica-aluminio-2m',
    sku: 'HRR-EXT-20',
    name: 'Extensión Telescópica en Aluminio 2 Metros',
    brand: 'ColorLink Pro Tools',
    subtitle: 'Vástago telescópico de bloqueo giratorio para pintar techos y muros altos sin escaleras',
    category: 'herramientas',
    categoryLabel: 'Accesorios & Extensiones',
    rating: 0, // la calificación real viene de /api/products/:key/reviews
    reviewsCount: 0,
    badge: 'Liviana & Rígida',
    description: 'Varilla telescópica de 2 tramos fabricada en aleación de aluminio aeroespacial que ofrece máxima rigidez sin pandeo con un peso inferior a 450 gramos. Sistema de bloqueo de rosca rápida que fija cualquier longitud intermedia entre 1.10 m y 2.00 m.',
    features: [
      'Punta roscada universal estándar compatible con todos los rodillos ColorLink',
      'Mecanismo de seguro giratorio que no se suelta durante el vaivén de pintura',
      'Empuñadura de espuma antideslizante para agarre seguro con manos sudorosas'
    ],
    specs: {
      rendimiento: 'Alcance hasta techos de 3.5 metros de altura',
      secado: 'N/A',
      base: 'Aluminio Anodizado Anticorrosivo',
      acabado: 'Bloqueo Antideslizante',
      solvente: 'Inmune a la humedad'
    },
    colors: [
      { id: 'aluminio', name: 'Aluminio & Naranja', hex: '#EA580C', code: 'EXT-AL', inStock: true }
    ],
    sizes: [
      { id: 'extension-2m', name: 'Ajustable 1.10 m a 2.00 m', price: 32000, inStock: true }
    ],
    defaultSizeId: 'extension-2m',
    image: '/products/tool-extension.webp',
    isTool: true
  }
];

// ---------------------------------------------------------------------------
// Utilidades compartidas de la tienda (formato, límites y enlaces externos)
// ---------------------------------------------------------------------------

/** Cantidad máxima por línea del carrito / selector de cantidad. */
export const MAX_ITEM_QTY = 99;

/** Limita una cantidad a un entero entre 1 y MAX_ITEM_QTY (NaN -> 1). */
export const clampQty = (n: number): number => {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v) || v < 1) return 1;
  return Math.min(MAX_ITEM_QTY, v);
};

const COP_FORMAT = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** "$ 115.000" con formato colombiano; nunca muestra NaN. */
export const formatCOP = (value: number): string => {
  const n = Number(value);
  return `$${COP_FORMAT.format(Number.isFinite(n) ? Math.round(n) : 0)}`;
};

/** Enlace de WhatsApp solo para celulares colombianos (3xx xxx xxxx). */
export const whatsappUrl = (phone: string, text?: string): string | null => {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
  if (!/^3\d{9}$/.test(digits)) return null;
  return `https://wa.me/57${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

/** Enlace tel: con indicativo de Colombia. */
export const telUrl = (phone: string): string => {
  const digits = String(phone || '').replace(/\D/g, '');
  return `tel:+57${digits.startsWith('57') && digits.length > 10 ? digits.slice(2) : digits}`;
};

/** Ruta de Google Maps hasta la sede (coordenadas si existen, si no la dirección). */
export const mapsDirectionsUrl = (branch: StoreBranch): string => {
  const dest = branch.lat != null && branch.lng != null
    ? `${branch.lat},${branch.lng}`
    : `${branch.name}, ${branch.address}, ${branch.city}, Colombia`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
};

/** Mapa embebible (sin API key) centrado en la sede. */
export const mapsEmbedUrl = (branch: StoreBranch): string => {
  const q = branch.lat != null && branch.lng != null
    ? `${branch.lat},${branch.lng}`
    : `${branch.address}, ${branch.city}, Colombia`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
};

/** Tipo de herramienta a partir del nombre del producto. */
export const toolTypeFor = (name: string): 'rodillo' | 'cinta' | 'espatula' | 'bandeja' | 'extension' | 'brocha' => {
  const n = (name || '').toLowerCase();
  if (n.includes('rodillo')) return 'rodillo';
  if (n.includes('cinta')) return 'cinta';
  if (/esp[aá]tula/.test(n)) return 'espatula';
  if (n.includes('bandeja')) return 'bandeja';
  if (/extensi[oó]n/.test(n)) return 'extension';
  return 'brocha';
};

/** Rendimiento (m²/galón a una mano) y manos por defecto para las calculadoras. */
export const coverageFor = (product?: StoreProduct | null): { perCoat: number; coats: number } => ({
  perCoat: product?.coverageM2PerGallon && product.coverageM2PerGallon > 0 ? product.coverageM2PerGallon : 50,
  coats: product?.defaultCoats && product.defaultCoats > 0 ? product.defaultCoats : 2
});

/**
 * Plan de compra para N galones: usa cuñetes solo cuando conviene
 * (múltiplo de 5 o sobran 3+ galones), si no galones sueltos.
 */
export const purchasePlan = (product: StoreProduct | null | undefined, gallons: number): { sizeId: string; count: number; label: string } => {
  const g = Math.max(1, Math.ceil(gallons));
  const hasCunete = Boolean(product?.sizes.some(s => s.id === 'cunete' && s.inStock));
  const hasGalon = Boolean(product?.sizes.some(s => s.id === 'galon' && s.inStock));
  const rem = g % 5;
  if (hasCunete && g >= 5 && (rem === 0 || rem >= 3 || !hasGalon)) {
    const n = Math.ceil(g / 5);
    return { sizeId: 'cunete', count: n, label: `${n} cuñete${n > 1 ? 's' : ''} de 5 galones` };
  }
  return { sizeId: 'galon', count: g, label: `${g} galón${g > 1 ? 'es' : ''}` };
};
