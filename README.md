# 🩺 DIAHMOES - Sistema de Gestión de Estudios Médicos

**DIAHMOES** es un sistema web moderno para la gestión integral de estudios médicos, diagnósticos histopatológicos y administración de laboratorios especializados. Construido con tecnologías de vanguardia para ofrecer una experiencia de usuario excepcional y funcionalidades robustas.

## 🚀 Stack Tecnológico

### Backend
- **Laravel 12** - Framework PHP de última generación
- **PHP 8.2+** - Lenguaje de programación backend
- **MySQL/MariaDB** - Sistema de gestión de base de datos
- **Inertia.js 2.0** - Adaptador para aplicaciones SPA modernas

### Frontend
- **React 19** - Biblioteca de JavaScript para interfaces de usuario
- **TypeScript 5.7** - Superset de JavaScript con tipado estático
- **Tailwind CSS 4.0** - Framework de CSS utility-first
- **Vite 7.0** - Herramienta de build y desarrollo ultrarrápida

### UI/UX
- **Radix UI** - Componentes accesibles y personalizables
- **Lucide React** - Iconografía moderna y escalable
- **Tailwind CSS Animate** - Animaciones y transiciones fluidas
- **shadcn/ui** - Sistema de componentes de diseño

### Herramientas de Desarrollo
- **ESLint 9.x** - Linter para código JavaScript/TypeScript
- **Prettier 3.x** - Formateador de código
- **Pest 3.x** - Framework de testing para PHP
- **Concurrently** - Ejecutor de múltiples procesos en desarrollo

## 🗄️ Estructura de Base de Datos

### Entidades Principales

#### 👥 Usuarios (`usuarios`)
Gestión completa de usuarios del sistema con roles diferenciados.

```sql
CREATE TABLE `usuarios` (
  `ID_USUARIO` int(11) PRIMARY KEY AUTO_INCREMENT,
  `USUARIO_NOMBRE` varchar(255) NOT NULL,
  `USUARIO_APELLIDOS` varchar(255) NOT NULL,
  `USUARIO_CORREO` varchar(255) NOT NULL UNIQUE,
  `USUARIO_TELEFONO` varchar(255) DEFAULT NULL,
  `USUARIO_PASS` varchar(255) NOT NULL,
  `USUARIO_TIPO` enum('admin','clientes','medico','paciente') NOT NULL,
  `ID_INSTITUCION` int(11) NOT NULL,
  `USUARIO_ESTADO` enum('activo','inactivo') DEFAULT 'activo',
  `FECHA_REGISTRO` timestamp NULL DEFAULT NULL,
  `FECHA_ACTUALIZACION` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  
  FOREIGN KEY (`ID_INSTITUCION`) REFERENCES `instituciones`(`ID_INSTITUCION`)
);
```

**Características:**
- ✅ **Tipos de usuario**: Administradores, clientes, médicos y pacientes
- ✅ **Estados**: Activo/Inactivo para control de acceso
- ✅ **Relación con instituciones**: Cada usuario pertenece a una institución
- ✅ **Autenticación**: Sistema completo de login y tokens

#### 🏢 Instituciones (`instituciones`)
Gestión de instituciones médicas y centros de salud.

```sql
CREATE TABLE `instituciones` (
  `ID_INSTITUCION` int(11) PRIMARY KEY AUTO_INCREMENT,
  `INSTITUCION_NOMBRE` varchar(255) NOT NULL,
  `INSTITUCION_CORREO` varchar(255) NOT NULL,
  `INSTITUCION_TELEFONO` varchar(255) NOT NULL,
  `INSTITUCION_RFC` varchar(255) NOT NULL,
  `INSTITUCION_RAZON_SOCIAL` varchar(255) NOT NULL,
  `INSTITUCION_DIRECCION` text NOT NULL,
  `INSTITUCION_NUMERO_EXT` varchar(255) NOT NULL,
  `INSTITUCION_NUMERO_INT` varchar(255) NOT NULL,
  `INSTITUCION_COLONIA` varchar(255) NOT NULL,
  `INSTITUCION_MUNICIPIO` varchar(255) NOT NULL,
  `INSTITUCION_CIUDAD` varchar(255) NOT NULL,
  `INSTITUCION_ESTADO` varchar(255) NOT NULL,
  `INSTITUCION_CODIGO_POSTAL` varchar(255) NOT NULL,
  `INSTITUCION_PIN` varchar(255) NOT NULL,
  `FECHA_REGISTRO` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_ACTUALIZACION` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Características:**
