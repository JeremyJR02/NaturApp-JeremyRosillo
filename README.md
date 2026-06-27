# Informe de cambios en el proyecto NaturApp
### Asignatura: Taller de Construcción de Software Móvil
**Facultad de Ingeniería de Sistemas e Informática**  
**Universidad Nacional Mayor de San Marcos**
### Alumno: Jeremy Andrew Rosillo Ramirez
---

## 1. Introducción y propósito del informe

El presente informe detalla las mejoras de software, depuración de errores, actualizaciones de infraestructura y optimizaciones de seguridad realizadas sobre el proyecto **NaturApp**. El objetivo principal de esta intervención fue corregir fallas de estabilidad, eliminar componentes obsoletos del backend Express, migrar el proyecto al SDK más reciente de Expo (SDK 56) y asegurar las credenciales de conexión mediante variables de entorno para su correcto alojamiento en repositorios públicos.

---

## 2. Detalle de los cambios y mejoras realizadas

### A. Depuración de la lógica del Carrito (`useCart.js`)
Se identificó un error de consistencia de tipos en el hook personalizado `useCart.js` que impedía el correcto renderizado del carrito y del proceso de pago (*checkout*), ocasionando cierres inesperados de la aplicación (*crashes*).
*   **Diagnóstico**: El método `CartService.get(userId)` del archivo `firestoreService.js` retorna un objeto estructurado como `{ items, total, count }`. Sin embargo, en la función `loadCart` de `useCart.js`, se asignaba este objeto completo directamente al estado `items` mediante la sentencia `setItems(data)`. Debido a que `items` se inicializa como un arreglo, cualquier posterior llamada a métodos iterativos de arreglos (como `.reduce()` para calcular totales o el mapeo interno de `FlatList`) generaba la excepción `TypeError: items.reduce is not a function`.
*   **Solución**: Se refactorizó la asignación del estado dentro de `loadCart` para extraer únicamente la propiedad que contiene la colección de artículos:
    ```javascript
    const data = await CartService.get(userId);
    setItems(data.items); // Se corrigió la asignación asignando el arreglo de productos
    ```

### B. Limpieza de arquitectura (Eliminación del Backend)
Siguiendo las directrices de migración hacia un modelo Serverless con Backend-as-a-Service (BaaS) en Firebase:
*   Se eliminó de forma permanente la carpeta `backend/` de la raíz del proyecto (la cual contenía la estructura de rutas, controladores y modelos escrita en Express.js).
*   Esta remoción elimina el acoplamiento innecesario y reduce el volumen de archivos residuales del proyecto, puesto que toda la comunicación de datos se realiza de forma directa entre el cliente React Native y los servicios en la nube de Firebase (Firestore, Auth y Storage).

### C. Actualización de infraestructura (Expo SDK 56 & React 19)
Se realizó la migración del proyecto de Expo SDK 52 a **Expo SDK 56** con el fin de incorporar mejoras de rendimiento y garantizar la compatibilidad con las versiones más recientes de Android e iOS:
*   **Alineación de módulos nativos**: Se ejecutaron los comandos de instalación correspondientes, elevando las dependencias clave a sus versiones compatibles:
    - `react-native` se actualizó a `0.85.3`.
    - `react` se actualizó a `19.2.3`.
    - `react-native-screens` se actualizó a `4.25.2`.
    - Se instaló la dependencia peer `expo-font` para dar soporte a `@expo/vector-icons@15.1.1`.
    - Se incorporó `react-native-worklets@0.8.3` para el soporte interno de animaciones nativas en `react-native-reanimated`.
*   **Depuración de configuración**:
    - Se eliminaron los archivos `babel.config.js` y `metro.config.js` debido a que el nuevo SDK de Expo gestiona los valores predeterminados internamente, reduciendo el número de archivos de configuración requeridos.
    - Se removió la bandera `"newArchEnabled": true` en `app.json` porque la Nueva Arquitectura de React Native viene activada por defecto a partir del SDK 53.
    - Se reestructuró la configuración de la pantalla de inicio (*splash screen*) en `app.json`. En SDK 56, la propiedad raíz `"splash"` se encuentra obsoleta; por lo tanto, la configuración de color de fondo y redimensionamiento se reubicó de manera correcta dentro de la sección `"plugins"` bajo el plugin `"expo-splash-screen"`.

### D. Adopción de entorno de ejecución Bun
Con el objetivo de agilizar las tareas de construcción del bundle y descarga de paquetes:
*   Se adoptó **Bun** como gestor de paquetes principal del proyecto en reemplazo de npm.
*   Se actualizó el archivo de configuración `package.json` para que el script de poblado de la base de datos se ejecute directamente a través del motor de Bun (`"seed": "bun scripts/seedFirestore.js"`).

