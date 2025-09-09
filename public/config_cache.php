<?php
/**
 * Config Cache Tool - Herramienta para limpiar caché de Laravel
 * 
 * IMPORTANTE: Eliminar este archivo después del uso por seguridad
 */

// Configuración de seguridad
define('SECRET_KEY', 'diahmoes_admin_2025');
define('MAX_EXECUTION_TIME', 300);

set_time_limit(MAX_EXECUTION_TIME);
ini_set('memory_limit', '256M');

// Headers de seguridad
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Rutas de Laravel (igual que tu index)
$bootstrapPath = __DIR__.'/../../diahmoes_2025/bootstrap/app.php';
$vendorPath = __DIR__.'/../../diahmoes_2025/vendor/autoload.php';
$laravelRoot = __DIR__.'/../../diahmoes_2025';

// Verificar archivos
if (!file_exists($vendorPath)) {
    die('Error: No se encontró vendor/autoload.php');
}

if (!file_exists($bootstrapPath)) {
    die('Error: No se encontró bootstrap/app.php');
}

// Cambiar al directorio de Laravel
$originalDir = getcwd();
chdir($laravelRoot);

try {
    // Cargar autoloader
    require_once $vendorPath;
    
    // Cargar aplicación Laravel
    $app = require_once $bootstrapPath;
    
    // IMPORTANTE: Arrancar Laravel completamente
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    $laravelLoaded = true;
    
} catch (Exception $e) {
    $laravelLoaded = false;
    $laravelError = $e->getMessage();
} catch (Throwable $e) {
    $laravelLoaded = false;
    $laravelError = $e->getMessage();
}

// Función para ejecutar comandos Artisan
function runArtisanCommand($command, $params = []) {
    global $laravelLoaded, $app;
    
    if (!$laravelLoaded) {
        return [
            'success' => false,
            'exit_code' => -1,
            'output' => 'Laravel no está cargado correctamente',
            'duration' => '0ms',
            'command' => $command,
            'error' => 'Laravel no inicializado'
        ];
    }
    
    try {
        $startTime = microtime(true);
        
        // Usar el kernel de consola
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        
        // Capturar output
        ob_start();
        $exitCode = $kernel->call($command, $params);
        $output = $kernel->output();
        ob_end_clean();
        
        $duration = round((microtime(true) - $startTime) * 1000, 2);
        
        return [
            'success' => $exitCode === 0,
            'exit_code' => $exitCode,
            'output' => $output,
            'duration' => $duration . 'ms',
            'command' => $command
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'exit_code' => -1,
            'output' => 'Error: ' . $e->getMessage(),
            'duration' => '0ms',
            'command' => $command,
            'error' => $e->getMessage()
        ];
    } catch (Throwable $e) {
        return [
            'success' => false,
            'exit_code' => -1,
            'output' => 'Error: ' . $e->getMessage(),
            'duration' => '0ms',
            'command' => $command,
            'error' => $e->getMessage()
        ];
    }
}

// Función para obtener información del entorno
function getEnvironmentInfo() {
    global $laravelLoaded, $laravelError, $laravelRoot;
    
    $info = [
        'php_version' => phpversion(),
        'timestamp' => date('Y-m-d H:i:s'),
        'laravel_loaded' => $laravelLoaded,
        'storage_writable' => is_writable($laravelRoot . '/storage'),
        'cache_writable' => is_writable($laravelRoot . '/bootstrap/cache'),
        'vendor_exists' => file_exists($laravelRoot . '/vendor/autoload.php'),
        'bootstrap_exists' => file_exists($laravelRoot . '/bootstrap/app.php'),
        'env_exists' => file_exists($laravelRoot . '/.env')
    ];
    
    if ($laravelLoaded) {
        try {
            $info['app_env'] = config('app.env', 'unknown');
            $info['app_debug'] = config('app.debug', false);
            $info['laravel_version'] = app()->version();
            $info['base_path'] = base_path();
        } catch (Exception $e) {
            $info['config_error'] = $e->getMessage();
        }
    } else {
        $info['laravel_error'] = $laravelError ?? 'Error desconocido';
    }
    
    return $info;
}

