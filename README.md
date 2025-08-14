# DIAHMOES - Sistema de Gestión de Estudios Médicos

Sistema web para la gestión integral de estudios médicos, diagnósticos histopatológicos y administración de laboratorios especializados.

## Stack Tecnológico

**Backend:** Laravel 12, PHP 8.2+, MySQL/MariaDB, Inertia.js 2.0
**Frontend:** React 19, TypeScript 5.7, Tailwind CSS 4.0, Vite 7.0
**UI/UX:** Radix UI, Lucide React, shadcn/ui

## Estructura de Base de Datos

### Usuarios (`usuarios`)
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

### Instituciones (`instituciones`)
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

### Clientes (`clientes`)
```sql
CREATE TABLE `clientes` (
  `ID_CLIENTE` int(11) PRIMARY KEY AUTO_INCREMENT,
  `CLIENTE_NOMBRE` varchar(255) NOT NULL,
  `CLIENTE_CORREO` varchar(255) NOT NULL,
  `CLIENTE_PASS` varchar(255) NOT NULL,
  `CLIENTE_ENVIAR_CORREO` enum('si','no') DEFAULT 'no'
);
```

### Mensajerías (`mensajerias`)
```sql
CREATE TABLE `mensajerias` (
  `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
  `NOMBRE` varchar(255) DEFAULT NULL,
  `ESTADO` enum('activo','inactivo') DEFAULT 'activo'
);
```

### Adjuntos (`adjuntos`)
```sql
CREATE TABLE `adjuntos` (
  `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
  `MUESTRA_CLAVE` varchar(255) NOT NULL,
  `ARCHIVO` varchar(255) NOT NULL
);
```

### Conteo (`conteo`)
```sql
CREATE TABLE `conteo` (
  `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
  `CLAVE` varchar(255) NOT NULL,
  `CONTINUO` varchar(255) NOT NULL
);
```

### Correos Copia (`correos_copias`)
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

### Estudios (`estudios`)
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

## Módulos Implementados

### ✅ Usuarios
- CRUD completo con filtros avanzados
- Tipos: Admin, Clientes, Médicos, Pacientes
- Estados: Activo/Inactivo
- Relación con instituciones

### ✅ Instituciones
- CRUD completo con información fiscal
- Gestión de PIN de seguridad
- Validación RFC y código postal
- Vista detallada con pestañas

### ✅ Clientes
- CRUD completo con autenticación
- Configuración de envío de correos
- Relación con estudios
- Toggle de estado

### ✅ Mensajerías
- CRUD simple para empresas de envío
- Estados activo/inactivo
- Estadísticas de uso

### ✅ Adjuntos
- Gestión de archivos por estudio
- Validación de extensiones
- Descarga y eliminación automática

### ✅ Conteo
- Sistema de numeración consecutiva
- Generación de claves únicas
- Configuración de prefijos

### ✅ Correos Copia
- Lista de distribución por estudio
- Importación desde usuarios
- Activación/desactivación granular

## Estado Actual

### Completado
- **Backend**: 6 modelos, 3 controladores, rutas completas
- **Frontend**: 12 páginas React, tipos TypeScript, sidebar
- **Autenticación**: Sistema completo Laravel/Inertia
- **UI**: Componentes shadcn/ui, iconografía Lucide React

### Pendiente
- Modelo y CRUD de Estudios (módulo principal)
- Dashboard con métricas
- Sistema de reportes
- Exportación de datos

## Arquitectura

### Backend
```
app/
├── Models/
│   ├── Usuario.php ✅
│   ├── Institucion.php ✅  
│   ├── Cliente.php ✅
│   ├── Mensajeria.php ✅
│   ├── Adjunto.php ✅
│   ├── Conteo.php ✅
│   ├── CorreoCopia.php ✅
│   └── Estudio.php 🚧
└── Http/Controllers/
    ├── UsuarioController.php ✅
    ├── InstitucionController.php ✅
    ├── ClienteController.php ✅
    ├── MensajeriaController.php ✅
    └── EstudioController.php 🚧
```

### Frontend
```
resources/js/
├── pages/
│   ├── Usuarios/ ✅ (Index, Create, Edit, Show)
│   ├── Instituciones/ ✅ (Index, Create, Edit, Show)
│   ├── Clientes/ ✅ (Index, Create, Edit, Show)
│   ├── Mensajerias/ ✅ (Index, Create, Edit, Show)
│   └── Estudios/ 🚧
├── types/
│   ├── usuarios.ts ✅
│   ├── instituciones.ts ✅
│   ├── clientes.ts ✅
│   ├── mensajerias.ts ✅
│   ├── adjuntos.ts ✅
│   ├── conteo.ts ✅
│   ├── correos.ts ✅
│   └── estudios.ts 🚧
└── layouts/
    └── app-layout.tsx ✅
```

## Instalación

```bash
# Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate

# Frontend  
npm install
npm run dev

# Servidor
php artisan serve
```

## Características Técnicas

- **Validaciones**: Cliente y servidor con feedback visual
- **Paginación**: Sistema completo con filtros preservados
- **API Endpoints**: Para selects y autocomplete
- **TypeScript**: Tipado completo sin errores
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Iconografía**: Lucide React consistente
- **Estados**: Toggle dinámico en interfaces

## Próximos Pasos

1. Implementar modelo y CRUD de Estudios
2. Dashboard principal con métricas
3. Sistema de reportes y exportación
4. Optimización mobile avanzada