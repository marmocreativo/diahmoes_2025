<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        // IMPORTANTE: Cambiar versión frecuentemente para evitar cache
        $baseVersion = parent::version($request);
        
        // Para móviles, cambiar la versión más frecuentemente
        $userAgent = $request->header('User-Agent', '');
        $isMobile = preg_match('/Mobile|Android|iPhone|iPad/', $userAgent);
        
        if ($isMobile) {
            // Cambiar cada minuto para móviles
            return $baseVersion . '-mobile-' . floor(time() / 60);
        }
        
        // Para desktop, cambiar cada 5 minutos
        return $baseVersion . '-' . floor(time() / 300);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message')
            ],
            // AGREGAR ESTOS PARA FORZAR ACTUALIZACIONES
            'timestamp' => time(),
            'cache_buster' => uniqid('cb_', true),
            'is_mobile' => $this->isMobile($request),
            'page_load_id' => uniqid('page_', true), // Único por carga de página
        ];
    }
    
    /**
     * Detectar si es dispositivo móvil
     */
    private function isMobile(Request $request): bool
    {
        return preg_match('/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i', 
                         $request->header('User-Agent', ''));
    }
}