// Procesar solicitudes POST
$result = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['secret']) || $_POST['secret'] !== SECRET_KEY) {
        $error = 'Clave secreta incorrecta';
    } else {
        $action = $_POST['action'] ?? '';
        $results = [];
        
        switch ($action) {
            case 'test_laravel':
                $results[] = [
                    'success' => $laravelLoaded,
                    'exit_code' => $laravelLoaded ? 0 : -1,
                    'output' => $laravelLoaded ? 'Laravel cargado y funcionando correctamente' : ($laravelError ?? 'Error desconocido'),
                    'duration' => '0ms',
                    'command' => 'test_laravel',
                    'description' => 'Prueba de carga de Laravel...'
                ];
                break;
                
            case 'clear_all':
                $commands = [
                    'config:clear' => 'Limpiando configuración...',
                    'cache:clear' => 'Limpiando caché de aplicación...',
                    'view:clear' => 'Limpiando vistas compiladas...',
                    'route:clear' => 'Limpiando rutas cacheadas...'
                ];
                
                foreach ($commands as $cmd => $description) {
                    $results[] = array_merge(
                        runArtisanCommand($cmd),
                        ['description' => $description]
                    );
                }
                break;
                
            case 'rebuild_cache':
                $commands = [
                    'config:cache' => 'Reconstruyendo caché de configuración...',
                    'route:cache' => 'Reconstruyendo caché de rutas...'
                ];
                
                foreach ($commands as $cmd => $description) {
                    $results[] = array_merge(
                        runArtisanCommand($cmd),
                        ['description' => $description]
                    );
                }
                break;
                
            case 'full_reset':
                $commands = [
                    'config:clear' => 'Limpiando configuración...',
                    'cache:clear' => 'Limpiando caché de aplicación...',
                    'view:clear' => 'Limpiando vistas compiladas...',
                    'route:clear' => 'Limpiando rutas cacheadas...',
                    'config:cache' => 'Reconstruyendo caché de configuración...',
                    'route:cache' => 'Reconstruyendo caché de rutas...'
                ];
                
                foreach ($commands as $cmd => $description) {
                    $results[] = array_merge(
                        runArtisanCommand($cmd),
                        ['description' => $description]
                    );
                }
                break;
                
            case 'single_command':
                $command = $_POST['command'] ?? '';
                if (!empty($command)) {
                    $results[] = runArtisanCommand($command);
                } else {
                    $error = 'Comando no especificado';
                }
                break;
                
            default:
                $error = 'Acción no válida';
        }
        
        $result = $results;
    }
}

$envInfo = getEnvironmentInfo();