- ✅ **Información fiscal**: RFC y razón social para facturación
- ✅ **Dirección completa**: Datos detallados de ubicación
- ✅ **PIN de seguridad**: Para autenticación adicional
- ✅ **Timestamps**: Registro y actualización automática

#### 🧪 Estudios (`estudios`)
Núcleo del sistema - gestión completa de estudios médicos.

```sql
CREATE TABLE `estudios` (
  `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
  `ID_ALEATORIO` varchar(255) NOT NULL,
  `CLAVE_INTERNA` varchar(255) NOT NULL,
  `CLAVE` varchar(3) NOT NULL,
  `SERIADO` int(11) NOT NULL,
  `ANIO` int(11) NOT NULL,
  `FOLIO_MERCK` varchar(255) NOT NULL,
  
  -- Relaciones
  `ID_MEDICO` int(11) DEFAULT NULL,
  `ID_PACIENTE` int(11) DEFAULT NULL,
  `ID_INSTITUCION` int(11) DEFAULT NULL,
  `ID_CLIENTE` int(11) NOT NULL,
  `BENEFICIARIO` varchar(255) DEFAULT NULL,
  `CORREO_COPIA` varchar(255) NOT NULL,
  
  -- Información de Muestra
  `MUESTRA_CLAVE` varchar(255) DEFAULT NULL,
  `MUESTRA_FOLIO_SOBRE` varchar(255) NOT NULL,
  `MUESTRA_FOLIO_KIT_BL` varchar(255) NOT NULL,
  `MUESTRA_OTROS_ROTULOS` text NOT NULL,
  `MUESTRA_TIPO` varchar(255) DEFAULT NULL,
  `MUESTRA_SITIO_LESION` varchar(255) NOT NULL,
  `MUESTRA_TIPO_ESTUDIO` varchar(255) NOT NULL,
  `MUESTRA_INICIALES` varchar(255) NOT NULL,
  `MUESTRA_GENERO` varchar(255) DEFAULT NULL,
  `MUESTRA_EDAD` varchar(255) DEFAULT NULL,
  `MUESTRA_BLOQUES` varchar(255) NOT NULL,
  `MUESTRA_LAMINILLAS` varchar(255) NOT NULL,
  `MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA` text NOT NULL,
  
  -- Información de Envío
  `MUESTRA_ENVIO` varchar(255) DEFAULT 'aplica',
  `MUESTRA_ENVIO_TIPO` varchar(255) DEFAULT 'Local',
  `MUESTRA_GUIA` varchar(255) DEFAULT NULL,
  `MUESTRA_GUIA_MENSAJERIA` varchar(255) NOT NULL,
  `MUESTRA_GUIA_ESPECIALIZADA` varchar(255) NOT NULL,
  `MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA` varchar(255) NOT NULL,
  `MUESTRA_GUIA_RETORNO` varchar(255) NOT NULL,
  `MUESTRA_GUIA_RETORNO_MENSAJERIA` varchar(255) NOT NULL,
  
  -- Dirección de Recolección
  `MUESTRA_DIRECCION` text DEFAULT NULL,
  `MUESTRA_NUMERO_EXT` varchar(255) NOT NULL,
  `MUESTRA_NUMERO_INT` varchar(255) NOT NULL,
  `MUESTRA_COLONIA` varchar(255) DEFAULT NULL,
  `MUESTRA_MUNICIPIO` varchar(255) NOT NULL,
  `MUESTRA_CIUDAD` varchar(255) NOT NULL,
  `MUESTRA_ESTADO` varchar(255) DEFAULT NULL,
  `MUESTRA_CODIGO_POSTAL` varchar(255) NOT NULL,
  `MUESTRA_REFERENCIAS` text DEFAULT NULL,
  `MUESTRA_HORARIOS` text DEFAULT NULL,
  
  -- Información Clínica
  `MUESTRA_DIAGNOSTICO_CLINICO` text NOT NULL,
  `MUESTRA_LIQ_CONDICION` varchar(255) NOT NULL,
  `MUESTRA_LIQ_CONDICION_PRESENCIA` varchar(255) NOT NULL,
  `MUESTRA_LIQ_CANTIDAD_ADECUADA` varchar(255) NOT NULL,
  `MUESTRA_LIQ_CANTIDAD_ML` varchar(255) NOT NULL,
  `MUESTRA_LIQ_HEMOLISIS` varchar(255) NOT NULL,
  `MUESTRA_LIQ_AMP_INDICACION` varchar(255) NOT NULL,
  `MUESTRA_LIQ_AMP_RAZON` varchar(255) NOT NULL,
  
  -- Resultados de Laboratorio
  `R_ESTUDIO_SOLICITADO` text DEFAULT NULL,
  `R_METODO_PROCESO` varchar(255) NOT NULL,
  `R_EVALUACION_HISTOPATOLOGICA` text DEFAULT NULL,
  `R_PRESERVACION_H_E` text DEFAULT NULL,
  `R_NUMERO_CELULAS_TUMORALES` text DEFAULT NULL,
  `R_AREA_TUMORAL` text DEFAULT NULL,
  `R_PORCENTAJE_TUMOR_TEJIDO` text DEFAULT NULL,
  `R_ENRIQUECIMIENTO` text DEFAULT NULL,
  `R_ADECUADO_PROCESAMIENTO` varchar(255) DEFAULT NULL,
  `R_RAZON_ADECUADO_PROCESAMIENTO` text NOT NULL,
  `R_ESTATUS_KRAS` text DEFAULT NULL,
  `R_GENOTIPO_KRAS` text DEFAULT NULL,
  `R_ESTATUS_NRAS` text DEFAULT NULL,
  `R_GENOTIPO_NRAS` text DEFAULT NULL,
  `R_ESTATUS_BRAF` text DEFAULT NULL,
  `R_GENOTIPO_BRAF` text DEFAULT NULL,
  `R_RESULTADO_HISTOPATOLOGICO` text DEFAULT NULL,
  `R_INTERPRETACION` text NOT NULL,
  `R_COMPLETOS` enum('si','no') DEFAULT 'no',
  
  -- Control de Fechas
  `FECHA_SOLICITUD_RECOLECCION` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_RECOLECCION` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_RECEPCION` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_ENVIO_LABORATORIO` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_RECEPCION_LABORATORIO` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_ENTREGA_PROCESAMIENTO` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_OBTENCION_RESULTADOS` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_INFORME` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_RESULTADOS_CORREO` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_RETORNO_MATERIAL` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_RECEPCION_RESULTADOS_FISICOS` timestamp DEFAULT '0000-00-00 00:00:00',
  `FECHA_FIN_PROCESO` timestamp DEFAULT '0000-00-00 00:00:00',
  
  -- Meta Información
  `ESTUDIO_FACTURADO` varchar(255) NOT NULL,
  `ESTUDIO_NOTAS` text NOT NULL,
  `ESTUDIO_COMENTARIOS` text NOT NULL,
  `ESTUDIO_ESTADO` varchar(255) DEFAULT NULL,
  
  FOREIGN KEY (`ID_MEDICO`) REFERENCES `usuarios`(`ID_USUARIO`),
  FOREIGN KEY (`ID_PACIENTE`) REFERENCES `usuarios`(`ID_USUARIO`),
  FOREIGN KEY (`ID_INSTITUCION`) REFERENCES `instituciones`(`ID_INSTITUCION`),
  FOREIGN KEY (`ID_CLIENTE`) REFERENCES `clientes`(`ID_CLIENTE`)
);
```

**Características:**
- ✅ **Trazabilidad completa**: 12 timestamps para seguimiento del proceso
- ✅ **Resultados genéticos**: KRAS, NRAS, BRAF con genotipos
- ✅ **Información histopatológica**: Diagnósticos y evaluaciones detalladas
- ✅ **Gestión de envíos**: Guías de mensajería y logística
- ✅ **Datos clínicos**: Condiciones de líquidos y muestras

#### 👥 Clientes (`clientes`)
Gestión de clientes independientes del sistema.

```sql
CREATE TABLE `clientes` (
  `ID_CLIENTE` int(11) PRIMARY KEY AUTO_INCREMENT,
  `CLIENTE_NOMBRE` varchar(255) NOT NULL,
  `CLIENTE_CORREO` varchar(255) NOT NULL,
  `CLIENTE_PASS` varchar(255) NOT NULL,
  `CLIENTE_ENVIAR_CORREO` enum('si','no') DEFAULT 'no'
);
```

### Entidades de Soporte

#### 📎 Adjuntos (`adjuntos`)
```sql
CREATE TABLE `adjuntos` (
  `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
  `MUESTRA_CLAVE` varchar(255) NOT NULL,
  `ARCHIVO` varchar(255) NOT NULL
);
```

#### 📧 Correos Copia (`correos_copias`)
```sql
CREATE TABLE `correos_copias` (
  `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
  `ID_USUARIO` int(11) NOT NULL,
  `ID_ESTUDIO` varchar(255) NOT NULL,
  `NOMBRE` varchar(255) NOT NULL,
  `CORREO` varchar(255) NOT NULL,
  `ENVIAR` enum('si','no') DEFAULT 'no'
);
```

#### 🚚 Mensajerías (`mensajerias`)
```sql
CREATE TABLE `mensajerias` (
  `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
  `NOMBRE` varchar(255) DEFAULT NULL,
  `ESTADO` enum('activo','inactivo') DEFAULT 'activo'
);
```

#### 🔢 Conteo (`conteo`)
```sql
CREATE TABLE `conteo` (
  `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
  `CLAVE` varchar(255) NOT NULL,
  `CONTINUO` varchar(255) NOT NULL
);
```

### Entidades del Sistema Laravel

#### 👤 Autenticación (`users`)
```sql
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
);
```

## 📁 Estructura de Archivos

### Backend (Laravel)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── UsuarioController.php         ✅ CRUD completo de usuarios
│   │   ├── InstitucionController.php     🚧 Pendiente
│   │   ├── EstudioController.php         🚧 Pendiente
│   │   ├── ClienteController.php         🚧 Pendiente
│   │   └── Auth/                         ✅ Sistema de autenticación
│   │       ├── AuthenticatedSessionController.php
│   │       ├── ConfirmablePasswordController.php
│   │       ├── EmailVerificationNotificationController.php
│   │       ├── EmailVerificationPromptController.php
│   │       ├── NewPasswordController.php
│   │       ├── PasswordController.php
│   │       ├── PasswordResetLinkController.php
│   │       ├── RegisteredUserController.php
│   │       └── VerifyEmailController.php
│   └── Middleware/
│       ├── Authenticate.php
│       ├── EncryptCookies.php
│       ├── HandleInertiaRequests.php
│       ├── PreventRequestsDuringMaintenance.php
│       ├── RedirectIfAuthenticated.php
│       ├── TrimStrings.php
│       ├── TrustHosts.php
│       ├── TrustProxies.php
│       ├── ValidateSignature.php
│       └── VerifyCsrfToken.php
├── Models/
│   ├── Usuario.php                       ✅ Modelo principal de usuarios
│   ├── Institucion.php                   🚧 Pendiente
│   ├── Estudio.php                       🚧 Pendiente
│   ├── Cliente.php                       🚧 Pendiente
│   ├── Adjunto.php                       🚧 Pendiente
│   ├── CorreoCopia.php                   🚧 Pendiente
│   ├── Mensajeria.php                    🚧 Pendiente
│   └── User.php                          ✅ Modelo de autenticación Laravel
└── Providers/
    ├── AppServiceProvider.php
    └── RouteServiceProvider.php
```

