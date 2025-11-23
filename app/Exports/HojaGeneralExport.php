<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HojaGeneralExport implements FromCollection, WithHeadings, WithTitle, WithMapping
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
            ->leftJoin('mensajerias as m', 'e.MUESTRA_GUIA_MENSAJERIA', '=', 'm.ID')
            ->select(
                'e.ANIO',
                'e.FECHA_SOLICITUD_RECOLECCION',
                DB::raw('CONCAT(u.USUARIO_NOMBRE, " ", u.USUARIO_APELLIDOS) as medico_completo'),
                'i.INSTITUCION_NOMBRE',
                'e.MUESTRA_CIUDAD',
                'e.MUESTRA_ESTADO',
                'e.ESTUDIO_ESTADO',
                'e.MUESTRA_GUIA',
                'm.NOMBRE as mensajeria_nombre',
                'e.FECHA_RECOLECCION',
                'e.FOLIO_MERCK'
            );

        // Aplicar filtros
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
        $fechaSolicitud = $row->FECHA_SOLICITUD_RECOLECCION ? Carbon::parse($row->FECHA_SOLICITUD_RECOLECCION) : null;
        $fechaRecoleccion = $row->FECHA_RECOLECCION ? Carbon::parse($row->FECHA_RECOLECCION) : null;

        return [
            $row->ANIO ?? '',
            $fechaSolicitud ? $fechaSolicitud->format('Y-m-d') : '',
            $fechaSolicitud ? $fechaSolicitud->format('H:i:s') : '',
            '', // Persona que solicita - vacío
            $row->medico_completo ?? '',
            $row->INSTITUCION_NOMBRE ?? '',
            $row->MUESTRA_CIUDAD ?? '',
            $row->MUESTRA_ESTADO ?? '',
            '', // Tipo de muestra solicitada - vacío
            '', // No. de muestras recibidas - vacío
            $row->ESTUDIO_ESTADO ?? '',
            $row->MUESTRA_GUIA ?? '',
            $row->mensajeria_nombre ?? '',
            $fechaRecoleccion ? $fechaRecoleccion->format('Y-m-d') : '',
            '', // Motivo de estatus - vacío
            $row->FOLIO_MERCK ?? ''
        ];
    }

    public function headings(): array
    {
        // Obtener rango de fechas para el encabezado
        $fechaInicio = $this->filters['fecha_inicio'] ?? 'No especificada';
        $fechaFin = $this->filters['fecha_fin'] ?? 'No especificada';
        
        return [
            ['REPORTE GENERAL DE ESTUDIOS'],
            ['Periodo: ' . $fechaInicio . ' al ' . $fechaFin],
            ['Este reporte muestra información general de los estudios procesados en el periodo seleccionado'],
            [''], // Fila vacía
            [
                'Año',
                'Fecha Solicitud',
                'Hora De Solicitud',
                'Persona Que Solicita',
                'Médico De Recolección',
                'Hospital',
                'Ciudad',
                'Estado',
                'Tipo de Muestra Solicitada',
                'No. De Muestras Recibidas',
                'Estatus',
                'Num Guía',
                'Mensajería',
                'Fecha de Recolección',
                'Motivo de estatus',
                'FOLIO MERCK'
            ]
        ];
    }

    public function title(): string
    {
        return 'Reporte General';
    }
}