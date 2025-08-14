<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Especifica el nombre de tu tabla
    protected $table = 'usuarios';
    
    // Especifica la clave primaria
    protected $primaryKey = 'ID_USUARIO';
    
    // Laravel espera created_at y updated_at, pero tu tabla usa otros nombres
    const CREATED_AT = 'FECHA_REGISTRO';
    const UPDATED_AT = 'FECHA_ACTUALIZACION';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'USUARIO_NOMBRE',
        'USUARIO_APELLIDOS', 
        'USUARIO_CORREO',
        'USUARIO_TELEFONO',
        'USUARIO_PASS',
        'USUARIO_TIPO',
        'ID_INSTITUCION',
        'USUARIO_ESTADO'
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'USUARIO_PASS',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'FECHA_REGISTRO' => 'datetime',
            'FECHA_ACTUALIZACION' => 'datetime',
            'USUARIO_PASS' => 'hashed', // Cambiar esto
        ];
    }

    // Métodos requeridos por Laravel Auth
    
    /**
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifierName()
    {
        return 'ID_USUARIO';
    }

    /**
     * Get the unique identifier for the user.
     */
    public function getAuthIdentifier()
    {
        return $this->getAttribute('ID_USUARIO');
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->USUARIO_PASS;
    }

    /**
     * Get the name of the password column.
     */
    public function getAuthPasswordName()
    {
        return 'USUARIO_PASS';
    }

    /**
     * Get the token value for the "remember me" session.
     */
    public function getRememberToken()
    {
        return $this->remember_token;
    }

    /**
     * Set the token value for the "remember me" session.
     */
    public function setRememberToken($value)
    {
        $this->remember_token = $value;
    }

    /**
     * Get the column name for the "remember me" token.
     */
    public function getRememberTokenName()
    {
        return 'remember_token';
    }

    /**
     * Get the e-mail address where password reset links are sent.
     */
    public function getEmailForPasswordReset()
    {
        return $this->USUARIO_CORREO;
    }

    // Accessors para compatibilidad con Laravel
    public function getNameAttribute()
    {
        return $this->USUARIO_NOMBRE . ' ' . $this->USUARIO_APELLIDOS;
    }

    public function getEmailAttribute()
    {
        return $this->USUARIO_CORREO;
    }

    // Relación con institución
    public function institucion()
    {
        return $this->belongsTo(Institucion::class, 'ID_INSTITUCION', 'ID_INSTITUCION');
    }

    // Scopes útiles
    public function scopeActivos($query)
    {
        return $query->where('USUARIO_ESTADO', 'activo');
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('USUARIO_TIPO', $tipo);
    }
}