// Restaurar directorio original
chdir($originalDir);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Config Cache Tool - DIAHMOES</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5; 
            color: #333; 
            line-height: 1.6;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #189BAF, #16a085);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .error-notice {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .success-notice {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        input[type="password"], input[type="text"], select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        .btn {
            background: #189BAF;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .btn:hover { background: #147a8a; }
        .btn:disabled { 
            background: #ccc; 
            cursor: not-allowed; 
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }
        .result.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .result.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .command-result {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #189BAF;
            background: #f8f9fa;
        }
        .command-header {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .command-output {
            font-family: monospace;
            font-size: 11px;
            background: #2d3748;
            color: #a0aec0;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
        }
        .status-success { color: #38a169; }
        .status-error { color: #e53e3e; }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label { font-weight: 600; }
        .info-value { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Config Cache Tool</h1>
            <p>Herramienta para limpiar caché de Laravel</p>
        </div>

        <div class="warning">
            <strong>IMPORTANTE:</strong> Eliminar este archivo después del uso por seguridad.
        </div>

        <?php if (!$laravelLoaded): ?>
        <div class="error-notice">
            <strong>Error de Laravel:</strong> <?= htmlspecialchars($laravelError ?? 'Error desconocido') ?>
        </div>
        <?php else: ?>
        <div class="success-notice">
            <strong>Laravel cargado correctamente</strong> - Los comandos están disponibles
        </div>
        <?php endif; ?>

        <div class="info-grid">
            <div class="card">
                <h3>Información del Sistema</h3>
                <div class="info-item">
                    <span class="info-label">Laravel cargado:</span>
                    <span class="info-value <?= $envInfo['laravel_loaded'] ? 'status-success' : 'status-error' ?>">
                        <?= $envInfo['laravel_loaded'] ? 'SÍ' : 'NO' ?>
                    </span>
                </div>
                <?php if (isset($envInfo['app_env'])): ?>
                <div class="info-item">
                    <span class="info-label">Entorno:</span>
                    <span class="info-value"><?= htmlspecialchars($envInfo['app_env']) ?></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Debug:</span>
                    <span class="info-value"><?= $envInfo['app_debug'] ? 'ON' : 'OFF' ?></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Laravel:</span>
                    <span class="info-value"><?= htmlspecialchars($envInfo['laravel_version']) ?></span>
                </div>
                <?php endif; ?>
                <div class="info-item">
                    <span class="info-label">PHP:</span>
                    <span class="info-value"><?= htmlspecialchars($envInfo['php_version']) ?></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Storage escribible:</span>
                    <span class="info-value <?= $envInfo['storage_writable'] ? 'status-success' : 'status-error' ?>">
                        <?= $envInfo['storage_writable'] ? 'SÍ' : 'NO' ?>
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cache escribible:</span>
                    <span class="info-value <?= $envInfo['cache_writable'] ? 'status-success' : 'status-error' ?>">
                        <?= $envInfo['cache_writable'] ? 'SÍ' : 'NO' ?>
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Archivo .env:</span>
                    <span class="info-value <?= $envInfo['env_exists'] ? 'status-success' : 'status-error' ?>">
                        <?= $envInfo['env_exists'] ? 'SÍ' : 'NO' ?>
                    </span>
                </div>
            </div>

            <div class="card">
                <h3>Ejecutar Comandos</h3>
                <form method="POST">
                    <div class="form-group">
                        <label for="secret">Clave Secreta:</label>
                        <input type="password" id="secret" name="secret" required 
                               placeholder="Ingresa la clave secreta">
                    </div>

                    <div class="form-group">
                        <label for="action">Acción:</label>
                        <select id="action" name="action" onchange="toggleCustomCommand()">
                            <option value="test_laravel">Probar Laravel</option>
                            <option value="clear_all">Limpiar todas las cachés</option>
                            <option value="rebuild_cache">Reconstruir cachés</option>
                            <option value="full_reset">Reset completo</option>
                            <option value="single_command">Comando personalizado</option>
                        </select>
                    </div>

                    <div class="form-group" id="custom-command" style="display: none;">
                        <label for="command">Comando Artisan:</label>
                        <input type="text" id="command" name="command" 
                               placeholder="ej: migrate, route:list">
                    </div>

                    <button type="submit" class="btn" <?= !$laravelLoaded ? 'disabled' : '' ?>>
                        Ejecutar
                    </button>
                    <?php if (!$laravelLoaded): ?>
                    <p style="color: #e53e3e; font-size: 12px; margin-top: 5px;">
                        Comandos deshabilitados - Laravel no se cargó correctamente
                    </p>
                    <?php endif; ?>
                </form>
            </div>
        </div>

        <?php if ($error): ?>
            <div class="result error">
                <strong>Error:</strong><br>
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <?php if ($result): ?>
            <div class="card">
                <h3>Resultados de Ejecución</h3>
                <?php foreach ($result as $commandResult): ?>
                    <div class="command-result">
                        <div class="command-header">
                            <span class="<?= $commandResult['success'] ? 'status-success' : 'status-error' ?>">
                                <?= $commandResult['success'] ? '✅' : '❌' ?>
                            </span>
                            <?= htmlspecialchars($commandResult['description'] ?? $commandResult['command']) ?>
                            <span style="font-size: 0.8em; color: #666;">
                                (<?= $commandResult['duration'] ?>, exit: <?= $commandResult['exit_code'] ?>)
                            </span>
                        </div>
                        <?php if (!empty($commandResult['output'])): ?>
                            <div class="command-output">
                                <?= htmlspecialchars($commandResult['output']) ?>
                            </div>
                        <?php endif; ?>
                        <?php if (isset($commandResult['error'])): ?>
                            <div class="result error">
                                Error: <?= htmlspecialchars($commandResult['error']) ?>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="card" style="margin-top: 20px; text-align: center; background: #fff3cd;">
            <p><strong>Eliminar este archivo después del uso:</strong></p>
            <code>rm config_cache.php</code>
        </div>
    </div>

    <script>
        function toggleCustomCommand() {
            const select = document.getElementById('action');
            const customDiv = document.getElementById('custom-command');
            
            if (select.value === 'single_command') {
                customDiv.style.display = 'block';
            } else {
                customDiv.style.display = 'none';
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('secret').focus();
        });

        document.querySelector('form').addEventListener('submit', function(e) {
            const action = document.getElementById('action').value;
            if (action === 'full_reset') {
                if (!confirm('¿Ejecutar reset completo? Esto limpiará y reconstruirá todas las cachés.')) {
                    e.preventDefault();
                }
            }
        });
    </script>
</body>
</html>