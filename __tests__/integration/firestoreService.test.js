// __tests__/integration/firestoreService.test.js
// ============================================
// PRUEBAS DE INTEGRACIÓN — Servicio Firestore
// Sesión 13: Validar colaboración entre módulos
// ============================================
// Estas pruebas verifican que los servicios de Firestore
// funcionan correctamente con su sistema de fallback local.

// Mock de Firebase antes de importar el servicio
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
}));
jest.mock('firebase/firestore', () => {
  const mockDocs = [];
  return {
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(() => Promise.reject(new Error('Firestore no configurado'))),
    getDocs: jest.fn(() => Promise.reject(new Error('Firestore no configurado'))),
    addDoc: jest.fn(() => Promise.reject(new Error('Firestore no configurado'))),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    serverTimestamp: jest.fn(() => ({ _type: 'serverTimestamp' })),
    setDoc: jest.fn(),
  };
});
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Servicio Firestore — Integración con Fallback', () => {
  let ProductService, CategoryService;

  beforeAll(() => {
    // Importar después de configurar los mocks
    const services = require('../../src/services/firestoreService');
    ProductService = services.ProductService;
    CategoryService = services.CategoryService;
  });

  // ══════════════════════════════════════════
  // SUITE 1: ProductService con Fallback
  // ══════════════════════════════════════════
  describe('ProductService — Fallback Local', () => {
    test('getAll retorna productos locales cuando Firestore falla', async () => {
      const productos = await ProductService.getAll();
      expect(Array.isArray(productos)).toBe(true);
      expect(productos.length).toBeGreaterThan(0);
      // Verificar estructura de un producto
      const p = productos[0];
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('category');
      expect(p).toHaveProperty('stock');
    });

    test('getAll con filtro de categoría funciona en fallback', async () => {
      const productos = await ProductService.getAll('herbal');
      expect(Array.isArray(productos)).toBe(true);
      expect(productos.every((p) => p.category === 'herbal')).toBe(true);
    });

    test('getById retorna producto correcto en fallback', async () => {
      const producto = await ProductService.getById('1');
      expect(producto).not.toBeNull();
      expect(producto.id).toBe('1');
      expect(producto.name).toBeDefined();
    });

    test('getById lanza error para ID inexistente', async () => {
      await expect(ProductService.getById('no-existe-xyz')).rejects.toThrow('Producto no encontrado');
    });

    test('search encuentra productos por nombre en fallback', async () => {
      const resultados = await ProductService.search('manzanilla');
      expect(Array.isArray(resultados)).toBe(true);
      expect(resultados.length).toBeGreaterThanOrEqual(1);
      expect(resultados[0].name.toLowerCase()).toContain('manzanilla');
    });

    test('search retorna vacío para término sin coincidencias', async () => {
      const resultados = await ProductService.search('xyznoexiste123');
      expect(Array.isArray(resultados)).toBe(true);
      expect(resultados).toHaveLength(0);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 2: CategoryService con Fallback
  // ══════════════════════════════════════════
  describe('CategoryService — Fallback Local', () => {
    test('getAll retorna categorías locales cuando Firestore falla', async () => {
      const categorias = await CategoryService.getAll();
      expect(Array.isArray(categorias)).toBe(true);
      expect(categorias.length).toBeGreaterThan(0);
      // Verificar estructura
      const c = categorias[0];
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
    });

    test('las categorías tienen iconos definidos', async () => {
      const categorias = await CategoryService.getAll();
      categorias.forEach((c) => {
        expect(c.icon).toBeDefined();
      });
    });
  });

  // ══════════════════════════════════════════
  // SUITE 3: Consistencia de Datos
  // ══════════════════════════════════════════
  describe('Consistencia de Datos Locales', () => {
    test('los productos tienen categorías válidas', async () => {
      const productos = await ProductService.getAll();
      const categorias = await CategoryService.getAll();
      const categoryIds = categorias.map((c) => c.id);

      productos.forEach((p) => {
        expect(categoryIds).toContain(p.category);
      });
    });

    test('todos los productos tienen precios positivos', async () => {
      const productos = await ProductService.getAll();
      productos.forEach((p) => {
        expect(p.price).toBeGreaterThan(0);
      });
    });

    test('todos los productos tienen stock no negativo', async () => {
      const productos = await ProductService.getAll();
      productos.forEach((p) => {
        expect(p.stock).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