### Frontend (React + TypeScript)

```
resources/
├── js/
│   ├── components/
│   │   ├── ui/                           ✅ Componentes base shadcn/ui
│   │   │   ├── sidebar.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── label.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   └── tooltip.tsx
│   │   ├── nav-footer.tsx                ✅ Componente de navegación footer
│   │   ├── nav-main.tsx                  ✅ Componente de navegación principal
│   │   └── nav-user.tsx                  ✅ Componente de usuario en navegación
│   ├── layouts/
│   │   └── app-layout.tsx                ✅ Layout principal de la aplicación
│   ├── pages/
│   │   ├── auth/                         ✅ Páginas de autenticación
│   │   │   ├── confirm-password.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── reset-password.tsx
│   │   │   └── verify-email.tsx
│   │   ├── Usuarios/                     ✅ CRUD completo de usuarios
│   │   │   ├── Index.tsx                 ✅ Lista con filtros y paginación
│   │   │   ├── Create.tsx                ✅ Formulario de creación
│   │   │   ├── Edit.tsx                  ✅ Formulario de edición
│   │   │   └── Show.tsx                  ✅ Vista detallada
│   │   ├── dashboard.tsx                 ✅ Panel principal
│   │   ├── settings.tsx                  ✅ Configuración del sistema
│   │   └── welcome.tsx                   ✅ Página de bienvenida
│   ├── types/                            ✅ Sistema de tipos TypeScript
│   │   ├── index.ts                      ✅ Tipos generales y exportaciones
│   │   ├── usuarios.ts                   ✅ Tipos específicos de usuarios
│   │   ├── instituciones.ts              ✅ Tipos específicos de instituciones
│   │   ├── clientes.ts                   ✅ Tipos específicos de clientes
│   │   ├── estudios.ts                   ✅ Tipos específicos de estudios
│   │   ├── adjuntos.ts                   ✅ Tipos específicos de adjuntos
│   │   ├── mensajerias.ts                ✅ Tipos específicos de mensajerías
│   │   └── correos.ts                    ✅ Tipos específicos de correos
│   └── app.tsx                           ✅ Componente raíz de la aplicación
└── css/
    └── app.css                           ✅ Estilos globales con Tailwind
```

