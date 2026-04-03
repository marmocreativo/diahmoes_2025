<?php
// Archivo de mantenimiento - Laravel in Nginx
// Solo funciones esenciales para actualizaciones y mantenimiento

// Habilitar reporte de errores
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "<h2>🔍 Iniciando sistema...</h2>";

try {
    echo "1. Cargando autoloader... ";
    require __DIR__.'/../../diahmoes_2025/vendor/autoload.php';
    echo "✅<br>";
    
    echo "2. Cargando bootstrap... ";
    $app = require_once __DIR__.'/../../diahmoes_2025/bootstrap/app.php';
    echo "✅<br>";
    
    echo "3. Capturando Request... ";
    $request = \Illuminate\Http\Request::capture();
    echo "✅<br>";
    
    echo "4. Creando kernel... ";
    $kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
    echo "✅<br>";
    
    echo "5. Inicializando aplicación... ";
    $response = $kernel->handle($request);
    echo "✅<br>";
    
    echo "6. Laravel cargado correctamente!<br><br>";
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; padding: 15px; border: 1px solid #f5c6cb; margin: 10px 0;'>";
    echo "<h3>❌ Error cargando Laravel:</h3>";
    echo "<strong>Mensaje:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<strong>Archivo:</strong> " . htmlspecialchars($e->getFile()) . "<br>";
    echo "<strong>Línea:</strong> " . $e->getLine() . "<br>";
    echo "<strong>Trace:</strong><br><pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    echo "</div>";
    exit;
} catch (Error $e) {
    echo "<div style='background: #f8d7da; padding: 15px; border: 1px solid #f5c6cb; margin: 10px 0;'>";
    echo "<h3>❌ Error Fatal:</h3>";
    echo "<strong>Mensaje:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<strong>Archivo:</strong> " . htmlspecialchars($e->getFile()) . "<br>";
    echo "<strong>Línea:</strong> " . $e->getLine() . "<br>";
    echo "</div>";
    exit;
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Mantenimiento - Laravel Installation</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .btn { display: inline-block; padding: 10px 20px; margin: 10px; background: #007cba; color: white; text-decoration: none; border-radius: 5px; border: none; cursor: pointer; font-size: 14px; }
        .btn:hover { background: #005a87; }
        .output { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #007cba; }
        .error { border-left-color: #dc3545; background: #f8d7da; }
        .success { border-left-color: #28a745; background: #d4edda; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        pre { background: #f1f3f4; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
        .debug-info { background: #e7f3ff; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Laravel Installation - Mantenimiento</h1>
        <p><strong>⚠️ IMPORTANTE:</strong> Este archivo debe eliminarse después de las actualizaciones.</p>
        
        <div class="debug-info">
            <strong>🔍 Herramientas de Mantenimiento</strong><br>
            Solo funciones esenciales para actualizaciones y mantenimiento del sistema.
        </div>

        <h2>🗄️ Base de Datos</h2>
        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="migrate" class="btn">Ejecutar Migraciones</button>
        </form>

        <h2>🚀 Optimización</h2>
        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="cache_clear" class="btn">Limpiar Cache</button>
        </form>

        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="optimize" class="btn">Optimize</button>
        </form>

        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="config_cache" class="btn">Cache Config</button>
        </form>

        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="route_cache" class="btn">Cache Routes</button>
        </form>

        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="route_clear" class="btn">Clear Route Cache</button>
        </form>
        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="storage_link" class="btn">Storage Link</button>
        </form>

        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="storage_link_manual" class="btn">Storage Link Manual</button>
        </form>

        <h2>📊 Diagnósticos</h2>
        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="test_env" class="btn">Test Variables ENV</button>
        </form>

        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="test_db" class="btn">Test Base de Datos</button>
        </form>
        <form method="post" style="display: inline;">
            <button type="submit" name="action" value="test_storage" class="btn">Test Storage Link</button>
        </form>

        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
            $action = $_POST['action'];
            
            echo "<div class='output'>";
            echo "<h3>Ejecutando: " . htmlspecialchars($action) . "</h3>";
            
            try {
                echo "<div class='debug-info'>Iniciando ejecución de comando...</div>";
                
                switch ($action) {
                    case 'migrate':
                        echo "<pre>Ejecutando migraciones...\n";
                        echo "Verificando conexión a DB...\n";
                        \Illuminate\Support\Facades\DB::connection()->getPdo();
                        echo "Conexión OK. Ejecutando migrate...\n";
                        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true, '--verbose' => true]);
                        $output = \Illuminate\Support\Facades\Artisan::output();
                        echo htmlspecialchars($output);
                        echo "\n✅ Migraciones completadas</pre>";
                        break;
                        
                    case 'cache_clear':
                        echo "<pre>";
                        $commands = [
                            'cache:clear' => 'Limpiando cache...',
                            'config:clear' => 'Limpiando config cache...',
                            'route:clear' => 'Limpiando route cache...',
                            'view:clear' => 'Limpiando view cache...'
                        ];
                        
                        foreach ($commands as $cmd => $msg) {
                            echo $msg . "\n";
                            \Illuminate\Support\Facades\Artisan::call($cmd);
                            echo "✅ " . $cmd . " ejecutado\n";
                        }
                        echo "</pre>";
                        break;
                        
                    case 'optimize':
                        echo "<pre>Optimizando aplicación...\n";
                        \Illuminate\Support\Facades\Artisan::call('optimize');
                        $output = \Illuminate\Support\Facades\Artisan::output();
                        echo htmlspecialchars($output);
                        echo "\n✅ Optimización completada</pre>";
                        break;
                        
                    case 'config_cache':
                        echo "<pre>Cacheando configuración...\n";
                        \Illuminate\Support\Facades\Artisan::call('config:cache');
                        $output = \Illuminate\Support\Facades\Artisan::output();
                        echo htmlspecialchars($output);
                        echo "\n✅ Config cache creado</pre>";
                        break;

                    case 'route_clear':
                        echo "<pre>Limpiando cache de rutas...\n";
                        \Illuminate\Support\Facades\Artisan::call('route:clear');
                        $output = \Illuminate\Support\Facades\Artisan::output();
                        echo htmlspecialchars($output);
                        echo "\n✅ Route cache eliminado exitosamente</pre>";
                        break;
                        
                    case 'route_cache':
                        echo "<pre>Cacheando rutas...\n";
                        echo "Paso 1: Limpiando cache anterior...\n";
                        \Illuminate\Support\Facades\Artisan::call('route:clear');
                        echo "✅ Cache anterior eliminado\n\n";
                        
                        echo "Paso 2: Generando nuevo cache de rutas...\n";
                        \Illuminate\Support\Facades\Artisan::call('route:cache');
                        $output = \Illuminate\Support\Facades\Artisan::output();
                        echo htmlspecialchars($output);
                        echo "\n✅ Route cache creado exitosamente</pre>";
                        break;
                        
                    case 'test_db':
                        echo "<pre>Probando conexión a base de datos...\n";
                        $connection = \Illuminate\Support\Facades\DB::connection();
                        $dbname = $connection->getDatabaseName();
                        echo "✅ Conexión exitosa a: $dbname\n";
                        
                        // Verificar si existen tablas
                        $tables = $connection->select("SHOW TABLES");
                        echo "📊 Tablas encontradas: " . count($tables) . "\n";
                        if (count($tables) > 0) {
                            $tableNames = array_map(function($table) {
                                return array_values((array)$table)[0];
                            }, array_slice($tables, 0, 10));
                            echo "Primeras 10 tablas: " . implode(', ', $tableNames) . "\n";
                            if (count($tables) > 10) {
                                echo "... y " . (count($tables) - 10) . " más\n";
                            }
                        } else {
                            echo "❗ No se encontraron tablas. Ejecuta las migraciones.\n";
                        }
                        echo "</pre>";
                        break;

                    case 'storage_link':
                        echo "<pre>Creando enlace simbólico de storage...\n";
                        $link   = '/home2/quarkser/public_html/website_fa4a5b00/storage';
                        $target = '/home2/quarkser/kepler_administrador_2026/storage/app/public';

                        if (is_link($link)) {
                            unlink($link);
                            echo "🗑️ Symlink anterior eliminado\n";
                        } elseif (is_dir($link)) {
                            echo "⚠️ Existe un directorio en esa ruta, no se puede crear el symlink\n";
                            break;
                        }

                        if (symlink($target, $link)) {
                            echo "✅ Symlink creado: $link -> $target\n";
                            // Test
                            $testFile = $target . '/test_storage_link.txt';
                            file_put_contents($testFile, 'Test - ' . date('Y-m-d H:i:s'));
                            echo file_exists($link . '/test_storage_link.txt') 
                                ? "✅ Test: Enlace funciona correctamente\n" 
                                : "⚠️ Test: El enlace no responde\n";
                            @unlink($testFile);
                        } else {
                            echo "❌ No se pudo crear. Error: " . error_get_last()['message'] . "\n";
                        }
                        echo "</pre>";
                        break;
                    case 'test_storage':
                        echo "<pre>🔍 VERIFICACIÓN DE STORAGE LINK\n";
                        echo "===============================\n\n";
                        
                        $publicStoragePath = public_path('storage');
                        $privateStoragePath = storage_path('app/public');
                        
                        echo "RUTAS:\n";
                        echo "   Public storage path:  " . $publicStoragePath . "\n";
                        echo "   Private storage path: " . $privateStoragePath . "\n\n";
                        
                        echo "VERIFICACIONES:\n";
                        
                        // Verificar si el directorio privado existe
                        if (is_dir($privateStoragePath)) {
                            echo "   ✅ Directorio storage/app/public existe\n";
                        } else {
                            echo "   ❌ Directorio storage/app/public NO existe\n";
                            mkdir($privateStoragePath, 0755, true);
                            echo "   🔧 Directorio creado automáticamente\n";
                        }
                        
                        // Verificar el enlace público
                        if (is_link($publicStoragePath)) {
                            $target = readlink($publicStoragePath);
                            echo "   ✅ Enlace simbólico existe\n";
                            echo "   🔗 Apunta a: " . $target . "\n";
                            
                            if ($target === $privateStoragePath) {
                                echo "   ✅ Enlace apunta a la ubicación correcta\n";
                            } else {
                                echo "   ⚠️ Enlace apunta a ubicación incorrecta\n";
                                echo "      Esperado: " . $privateStoragePath . "\n";
                                echo "      Actual:   " . $target . "\n";
                            }
                        } elseif (is_dir($publicStoragePath)) {
                            echo "   ⚠️ Existe directorio en lugar de enlace simbólico\n";
                            echo "   💡 Ejecuta 'Storage Link' para crear el enlace correcto\n";
                        } else {
                            echo "   ❌ No existe enlace ni directorio público\n";
                            echo "   💡 Ejecuta 'Storage Link' para crear el enlace\n";
                        }
                        
                        // Test de escritura
                        echo "\nTEST DE FUNCIONAMIENTO:\n";
                        $testContent = 'Test file - ' . date('Y-m-d H:i:s');
                        $testFile = 'test_storage_' . time() . '.txt';
                        
                        try {
                            // Escribir usando Storage facade
                            \Illuminate\Support\Facades\Storage::disk('public')->put($testFile, $testContent);
                            echo "   ✅ Escritura con Storage::disk('public') exitosa\n";
                            
                            // Verificar acceso público
                            if (file_exists(public_path('storage/' . $testFile))) {
                                echo "   ✅ Archivo accesible públicamente\n";
                                
                                // Limpiar
                                \Illuminate\Support\Facades\Storage::disk('public')->delete($testFile);
                                echo "   🧹 Archivo de prueba eliminado\n";
                            } else {
                                echo "   ❌ Archivo NO accesible públicamente\n";
                            }
                            
                        } catch (\Exception $e) {
                            echo "   ❌ Error en test: " . $e->getMessage() . "\n";
                        }
                        
                        echo "\nURL TESTING:\n";
                        $appUrl = config('app.url');
                        echo "   App URL: " . $appUrl . "\n";
                        echo "   Storage URL: " . $appUrl . "/storage/\n";
                        
                        echo "</pre>";
                        break;
                        
                    case 'test_env':
                        echo "<pre>🔍 VERIFICACIÓN DE VARIABLES ENV\n";
                        echo "=================================\n\n";
                        
                        // Variables de aplicación básicas
                        echo "APLICACIÓN:\n";
                        $appVars = [
                            'APP_NAME' => config('app.name'),
                            'APP_ENV' => config('app.env'),
                            'APP_DEBUG' => config('app.debug') ? 'true' : 'false',
                            'APP_URL' => config('app.url'),
                            'APP_KEY' => config('app.key') ? 'SET' : 'NOT SET',
                        ];
                        
                        foreach ($appVars as $key => $value) {
                            echo sprintf("   %-15s: %s\n", $key, $value ?? 'NOT SET');
                        }
                        
                        // Variables de base de datos
                        echo "\nBASE DE DATOS:\n";
                        $dbVars = [
                            'DB_CONNECTION' => config('database.default'),
                            'DB_HOST' => config('database.connections.mysql.host'),
                            'DB_PORT' => config('database.connections.mysql.port'),
                            'DB_DATABASE' => config('database.connections.mysql.database'),
                            'DB_USERNAME' => config('database.connections.mysql.username'),
                            'DB_PASSWORD' => config('database.connections.mysql.password'),
                        ];
                        
                        foreach ($dbVars as $key => $value) {
                            echo sprintf("   %-15s: %s\n", $key, $value ?? 'NOT SET');
                        }
                        
                        // Variables de STRIPE
                        echo "\nSTRIPE CONFIGURATION:\n";

                        // Debug: mostrar valores raw primero
                        echo "\nDEBUG - Valores raw:\n";
                        echo "   env('VITE_STRIPE_PUBLIC_KEY'): " . (env('VITE_STRIPE_PUBLIC_KEY') ?: 'NULL') . "\n";
                        echo "   config('services.stripe.key'): " . (config('services.stripe.key') ?: 'NULL') . "\n";
                        echo "   config('services.stripe.secret'): " . (config('services.stripe.secret') ? 'SET (' . substr(config('services.stripe.secret'), 0, 15) . '...)' : 'NULL') . "\n";
                        echo "   config('services.stripe.webhook.secret'): " . (config('services.stripe.webhook.secret') ? 'SET (' . substr(config('services.stripe.webhook.secret'), 0, 10) . '...)' : 'NULL') . "\n\n";

                        $stripeVars = [
                            'STRIPE_KEY (public)' => config('services.stripe.key') ? 
                                (str_starts_with(config('services.stripe.key'), 'pk_live_') ? '✅ LIVE KEY SET' : 
                                (str_starts_with(config('services.stripe.key'), 'pk_test_') ? '🧪 TEST KEY SET' : 'INVALID KEY')) 
                                : 'NOT SET',
                            'STRIPE_SECRET' => config('services.stripe.secret') ? 
                                (str_starts_with(config('services.stripe.secret'), 'sk_live_') ? '✅ LIVE SECRET SET' : 
                                (str_starts_with(config('services.stripe.secret'), 'sk_test_') ? '🧪 TEST SECRET SET' : 'INVALID SECRET')) 
                                : 'NOT SET',
                            'STRIPE_WEBHOOK_SECRET' => config('services.stripe.webhook.secret') ? 
                                (str_starts_with(config('services.stripe.webhook.secret'), 'whsec_') ? 'SET' : 'INVALID WEBHOOK SECRET') 
                                : 'NOT SET',
                            'VITE_STRIPE_PUBLIC_KEY' => config('services.stripe.vite_public_key') ?
                                (str_starts_with(env('VITE_STRIPE_PUBLIC_KEY'), 'pk_live_') ? '✅ LIVE VITE KEY SET' : 
                                (str_starts_with(env('VITE_STRIPE_PUBLIC_KEY'), 'pk_test_') ? '🧪 TEST VITE KEY SET' : 'INVALID VITE KEY')) 
                                : 'NOT SET',
                        ];

                        foreach ($stripeVars as $key => $value) {
                            echo sprintf("   %-25s: %s\n", $key, $value);
                        }
                        
                        // Variables de storage
                        echo "\nSTORAGE:\n";
                        $storageVars = [
                            'FILESYSTEM_DISK (env)' => env('FILESYSTEM_DISK', 'NOT SET'),
                            'FILESYSTEM_DISK (config)' => config('filesystems.default'),
                            'PUBLIC_ROOT' => config('filesystems.disks.public.root'),
                        ];
                        
                        foreach ($storageVars as $key => $value) {
                            echo sprintf("   %-25s: %s\n", $key, $value ?? 'NOT SET');
                        }
                        
                        // Verificación específica
                        $envDisk = env('FILESYSTEM_DISK');
                        $configDisk = config('filesystems.default');
                        
                        echo "\nVERIFICACIONES:\n";
                        
                        // Storage verification
                        if ($envDisk === $configDisk) {
                            echo "   ✅ FILESYSTEM_DISK: env y config coinciden ($envDisk)\n";
                        } else {
                            echo "   ⚠️ FILESYSTEM_DISK: diferencia detectada\n";
                            echo "      .env: " . ($envDisk ?? 'NOT SET') . "\n";
                            echo "      config: " . ($configDisk ?? 'NOT SET') . "\n";
                            echo "   🔧 Ejecutar 'Cache Config' para aplicar cambios\n";
                        }
                        
                        // APP_KEY verification
                        if (!config('app.key')) {
                            echo "   ⚠️ APP_KEY no está configurada\n";
                        } else {
                            echo "   ✅ APP_KEY configurada\n";
                        }
                        
                        // Stripe environment consistency check
                        $stripePublic = config('services.stripe.key');
                        $stripeSecret = config('services.stripe.secret');
                        $viteStripe = env('VITE_STRIPE_PUBLIC_KEY');
                        
                        if ($stripePublic && $stripeSecret) {
                            $publicIsLive = str_starts_with($stripePublic, 'pk_live_');
                            $secretIsLive = str_starts_with($stripeSecret, 'sk_live_');
                            $viteIsLive = $viteStripe ? str_starts_with($viteStripe, 'pk_live_') : false;
                            
                            if ($publicIsLive === $secretIsLive) {
                                $environment = $publicIsLive ? 'LIVE' : 'TEST';
                                echo "   ✅ STRIPE: Todas las keys están en modo $environment\n";
                                
                                // Check VITE key consistency
                                if ($viteStripe) {
                                    if ($publicIsLive === $viteIsLive) {
                                        echo "   ✅ STRIPE VITE: Key consistente con ambiente $environment\n";
                                    } else {
                                        echo "   ⚠️ STRIPE VITE: Key no coincide con el ambiente principal\n";
                                    }
                                } else {
                                    echo "   ⚠️ VITE_STRIPE_PUBLIC_KEY no configurada\n";
                                }
                            } else {
                                echo "   ⚠️ STRIPE: Inconsistencia - public y secret keys en diferentes ambientes\n";
                            }
                        } else {
                            echo "   ⚠️ STRIPE: Keys faltantes\n";
                        }
                        
                        // Environment recommendation
                        $appEnv = config('app.env');
                        if ($appEnv === 'production' && $stripePublic && !str_starts_with($stripePublic, 'pk_live_')) {
                            echo "   ⚠️ ADVERTENCIA: APP_ENV=production pero usando keys de TEST\n";
                        } elseif ($appEnv !== 'production' && $stripePublic && str_starts_with($stripePublic, 'pk_live_')) {
                            echo "   ⚠️ ADVERTENCIA: APP_ENV=$appEnv pero usando keys de LIVE\n";
                        }
                        
                        echo "</pre>";
                        break;
                        
                    default:
                        echo "<p class='error'>Acción no reconocida.</p>";
                }
                
            } catch (Exception $e) {
                echo "<div class='error'>";
                echo "<h3>❌ Error ejecutando: " . htmlspecialchars($action) . "</h3>";
                echo "<strong>Mensaje:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
                echo "<strong>Archivo:</strong> " . htmlspecialchars($e->getFile()) . "<br>";
                echo "<strong>Línea:</strong> " . $e->getLine() . "<br>";
                echo "<details><summary>Ver stack trace completo</summary>";
                echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
                echo "</details>";
                echo "</div>";
            } catch (Error $e) {
                echo "<div class='error'>";
                echo "<h3>❌ Error Fatal ejecutando: " . htmlspecialchars($action) . "</h3>";
                echo "<strong>Mensaje:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
                echo "<strong>Archivo:</strong> " . htmlspecialchars($e->getFile()) . "<br>";
                echo "<strong>Línea:</strong> " . $e->getLine() . "<br>";
                echo "</div>";
            }
            
            echo "</div>";
        }
        ?>
        
        <hr>
        <div class="debug-info">
            <strong>📍 Información del Sistema:</strong><br>
            Ruta del sistema: <?php echo realpath(__DIR__ . '/../system'); ?><br>
            PHP Version: <?php echo PHP_VERSION; ?><br>
            Request URL: <?php echo $_SERVER['REQUEST_URI'] ?? 'No disponible'; ?><br>
            Server Name: <?php echo $_SERVER['SERVER_NAME'] ?? 'No disponible'; ?><br>
            Memory Usage: <?php echo round(memory_get_usage() / 1024 / 1024, 2); ?> MB<br>
            <strong>🗑️ RECUERDA:</strong> Eliminar este archivo después de las actualizaciones
        </div>
    </div>
</body>
</html>