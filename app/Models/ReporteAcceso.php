<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;

class ReporteAcceso extends Model
{
    protected $table = 'reporte_accesos';

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'activo',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Verificar contraseña en texto plano contra el hash almacenado.
     */
    public function verificarPassword(string $password): bool
    {
        return Hash::check($password, $this->password);
    }

    /**
     * Logs generados por este acceso.
     *
     * @return HasMany
     */
    public function logs(): HasMany
    {
        return $this->hasMany(ReporteLog::class, 'reporte_acceso_id');
    }
}