### Rutas

```
routes/
├── web.php                               ✅ Rutas principales de la aplicación
├── auth.php                              ✅ Rutas de autenticación
└── settings.php                          ✅ Rutas de configuración
```

### Configuración

```
├── .eslintrc.js                          ✅ Configuración de ESLint
├── prettier.config.js                    ✅ Configuración de Prettier
├── tailwind.config.js                    ✅ Configuración de Tailwind CSS
├── tsconfig.json                         ✅ Configuración de TypeScript
├── vite.config.js                        ✅ Configuración de Vite
├── composer.json                         ✅ Dependencias de PHP
└── package.json                          ✅ Dependencias de Node.js
```

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Usuarios
- **CRUD completo**: Crear, leer, actualizar y eliminar usuarios
- **Tipos de usuario**: Admin, Clientes, Médicos, Pacientes
- **Estados**: Activo/Inactivo con toggle dinámico
- **Filtros avanzados**: Por tipo, estado, institución y búsqueda
- **Paginación**: Sistema completo con navegación
- **Validaciones**: Cliente y servidor con feedback visual
- **Interfaz moderna**: Diseño coherente y responsive

### ✅ Sistema de Autenticación
- **Login/Logout**: Sesiones seguras
- **Registro de usuarios**: Con validación de email
- **Recuperación de contraseña**: Sistema completo
- **Verificación de email**: Proceso de confirmación
- **Middleware de protección**: Rutas protegidas

