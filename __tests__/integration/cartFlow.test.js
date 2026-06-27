// __tests__/integration/cartFlow.test.js
// ============================================
// PRUEBAS DE INTEGRACIÓN — Flujo del Carrito
// Sesión 13: Validar interacción entre capas
// ============================================
// Estas pruebas verifican el flujo completo del carrito:
// Agregar → Actualizar cantidad → Calcular total → Eliminar → Vaciar

describe('Flujo Integrado del Carrito', () => {
  // Simular un carrito en memoria (sin Firebase)
  let cart = [];

  // ── Funciones que replican la lógica del carrito ──
  const addItem = (product) => {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: `cart-${Date.now()}-${product.id}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      cart = cart.filter((i) => i.id !== itemId);
    } else {
      const item = cart.find((i) => i.id === itemId);
      if (item) item.quantity = quantity;
    }
  };

  const removeItem = (itemId) => {
    cart = cart.filter((i) => i.id !== itemId);
  };

  const clearCart = () => {
    cart = [];
  };

  const getTotal = () => cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const getItemCount = () => cart.reduce((s, i) => s + i.quantity, 0);

  // Reset antes de cada test
  beforeEach(() => {
    cart = [];
  });

  // ══════════════════════════════════════════
  // SUITE 1: Flujo Completo de Compra
  // ══════════════════════════════════════════
  describe('Flujo completo: agregar → checkout', () => {
    test('agregar producto crea un item en el carrito', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 12.50, image: null });
      expect(cart).toHaveLength(1);
      expect(cart[0].name).toBe('Manzanilla');
      expect(cart[0].quantity).toBe(1);
    });

    test('agregar el mismo producto incrementa la cantidad', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 12.50 });
      addItem({ id: 'p1', name: 'Manzanilla', price: 12.50 });
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(2);
    });

    test('agregar diferentes productos crea items separados', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 12.50 });
      addItem({ id: 'p2', name: 'Matcha', price: 45.00 });
      expect(cart).toHaveLength(2);
    });

    test('total se calcula correctamente tras múltiples operaciones', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 12.50 });
      addItem({ id: 'p1', name: 'Manzanilla', price: 12.50 }); // qty=2, subtotal=25
      addItem({ id: 'p2', name: 'Matcha', price: 45.00 });       // qty=1, subtotal=45
      expect(getTotal()).toBeCloseTo(70.00, 2);
      expect(getItemCount()).toBe(3);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 2: Actualizar Cantidades
  // ══════════════════════════════════════════
  describe('Actualización de cantidades', () => {
    test('incrementar cantidad actualiza el total', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 10.00 });
      const itemId = cart[0].id;
      updateQuantity(itemId, 5);
      expect(cart[0].quantity).toBe(5);
      expect(getTotal()).toBe(50.00);
    });

    test('poner cantidad a 0 elimina el item', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 10.00 });
      const itemId = cart[0].id;
      updateQuantity(itemId, 0);
      expect(cart).toHaveLength(0);
    });

    test('cantidad negativa elimina el item', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 10.00 });
      const itemId = cart[0].id;
      updateQuantity(itemId, -1);
      expect(cart).toHaveLength(0);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 3: Eliminar Items
  // ══════════════════════════════════════════
  describe('Eliminación de items', () => {
    test('eliminar item reduce el carrito', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 10.00 });
      addItem({ id: 'p2', name: 'Matcha', price: 45.00 });
      removeItem(cart[0].id);
      expect(cart).toHaveLength(1);
      expect(cart[0].name).toBe('Matcha');
    });

    test('eliminar item inexistente no modifica el carrito', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 10.00 });
      removeItem('no-existe');
      expect(cart).toHaveLength(1);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 4: Vaciar Carrito
  // ══════════════════════════════════════════
  describe('Vaciar carrito', () => {
    test('vaciar elimina todos los items', () => {
      addItem({ id: 'p1', name: 'Manzanilla', price: 10.00 });
      addItem({ id: 'p2', name: 'Matcha', price: 45.00 });
      addItem({ id: 'p3', name: 'Quinua', price: 22.00 });
      expect(cart).toHaveLength(3);
      clearCart();
      expect(cart).toHaveLength(0);
      expect(getTotal()).toBe(0);
    });

    test('vaciar carrito ya vacío no causa error', () => {
      clearCart();
      expect(cart).toHaveLength(0);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 5: Escenario E2E Simulado
  // ══════════════════════════════════════════
  describe('Escenario completo: compra simulada', () => {
    test('usuario navega, agrega productos, ajusta cantidades y confirma pedido', () => {
      // 1. Usuario agrega productos
      addItem({ id: 'p1', name: 'Manzanilla Orgánica', price: 12.50 });
      addItem({ id: 'p2', name: 'Aceite de Eucalipto', price: 28.00 });
      addItem({ id: 'p3', name: 'Té Verde Matcha', price: 45.00 });
      expect(cart).toHaveLength(3);

      // 2. Agrega más Manzanilla
      addItem({ id: 'p1', name: 'Manzanilla Orgánica', price: 12.50 });
      expect(cart.find((i) => i.productId === 'p1').quantity).toBe(2);

      // 3. Quita el Aceite de Eucalipto
      const aceiteId = cart.find((i) => i.productId === 'p2').id;
      removeItem(aceiteId);
      expect(cart).toHaveLength(2);

      // 4. Cambia cantidad de Matcha a 3
      const matchaId = cart.find((i) => i.productId === 'p3').id;
      updateQuantity(matchaId, 3);

      // 5. Verificar total: Manzanilla(12.50*2) + Matcha(45.00*3) = 25 + 135 = 160
      expect(getTotal()).toBeCloseTo(160.00, 2);
      expect(getItemCount()).toBe(5); // 2 + 3

      // 6. Preparar datos del pedido
      const orderData = {
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total: getTotal(),
        address: 'Av. Universitaria 1800, Lima',
        userId: 'user-test',
        status: 'pending',
      };

      expect(orderData.total).toBe(160.00);
      expect(orderData.items).toHaveLength(2);

      // 7. Tras confirmar, se vacía el carrito
      clearCart();
      expect(cart).toHaveLength(0);
      expect(getTotal()).toBe(0);
    });
  });
});