### E. Blindaje de credenciales y seguridad de código (Archivo `.env`)
Para evitar la filtración de credenciales sensibles (claves de API y tokens de conexión a Firebase) al subir el proyecto a un repositorio de Git:
*   Se implementó el uso de variables de entorno mediante un archivo oculto `.env`. Las variables usan el prefijo `EXPO_PUBLIC_` para ser enlazadas automáticamente por el compilador de Expo en tiempo de ejecución.
*   Se creó el archivo `.env.example` como plantilla de configuración.
*   Se verificó que el archivo `.gitignore` bloquee de forma estricta el rastreo de `.env`.
*   Se refactorizaron los archivos de inicialización `firebaseConfig.js` y `seedFirestore.js` para consumir los parámetros desde `process.env`.

### F. Corrección en la consistencia de datos del catálogo (`seedFirestore.js`)
Se identificó un fallo que impedía mostrar los productos en la interfaz de la aplicación, a pesar de que la base de datos de Firestore indicaba estar poblada con documentos.
*   **Diagnóstico**: La aplicación filtra los productos activos mediante la propiedad `isActive: true` en las consultas de Firestore. Sin embargo, en el script de siembra `seedFirestore.js`, los últimos 5 productos se guardaban con la clave `active: true` en lugar de `isActive: true`. Al no encontrar productos que cumplieran con el filtro, la consulta de Firestore retornaba un conjunto vacío con éxito (sin lanzar excepciones), lo que evitaba que se activara el catálogo de fallback local (`LOCAL_PRODUCTS`) y dejaba la pantalla de inicio en blanco.
*   **Solución**: Se modificó `seedFirestore.js` para homogeneizar el campo a `isActive: true` en todos los productos del catálogo inicial y se re-ejecutó el comando de siembra (`bun run seed`), logrando que la consulta a Firestore recupere y muestre correctamente todo el catálogo en la app.

### G. Refactorización visual del componente de Categorías (`CategoryChips.js`)
Se corrigieron dos problemas visuales en el carrusel de categorías horizontal de la pantalla de inicio:
*   **Alineación vertical (Stretching)**: Por defecto, los elementos hijos de un `ScrollView` horizontal en React Native se estiran para ocupar todo el alto disponible (`alignItems: 'stretch'`). Esto causaba que los botones de categoría (incluido el botón "Todos") se renderizaran como rectángulos verticales muy altos. Se solucionó añadiendo `alignItems: 'center'` a la propiedad `contentContainerStyle`.
*   **Espaciado vertical excesivo**: El componente `ScrollView` intentaba expandirse verticalmente dentro del contenedor flexible de la pantalla de inicio, dejando un espacio vacío muy grande por encima y por debajo de las categorías. Se corrigió aplicando `flexGrow: 0` en el prop `style` del `ScrollView`, forzándolo a ceñirse al tamaño real de su contenido.

---

## 3. Diagnóstico y pruebas de calidad

*   **Verificación con Expo Doctor**: Se ejecutó la auditoría del proyecto mediante `bun x expo-doctor`. El sistema reportó un resultado de **21/21 pruebas superadas con éxito**, confirmando la salud general del esquema de configuración y la ausencia de conflictos de dependencias nativas.
*   **Prueba de fallback offline**: Se comprobó que el flujo del catálogo de productos y el inicio de sesión sigan siendo operables localmente (a través de datos simulados en memoria) en caso de que no existan variables de entorno configuradas, garantizando una excelente tolerancia a fallos.

---

## 4. Guía de ejecución y despliegue del sistema

Para levantar y validar el correcto funcionamiento del proyecto, se deben ejecutar los siguientes pasos en la consola:

### Paso 1: Configurar las variables de entorno
1. Se debe crear un archivo con el nombre `.env` en la raíz del directorio `NaturApp`.
2. Se deben copiar las variables del archivo `.env.example` y sustituir los campos con las credenciales correspondientes al proyecto de Firebase Console:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=TU_API_KEY
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=TU_PROJECT_ID
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
   EXPO_PUBLIC_FIREBASE_APP_ID=TU_APP_ID
   ```

### Paso 2: Inicializar el entorno de desarrollo (con Bun)
Estando ubicados en la terminal dentro de `NaturApp`, se deben ejecutar las siguientes instrucciones:

```powershell
# 1. Instalar las dependencias del proyecto y generar el archivo bun.lockb
bun install

# 2. Poblar las colecciones de Firestore con los datos iniciales de prueba (Categorías y Productos)
bun run seed

# 3. Levantar el servidor de desarrollo de Expo
bun x expo start
```

*Una vez completado el paso 3, se puede escanear el código QR resultante en la terminal con la aplicación de pruebas **Expo Go** para previsualizar el aplicativo en dispositivos Android o iOS.*
