<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UsuarioController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
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
    | Rutas de conveniencia para filtros rápidos
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
    | Rutas adicionales útiles
    |--------------------------------------------------------------------------
    */
    
    // Verificar si un correo ya existe (para validación en tiempo real)
    Route::post('usuarios/verificar-correo', function() {
        $correo = request('correo');
        $usuarioId = request('usuario_id'); // Para edición
        
        $existe = \App\Models\Usuario::where('USUARIO_CORREO', $correo)
            ->when($usuarioId, function($query) use ($usuarioId) {
                return $query->where('ID_USUARIO', '!=', $usuarioId);
            })
            ->exists();
            
        return response()->json(['existe' => $existe]);
    })->name('usuarios.verificar-correo');
    
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';