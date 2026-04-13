<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ReporteAccess
{
    /**
     * Verifica que el usuario tenga acceso a la sección de reportes.
     * Se permite el acceso si se cumple UNA de estas condiciones:
     *
     * 1. Tiene sesión Laravel activa Y su USUARIO_TIPO es 'admin'
     * 2. Tiene una sesión de reporte activa (login con tabla reporte_accesos)
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Condición 1: usuario Laravel autenticado con tipo admin
        if (Auth::check()) {
            $usuario = $request->user(); // modelo User (tabla users)

            // Buscamos el usuario en la tabla usuarios vinculado por email
            $usuarioApp = \App\Models\Usuario::where('USUARIO_CORREO', $usuario->email)
                ->where('USUARIO_TIPO', 'admin')
                ->where('USUARIO_ESTADO', 'activo')
                ->first();

            if ($usuarioApp) {
                // Guardamos en sesión para que ReporteLog pueda registrar el user_id
                if (! $request->session()->has('reporte_user_id')) {
                    $request->session()->put('reporte_user_id', $usuario->id);
                    $request->session()->put('reporte_acceso_id', null);
                    $request->session()->put('reporte_nombre', $usuario->name);
                    $request->session()->put('reporte_tipo', 'admin');
                }

                return $next($request);
            }
        }

        // Condición 2: sesión de reporte activa (login externo)
        if ($request->session()->get('reporte_autenticado') === true) {
            return $next($request);
        }

        // Sin acceso: redirigir al login de reportes
        return redirect()->route('reportes.login');
    }
}