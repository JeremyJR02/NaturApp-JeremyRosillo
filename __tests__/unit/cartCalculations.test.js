// __tests__/unit/cartCalculations.test.js
// ============================================
// PRUEBAS UNITARIAS — Cálculos del Carrito
// Sesión 13: Validación de lógica de negocio aislada
// ============================================
// Estas pruebas validan funciones puras de cálculo,
// sin dependencias de UI, Firebase o módulos nativos.

describe('Cálculos del Carrito de Compras', () => {
  // ── Función bajo prueba: calcularTotal ──
  // Lógica extraída del hook useCart
  const calcularTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // ── Función bajo prueba: contarItems ──
  const contarItems = (items) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // ── Función bajo prueba: calcularSubtotalItem ──
  const calcularSubtotalItem = (price, quantity) => {
    return price * quantity;
  };

  // ── Función bajo prueba: aplicarDescuento ──
  const aplicarDescuento = (total, descuento) => {
    const resultado = total - descuento;
    return resultado < 0 ? 0 : resultado;
  };

  // ── Función bajo prueba: validarStock ──
  const validarStock = (stock, cantidadSolicitada) => {
    return stock >= cantidadSolicitada && cantidadSolicitada > 0;
  };

  // ══════════════════════════════════════════
  // SUITE 1: Cálculo de Total
  // ══════════════════════════════════════════
  describe('calcularTotal', () => {
    test('calcula total correctamente con múltiples items', () => {
      const items = [
        { price: 12.50, quantity: 2 },  // 25.00
        { price: 28.00, quantity: 1 },  // 28.00
        { price: 45.00, quantity: 3 },  // 135.00
      ];
      expect(calcularTotal(items)).toBe(188.00);
    });

    test('retorna 0 cuando el carrito está vacío', () => {
      expect(calcularTotal([])).toBe(0);
    });

    test('calcula correctamente con un solo item', () => {
      const items = [{ price: 55.00, quantity: 1 }];
      expect(calcularTotal(items)).toBe(55.00);
    });

    test('maneja cantidades grandes correctamente', () => {
      const items = [{ price: 10.00, quantity: 100 }];
      expect(calcularTotal(items)).toBe(1000.00);
    });

    test('maneja precios con decimales', () => {
      const items = [
        { price: 12.50, quantity: 2 },
        { price: 15.50, quantity: 1 },
      ];
      expect(calcularTotal(items)).toBeCloseTo(40.50, 2);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 2: Conteo de Items
  // ══════════════════════════════════════════
  describe('contarItems', () => {
    test('cuenta total de unidades correctamente', () => {
      const items = [
        { quantity: 2 },
        { quantity: 1 },
        { quantity: 3 },
      ];
      expect(contarItems(items)).toBe(6);
    });

    test('retorna 0 cuando no hay items', () => {
      expect(contarItems([])).toBe(0);
    });

    test('cuenta correctamente con un solo item', () => {
      expect(contarItems([{ quantity: 5 }])).toBe(5);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 3: Subtotal por Item
  // ══════════════════════════════════════════
  describe('calcularSubtotalItem', () => {
    test('calcula subtotal: precio * cantidad', () => {
      expect(calcularSubtotalItem(28.00, 3)).toBe(84.00);
    });

    test('subtotal con cantidad 1 es el precio', () => {
      expect(calcularSubtotalItem(45.00, 1)).toBe(45.00);
    });

    test('subtotal con precio decimal', () => {
      expect(calcularSubtotalItem(12.50, 4)).toBeCloseTo(50.00, 2);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 4: Descuentos
  // ══════════════════════════════════════════
  describe('aplicarDescuento', () => {
    test('aplica descuento correctamente', () => {
      expect(aplicarDescuento(100, 20)).toBe(80);
    });

    test('nunca retorna total negativo', () => {
      expect(aplicarDescuento(10, 30)).toBe(0);
    });

    test('descuento cero no cambia el total', () => {
      expect(aplicarDescuento(50, 0)).toBe(50);
    });

    test('descuento igual al total retorna cero', () => {
      expect(aplicarDescuento(100, 100)).toBe(0);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 5: Validación de Stock
  // ══════════════════════════════════════════
  describe('validarStock', () => {
    test('permite agregar cuando hay stock suficiente', () => {
      expect(validarStock(50, 5)).toBe(true);
    });

    test('rechaza cuando no hay stock suficiente', () => {
      expect(validarStock(3, 5)).toBe(false);
    });

    test('permite agregar cantidad exacta al stock', () => {
      expect(validarStock(10, 10)).toBe(true);
    });

    test('rechaza cantidad cero', () => {
      expect(validarStock(50, 0)).toBe(false);
    });

    test('rechaza cantidad negativa', () => {
      expect(validarStock(50, -1)).toBe(false);
    });

    test('rechaza cuando stock es cero', () => {
      expect(validarStock(0, 1)).toBe(false);
    });
  });
});
