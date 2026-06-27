// __tests__/unit/productFilters.test.js
// ============================================
// PRUEBAS UNITARIAS — Filtros y Búsqueda de Productos
// Sesión 13: Lógica pura de filtrado sin dependencia de Firebase
// ============================================

describe('Filtrado y Búsqueda de Productos', () => {
  // ── Datos de prueba ──
  const productos = [
    { id: '1', name: 'Manzanilla Orgánica', category: 'herbal', price: 12.50, stock: 50, active: true },
    { id: '2', name: 'Aceite de Eucalipto', category: 'oils', price: 28.00, stock: 35, active: true },
    { id: '3', name: 'Té Verde Matcha', category: 'teas', price: 45.00, stock: 25, active: true },
    { id: '4', name: 'Espirulina en Polvo', category: 'supplements', price: 38.50, stock: 0, active: true },
    { id: '5', name: 'Quinua Real Orgánica', category: 'superfoods', price: 22.00, stock: 60, active: true },
    { id: '6', name: 'Producto Inactivo', category: 'herbal', price: 5.00, stock: 10, active: false },
  ];

  // ── Función bajo prueba: filtrar por categoría ──
  const filtrarPorCategoria = (items, categoryId) => {
    if (!categoryId) return items;
    return items.filter((p) => p.category === categoryId);
  };

  // ── Función bajo prueba: buscar por texto ──
  const buscarProductos = (items, query) => {
    if (!query || !query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  };

  // ── Función bajo prueba: filtrar activos ──
  const filtrarActivos = (items) => {
    return items.filter((p) => p.active !== false);
  };

  // ── Función bajo prueba: filtrar con stock ──
  const filtrarConStock = (items) => {
    return items.filter((p) => p.stock > 0);
  };

  // ── Función bajo prueba: ordenar por precio ──
  const ordenarPorPrecio = (items, ascendente = true) => {
    return [...items].sort((a, b) => ascendente ? a.price - b.price : b.price - a.price);
  };

  // ══════════════════════════════════════════
  // SUITE 1: Filtro por Categoría
  // ══════════════════════════════════════════
  describe('filtrarPorCategoria', () => {
    test('retorna todos los productos si no se especifica categoría', () => {
      expect(filtrarPorCategoria(productos, null)).toHaveLength(6);
    });

    test('filtra correctamente por categoría "herbal"', () => {
      const resultado = filtrarPorCategoria(productos, 'herbal');
      expect(resultado).toHaveLength(2);
      expect(resultado.every((p) => p.category === 'herbal')).toBe(true);
    });

    test('retorna array vacío si la categoría no existe', () => {
      expect(filtrarPorCategoria(productos, 'inexistente')).toHaveLength(0);
    });

    test('filtra categoría con un solo producto', () => {
      const resultado = filtrarPorCategoria(productos, 'teas');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].name).toBe('Té Verde Matcha');
    });
  });

  // ══════════════════════════════════════════
  // SUITE 2: Búsqueda por Texto
  // ══════════════════════════════════════════
  describe('buscarProductos', () => {
    test('encuentra producto por nombre parcial', () => {
      const resultado = buscarProductos(productos, 'manza');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].name).toBe('Manzanilla Orgánica');
    });

    test('búsqueda es case-insensitive', () => {
      const resultado = buscarProductos(productos, 'MATCHA');
      expect(resultado).toHaveLength(1);
    });

    test('busca también en el campo category', () => {
      const resultado = buscarProductos(productos, 'oils');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].name).toBe('Aceite de Eucalipto');
    });

    test('retorna todos si el query es vacío', () => {
      expect(buscarProductos(productos, '')).toHaveLength(6);
      expect(buscarProductos(productos, null)).toHaveLength(6);
    });

    test('retorna vacío si no hay coincidencias', () => {
      expect(buscarProductos(productos, 'chocolate')).toHaveLength(0);
    });

    test('encuentra múltiples coincidencias', () => {
      const resultado = buscarProductos(productos, 'orgánica');
      expect(resultado.length).toBeGreaterThanOrEqual(2);
    });

    test('ignora espacios extra en el query', () => {
      const resultado = buscarProductos(productos, '  matcha  ');
      expect(resultado).toHaveLength(1);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 3: Filtro de Productos Activos
  // ══════════════════════════════════════════
  describe('filtrarActivos', () => {
    test('excluye productos inactivos', () => {
      const resultado = filtrarActivos(productos);
      expect(resultado).toHaveLength(5);
      expect(resultado.some((p) => p.name === 'Producto Inactivo')).toBe(false);
    });

    test('mantiene todos los productos activos', () => {
      const resultado = filtrarActivos(productos);
      expect(resultado.every((p) => p.active !== false)).toBe(true);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 4: Filtro por Stock
  // ══════════════════════════════════════════
  describe('filtrarConStock', () => {
    test('excluye productos sin stock', () => {
      const resultado = filtrarConStock(productos);
      expect(resultado.some((p) => p.stock === 0)).toBe(false);
    });

    test('mantiene productos con stock positivo', () => {
      const resultado = filtrarConStock(productos);
      expect(resultado.every((p) => p.stock > 0)).toBe(true);
      expect(resultado).toHaveLength(5);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 5: Ordenamiento por Precio
  // ══════════════════════════════════════════
  describe('ordenarPorPrecio', () => {
    test('ordena de menor a mayor precio (ascendente)', () => {
      const resultado = ordenarPorPrecio(productos, true);
      for (let i = 1; i < resultado.length; i++) {
        expect(resultado[i].price).toBeGreaterThanOrEqual(resultado[i - 1].price);
      }
    });

    test('ordena de mayor a menor precio (descendente)', () => {
      const resultado = ordenarPorPrecio(productos, false);
      for (let i = 1; i < resultado.length; i++) {
        expect(resultado[i].price).toBeLessThanOrEqual(resultado[i - 1].price);
      }
    });

    test('no modifica el array original', () => {
      const original = [...productos];
      ordenarPorPrecio(productos, true);
      expect(productos).toEqual(original);
    });
  });
});
