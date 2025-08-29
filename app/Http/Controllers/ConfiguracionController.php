<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;

class ConfiguracionController extends Controller
{
    /**
     * Mostrar la página principal de configuración
     */
    public function index()
    {
        \Log::info('📄 Cargando página de configuración');
        
        try {
            return Inertia::render('Configuracion/Index', [
                'database_info' => $this->getDatabaseInfo(),
                'mail_config' => $this->getMailConfig(),
                'last_backup' => $this->getLastBackupInfo()
            ]);
        } catch (\Throwable $e) {
            \Log::error('💥 Error cargando configuración', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            throw $e;
        }
    }

    /**
     * Método de prueba simple para verificar conectividad
     */
    public function test(Request $request)
    {
        \Log::info('🧪 Test endpoint llamado', [
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'input' => $request->all()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Endpoint funcionando correctamente',
            'timestamp' => now()->toISOString(),
            'method' => $request->method(),
            'url' => $request->url()
        ]);
    }

    /**
     * Ejecutar migraciones de la base de datos
     */
    public function runMigrations(Request $request)
    {
        \Log::info('🚀 Iniciando runMigrations', [
            'method' => $request->method(),
            'url' => $request->url(),
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip()
        ]);

        try {
            \Log::info('📊 Verificando estado de migraciones...');
            
            // Verificar conexión a base de datos
            try {
                DB::connection()->getPdo();
                \Log::info('✅ Conexión a BD exitosa');
            } catch (\Exception $e) {
                \Log::error('❌ Error conexión BD: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Error de conexión a la base de datos.',
                    'error' => $e->getMessage()
                ], 500);
            }

            // Obtener migraciones pendientes con logs
            \Log::info('📋 Obteniendo migraciones pendientes...');
            $pendingMigrations = $this->getPendingMigrations();
            \Log::info('📋 Migraciones pendientes encontradas: ' . count($pendingMigrations), $pendingMigrations);
            
            if (empty($pendingMigrations)) {
                \Log::info('✅ No hay migraciones pendientes');
                return response()->json([
                    'success' => true,
                    'message' => 'No hay migraciones pendientes por ejecutar.',
                    'details' => 'La base de datos está actualizada.',
                    'migrated_count' => 0
                ]);
            }

            \Log::info('⚡ Ejecutando comando migrate...');
            
            // Ejecutar migraciones
            $exitCode = Artisan::call('migrate', [
                '--force' => true,
                '--no-interaction' => true,
                '--verbose' => true
            ]);

            $output = Artisan::output();
            
            \Log::info('📤 Resultado del comando migrate', [
                'exit_code' => $exitCode,
                'output' => $output
            ]);

            if ($exitCode === 0) {
                \Log::info('✅ Migraciones ejecutadas exitosamente');
                return response()->json([
                    'success' => true,
                    'message' => 'Migraciones ejecutadas exitosamente.',
                    'details' => $output ?: 'Migraciones completadas sin problemas.',
                    'migrated_count' => count($pendingMigrations),
                    'exit_code' => $exitCode
                ]);
            } else {
                \Log::error('❌ Error en migraciones, código de salida: ' . $exitCode);
                return response()->json([
                    'success' => false,
                    'message' => 'Error al ejecutar migraciones.',
                    'error' => 'Exit code: ' . $exitCode,
                    'details' => $output,
                    'exit_code' => $exitCode
                ], 500);
            }

        } catch (\Throwable $e) {
            \Log::error('💥 Excepción en runMigrations', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno al ejecutar migraciones.',
                'error' => $e->getMessage(),
                'details' => 'Error en línea ' . $e->getLine() . ' de ' . basename($e->getFile()),
                'debug_info' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Generar y descargar respaldo de la base de datos
     */
    public function downloadBackup()
    {
        try {
            \Log::info('📦 Iniciando creación de respaldo...');
            
            $filename = $this->createBackup();
            
            if (!$filename) {
                \Log::error('❌ No se pudo crear el respaldo');
                return response()->json([
                    'success' => false,
                    'message' => 'Error al crear el respaldo.'
                ], 500);
            }

            $filePath = storage_path('app/backups/' . $filename);
            \Log::info('📦 Respaldo creado: ' . $filePath);
            
            if (!file_exists($filePath)) {
                \Log::error('❌ Archivo de respaldo no existe: ' . $filePath);
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo de respaldo no fue creado correctamente.'
                ], 500);
            }

            return response()->download($filePath, $filename)->deleteFileAfterSend(false);

        } catch (\Throwable $e) {
            \Log::error('💥 Error generando respaldo', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar respaldo.',
                'error' => $e->getMessage(),
                'debug_info' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'mysqldump_available' => $this->checkMysqldumpAvailable()
                ]
            ], 500);
        }
    }

    /**
     * Probar configuración SMTP sin enviar correo
     */
    public function testMailConfig(Request $request)
    {
        try {
            \Log::info('📧 Probando configuración SMTP...');
            
            // Obtener configuración actual
            $config = [
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'), 
                'username' => config('mail.mailers.smtp.username'),
                'encryption' => config('mail.mailers.smtp.encryption'),
                'from_address' => config('mail.from.address'),
                'from_name' => config('mail.from.name')
            ];
            
            \Log::info('📧 Configuración actual:', $config);
            
            // Probar conexión SMTP
            $errors = [];
            $warnings = [];
            
            // Verificar que los valores requeridos estén configurados
            if (empty($config['host'])) {
                $errors[] = 'MAIL_HOST no está configurado';
            }
            
            if (empty($config['username'])) {
                $errors[] = 'MAIL_USERNAME no está configurado';
            }
            
            if (empty($config['from_address'])) {
                $errors[] = 'MAIL_FROM_ADDRESS no está configurado';
            }
            
            // Verificar configuración del puerto y encriptación
            if ($config['port'] == 465 && $config['encryption'] !== 'ssl') {
                $warnings[] = 'Puerto 465 generalmente requiere SSL encryption';
            }
            
            if ($config['port'] == 587 && !in_array($config['encryption'], ['tls', 'starttls'])) {
                $warnings[] = 'Puerto 587 generalmente requiere TLS encryption';
            }
            
            if (!empty($errors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores en la configuración de correo',
                    'errors' => $errors,
                    'warnings' => $warnings,
                    'config' => $config
                ], 400);
            }
            
            // Intentar crear conexión SMTP
            try {
                $transport = new \Swift_SmtpTransport($config['host'], $config['port']);
                $transport->setUsername($config['username']);
                $transport->setPassword(config('mail.mailers.smtp.password'));
                
                if ($config['encryption']) {
                    $transport->setEncryption($config['encryption']);
                }
                
                // Probar conexión
                $transport->start();
                $transport->stop();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Configuración SMTP válida - conexión exitosa',
                    'config' => $config,
                    'warnings' => $warnings,
                    'details' => 'La conexión al servidor SMTP fue establecida correctamente'
                ]);
                
            } catch (\Swift_TransportException $e) {
                \Log::error('❌ Error de transporte SMTP: ' . $e->getMessage());
                
                return response()->json([
                    'success' => false,
                    'message' => 'Error de conexión SMTP',
                    'error' => $e->getMessage(),
                    'config' => $config,
                    'suggestions' => $this->getSMTPTroubleshootingSuggestions($e->getMessage())
                ], 500);
            }
            
        } catch (\Throwable $e) {
            \Log::error('💥 Error probando configuración SMTP', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno al probar configuración',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Realizar prueba de envío de correos con diagnósticos
     */
    public function testEmail(Request $request)
    {
        $request->validate([
            'test_email' => 'required|email',
            'include_diagnostics' => 'boolean'
        ]);

        try {
            \Log::info('📧 Iniciando prueba de correo...');
            
            $testEmail = $request->test_email;
            $includeDiagnostics = $request->boolean('include_diagnostics', false);
            
            $diagnostics = [];
            
            if ($includeDiagnostics) {
                // Recopilar información de diagnóstico
                $diagnostics = [
                    'mail_config' => [
                        'mailer' => config('mail.default'),
                        'host' => config('mail.mailers.smtp.host'),
                        'port' => config('mail.mailers.smtp.port'),
                        'encryption' => config('mail.mailers.smtp.encryption'),
                        'from_address' => config('mail.from.address'),
                        'from_name' => config('mail.from.name')
                    ],
                    'php_info' => [
                        'openssl_loaded' => extension_loaded('openssl'),
                        'curl_loaded' => extension_loaded('curl'),
                        'allow_url_fopen' => ini_get('allow_url_fopen'),
                    ],
                    'dns_check' => $this->checkDNS(config('mail.mailers.smtp.host'))
                ];
                
                \Log::info('📧 Diagnósticos recopilados:', $diagnostics);
            }
            
            // Intentar envío
            $startTime = microtime(true);
            
            Mail::raw(
                'Este es un correo de prueba del sistema DIAHMOES enviado el ' . now()->format('Y-m-d H:i:s') . 
                "\n\nSi recibes este mensaje, la configuración de correo funciona correctamente." .
                ($includeDiagnostics ? "\n\nInformación técnica incluida en los logs del servidor." : ''),
                function ($message) use ($testEmail) {
                    $message->to($testEmail)
                            ->subject('Prueba de Correo - Sistema DIAHMOES - ' . now()->format('H:i:s'))
                            ->from(config('mail.from.address'), config('mail.from.name'));
                }
            );
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            \Log::info('✅ Correo enviado exitosamente en ' . $duration . 'ms');

            return response()->json([
                'success' => true,
                'message' => 'Correo de prueba enviado exitosamente.',
                'details' => "Correo enviado a: {$testEmail}",
                'sent_to' => $testEmail,
                'duration_ms' => $duration,
                'diagnostics' => $diagnostics
            ]);

        } catch (\Throwable $e) {
            \Log::error('💥 Error enviando correo de prueba', [
                'email' => $request->test_email,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar correo de prueba.',
                'error' => $e->getMessage(),
                'suggestions' => $this->getEmailTroubleshootingSuggestions($e->getMessage()),
                'diagnostics' => $diagnostics ?? []
            ], 500);
        }
    }

    private function getSMTPTroubleshootingSuggestions($errorMessage)
    {
        $suggestions = [];
        
        if (stripos($errorMessage, 'connection refused') !== false) {
            $suggestions[] = 'Verificar que el puerto SMTP esté abierto (465 para SSL, 587 para TLS)';
            $suggestions[] = 'Confirmar que el host del servidor sea correcto';
        }
        
        if (stripos($errorMessage, 'authentication failed') !== false) {
            $suggestions[] = 'Verificar usuario y contraseña SMTP';
            $suggestions[] = 'Comprobar que la cuenta esté habilitada para SMTP';
        }
        
        if (stripos($errorMessage, 'certificate') !== false || stripos($errorMessage, 'ssl') !== false) {
            $suggestions[] = 'Verificar configuración SSL/TLS';
            $suggestions[] = 'Probar con verify_peer=false en desarrollo';
        }
        
        if (stripos($errorMessage, 'timeout') !== false) {
            $suggestions[] = 'El servidor puede estar lento o no responder';
            $suggestions[] = 'Verificar configuración de firewall';
        }
        
        return $suggestions;
    }
    
    private function getEmailTroubleshootingSuggestions($errorMessage)
    {
        $suggestions = [];
        
        if (stripos($errorMessage, 'could not instantiate mail function') !== false) {
            $suggestions[] = 'PHP mail() no está disponible, usar SMTP en su lugar';
        }
        
        if (stripos($errorMessage, 'stream_socket_enable_crypto') !== false) {
            $suggestions[] = 'Problema con certificados SSL/TLS';
            $suggestions[] = 'Verificar extensión OpenSSL en PHP';
        }
        
        return $suggestions;
    }
    
    private function checkDNS($hostname)
    {
        if (empty($hostname)) {
            return ['error' => 'No hostname provided'];
        }
        
        try {
            $ip = gethostbyname($hostname);
            return [
                'hostname' => $hostname,
                'resolved_ip' => $ip !== $hostname ? $ip : null,
                'can_resolve' => $ip !== $hostname
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Métodos auxiliares privados
     */

    private function getDatabaseInfo()
    {
        try {
            return [
                'connection' => config('database.default'),
                'database' => config('database.connections.' . config('database.default') . '.database'),
                'host' => config('database.connections.' . config('database.default') . '.host'),
                'tables_count' => DB::select('SHOW TABLES') ? count(DB::select('SHOW TABLES')) : 0,
                'last_migration' => $this->getLastMigration()
            ];
        } catch (Exception $e) {
            return [
                'error' => 'No se pudo obtener información de la base de datos: ' . $e->getMessage()
            ];
        }
    }

    private function getMailConfig()
    {
        return [
            'mailer' => config('mail.default'),
            'host' => config('mail.mailers.smtp.host'),
            'port' => config('mail.mailers.smtp.port'),
            'from_address' => config('mail.from.address'),
            'from_name' => config('mail.from.name')
        ];
    }

    private function getLastBackupInfo()
    {
        $backupPath = storage_path('app/backups');
        
        if (!is_dir($backupPath)) {
            return null;
        }

        // Buscar archivos .sql y .sql.gz
        $sqlFiles = glob($backupPath . '/*.sql');
        $gzFiles = glob($backupPath . '/*.sql.gz');
        $files = array_merge($sqlFiles, $gzFiles);
        
        if (empty($files)) {
            return null;
        }

        $lastFile = array_reduce($files, function ($a, $b) {
            return filemtime($a) > filemtime($b) ? $a : $b;
        });

        return [
            'filename' => basename($lastFile),
            'date' => Carbon::createFromTimestamp(filemtime($lastFile))->format('Y-m-d H:i:s'),
            'size' => $this->formatBytes(filesize($lastFile)),
            'type' => pathinfo($lastFile, PATHINFO_EXTENSION) === 'gz' ? 'Comprimido (gzip)' : 'SQL sin comprimir'
        ];
    }

    private function getPendingMigrations()
    {
        \Log::info('🔍 Iniciando getPendingMigrations');
        
        try {
            // Verificar si la tabla migrations existe
            \Log::info('📋 Verificando si tabla migrations existe...');
            $migrationsTableExists = DB::getSchemaBuilder()->hasTable('migrations');
            \Log::info('📋 Tabla migrations existe: ' . ($migrationsTableExists ? 'SÍ' : 'NO'));
            
            if (!$migrationsTableExists) {
                \Log::info('📁 Tabla migrations no existe, buscando archivos de migración...');
                // Si no existe la tabla migrations, todas las migraciones están pendientes
                $migrationFiles = glob(database_path('migrations/*.php'));
                \Log::info('📁 Archivos de migración encontrados: ' . count($migrationFiles), $migrationFiles);
                return array_map('basename', $migrationFiles);
            }

            // Obtener migraciones ejecutadas
            \Log::info('📊 Obteniendo migraciones ejecutadas desde BD...');
            $ranMigrations = DB::table('migrations')
                ->pluck('migration')
                ->toArray();
            \Log::info('📊 Migraciones ejecutadas: ' . count($ranMigrations), $ranMigrations);

            // Obtener todos los archivos de migración
            \Log::info('📁 Obteniendo archivos de migración del filesystem...');
            $migrationFiles = glob(database_path('migrations/*.php'));
            \Log::info('📁 Archivos encontrados: ' . count($migrationFiles));
            
            $allMigrations = [];
            foreach ($migrationFiles as $file) {
                $filename = pathinfo($file, PATHINFO_FILENAME);
                $allMigrations[] = $filename;
            }
            \Log::info('📁 Nombres de migración extraídos: ' . count($allMigrations), $allMigrations);

            // Encontrar migraciones pendientes
            $pending = array_diff($allMigrations, $ranMigrations);
            \Log::info('⏳ Migraciones pendientes calculadas: ' . count($pending), array_values($pending));
            
            return array_values($pending);

        } catch (\Throwable $e) {
            \Log::error('💥 Error en getPendingMigrations', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // En caso de error, intentar usar el comando artisan
            \Log::info('🔄 Intentando fallback con migrate:status...');
            try {
                $exitCode = Artisan::call('migrate:status');
                \Log::info('📊 migrate:status exit code: ' . $exitCode);
                
                if ($exitCode === 0) {
                    $output = Artisan::output();
                    \Log::info('📊 migrate:status output: ' . $output);
                    
                    // Parsear output para encontrar migraciones pendientes
                    $lines = explode("\n", $output);
                    $pending = [];
                    
                    foreach ($lines as $line) {
                        $trimmedLine = trim($line);
                        // Buscar líneas que empiecen con "No" (migraciones no ejecutadas)
                        if (preg_match('/^\s*No\s+(.+)$/', $trimmedLine, $matches)) {
                            $pending[] = trim($matches[1]);
                        }
                    }
                    
                    \Log::info('🔄 Pendientes desde migrate:status: ' . count($pending), $pending);
                    return $pending;
                }
            } catch (\Throwable $e2) {
                \Log::error('💥 Error adicional en fallback migrate:status', [
                    'message' => $e2->getMessage(),
                    'file' => $e2->getFile(),
                    'line' => $e2->getLine()
                ]);
            }
            
            \Log::warning('⚠️ Retornando array vacío por errores');
            return [];
        }
    }

    private function getLastMigration()
    {
        try {
            $lastMigration = DB::table('migrations')
                ->orderBy('id', 'desc')
                ->first();
            
            return $lastMigration ? $lastMigration->migration : 'No migrations found';
        } catch (Exception $e) {
            return 'Error: ' . $e->getMessage();
        }
    }

    private function createBackup($prefix = '')
    {
        try {
            \Log::info('🔧 Iniciando createBackup con prefijo: ' . $prefix);
            
            // Crear directorio de respaldos si no existe
            $backupPath = storage_path('app/backups');
            if (!is_dir($backupPath)) {
                \Log::info('📁 Creando directorio: ' . $backupPath);
                mkdir($backupPath, 0755, true);
            }

            // Cambiar extensión a .sql.gz para compresión
            $filename = $prefix . 'backup_' . Carbon::now()->format('Y_m_d_H_i_s') . '.sql.gz';
            $filePath = $backupPath . '/' . $filename;
            \Log::info('📄 Archivo de destino: ' . $filePath);

            // Intentar mysqldump primero
            if ($this->checkMysqldumpAvailable()) {
                \Log::info('🔧 Usando mysqldump con compresión...');
                if ($this->createBackupWithMysqldump($filePath)) {
                    \Log::info('✅ Respaldo creado con mysqldump');
                    return $filename;
                }
            }

            // Fallback a método PHP puro con compresión
            \Log::info('🔧 Usando método PHP puro con compresión...');
            $this->createBackupWithPHP($filePath);
            
            \Log::info('✅ Respaldo comprimido creado con PHP: ' . $this->formatBytes(filesize($filePath)));
            return $filename;

        } catch (\Throwable $e) {
            \Log::error('💥 Error en createBackup', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            throw new \Exception('Error creando respaldo: ' . $e->getMessage());
        }
    }

    private function checkMysqldumpAvailable()
    {
        try {
            $result = null;
            $output = [];
            exec('mysqldump --version 2>&1', $output, $result);
            return $result === 0;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function createBackupWithMysqldump($filePath)
    {
        try {
            $database = config('database.connections.' . config('database.default') . '.database');
            $username = config('database.connections.' . config('database.default') . '.username');
            $password = config('database.connections.' . config('database.default') . '.password');
            $host = config('database.connections.' . config('database.default') . '.host');
            $port = config('database.connections.' . config('database.default') . '.port', 3306);

            // Comando mysqldump con compresión gzip
            $command = sprintf(
                'mysqldump -h %s -P %s -u %s --password=%s --single-transaction --routines --triggers %s | gzip > %s 2>&1',
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($database),
                escapeshellarg($filePath)
            );

            \Log::info('🔧 Ejecutando comando mysqldump con gzip...');
            exec($command, $output, $return_var);

            if ($return_var !== 0) {
                \Log::error('❌ mysqldump con gzip falló: ' . implode("\n", $output));
                return false;
            }

            $success = file_exists($filePath) && filesize($filePath) > 0;
            if ($success) {
                \Log::info('✅ mysqldump+gzip exitoso, tamaño: ' . $this->formatBytes(filesize($filePath)));
            }
            
            return $success;

        } catch (\Exception $e) {
            \Log::error('💥 Error en mysqldump+gzip: ' . $e->getMessage());
            return false;
        }
    }

    private function createBackupWithPHP($filePath)
    {
        try {
            \Log::info('🔧 Generando respaldo con PHP + gzip...');
            
            $database = config('database.connections.' . config('database.default') . '.database');
            
            // Abrir archivo comprimido para escritura
            $file = gzopen($filePath, 'wb9'); // wb9 = máxima compresión
            if (!$file) {
                throw new \Exception('No se pudo crear el archivo comprimido: ' . $filePath);
            }

            // Header del archivo SQL
            gzwrite($file, "-- Respaldo generado por DIAHMOES (Comprimido con gzip)\n");
            gzwrite($file, "-- Fecha: " . date('Y-m-d H:i:s') . "\n");
            gzwrite($file, "-- Base de datos: " . $database . "\n\n");
            gzwrite($file, "SET FOREIGN_KEY_CHECKS=0;\n");
            gzwrite($file, "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n");
            gzwrite($file, "START TRANSACTION;\n\n");

            // Obtener todas las tablas
            $tables = DB::select('SHOW TABLES');
            $tablesArray = [];
            foreach ($tables as $table) {
                $tableArray = (array) $table;
                $tablesArray[] = reset($tableArray);
            }

            \Log::info('📊 Tablas encontradas: ' . count($tablesArray));

            $totalRows = 0;
            foreach ($tablesArray as $table) {
                \Log::info('📋 Procesando tabla: ' . $table);
                
                // Estructura de la tabla
                $createTable = DB::select("SHOW CREATE TABLE `{$table}`");
                if (!empty($createTable)) {
                    $createSQL = $createTable[0]->{'Create Table'};
                    gzwrite($file, "\n-- Estructura de tabla para la tabla `{$table}`\n");
                    gzwrite($file, "DROP TABLE IF EXISTS `{$table}`;\n");
                    gzwrite($file, $createSQL . ";\n\n");
                }

                // Datos de la tabla (procesamiento en chunks para tablas grandes)
                $rowCount = DB::table($table)->count();
                if ($rowCount > 0) {
                    \Log::info('📊 Exportando ' . $rowCount . ' filas de la tabla: ' . $table);
                    gzwrite($file, "-- Volcado de datos para la tabla `{$table}` ({$rowCount} filas)\n");
                    
                    $chunkSize = 1000; // Procesar de 1000 en 1000 registros
                    $chunks = ceil($rowCount / $chunkSize);
                    
                    for ($chunk = 0; $chunk < $chunks; $chunk++) {
                        $offset = $chunk * $chunkSize;
                        $rows = DB::table($table)->offset($offset)->limit($chunkSize)->get();
                        
                        if ($rows->count() > 0) {
                            gzwrite($file, "INSERT INTO `{$table}` VALUES ");
                            
                            $first = true;
                            foreach ($rows as $row) {
                                if (!$first) {
                                    gzwrite($file, ",\n");
                                }
                                $first = false;
                                
                                $values = [];
                                foreach ((array)$row as $value) {
                                    if ($value === null) {
                                        $values[] = 'NULL';
                                    } else {
                                        // Escapar caracteres especiales
                                        $escaped = str_replace(
                                            ["\\", "'", "\r", "\n", "\t"],
                                            ["\\\\", "\\'", "\\r", "\\n", "\\t"],
                                            $value
                                        );
                                        $values[] = "'" . $escaped . "'";
                                    }
                                }
                                gzwrite($file, '(' . implode(',', $values) . ')');
                                $totalRows++;
                            }
                            gzwrite($file, ";\n\n");
                        }
                    }
                }
            }

            // Footer
            gzwrite($file, "SET FOREIGN_KEY_CHECKS=1;\n");
            gzwrite($file, "COMMIT;\n");
            gzwrite($file, "\n-- Respaldo completado\n");
            gzwrite($file, "-- Total de filas exportadas: " . $totalRows . "\n");
            gzwrite($file, "-- Tablas procesadas: " . count($tablesArray) . "\n");
            
            gzclose($file);
            
            $fileSize = filesize($filePath);
            \Log::info('✅ Respaldo PHP+gzip completado');
            \Log::info('📊 Estadísticas: ' . $totalRows . ' filas, ' . count($tablesArray) . ' tablas');
            \Log::info('💾 Tamaño comprimido: ' . $this->formatBytes($fileSize));

        } catch (\Throwable $e) {
            if (isset($file) && is_resource($file)) {
                gzclose($file);
            }
            \Log::error('💥 Error en createBackupWithPHP+gzip: ' . $e->getMessage());
            throw $e;
        }
    }

    private function isValidSqlFile($content)
    {
        // Verificar que contenga comandos SQL básicos
        $sqlKeywords = ['CREATE', 'INSERT', 'DROP', 'ALTER', 'UPDATE'];
        $foundKeywords = 0;

        foreach ($sqlKeywords as $keyword) {
            if (stripos($content, $keyword) !== false) {
                $foundKeywords++;
            }
        }

        return $foundKeywords >= 2; // Al menos 2 palabras clave SQL
    }

    private function executeSqlRestore($sqlContent, $mode = 'replace')
    {
        try {
            \Log::info('🔄 Iniciando restauración en modo: ' . $mode);
            
            // Limpiar el contenido SQL para evitar problemas
            $sqlContent = $this->cleanSqlContent($sqlContent);
            
            // Dividir el contenido en statements individuales
            $statements = $this->parseSqlStatements($sqlContent);
            
            \Log::info('📊 Statements encontrados: ' . count($statements));

            DB::beginTransaction();

            $processedStatements = 0;
            $skippedStatements = 0;
            $errors = [];

            foreach ($statements as $statement) {
                if (empty(trim($statement))) {
                    continue;
                }

                try {
                    // Si es modo replace, modificar CREATE TABLE statements
                    if ($mode === 'replace' && stripos($statement, 'CREATE TABLE') !== false) {
                        // Cambiar CREATE TABLE por CREATE TABLE IF NOT EXISTS y DROP IF EXISTS
                        if (preg_match('/CREATE TABLE `([^`]+)`/', $statement, $matches)) {
                            $tableName = $matches[1];
                            \Log::info('📋 Procesando tabla: ' . $tableName);
                            
                            // Primero, hacer DROP TABLE IF EXISTS
                            DB::unprepared("DROP TABLE IF EXISTS `{$tableName}`");
                            \Log::info('🗑️ Tabla eliminada si existía: ' . $tableName);
                        }
                    }
                    
                    // Ejecutar el statement
                    DB::unprepared($statement);
                    $processedStatements++;
                    
                } catch (\Exception $e) {
                    $error = [
                        'statement' => substr($statement, 0, 100) . '...',
                        'error' => $e->getMessage()
                    ];
                    
                    \Log::warning('⚠️ Error en statement: ' . $e->getMessage());
                    
                    // Si es un error crítico, abortar
                    if (stripos($e->getMessage(), 'syntax error') !== false || 
                        stripos($e->getMessage(), 'access denied') !== false) {
                        $errors[] = $error;
                        throw $e;
                    }
                    
                    // Si es un error menor (tabla ya existe, etc.), continuar
                    $errors[] = $error;
                    $skippedStatements++;
                    continue;
                }
            }

            DB::commit();
            
            \Log::info('✅ Restauración completada');
            \Log::info('📊 Statements procesados: ' . $processedStatements);
            \Log::info('⏭️ Statements omitidos: ' . $skippedStatements);
            
            if (!empty($errors)) {
                \Log::info('⚠️ Errores menores encontrados: ' . count($errors));
            }

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('💥 Error en restauración: ' . $e->getMessage());
            throw new \Exception('Error ejecutando restauración: ' . $e->getMessage());
        }
    }

    private function cleanSqlContent($sqlContent)
    {
        // Remover comentarios de una línea que empiecen con --
        $sqlContent = preg_replace('/^--.*$/m', '', $sqlContent);
        
        // Remover comentarios multi-línea /* ... */
        $sqlContent = preg_replace('/\/\*.*?\*\//s', '', $sqlContent);
        
        // Remover líneas vacías múltiples
        $sqlContent = preg_replace('/\n\s*\n/', "\n", $sqlContent);
        
        // Remover comandos específicos de mysqldump que pueden causar problemas
        $problematicCommands = [
            '/^SET @@SESSION\.sql_mode.*$/m',
            '/^SET @@session\.sql_mode.*$/m',
            '/^SET NAMES.*$/m',
            '/^SET character_set_client.*$/m',
            '/^SET character_set_results.*$/m',
            '/^SET collation_connection.*$/m',
            '/^\/\*![0-9]+ SET.*?\*\/;?/m'
        ];
        
        foreach ($problematicCommands as $pattern) {
            $sqlContent = preg_replace($pattern, '', $sqlContent);
        }
        
        return $sqlContent;
    }

    private function parseSqlStatements($sqlContent)
    {
        // Dividir por punto y coma, pero cuidando las cadenas entre comillas
        $statements = [];
        $current = '';
        $inQuotes = false;
        $quoteChar = '';
        $escaped = false;
        
        for ($i = 0; $i < strlen($sqlContent); $i++) {
            $char = $sqlContent[$i];
            
            if ($escaped) {
                $current .= $char;
                $escaped = false;
                continue;
            }
            
            if ($char === '\\') {
                $current .= $char;
                $escaped = true;
                continue;
            }
            
            if (!$inQuotes && ($char === '"' || $char === "'")) {
                $inQuotes = true;
                $quoteChar = $char;
                $current .= $char;
                continue;
            }
            
            if ($inQuotes && $char === $quoteChar) {
                $inQuotes = false;
                $quoteChar = '';
                $current .= $char;
                continue;
            }
            
            if (!$inQuotes && $char === ';') {
                $statement = trim($current);
                if (!empty($statement)) {
                    $statements[] = $statement;
                }
                $current = '';
                continue;
            }
            
            $current .= $char;
        }
        
        // Agregar el último statement si no termina en ;
        $statement = trim($current);
        if (!empty($statement)) {
            $statements[] = $statement;
        }
        
        return array_filter($statements, function($stmt) {
            $stmt = trim($stmt);
            return !empty($stmt) && !preg_match('/^(--|\#|\/\*)/', $stmt);
        });
    }

    private function formatBytes($size, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, $precision) . ' ' . $units[$i];
    }

    /**
     * Verificar información del sistema para debug
     */
    public function getSystemInfo()
    {
        try {
            return response()->json([
                'success' => true,
                'system_info' => [
                    'php_version' => phpversion(),
                    'laravel_version' => app()->version(),
                    'os' => php_uname(),
                    'mysqldump_available' => $this->checkMysqldumpAvailable(),
                    'storage_writable' => is_writable(storage_path('app')),
                    'backup_dir_exists' => is_dir(storage_path('app/backups')),
                    'backup_dir_writable' => is_writable(storage_path('app/backups')) || is_writable(storage_path('app')),
                    'database_connection' => config('database.default'),
                    'memory_limit' => ini_get('memory_limit'),
                    'max_execution_time' => ini_get('max_execution_time')
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo información del sistema',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}