### ✅ Arquitectura TypeScript
- **Sistema de tipos**: Completamente tipado
- **Organización modular**: Tipos separados por entidad
- **Interfaces props**: Para todos los componentes
- **Validación de compilación**: Sin errores de tipo

## 🚧 Pendiente de Implementación

### Próximos Módulos
- 🏢 **CRUD de Instituciones**
- 🧪 **CRUD de Estudios** (módulo principal)
- 👥 **CRUD de Clientes**
- 📎 **Gestión de Adjuntos**
- 📧 **Sistema de Correos**
- 🚚 **Gestión de Mensajerías**

### Funcionalidades Avanzadas
- 📊 **Dashboard con métricas**
- 📈 **Reportes y estadísticas**
- 🔍 **Búsqueda avanzada**
- 📱 **Optimización mobile**
- 🔐 **Permisos granulares**
- 📄 **Exportación de datos**

## 🛠️ Instalación y Configuración

### Requisitos Previos
- PHP 8.2+
- Node.js 18+
- MySQL/MariaDB
- Composer
- NPM/Yarn

### Instalación

1. **Clonar repositorio**
```bash
git clone [repository-url]
cd diahmoes
```

2. **Instalar dependencias PHP**
```bash
composer install
```

3. **Instalar dependencias Node.js**
```bash
npm install
```

4. **Configurar entorno**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configurar base de datos**
```bash
# Editar .env con credenciales de BD
php artisan migrate
```

6. **Compilar assets**
```bash
npm run dev
```

7. **Iniciar servidor**
```bash
php artisan serve
```

## 🎨 Guía de Diseño

### Paleta de Colores
- **Primario**: `#189BAF` (Azul verdoso)
- **Secundario**: `#D68B41` (Naranja dorado)
- **Variante oscura**: `#157a8c`
- **Estados**: Verde (activo), Rojo (inactivo)

### Componentes Base
- **Cards**: `bg-white rounded-xl shadow-lg border border-gray-100`
- **Botones primarios**: `bg-[#189BAF] hover:bg-[#157a8c]`
- **Gradientes**: `from-[#189BAF] to-[#157a8c]`

## 📈 Roadmap

### Fase 1 (Actual) ✅
- [x] Configuración del stack tecnológico
- [x] Sistema de autenticación
- [x] CRUD de usuarios completo
- [x] Arquitectura TypeScript

### Fase 2 (En desarrollo) 🚧
- [ ] CRUD de instituciones
- [ ] CRUD de estudios básico
- [ ] Dashboard con métricas
- [ ] Sistema de permisos

### Fase 3 (Planificado) 📋
- [ ] Gestión de archivos adjuntos
- [ ] Sistema de notificaciones
- [ ] Reportes avanzados
- [ ] API REST completa

### Fase 4 (Futuro) 🔮
- [ ] Aplicación móvil
- [ ] Integración con LIMS
- [ ] Machine Learning para diagnósticos
- [ ] Portal de pacientes

---

**Desarrollado con ❤️ para el sector de la salud**

*Este sistema está diseñado para cumplir con los más altos estándares de calidad y seguridad en el manejo de información médica sensible.*