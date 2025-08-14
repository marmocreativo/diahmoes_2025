<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Adjunto extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'adjuntos';

    /**
     * Clave primaria de la tabla
     */
    protected $primaryKey = 'ID';

    /**
     * Indica si el modelo debe manejar timestamps automáticamente
     */
    public $timestamps = false;

    /**
     * Los atributos que son asignables en masa
     */
    protected $fillable = [
        'MUESTRA_CLAVE',
        'ARCHIVO'
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'MUESTRA_CLAVE' => 'string',
        'ARCHIVO' => 'string'
    ];

    /**
     * Accessors
     */
    public function getMuestraClaveAttribute()
    {
        return $this->MUESTRA_CLAVE;
    }

    public function getArchivoAttribute()
    {
        return $this->ARCHIVO;
    }

    public function getNombreArchivoAttribute()
    {
        return basename($this->ARCHIVO);
    }

    public function getExtensionAttribute()
    {
        return pathinfo($this->ARCHIVO, PATHINFO_EXTENSION);
    }

    public function getTamanoArchivoAttribute()
    {
        if (Storage::exists($this->ARCHIVO)) {
            return Storage::size($this->ARCHIVO);
        }
        return 0;
    }

    public function getTamanoFormateadoAttribute()
    {
        $bytes = $this->tamano_archivo;
        
        if ($bytes === 0) return '0 B';
        
        $units = ['B', 'KB', 'MB', 'GB'];
        $factor = floor(log($bytes, 1024));
        
        return round($bytes / pow(1024, $factor), 2) . ' ' . $units[$factor];
    }

    public function getUrlDescargarAttribute()
    {
        return route('adjuntos.descargar', $this->ID);
    }

    public function getEsImagenAttribute()
    {
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        return in_array(strtolower($this->extension), $imageExtensions);
    }

    public function getEsPdfAttribute()
    {
        return strtolower($this->extension) === 'pdf';
    }

    public function getTipoArchivoAttribute()
    {
        $extension = strtolower($this->extension);
        
        $types = [
            'pdf' => 'PDF',
            'doc' => 'Word',
            'docx' => 'Word',
            'xls' => 'Excel',
            'xlsx' => 'Excel',
            'ppt' => 'PowerPoint',
            'pptx' => 'PowerPoint',
            'jpg' => 'Imagen',
            'jpeg' => 'Imagen',
            'png' => 'Imagen',
            'gif' => 'Imagen',
            'bmp' => 'Imagen',
            'webp' => 'Imagen',
            'txt' => 'Texto',
            'zip' => 'Archivo',
            'rar' => 'Archivo',
        ];
        
        return $types[$extension] ?? 'Archivo';
    }

    /**
     * Mutators
     */
    public function setMuestraClaveAttribute($value)
    {
        $this->attributes['MUESTRA_CLAVE'] = trim($value);
    }

    public function setArchivoAttribute($value)
    {
        $this->attributes['ARCHIVO'] = trim($value);
    }

    /**
     * Scopes
     */
    public function scopePorMuestraClave($query, $clave)
    {
        return $query->where('MUESTRA_CLAVE', $clave);
    }

    public function scopePorExtension($query, $extension)
    {
        return $query->where('ARCHIVO', 'LIKE', '%.' . $extension);
    }

    public function scopeImagenes($query)
    {
        return $query->where(function ($q) {
            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
            foreach ($imageExtensions as $ext) {
                $q->orWhere('ARCHIVO', 'LIKE', '%.' . $ext);
            }
        });
    }

    public function scopeDocumentos($query)
    {
        return $query->where(function ($q) {
            $docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
            foreach ($docExtensions as $ext) {
                $q->orWhere('ARCHIVO', 'LIKE', '%.' . $ext);
            }
        });
    }

    /**
     * Relaciones
     */
    public function estudio(): BelongsTo
    {
        return $this->belongsTo(Estudio::class, 'MUESTRA_CLAVE', 'MUESTRA_CLAVE');
    }

    /**
     * Métodos de utilidad
     */
    public function existeArchivo()
    {
        return Storage::exists($this->ARCHIVO);
    }

    public function eliminarArchivo()
    {
        if ($this->existeArchivo()) {
            return Storage::delete($this->ARCHIVO);
        }
        return true;
    }

    public function moverArchivo($nuevaRuta)
    {
        if ($this->existeArchivo()) {
            $moved = Storage::move($this->ARCHIVO, $nuevaRuta);
            if ($moved) {
                $this->ARCHIVO = $nuevaRuta;
                $this->save();
                return true;
            }
        }
        return false;
    }

    public function descargar()
    {
        if (!$this->existeArchivo()) {
            throw new \Exception('El archivo no existe');
        }
        
        return Storage::download($this->ARCHIVO, $this->nombre_archivo);
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        // Evento antes de eliminar
        static::deleting(function ($adjunto) {
            // Eliminar archivo físico cuando se elimina el registro
            $adjunto->eliminarArchivo();
        });
    }

    /**
     * Métodos estáticos de utilidad
     */
    public static function obtenerPorMuestraClave($clave)
    {
        return self::porMuestraClave($clave)->get();
    }

    public static function contarPorMuestraClave($clave)
    {
        return self::porMuestraClave($clave)->count();
    }

    public static function obtenerExtensionesPermitidas()
    {
        return [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
            'zip', 'rar'
        ];
    }

    public static function validarExtension($archivo)
    {
        $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
        return in_array($extension, self::obtenerExtensionesPermitidas());
    }

    public static function getTamanoMaximo()
    {
        // Retorna el tamaño máximo en bytes (10MB por defecto)
        return config('app.max_file_size', 10 * 1024 * 1024);
    }

    /**
     * Serialización personalizada para JSON
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Agregar campos calculados
        $array['nombre_archivo'] = $this->nombre_archivo;
        $array['extension'] = $this->extension;
        $array['tamano_archivo'] = $this->tamano_archivo;
        $array['tamano_formateado'] = $this->tamano_formateado;
        $array['url_descargar'] = $this->url_descargar;
        $array['es_imagen'] = $this->es_imagen;
        $array['es_pdf'] = $this->es_pdf;
        $array['tipo_archivo'] = $this->tipo_archivo;
        $array['existe_archivo'] = $this->existeArchivo();
        
        return $array;
    }
}