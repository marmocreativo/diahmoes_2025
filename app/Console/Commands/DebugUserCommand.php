<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class DebugUserCommand extends Command
{
    protected $signature = 'debug:user {email} {password?}';
    protected $description = 'Debug user authentication data';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $this->info("=== DEBUGGING USER: {$email} ===");

        // Buscar el usuario
        $user = User::where('USUARIO_CORREO', $email)->first();

        if (!$user) {
            $this->error("❌ Usuario NO encontrado con email: {$email}");
            
            // Mostrar usuarios disponibles
            $this->info("\n📋 Usuarios disponibles:");
            $users = User::select('ID_USUARIO', 'USUARIO_CORREO', 'USUARIO_ESTADO')->limit(5)->get();
            foreach ($users as $u) {
                $this->line("ID: {$u->ID_USUARIO} | Email: {$u->USUARIO_CORREO} | Estado: {$u->USUARIO_ESTADO}");
            }
            return;
        }

        $this->info("✅ Usuario encontrado:");
        $this->table(['Campo', 'Valor'], [
            ['ID_USUARIO', $user->ID_USUARIO],
            ['USUARIO_NOMBRE', $user->USUARIO_NOMBRE],
            ['USUARIO_APELLIDOS', $user->USUARIO_APELLIDOS],
            ['USUARIO_CORREO', $user->USUARIO_CORREO],
            ['USUARIO_ESTADO', $user->USUARIO_ESTADO],
            ['USUARIO_TIPO', $user->USUARIO_TIPO],
            ['ID_INSTITUCION', $user->ID_INSTITUCION],
            ['Password Hash (primeros 30 chars)', substr($user->USUARIO_PASS, 0, 30) . '...'],
            ['Password Hash Length', strlen($user->USUARIO_PASS)],
        ]);

        if ($password) {
            $this->info("\n🔐 Verificando contraseña...");
            
            // Verificar contraseña con Hash::check
            $isValid = Hash::check($password, $user->USUARIO_PASS);
            $this->info("Hash::check result: " . ($isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'));

            // Verificar si es bcrypt
            $isBcrypt = strlen($user->USUARIO_PASS) === 60 && substr($user->USUARIO_PASS, 0, 4) === '$2y$';
            $this->info("Es hash bcrypt: " . ($isBcrypt ? '✅ SÍ' : '❌ NO'));

            // Mostrar info del hash
            $hashInfo = password_get_info($user->USUARIO_PASS);
            $this->info("Hash algorithm: " . $hashInfo['algoName']);

            if (!$isValid) {
                $this->info("\n🔧 Intentando rehashear la contraseña...");
                $newHash = Hash::make($password);
                $this->info("Nuevo hash generado: " . substr($newHash, 0, 30) . '...');
                
                if ($this->confirm('¿Quieres actualizar la contraseña en la base de datos?')) {
                    $user->USUARIO_PASS = $newHash;
                    $user->save();
                    $this->info("✅ Contraseña actualizada exitosamente!");
                }
            }
        }

        // Verificar campos requeridos para auth
        $this->info("\n🔍 Verificando configuración de autenticación:");
        $this->table(['Método', 'Resultado'], [
            ['getAuthIdentifierName()', $user->getAuthIdentifierName()],
            ['getAuthIdentifier()', $user->getAuthIdentifier()],
            ['getAuthPasswordName()', $user->getAuthPasswordName()],
            ['getAuthPassword() length', strlen($user->getAuthPassword())],
        ]);
    }
}