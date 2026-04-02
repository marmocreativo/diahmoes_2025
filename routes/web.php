<?php

use App\Http\Controllers\ClienteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EstudioController;
use App\Http\Controllers\InstitucionController;
use App\Http\Controllers\MensajeriaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\EnviosCorreosController;
use App\Http\Controllers\InsumoController;
use App\Http\Controllers\InsumoLoteController;
use App\Http\Controllers\PlantillaInsumoController;
use App\Http\Controllers\EstudioInsumoController;
use App\Http\Controllers\DashboardExportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Rutas Web de DIAHMOES
|--------------------------------------------------------------------------
|
| Estas rutas manejan todas las operaciones del sistema DIAHMOES
| incluyendo CRUDs completos, funcionalidades adicionales y APIs.
|
*/

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/

// Página de bienvenida (antes del login)
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('welcome');

// Redirección para URLs comunes
Route::redirect('/home', '/dashboard');
Route::redirect('/inicio', '/dashboard');

// Ruta pública para generar PDF de estudios (sin autenticación)
Route::get('/publicos/estudio', [EstudioController::class, 'generatePublicPdf'])
    ->name('estudios.pdf.public');

// Ruta pública para el tracking de correos
Route::get('/tracking/pixel/{token}', [EnviosCorreosController::class, 'trackingPixel'])->name('tracking.pixel');




