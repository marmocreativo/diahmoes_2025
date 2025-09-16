<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoCacheMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Detectar si es móvil
        $userAgent = $request->header('User-Agent', '');
        $isMobile = preg_match('/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i', $userAgent);
        
        // Aplicar headers anti-cache más agresivos en móviles
        if ($isMobile || $request->ajax() || $request->wantsJson()) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
            $response->headers->set('Last-Modified', gmdate('D, d M Y H:i:s') . ' GMT');
            $response->headers->set('Vary', 'User-Agent, Accept-Encoding');
            
            // Headers específicos para Inertia en móviles
            if ($request->header('X-Inertia')) {
                $response->headers->set('X-Inertia-Cache', 'no-cache');
                $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, no-transform');
            }
        } else {
            // Para desktop, headers menos agresivos
            $response->headers->set('Cache-Control', 'no-cache, must-revalidate, max-age=300');
        }
        
        return $response;
    }
}