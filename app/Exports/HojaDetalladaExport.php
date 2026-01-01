<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HojaDetalladaExport implements FromCollection, WithHeadings, WithTitle, WithMapping
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = DB::table('estudios as e')
            ->leftJoin('usuarios as u', 'e.ID_MEDICO', '=', 'u.ID_USUARIO')
            ->leftJoin('instituciones as i', 'e.ID_INSTITUCION', '=', 'i.ID_INSTITUCION')
            ->select(
                'e.CLAVE_INTERNA',
                'e.FOLIO_MERCK',
                'e.MUESTRA_CLAVE',
                'e.FECHA_RECEPCION_LABORATORIO',
                'e.ESTUDIO_ESTADO',
                'e.MUESTRA_INICIALES',
                'e.MUESTRA_GENERO',
                'e.MUESTRA_EDAD',
                'e.MUESTRA_SITIO_LESION',
                'e.MUESTRA_BLOQUES',
                'e.MUESTRA_LAMINILLAS',
                'e.MUESTRA_TIPO_ESTUDIO',
                'e.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA',
                DB::raw('CONCAT(u.USUARIO_NOMBRE, " ", u.USUARIO_APELLIDOS) as medico_completo'),
                'i.INSTITUCION_NOMBRE',
                'i.INSTITUCION_PROCEDENCIA',
                'u.USUARIO_TELEFONO',
                'u.USUARIO_CORREO',
                'e.MUESTRA_CIUDAD',
                'e.MUESTRA_ESTADO',
                'e.FECHA_ENTREGA_PROCESAMIENTO',
                'e.R_ESTATUS_KRAS',
                'e.R_GENOTIPO_KRAS',
                'e.R_ESTATUS_NRAS',
                'e.R_GENOTIPO_NRAS',
                'e.R_INTERPRETACION',
                'e.R_ESTATUS_BRAF',
                'e.R_GENOTIPO_BRAF',
                'e.FECHA_RESULTADOS_CORREO'
            );

        // Aplicar los mismos filtros que en la primera hoja
        if (!empty($this->filters['fecha_inicio'])) {
            $query->where('e.FECHA_SOLICITUD_RECOLECCION', '>=', $this->filters['fecha_inicio']);
        }
        
        if (!empty($this->filters['fecha_fin'])) {
            $query->where('e.FECHA_SOLICITUD_RECOLECCION', '<=', $this->filters['fecha_fin']);
        }

        if (!empty($this->filters['institucion_id'])) {
            $query->where('e.ID_INSTITUCION', $this->filters['institucion_id']);
        }

        if (!empty($this->filters['medico_id'])) {
            $query->where('e.ID_MEDICO', $this->filters['medico_id']);
        }

        if (!empty($this->filters['estado'])) {
            $query->where('e.ESTUDIO_ESTADO', $this->filters['estado']);
        }

        return $query->get();
    }

    public function map($row): array
    {
        $fechaRecepcionLab = $row->FECHA_RECEPCION_LABORATORIO ? Carbon::parse($row->FECHA_RECEPCION_LABORATORIO) : null;
        $fechaAnalisis = $row->FECHA_ENTREGA_PROCESAMIENTO ? Carbon::parse($row->FECHA_ENTREGA_PROCESAMIENTO) : null;
        $fechaEnvioCorreo = $row->FECHA_RESULTADOS_CORREO ? Carbon::parse($row->FECHA_RESULTADOS_CORREO) : null;

        // Combinar resultados KRAS
        $resultadosKras = trim(($row->R_ESTATUS_KRAS ?? '') . ' ' . ($row->R_GENOTIPO_KRAS ?? ''));
        
        // Combinar resultados NRAS
        $resultadosNras = trim(($row->R_ESTATUS_NRAS ?? '') . ' ' . ($row->R_GENOTIPO_NRAS ?? ''));
        
        // Combinar resultados BRAF (nota: usas R_GENOTIPO_NRAS en lugar de R_GENOTIPO_BRAF según tu especificación)
        $resultadosBraf = trim(($row->R_ESTATUS_BRAF ?? '') . ' ' . ($row->R_GENOTIPO_BRAF ?? ''));

        return [
            $row->CLAVE_INTERNA ?? '',
            $row->FOLIO_MERCK ?? '',
            $fechaRecepcionLab ? $fechaRecepcionLab->format('Y-m-d') : '',
            $row->ESTUDIO_ESTADO ?? '',
            $row->MUESTRA_INICIALES ?? '',
            $row->MUESTRA_GENERO ?? '',
            $row->MUESTRA_EDAD ?? '',
            $row->MUESTRA_SITIO_LESION ?? '',
            $this->getColonType($row->MUESTRA_SITIO_LESION ?? ''), // COLON/ASCEN-DESC
            $row->MUESTRA_BLOQUES ?? '',
            $row->MUESTRA_LAMINILLAS ?? '',
            $row->MUESTRA_TIPO_ESTUDIO ?? '',
            $row->MUESTRA_CLAVE ?? '',
            $row->MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA ?? '',
            $row->medico_completo ?? '',
            $row->INSTITUCION_NOMBRE ?? '',
            $row->INSTITUCION_PROCEDENCIA ?? '',
            $row->USUARIO_TELEFONO ?? '',
            $row->USUARIO_CORREO ?? '',
            $row->MUESTRA_CIUDAD ?? '',
            $row->MUESTRA_ESTADO ?? '',
            $fechaRecepcionLab ? $fechaRecepcionLab->format('Y-m-d') : '',
            $resultadosKras ?: '',
            $resultadosNras ?: '',
            $row->R_INTERPRETACION ?? '',
            $resultadosBraf ?: '',
            $fechaEnvioCorreo ? $fechaEnvioCorreo->format('Y-m-d') : ''
        ];
    }

    public function headings(): array
    {
        // Obtener rango de fechas para el encabezado
        $fechaInicio = $this->filters['fecha_inicio'] ?? 'No especificada';
        $fechaFin = $this->filters['fecha_fin'] ?? 'No especificada';
        
        return [
            ['REPORTE DETALLADO DE ESTUDIOS'],
            ['Periodo: ' . $fechaInicio . ' al ' . $fechaFin],
            ['Este reporte muestra información detallada de los resultados y análisis de los estudios procesados'],
            [''], // Fila vacía
            [
                'CODIGO INTERNO',
                'MU',
                'RECEPCION LAB',
                'ESTATUS',
                'INICIALES DEL PX',
                'SEXO PX',
                'EDAD DEL PX',
                'SITIO DE LESION',
                'COLON/ASCEN-DESC',
                'BLOQUE',
                'LAMINILLA',
                'TIPO DE MUESTRA',
                'MUE',
                'REPORTE DEL DIAGNOSTICO HISTOPATOLOGICO',
                'MEDICO TRATANTE',
                'HOSPITAL',
                'PROCEDENCIA',
                'TELÉFONO',
                'E-MAIL',
                'CIUDAD',
                'ESTADO',
                'FECHA DE ANALISIS',
                'RESULTADOS KRAS',
                'RESULTADOS NRAS',
                'INTERPRETACION RESULTADOS',
                'BRAF',
                'FECHA ENVIO REPORTE E-MAIL'
            ]
        ];
    }

    public function title(): string
    {
        return 'Reporte Detallado';
    }

    private function getColonType($sitioLesion)
    {
        $sitio = trim(strtoupper($sitioLesion));
        
        // Buscar palabras clave en lugar de coincidencias exactas
        if (strpos($sitio, 'DESCENDENTE') !== false) {
            return 'DESC';
        }
        
        if (strpos($sitio, 'ASCENDENTE') !== false) {
            return 'ASC';
        }
        
        // Si solo contiene "COLON" pero no es ascendente ni descendente
        if (strpos($sitio, 'COLON') !== false) {
            return 'ND';
        }
        
        return ''; // Cualquier otra respuesta queda vacío
    }
}