<?php

use App\Http\Controllers\EstudioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Obtener último estudio por institución
Route::get('/estudios/ultimo-por-institucion', [EstudioController::class, 'getUltimoEstudioInstitucion']);

// Obtener último estudio por médico
Route::get('/estudios/ultimo-por-medico', [EstudioController::class, 'getUltimoEstudioMedico']);