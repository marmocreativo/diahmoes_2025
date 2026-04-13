<?php

namespace App\Http\Controllers;

use App\Models\ReporteAcceso;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ReporteAccesoController extends Controller
{
    /**
     * Verificar que el usuario autenticado sea admin.
     * Si no lo es, abortar con 403.
     */
    private function verificarAdmin(): void
    {
        $usuario = Usuario::where('USUARIO_CORREO', Auth::user()->email)
            ->where('USUARIO_TIPO', 'admin')
            ->where('USUARIO_ESTADO', 'activo')
            ->first();

        if (! $usuario) {
            abort(403, 'No tienes permiso para acceder a esta sección.');
        }
    }

    /**
     * Listar todos los accesos de reporte.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $this->verificarAdmin();

        $accesos = ReporteAcceso::orderBy('created_at', 'desc')->get()->map(fn($a) => [
            'id'         => $a->id,
            'nombre'     => $a->nombre,
            'email'      => $a->email,
            'activo'     => $a->activo,
            'created_at' => $a->created_at?->format('d/m/Y H:i'),
        ]);

        return Inertia::render('Reportes/Accesos/Index', [
            'accesos' => $accesos,
        ]);
    }

    /**
     * Crear un nuevo acceso de reporte.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $this->verificarAdmin();

        $request->validate([
            'nombre'   => 'required|string|max:255',
            'email'    => 'required|email|unique:reporte_accesos,email',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'nombre.required'      => 'El nombre es obligatorio.',
            'email.required'       => 'El correo es obligatorio.',
            'email.email'          => 'El correo no tiene un formato válido.',
            'email.unique'         => 'Ya existe un acceso con este correo.',
            'password.required'    => 'La contraseña es obligatoria.',
            'password.min'         => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'   => 'Las contraseñas no coinciden.',
        ]);

        ReporteAcceso::create([
            'nombre'   => $request->nombre,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'activo'   => 1,
        ]);

        return redirect()->route('reporte-accesos.index')
            ->with('success', 'Acceso creado correctamente.');
    }

    /**
     * Activar o desactivar un acceso.
     *
     * @param  ReporteAcceso  $reporteAcceso
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleActivo(ReporteAcceso $reporteAcceso)
    {
        $this->verificarAdmin();

        $reporteAcceso->update([
            'activo' => $reporteAcceso->activo ? 0 : 1,
        ]);

        $estado = $reporteAcceso->activo ? 'activado' : 'desactivado';

        return redirect()->route('reporte-accesos.index')
            ->with('success', "Acceso {$estado} correctamente.");
    }

    /**
     * Eliminar un acceso de reporte.
     *
     * @param  ReporteAcceso  $reporteAcceso
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(ReporteAcceso $reporteAcceso)
    {
        $this->verificarAdmin();

        $reporteAcceso->delete();

        return redirect()->route('reporte-accesos.index')
            ->with('success', 'Acceso eliminado correctamente.');
    }
}