/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren Autenticación)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/dashboard/export-excel', [DashboardExportController::class, 'exportExcel'])
    ->name('dashboard.export.excel')
    ->middleware(['auth']);
    
    /*
    |--------------------------------------------------------------------------
    | CRUD de Usuarios
    |--------------------------------------------------------------------------
    */
    
    // CRUD básico de usuarios
    Route::resource('usuarios', UsuarioController::class)
        ->parameters(['usuarios' => 'usuario:ID_USUARIO']);
    
    // Cambiar estado del usuario (activar/desactivar)
    Route::patch('usuarios/{usuario:ID_USUARIO}/toggle-estado', [UsuarioController::class, 'toggleEstado'])
        ->name('usuarios.toggle-estado');
    
    /*
    |--------------------------------------------------------------------------
    | CRUD de Instituciones
    |--------------------------------------------------------------------------
    */
    
    // CRUD básico de instituciones
    Route::resource('instituciones', InstitucionController::class)
        ->parameters(['instituciones' => 'institucion:ID_INSTITUCION']);

    // Regenerar PIN de seguridad
    Route::patch('instituciones/{institucion:ID_INSTITUCION}/regenerar-pin', [InstitucionController::class, 'regenerarPIN'])
        ->name('instituciones.regenerar-pin');
    
    // Estadísticas de instituciones
    Route::get('instituciones-estadisticas', [InstitucionController::class, 'estadisticas'])
        ->name('instituciones.estadisticas');
    
    /*
    |--------------------------------------------------------------------------
    | CRUD de Mensajerías
    |--------------------------------------------------------------------------
    |
    | Rutas estándar de recursos para mensajerías:
    | GET /mensajerias               - Listado de mensajerías
    | GET /mensajerias/create        - Formulario de creación
    | POST /mensajerias              - Guardar nueva mensajería
    | GET /mensajerias/{mensajeria}  - Ver mensajería específica
    | GET /mensajerias/{mensajeria}/edit - Formulario de edición
    | PUT/PATCH /mensajerias/{mensajeria} - Actualizar mensajería
    | DELETE /mensajerias/{mensajeria} - Eliminar mensajería
    */
    Route::resource('mensajerias', MensajeriaController::class)
        ->parameters(['mensajerias' => 'mensajeria:ID']);

    /*
    |--------------------------------------------------------------------------
    | Rutas adicionales para Mensajerías
    |--------------------------------------------------------------------------
    */
    
    // Cambiar estado de mensajería (activar/desactivar)
    Route::patch('mensajerias/{mensajeria:ID}/toggle-estado', [MensajeriaController::class, 'toggleEstado'])
        ->name('mensajerias.toggle-estado');
    
    // Estadísticas de mensajerías
    Route::get('mensajerias-estadisticas', [MensajeriaController::class, 'estadisticas'])
        ->name('mensajerias.estadisticas');
    
    // Buscar mensajerías (para autocomplete)
    Route::get('mensajerias/buscar', [MensajeriaController::class, 'buscar'])
        ->name('mensajerias.buscar');
    
    /*
    |--------------------------------------------------------------------------
    | CRUD de Clientes
    |--------------------------------------------------------------------------
    |
    | Rutas estándar de recursos para clientes:
    | GET /clientes               - Listado de clientes
    | GET /clientes/create        - Formulario de creación
    | POST /clientes              - Guardar nuevo cliente
    | GET /clientes/{cliente}     - Ver cliente específico
    | GET /clientes/{cliente}/edit - Formulario de edición
    | PUT/PATCH /clientes/{cliente} - Actualizar cliente
    | DELETE /clientes/{cliente} - Eliminar cliente
    */
    Route::resource('clientes', ClienteController::class)
        ->parameters(['clientes' => 'cliente:ID_CLIENTE']);

    /*
    |--------------------------------------------------------------------------
    | Rutas adicionales para Clientes
    |--------------------------------------------------------------------------
    */
    
    // Cambiar estado de envío de correo (activar/desactivar)
    Route::patch('clientes/{cliente:ID_CLIENTE}/toggle-envio-correo', [ClienteController::class, 'toggleEnvioCorreo'])
        ->name('clientes.toggle-envio-correo');
    
    // Verificar contraseña de cliente
    Route::post('clientes/{cliente:ID_CLIENTE}/verificar-password', [ClienteController::class, 'verificarPassword'])
        ->name('clientes.verificar-password');
    
    // Estadísticas de clientes
    Route::get('clientes-estadisticas', [ClienteController::class, 'estadisticas'])
        ->name('clientes.estadisticas');
    

    /*
    |--------------------------------------------------------------------------
    | CRUD de Insumos
    |--------------------------------------------------------------------------
    */

    // CRUD básico de insumos
    Route::resource('insumos', InsumoController::class)
        ->parameters(['insumos' => 'insumo:ID']);
    
    // Confirmación antes de eliminar insumo
    Route::get('insumos/{insumo:ID}/confirm-delete', [InsumoController::class, 'confirmDelete'])
        ->name('insumos.confirm-delete');

    // Obtener insumos disponibles (para formularios)
    Route::get('api/insumos/disponibles', [InsumoController::class, 'getDisponibles'])
        ->name('api.insumos.disponibles');

    

    /*
    |--------------------------------------------------------------------------
    | CRUD de Lotes de Insumos
    |--------------------------------------------------------------------------
    */

    // Rutas para lotes de un insumo específico
    Route::prefix('insumos/{insumo:ID}')->group(function () {
        
        // Listar lotes del insumo
        Route::get('/lotes', [InsumoLoteController::class, 'index'])
            ->name('insumos.lotes.index');
        
        // Crear nuevo lote
        Route::get('/lotes/create', [InsumoLoteController::class, 'create'])
            ->name('insumos.lotes.create');
        
        Route::post('/lotes', [InsumoLoteController::class, 'store'])
            ->name('insumos.lotes.store');
        
        // Ver, editar, actualizar y eliminar lotes
        Route::get('/lotes/{lote:ID}', [InsumoLoteController::class, 'show'])
            ->name('insumos.lotes.show');
        
        Route::get('/lotes/{lote:ID}/edit', [InsumoLoteController::class, 'edit'])
            ->name('insumos.lotes.edit');
        
        Route::patch('/lotes/{lote:ID}', [InsumoLoteController::class, 'update'])
            ->name('insumos.lotes.update');
        
        Route::delete('/lotes/{lote:ID}', [InsumoLoteController::class, 'destroy'])
            ->name('insumos.lotes.destroy');
        
        // Ajustar cantidad manualmente (corrección de inventario)
        Route::patch('/lotes/{lote:ID}/ajustar-cantidad', [InsumoLoteController::class, 'ajustarCantidad'])
            ->name('insumos.lotes.ajustar-cantidad');
        
        // Obtener lotes disponibles del insumo
        Route::get('/lotes-disponibles', [InsumoLoteController::class, 'getLotesDisponibles'])
            ->name('insumos.lotes.disponibles');
    });

    /*
    |--------------------------------------------------------------------------
    | API Endpoints para Lotes
    |--------------------------------------------------------------------------
    */

    // Obtener alertas de inventario
    Route::get('api/insumos/alertas', [InsumoLoteController::class, 'getAlertas'])
        ->name('api.insumos.alertas');

    /*
    |--------------------------------------------------------------------------
    | Gestión de Insumos en Estudios
    |--------------------------------------------------------------------------
    */

    // Rutas para insumos de un estudio específico
    Route::prefix('estudios/{estudio:ID}')->group(function () {

        // Rutas para plantillas de insumos
        Route::get('/plantillas-insumos', [PlantillaInsumoController::class, 'getPlantillasRecomendadas'])
            ->name('estudios.plantillas.recomendadas');
        
        Route::post('/aplicar-plantilla', [PlantillaInsumoController::class, 'aplicarPlantilla'])
            ->name('estudios.plantillas.aplicar');
        
        Route::post('/validar-plantilla', [PlantillaInsumoController::class, 'validarDisponibilidadPlantilla'])
            ->name('estudios.plantillas.validar');
        
        // Listar insumos del estudio
        Route::get('/insumos', [EstudioInsumoController::class, 'index'])
            ->name('estudios.insumos.index');
        
        // Agregar insumo al estudio
        Route::post('/insumos', [EstudioInsumoController::class, 'store'])
            ->name('estudios.insumos.store');
        
        // Actualizar insumo del estudio
        Route::patch('/insumos/{estudioInsumo:ID}', [EstudioInsumoController::class, 'update'])
            ->name('estudios.insumos.update');
        
        // Eliminar insumo del estudio
        Route::delete('/insumos/{estudioInsumo:ID}', [EstudioInsumoController::class, 'destroy'])
            ->name('estudios.insumos.destroy');
        
        // Obtener costo de insumos del estudio
        Route::get('/insumos/costo', [EstudioInsumoController::class, 'getCostoEstudio'])
            ->name('estudios.insumos.costo');
    });

    /*
    |--------------------------------------------------------------------------
    | API Endpoints para Insumos en Estudios
    |--------------------------------------------------------------------------
    */

    // Obtener insumos disponibles para agregar a estudios
    Route::get('api/estudios/insumos-disponibles', [EstudioInsumoController::class, 'getInsumosDisponibles'])
        ->name('api.estudios.insumos-disponibles');

    // Validar disponibilidad de insumo
    Route::post('api/estudios/validar-disponibilidad', [EstudioInsumoController::class, 'validarDisponibilidad'])
        ->name('api.estudios.validar-disponibilidad');

    // Reporte de uso de insumos
    Route::get('api/insumos/reporte-uso', [EstudioInsumoController::class, 'getReporteUso'])
        ->name('api.insumos.reporte-uso');

    /*
    |--------------------------------------------------------------------------
    | Rutas de conveniencia para filtros rápidos - Insumos
    |--------------------------------------------------------------------------
    */

    // Insumos con stock bajo
    Route::get('insumos/stock-bajo', function() {
        return redirect()->route('insumos.index', ['stock_bajo' => 'true']);
    })->name('insumos.stock-bajo');

    // Insumos activos
    Route::get('insumos/activos', function() {
        return redirect()->route('insumos.index', ['estado' => 'activo']);
    })->name('insumos.activos');

    // Insumos inactivos
    Route::get('insumos/inactivos', function() {
        return redirect()->route('insumos.index', ['estado' => 'inactivo']);
    })->name('insumos.inactivos');

    /*
    |--------------------------------------------------------------------------
    | Rutas de reportes - Insumos
    |--------------------------------------------------------------------------
    */

    // Dashboard de inventario
    Route::get('insumos/dashboard', function() {
        $alertas = app(InsumoLoteController::class)->getAlertas();
        return Inertia::render('Insumos/Dashboard', [
            'alertas' => $alertas->getData()
        ]);
    })->name('insumos.dashboard');

    // Reporte de movimientos de inventario
    Route::get('insumos/reporte/movimientos', function() {
        return Inertia::render('Insumos/Reportes/Movimientos');
    })->name('insumos.reporte.movimientos');

    // Reporte de costos por estudio
    Route::get('insumos/reporte/costos', function() {
        return Inertia::render('Insumos/Reportes/Costos');
    })->name('insumos.reporte.costos');


    /*
    |--------------------------------------------------------------------------
    | CRUD de Estudios
    |--------------------------------------------------------------------------
    */

    Route::get('/estudios/insumos-masivos', [EstudioController::class, 'insumosListado'])
        ->name('estudios.insumos.listado')
        ->middleware(['auth', 'verified']);
    
    // Rutas especializadas para edición en pasos
    Route::get('estudios/{estudio:ID}/edit/recoleccion', [EstudioController::class, 'editRecoleccion'])
        ->name('estudios.edit.recoleccion');
    Route::patch('estudios/{estudio:ID}/recoleccion', [EstudioController::class, 'updateRecoleccion'])
        ->name('estudios.update.recoleccion');
    
    Route::get('estudios/{estudio:ID}/edit/recepcion', [EstudioController::class, 'editRecepcion'])
        ->name('estudios.edit.recepcion');
    Route::patch('estudios/{estudio:ID}/recepcion', [EstudioController::class, 'updateRecepcion'])
        ->name('estudios.update.recepcion');
    
    Route::get('estudios/{estudio:ID}/edit/laboratorio', [EstudioController::class, 'editLaboratorio'])
        ->name('estudios.edit.laboratorio');
    Route::patch('estudios/{estudio:ID}/laboratorio', [EstudioController::class, 'updateLaboratorio'])
        ->name('estudios.update.laboratorio');
    
    Route::get('estudios/{estudio:ID}/edit/informe', [EstudioController::class, 'editInforme'])
        ->name('estudios.edit.informe');
    Route::patch('estudios/{estudio:ID}/informe', [EstudioController::class, 'updateInforme'])
        ->name('estudios.update.informe');
    Route::post('estudios/{estudio:ID}/enviar-correo', [EstudioController::class, 'enviarCorreoIndividual'])
        ->name('estudios.enviar-correo');
    
    // Ruta para edición completa en una sola vista
    Route::get('estudios/{estudio:ID}/edit/full', [EstudioController::class, 'editFull'])
        ->name('estudios.edit.full');
    Route::patch('estudios/{estudio:ID}/full', [EstudioController::class, 'updateFull'])
        ->name('estudios.update.full');
    
    // Ruta para generar PDF del estudio
    Route::get('estudios/{estudio:ID}/pdf', [EstudioController::class, 'generatePdf'])
        ->name('estudios.pdf');
    
    Route::get('estudios/{estudio:ID}/envios-correos', [EstudioController::class, 'mostrarEnviosCorreos'])
    ->name('estudios.envios-correos');

    // Rutas de funciones e mantenimiento
    Route::post('estudios/reparar', [EstudioController::class, 'repararEstudios'])
    ->name('estudios.reparar');

    Route::post('estudios/finalizar-antiguos', [EstudioController::class, 'finalizarEstudiosAntiguos'])
    ->name('estudios.finalizar-antiguos');

    Route::post('/estudios/cambiar-destinatario', [EstudioController::class, 'cambiarDestinatario'])
    ->name('estudios.cambiar-destinatario');
    
    // Rutas para obtener datos de estudios
    Route::get('estudios/ultimo-por-institucion', [EstudioController::class, 'getUltimoEstudioInstitucion']);
    Route::get('estudios/ultimo-por-medico', [EstudioController::class, 'getUltimoEstudioMedico']);

    // CRUD básico de estudios
    Route::resource('estudios', EstudioController::class)
        ->parameters(['estudios' => 'estudio:ID']);
    
    // API para manejar correos de copia
    Route::post('api/estudios/{estudio:ID}/correos-copia', [EstudioController::class, 'storeCorreoCopia'])
        ->name('api.estudios.correos-copia.store');
    Route::delete('api/estudios/{estudio:ID}/correos-copia/{correoId}', [EstudioController::class, 'destroyCorreoCopia'])
        ->name('api.estudios.correos-copia.destroy');

    /*
    |--------------------------------------------------------------------------
    | Rutas para envios de correos
    |--------------------------------------------------------------------------
    */
    // Listar envíos
    Route::get('/envios-correos', [EnviosCorreosController::class, 'index'])->name('envios-correos.index');

    // IMPORTANTE: La ruta DELETE debe ir ANTES que la ruta GET {id}
    Route::delete('/envios-correos/{id}', [EnviosCorreosController::class, 'destroy'])->name('envios-correos.destroy');
    
    // Ver detalle de envío
    Route::get('/envios-correos/{id}', [EnviosCorreosController::class, 'show'])->name('envios-correos.show');
    
    // Registrar nuevo envío (API)
    Route::post('/api/envios-correos/registrar', [EnviosCorreosController::class, 'registrarEnvio'])->name('api.envios-correos.registrar');
    
    // Estadísticas de envíos (API)
    Route::get('/api/envios-correos/estadisticas', [EnviosCorreosController::class, 'estadisticas'])->name('api.envios-correos.estadisticas');
    
    // Envíos por estudio (API)
    Route::get('/api/envios-correos/estudio/{estudioId}', [EnviosCorreosController::class, 'porEstudio'])->name('api.envios-correos.por-estudio');
    
    // Reenviar correo
    Route::post('/api/envios-correos/{id}/reenviar', [EnviosCorreosController::class, 'reenviar'])->name('api.envios-correos.reenviar');
    
    // Exportar envíos
    Route::get('/envios-correos/exportar', [EnviosCorreosController::class, 'exportar'])->name('envios-correos.exportar');
    
    /*
    |--------------------------------------------------------------------------
    | API Endpoints para Instituciones
    |--------------------------------------------------------------------------
    */
    
    // Obtener instituciones para selects y autocomplete
    Route::get('api/instituciones', [InstitucionController::class, 'apiInstituciones'])
        ->name('api.instituciones');
    
    // Obtener instituciones por ciudad
    Route::get('api/instituciones/ciudad/{ciudad}', function($ciudad) {
        return app(InstitucionController::class)->apiInstituciones(request()->merge(['ciudad' => $ciudad]));
    })->name('api.instituciones.por-ciudad');
    
    // Obtener instituciones por estado
    Route::get('api/instituciones/estado/{estado}', function($estado) {
        return app(InstitucionController::class)->apiInstituciones(request()->merge(['estado' => $estado]));
    })->name('api.instituciones.por-estado');
    
    /*
    |--------------------------------------------------------------------------
    | API Endpoints para Mensajerías
    |--------------------------------------------------------------------------
    */
    
    // Obtener mensajerías para selects y autocomplete
    Route::get('api/mensajerias', [MensajeriaController::class, 'apiMensajerias'])
        ->name('api.mensajerias');
    
    // Obtener solo mensajerías activas
    Route::get('api/mensajerias/activas', function() {
        return app(MensajeriaController::class)->apiMensajerias(request()->merge(['incluir_inactivas' => false]));
    })->name('api.mensajerias.activas');
    
    // Obtener mensajerías más utilizadas
    Route::get('api/mensajerias/mas-utilizadas/{limite?}', function($limite = 10) {
        $mensajerias = \App\Models\Mensajeria::masUtilizadas($limite);
        return response()->json($mensajerias->map(function($m) {
            return $m->getResumen();
        }));
    })->name('api.mensajerias.mas-utilizadas');
    
    /*
    |--------------------------------------------------------------------------
    | API Endpoints para Clientes
    |--------------------------------------------------------------------------
    */
    
    // Obtener clientes para selects y autocomplete
    Route::get('api/clientes', [ClienteController::class, 'apiIndex'])
        ->name('api.clientes');
    
    // Obtener solo clientes activos (que reciben correos)
    Route::get('api/clientes/activos', [ClienteController::class, 'apiActivos'])
        ->name('api.clientes.activos');
    
    // Buscar cliente por correo específico
    Route::post('api/clientes/buscar-por-correo', [ClienteController::class, 'apiBuscarPorCorreo'])
        ->name('api.clientes.buscar-por-correo');
    
    // Estadísticas de clientes para dashboard
    Route::get('api/clientes/estadisticas', [ClienteController::class, 'apiEstadisticas'])
        ->name('api.clientes.estadisticas');
    
    // Obtener clientes con envío de correo habilitado
    Route::get('api/clientes/con-envio-correo', function() {
        return app(ClienteController::class)->apiIndex(request()->merge(['envio_correo' => 'si']));
    })->name('api.clientes.con-envio-correo');
    
    // Obtener clientes sin envío de correo
    Route::get('api/clientes/sin-envio-correo', function() {
        return app(ClienteController::class)->apiIndex(request()->merge(['envio_correo' => 'no']));
    })->name('api.clientes.sin-envio-correo');
    
    /*
    |--------------------------------------------------------------------------
    | API Endpoints para Usuarios
    |--------------------------------------------------------------------------
    */
    
    // Obtener usuarios para selects y autocomplete
    Route::get('api/usuarios', [UsuarioController::class, 'apiUsuarios'])
        ->name('api.usuarios');
    
    // Obtener usuarios por tipo específico
    Route::get('api/usuarios/tipo/{tipo}', function($tipo) {
        return app(UsuarioController::class)->apiUsuarios(request()->merge(['tipo' => $tipo]));
    })->where('tipo', 'admin|clientes|medico|paciente')
      ->name('api.usuarios.por-tipo');
    
    // Obtener médicos activos (endpoint específico para formularios)
    Route::get('api/medicos', function() {
        return app(UsuarioController::class)->apiUsuarios(request()->merge(['tipo' => 'medico']));
    })->name('api.medicos');
    
    // Obtener clientes usuarios activos
    Route::get('api/clientes-usuarios', function() {
        return app(UsuarioController::class)->apiUsuarios(request()->merge(['tipo' => 'clientes']));
    })->name('api.clientes-usuarios');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de exportación
    |--------------------------------------------------------------------------
    */
    
    // Exportar instituciones
    Route::get('instituciones/exportar/{formato?}', [InstitucionController::class, 'exportar'])
        ->where('formato', 'excel|csv|pdf')
        ->name('instituciones.exportar');
    
    // Exportar mensajerías
    Route::get('mensajerias/exportar/{formato?}', [MensajeriaController::class, 'exportar'])
        ->where('formato', 'excel|csv|pdf')
        ->name('mensajerias.exportar');
    
    // Exportar clientes
    Route::get('clientes/exportar/{formato?}', [ClienteController::class, 'exportar'])
        ->where('formato', 'excel|csv|pdf')
        ->name('clientes.exportar');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de conveniencia para filtros rápidos - Usuarios
    |--------------------------------------------------------------------------
    */
    
    // Filtros rápidos por tipo de usuario
    Route::get('usuarios/medicos', function() {
        return redirect()->route('usuarios.index', ['tipo' => 'medico']);
    })->name('usuarios.medicos');
    
    Route::get('usuarios/clientes', function() {
        return redirect()->route('usuarios.index', ['tipo' => 'clientes']);
    })->name('usuarios.clientes');
    
    Route::get('usuarios/pacientes', function() {
        return redirect()->route('usuarios.index', ['tipo' => 'paciente']);
    })->name('usuarios.pacientes');
    
    Route::get('usuarios/administradores', function() {
        return redirect()->route('usuarios.index', ['tipo' => 'admin']);
    })->name('usuarios.administradores');
    
    // Filtros por estado
    Route::get('usuarios/activos', function() {
        return redirect()->route('usuarios.index', ['estado' => 'activo']);
    })->name('usuarios.activos');
    
    Route::get('usuarios/inactivos', function() {
        return redirect()->route('usuarios.index', ['estado' => 'inactivo']);
    })->name('usuarios.inactivos');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de conveniencia para filtros rápidos - Instituciones
    |--------------------------------------------------------------------------
    */
    
    // Filtros por ubicación geográfica
    Route::get('instituciones/ciudad/{ciudad}', function($ciudad) {
        return redirect()->route('instituciones.index', ['ciudad' => $ciudad]);
    })->name('instituciones.por-ciudad');
    
    Route::get('instituciones/estado/{estado}', function($estado) {
        return redirect()->route('instituciones.index', ['estado_geografico' => $estado]);
    })->name('instituciones.por-estado');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de conveniencia para filtros rápidos - Mensajerías
    |--------------------------------------------------------------------------
    */
    
    // Filtros por estado de mensajería
    Route::get('mensajerias/activas', function() {
        return redirect()->route('mensajerias.index', ['estado' => 'activo']);
    })->name('mensajerias.activas');
    
    Route::get('mensajerias/inactivas', function() {
        return redirect()->route('mensajerias.index', ['estado' => 'inactivo']);
    })->name('mensajerias.inactivas');
    
    // Mensajerías más utilizadas
    Route::get('mensajerias/mas-utilizadas', function() {
        return redirect()->route('mensajerias.index', ['sort' => 'total_guias', 'direction' => 'desc']);
    })->name('mensajerias.mas-utilizadas');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de conveniencia para filtros rápidos - Clientes
    |--------------------------------------------------------------------------
    */
    
    // Filtros por estado de envío de correo
    Route::get('clientes/activos', function() {
        return redirect()->route('clientes.index', ['envio_correo' => 'si']);
    })->name('clientes.activos');
    
    Route::get('clientes/inactivos', function() {
        return redirect()->route('clientes.index', ['envio_correo' => 'no']);
    })->name('clientes.inactivos');
    
    // Clientes con envío de correo habilitado
    Route::get('clientes/con-envio-correo', function() {
        return redirect()->route('clientes.index', ['envio_correo' => 'si']);
    })->name('clientes.con-envio-correo');
    
    // Clientes sin envío de correo
    Route::get('clientes/sin-envio-correo', function() {
        return redirect()->route('clientes.index', ['envio_correo' => 'no']);
    })->name('clientes.sin-envio-correo');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de reportes y análisis
    |--------------------------------------------------------------------------
    */
    
    // Reportes de instituciones
    Route::get('instituciones/reporte/ciudades', [InstitucionController::class, 'reportePorCiudades'])
        ->name('instituciones.reporte.ciudades');
    
    Route::get('instituciones/reporte/estados', [InstitucionController::class, 'reportePorEstados'])
        ->name('instituciones.reporte.estados');
    
    // Reportes de mensajerías
    Route::get('mensajerias/reporte/utilizacion', function() {
        $stats = \App\Models\Mensajeria::all()->map(function($m) {
            return array_merge($m->getResumen(), $m->getEstadisticas());
        });
        return Inertia::render('Mensajerias/Reportes/Utilizacion', ['datos' => $stats]);
    })->name('mensajerias.reporte.utilizacion');
    
    // Reportes de clientes
    Route::get('clientes/reporte/envio-correos', function() {
        $stats = [
            'con_envio' => \App\Models\Cliente::contarActivos(),
            'sin_envio' => \App\Models\Cliente::contarInactivos(),
            'total' => \App\Models\Cliente::contarTotal(),
            'porcentaje_activos' => \App\Models\Cliente::contarTotal() > 0 
                ? round((\App\Models\Cliente::contarActivos() / \App\Models\Cliente::contarTotal()) * 100, 2) 
                : 0,
        ];
        return Inertia::render('Clientes/Reportes/EnvioCorreos', ['datos' => $stats]);
    })->name('clientes.reporte.envio-correos');
    
    Route::get('clientes/reporte/actividad', function() {
        $clientes = \App\Models\Cliente::with('estudios')
            ->get()
            ->map(function($cliente) {
                return [
                    'ID_CLIENTE' => $cliente->ID_CLIENTE,
                    'CLIENTE_NOMBRE' => $cliente->CLIENTE_NOMBRE,
                    'CLIENTE_CORREO' => $cliente->CLIENTE_CORREO,
                    'total_estudios' => $cliente->getTotalEstudios(),
                    'enviar_correo' => $cliente->CLIENTE_ENVIAR_CORREO === 'si',
                ];
            });
        return Inertia::render('Clientes/Reportes/Actividad', ['datos' => $clientes]);
    })->name('clientes.reporte.actividad');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de validación en tiempo real
    |--------------------------------------------------------------------------
    */
    
    // Verificar si un correo de usuario ya existe
    Route::post('usuarios/verificar-correo', function() {
        $correo = request('correo');
        $usuarioId = request('usuario_id');
        
        $existe = \App\Models\Usuario::where('USUARIO_CORREO', $correo)
            ->when($usuarioId, function($query) use ($usuarioId) {
                return $query->where('ID_USUARIO', '!=', $usuarioId);
            })
            ->exists();
            
        return response()->json(['existe' => $existe]);
    })->name('usuarios.verificar-correo');
    
    // Verificar si un RFC de institución ya existe
    Route::post('instituciones/verificar-rfc', function() {
        $rfc = request('rfc');
        $institucionId = request('institucion_id');
        
        $existe = \App\Models\Institucion::where('INSTITUCION_RFC', $rfc)
            ->when($institucionId, function($query) use ($institucionId) {
                return $query->where('ID_INSTITUCION', '!=', $institucionId);
            })
            ->exists();
            
        return response()->json(['existe' => $existe]);
    })->name('instituciones.verificar-rfc');
    
    // Verificar si un correo de institución ya existe
    Route::post('instituciones/verificar-correo', function() {
        $correo = request('correo');
        $institucionId = request('institucion_id');
        
        $existe = \App\Models\Institucion::where('INSTITUCION_CORREO', $correo)
            ->when($institucionId, function($query) use ($institucionId) {
                return $query->where('ID_INSTITUCION', '!=', $institucionId);
            })
            ->exists();
            
        return response()->json(['existe' => $existe]);
    })->name('instituciones.verificar-correo');
    
    // Verificar si un nombre de mensajería ya existe
    Route::post('mensajerias/verificar-nombre', function() {
        $nombre = request('nombre');
        $mensajeriaId = request('mensajeria_id');
        
        $existe = \App\Models\Mensajeria::where('NOMBRE', $nombre)
            ->when($mensajeriaId, function($query) use ($mensajeriaId) {
                return $query->where('ID', '!=', $mensajeriaId);
            })
            ->exists();
            
        return response()->json(['existe' => $existe]);
    })->name('mensajerias.verificar-nombre');
    
    // Verificar si un correo de cliente ya existe
    Route::post('clientes/verificar-correo', function() {
        $correo = request('correo');
        $clienteId = request('cliente_id');
        
        $existe = \App\Models\Cliente::where('CLIENTE_CORREO', $correo)
            ->when($clienteId, function($query) use ($clienteId) {
                return $query->where('ID_CLIENTE', '!=', $clienteId);
            })
            ->exists();
            
        return response()->json(['existe' => $existe]);
    })->name('clientes.verificar-correo');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de integración entre módulos
    |--------------------------------------------------------------------------
    */
    
    // Obtener usuarios de una institución específica
    Route::get('instituciones/{institucion:ID_INSTITUCION}/usuarios', function($institucion) {
        return app(UsuarioController::class)->apiUsuarios(request()->merge(['institucion' => $institucion->ID_INSTITUCION]));
    })->name('instituciones.usuarios');
    
    // Obtener médicos de una institución específica
    Route::get('instituciones/{institucion:ID_INSTITUCION}/medicos', function($institucion) {
        return app(UsuarioController::class)->apiUsuarios(request()->merge([
            'institucion' => $institucion->ID_INSTITUCION,
            'tipo' => 'medico'
        ]));
    })->name('instituciones.medicos');
    
    // Obtener estudios que usan una mensajería específica
    Route::get('mensajerias/{mensajeria:ID}/estudios', function($mensajeria) {
        $estudios = $mensajeria->getEstudiosRecientes(50);
        return response()->json($estudios->map(function($estudio) use ($mensajeria) {
            return [
                'ID' => $estudio->ID,
                'CLAVE_INTERNA' => $estudio->CLAVE_INTERNA,
                'MUESTRA_INICIALES' => $estudio->MUESTRA_INICIALES,
                'FECHA_SOLICITUD_RECOLECCION' => $estudio->FECHA_SOLICITUD_RECOLECCION,
                'tipo_guia' => app(MensajeriaController::class)->determinarTipoGuia($estudio, $mensajeria->NOMBRE),
            ];
        }));
    })->name('mensajerias.estudios');
    
    // Obtener estudios de un cliente específico
    Route::get('clientes/{cliente:ID_CLIENTE}/estudios', function($cliente) {
        $estudios = $cliente->getEstudiosRecientes(50);
        return response()->json($estudios->map(function($estudio) {
            return [
                'ID' => $estudio->ID,
                'CLAVE_INTERNA' => $estudio->CLAVE_INTERNA,
                'MUESTRA_INICIALES' => $estudio->MUESTRA_INICIALES,
                'FECHA_SOLICITUD_RECOLECCION' => $estudio->FECHA_SOLICITUD_RECOLECCION,
                'ESTUDIO_ESTADO' => $estudio->ESTUDIO_ESTADO,
            ];
        }));
    })->name('clientes.estudios');
    
    // Obtener estudios recientes de un cliente para dashboard
    Route::get('clientes/{cliente:ID_CLIENTE}/estudios-recientes/{limite?}', function($cliente, $limite = 10) {
        $estudios = $cliente->getEstudiosRecientes($limite);
        return response()->json($estudios);
    })->name('clientes.estudios-recientes');
    
    /*
    |--------------------------------------------------------------------------
    | Rutas de configuración y sistema
    |--------------------------------------------------------------------------
    */
    
    // Página principal de configuración
    Route::get('/configuracion', [ConfiguracionController::class, 'index'])
        ->name('configuracion.index');

    // 🧪 Ruta de prueba para debugging
    Route::any('/configuracion/test', [ConfiguracionController::class, 'test'])
        ->name('configuracion.test');

    // 📊 Información del sistema para debugging
    Route::get('/configuracion/system-info', [ConfiguracionController::class, 'getSystemInfo'])
        ->name('configuracion.system-info');

    // Herramientas de mantenimiento - con middleware adicional para API responses
    Route::middleware(['web'])->group(function () {
        
        Route::post('/configuracion/run-migrations', [ConfiguracionController::class, 'runMigrations'])
            ->name('configuracion.run-migrations');

        Route::get('/configuracion/download-backup', [ConfiguracionController::class, 'downloadBackup'])
            ->name('configuracion.download-backup');

        Route::post('/configuracion/test-email', [ConfiguracionController::class, 'testEmail'])
            ->name('configuracion.test-email');

        Route::post('/configuracion/mail-config-test', [ConfiguracionController::class, 'testMailConfig'])
            ->name('configuracion.mail-config-test');
    });

    // En routes/web.php, agregar dentro del grupo de configuración:
    Route::post('/configuracion/cache-commands', [ConfiguracionController::class, 'executeCacheCommands']);
    Route::get('/configuracion/cache-info', [ConfiguracionController::class, 'getCacheInfo']);
    
});

Route::get('/plantillas-insumos', [PlantillaInsumoController::class, 'getPlantillas'])
     ->name('plantillas.insumos.index');

/*
|--------------------------------------------------------------------------
| Aliases y rutas de conveniencia
|--------------------------------------------------------------------------
*/

// Aliases para facilitar el acceso
Route::redirect('/institutions', '/instituciones')->name('institutions.redirect');
Route::redirect('/centros', '/instituciones')->name('centros.redirect');
Route::redirect('/hospitales', '/instituciones')->name('hospitales.redirect');
Route::redirect('/envios', '/mensajerias')->name('envios.redirect');
Route::redirect('/transportes', '/mensajerias')->name('transportes.redirect');
Route::redirect('/paqueterias', '/mensajerias')->name('paqueterias.redirect');

// Aliases para clientes
Route::redirect('/customers', '/clientes')->name('customers.redirect');
Route::redirect('/empresas', '/clientes')->name('empresas.redirect');
Route::redirect('/companies', '/clientes')->name('companies.redirect');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';