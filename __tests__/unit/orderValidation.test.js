// __tests__/unit/orderValidation.test.js
// ============================================
// PRUEBAS UNITARIAS — Validación de Pedidos
// Sesión 13: Reglas de negocio para creación de órdenes
// ============================================

describe('Validación de Pedidos', () => {
  // ── Función bajo prueba: validar datos de pedido ──
  const validarPedido = (orderData) => {
    const errors = [];
    if (!orderData.items || orderData.items.length === 0) {
      errors.push('El pedido debe tener al menos un producto');
    }
    if (!orderData.address || !orderData.address.trim()) {
      errors.push('La dirección de entrega es obligatoria');
    }
    if (!orderData.userId) {
      errors.push('Se requiere un usuario autenticado');
    }
    if (orderData.total <= 0) {
      errors.push('El total debe ser mayor a cero');
    }
    return { valid: errors.length === 0, errors };
  };

  // ── Función bajo prueba: calcular total del pedido ──
  const calcularTotalPedido = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // ── Función bajo prueba: determinar estado del pedido ──
  const puedeSerCancelado = (status) => {
    const cancelables = ['pending', 'confirmed'];
    return cancelables.includes(status);
  };

  // ── Función bajo prueba: formatear ID de pedido ──
  const formatearIdPedido = (id) => {
    if (!id) return 'N/A';
    return `#${id.slice(-6).toUpperCase()}`;
  };

  // ══════════════════════════════════════════
  // SUITE 1: Validación de Datos
  // ══════════════════════════════════════════
  describe('validarPedido', () => {
    test('pedido válido no tiene errores', () => {
      const resultado = validarPedido({
        items: [{ name: 'Manzanilla', price: 12.50, quantity: 1 }],
        address: 'Av. Universitaria 1800, Lima',
        userId: 'user-123',
        total: 12.50,
      });
      expect(resultado.valid).toBe(true);
      expect(resultado.errors).toHaveLength(0);
    });

    test('rechaza pedido sin items', () => {
      const resultado = validarPedido({
        items: [],
        address: 'Lima',
        userId: 'user-123',
        total: 0,
      });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('El pedido debe tener al menos un producto');
    });

    test('rechaza pedido sin dirección', () => {
      const resultado = validarPedido({
        items: [{ name: 'Té', price: 10, quantity: 1 }],
        address: '',
        userId: 'user-123',
        total: 10,
      });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('La dirección de entrega es obligatoria');
    });

    test('rechaza pedido sin usuario', () => {
      const resultado = validarPedido({
        items: [{ name: 'Té', price: 10, quantity: 1 }],
        address: 'Lima',
        userId: null,
        total: 10,
      });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('Se requiere un usuario autenticado');
    });

    test('rechaza pedido con total cero o negativo', () => {
      const resultado = validarPedido({
        items: [{ name: 'Té', price: 10, quantity: 1 }],
        address: 'Lima',
        userId: 'user-123',
        total: 0,
      });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('El total debe ser mayor a cero');
    });

    test('acumula múltiples errores', () => {
      const resultado = validarPedido({
        items: [],
        address: '',
        userId: null,
        total: -5,
      });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 2: Cálculo de Total del Pedido
  // ══════════════════════════════════════════
  describe('calcularTotalPedido', () => {
    test('suma correctamente todos los items', () => {
      const items = [
        { price: 12.50, quantity: 2 },
        { price: 28.00, quantity: 1 },
      ];
      expect(calcularTotalPedido(items)).toBe(53.00);
    });

    test('retorna 0 con lista vacía', () => {
      expect(calcularTotalPedido([])).toBe(0);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 3: Estados del Pedido
  // ══════════════════════════════════════════
  describe('puedeSerCancelado', () => {
    test('pedido pendiente puede cancelarse', () => {
      expect(puedeSerCancelado('pending')).toBe(true);
    });

    test('pedido confirmado puede cancelarse', () => {
      expect(puedeSerCancelado('confirmed')).toBe(true);
    });

    test('pedido enviado NO puede cancelarse', () => {
      expect(puedeSerCancelado('shipped')).toBe(false);
    });

    test('pedido entregado NO puede cancelarse', () => {
      expect(puedeSerCancelado('delivered')).toBe(false);
    });

    test('pedido ya cancelado NO puede cancelarse de nuevo', () => {
      expect(puedeSerCancelado('cancelled')).toBe(false);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 4: Formateo de ID
  // ══════════════════════════════════════════
  describe('formatearIdPedido', () => {
    test('formatea correctamente los últimos 6 caracteres', () => {
      expect(formatearIdPedido('abc123def456')).toBe('#DEF456');
    });

    test('maneja IDs cortos', () => {
      expect(formatearIdPedido('ab')).toBe('#AB');
    });

    test('retorna N/A para IDs nulos', () => {
      expect(formatearIdPedido(null)).toBe('N/A');
      expect(formatearIdPedido(undefined)).toBe('N/A');
    });
  });
});
