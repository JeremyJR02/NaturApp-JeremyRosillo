// __tests__/unit/authValidation.test.js
// ============================================
// PRUEBAS UNITARIAS — Validación de Autenticación
// Sesión 13: Reglas de validación de formularios de login/registro
// ============================================

describe('Validación de Autenticación', () => {
  // ── Función bajo prueba: validar email ──
  const validarEmail = (email) => {
    if (!email || !email.trim()) return { valid: false, error: 'El email es obligatorio' };
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email.trim())) return { valid: false, error: 'Email inválido' };
    return { valid: true, error: null };
  };

  // ── Función bajo prueba: validar password ──
  const validarPassword = (password) => {
    if (!password) return { valid: false, error: 'La contraseña es obligatoria' };
    if (password.length < 6) return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    return { valid: true, error: null };
  };

  // ── Función bajo prueba: validar registro completo ──
  const validarRegistro = (data) => {
    const errors = [];
    if (!data.name || !data.name.trim()) errors.push('El nombre es obligatorio');
    const emailResult = validarEmail(data.email);
    if (!emailResult.valid) errors.push(emailResult.error);
    const passResult = validarPassword(data.password);
    if (!passResult.valid) errors.push(passResult.error);
    if (data.password !== data.confirmPassword) errors.push('Las contraseñas no coinciden');
    return { valid: errors.length === 0, errors };
  };

  // ── Función bajo prueba: mapear código de error Firebase ──
  const mapearErrorFirebase = (code) => {
    const map = {
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Email inválido',
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres)',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/invalid-credential': 'Credenciales inválidas',
    };
    return map[code] || 'Error de autenticación desconocido';
  };

  // ══════════════════════════════════════════
  // SUITE 1: Validación de Email
  // ══════════════════════════════════════════
  describe('validarEmail', () => {
    test('acepta email válido', () => {
      expect(validarEmail('user@example.com').valid).toBe(true);
    });

    test('acepta email con subdominio', () => {
      expect(validarEmail('user@mail.unmsm.edu.pe').valid).toBe(true);
    });

    test('rechaza email vacío', () => {
      const resultado = validarEmail('');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toBe('El email es obligatorio');
    });

    test('rechaza email nulo', () => {
      expect(validarEmail(null).valid).toBe(false);
    });

    test('rechaza email sin @', () => {
      expect(validarEmail('userexample.com').valid).toBe(false);
      expect(validarEmail('userexample.com').error).toBe('Email inválido');
    });

    test('rechaza email sin dominio', () => {
      expect(validarEmail('user@').valid).toBe(false);
    });

    test('ignora espacios alrededor del email', () => {
      expect(validarEmail('  user@example.com  ').valid).toBe(true);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 2: Validación de Password
  // ══════════════════════════════════════════
  describe('validarPassword', () => {
    test('acepta contraseña de 6+ caracteres', () => {
      expect(validarPassword('abc123').valid).toBe(true);
    });

    test('acepta contraseña larga', () => {
      expect(validarPassword('MiContraseñaSegura2024!').valid).toBe(true);
    });

    test('rechaza contraseña vacía', () => {
      expect(validarPassword('').valid).toBe(false);
    });

    test('rechaza contraseña corta (< 6 chars)', () => {
      const resultado = validarPassword('abc');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('6 caracteres');
    });

    test('rechaza contraseña de exactamente 5 caracteres', () => {
      expect(validarPassword('12345').valid).toBe(false);
    });

    test('acepta contraseña de exactamente 6 caracteres', () => {
      expect(validarPassword('123456').valid).toBe(true);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 3: Validación de Registro
  // ══════════════════════════════════════════
  describe('validarRegistro', () => {
    test('registro válido no tiene errores', () => {
      const resultado = validarRegistro({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(resultado.valid).toBe(true);
    });

    test('rechaza si falta el nombre', () => {
      const resultado = validarRegistro({
        name: '',
        email: 'juan@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('El nombre es obligatorio');
    });

    test('rechaza si las contraseñas no coinciden', () => {
      const resultado = validarRegistro({
        name: 'Juan',
        email: 'juan@example.com',
        password: 'password123',
        confirmPassword: 'password456',
      });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('Las contraseñas no coinciden');
    });

    test('acumula errores de todos los campos', () => {
      const resultado = validarRegistro({
        name: '',
        email: 'invalido',
        password: '123',
        confirmPassword: '456',
      });
      expect(resultado.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ══════════════════════════════════════════
  // SUITE 4: Mapeo de Errores Firebase
  // ══════════════════════════════════════════
  describe('mapearErrorFirebase', () => {
    test('mapea auth/user-not-found', () => {
      expect(mapearErrorFirebase('auth/user-not-found')).toBe('No existe una cuenta con este email');
    });

    test('mapea auth/wrong-password', () => {
      expect(mapearErrorFirebase('auth/wrong-password')).toBe('Contraseña incorrecta');
    });

    test('mapea auth/email-already-in-use', () => {
      expect(mapearErrorFirebase('auth/email-already-in-use')).toBe('Este email ya está registrado');
    });

    test('retorna mensaje genérico para código desconocido', () => {
      expect(mapearErrorFirebase('auth/unknown-error')).toBe('Error de autenticación desconocido');
    });

    test('mapea auth/too-many-requests', () => {
      expect(mapearErrorFirebase('auth/too-many-requests')).toContain('Demasiados intentos');
    });
  });
});
