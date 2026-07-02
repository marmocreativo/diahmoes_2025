<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardExportController extends Controller
{
    public function exportExcel(Request $request)
    {
        // Crear nueva spreadsheet
        $spreadsheet = new Spreadsheet();
        
        // Obtener los filtros
        $filters = $request->all();
        
        // Crear primera hoja - Reporte General
        //$this->createHojaGeneral($spreadsheet, $filters);
        
        // Crear segunda hoja - Reporte Detallado
        $this->createHojaDetallada($spreadsheet, $filters);
        
        // Configurar para descarga
        $fileName = 'reporte_dashboard_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        
        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
    
    private function createHojaGeneral($spreadsheet, $filters)
    {
        // Establecer la primera hoja como activa
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Reporte General');
        
        // Encabezados informativos
        $fechaInicio = $filters['fecha_inicio'] ?? 'No especificada';
        $fechaFin = $filters['fecha_fin'] ?? 'No especificada';
        
        $sheet->setCellValue('A1', 'REPORTE GENERAL DE ESTUDIOS');
        $sheet->setCellValue('A2', 'Periodo: ' . $fechaInicio . ' al ' . $fechaFin);
        $sheet->setCellValue('A3', 'Este reporte muestra información general de los estudios procesados en el periodo seleccionado');
        
        // Encabezados de columnas en fila 5
        $headers = [
            'A5' => 'Año',
            'B5' => 'Fecha Solicitud',
            'C5' => 'Hora De Solicitud',
            'D5' => 'Persona Que Solicita',
            'E5' => 'Médico De Recolección',
            'F5' => 'Hospital',
            'G5' => 'Ciudad',
            'H5' => 'Estado',
            'I5' => 'Tipo de Muestra Solicitada',
            'J5' => 'No. De Muestras Recibidas',
            'K5' => 'Estatus',
            'L5' => 'Num Guía',
            'M5' => 'Mensajería',
            'N5' => 'Fecha de Recolección',
            'O5' => 'Motivo de estatus',
            'P5' => 'FOLIO MERCK'
        ];
        
        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }
        
        // Obtener datos
        $datos = $this->getDataGeneral($filters);
        
        // Insertar datos
        $row = 6;
        foreach ($datos as $dato) {
            $fechaSolicitud = $dato->FECHA_SOLICITUD_RECOLECCION ? Carbon::parse($dato->FECHA_SOLICITUD_RECOLECCION) : null;
            $fechaRecoleccion = $dato->FECHA_RECOLECCION ? Carbon::parse($dato->FECHA_RECOLECCION) : null;
            
            $sheet->setCellValue('A' . $row, $dato->ANIO ?? '');
            $sheet->setCellValue('B' . $row, $fechaSolicitud ? $fechaSolicitud->format('Y-m-d') : '');
            $sheet->setCellValue('C' . $row, $fechaSolicitud ? $fechaSolicitud->format('H:i:s') : '');
            $sheet->setCellValue('D' . $row, ''); // Persona que solicita - vacío
            $sheet->setCellValue('E' . $row, $dato->medico_completo ?? '');
            $sheet->setCellValue('F' . $row, $dato->INSTITUCION_NOMBRE ?? '');
            $sheet->setCellValue('G' . $row, $dato->MUESTRA_CIUDAD ?? '');
            $sheet->setCellValue('H' . $row, $dato->MUESTRA_ESTADO ?? '');
            $sheet->setCellValue('I' . $row, ''); // Tipo de muestra solicitada - vacío
            $sheet->setCellValue('J' . $row, ''); // No. de muestras recibidas - vacío
            $sheet->setCellValue('K' . $row, $dato->ESTUDIO_ESTADO ?? '');
            $sheet->setCellValue('L' . $row, $dato->MUESTRA_GUIA ?? '');
            $sheet->setCellValue('M' . $row, $dato->mensajeria_nombre ?? '');
            $sheet->setCellValue('N' . $row, $fechaRecoleccion ? $fechaRecoleccion->format('Y-m-d') : '');
            $sheet->setCellValue('O' . $row, ''); // Motivo de estatus - vacío
            $sheet->setCellValue('P' . $row, $dato->FOLIO_MERCK ?? '');
            
            $row++;
        }
        
        // Aplicar formato
        $sheet->getStyle('A1:P1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A5:P5')->getFont()->setBold(true);
        $sheet->getStyle('A5:P5')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE2E8F0');
            
        // Autoajustar columnas
        foreach (range('A', 'P') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }
    
    private function createHojaDetallada($spreadsheet, $filters)
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Reporte Detallado');

        $headers = [
            'A1' => 'CODIGO INTERNO',
            'B1' => 'MU',
            'C1' => 'RECEPCION LAB',
            'D1' => 'ESTATUS',
            'E1' => 'INICIALES DEL PX',
            'F1' => 'SEXO PX',
            'G1' => 'EDAD DEL PX',
            'H1' => 'SITIO DE LESION',
            'I1' => 'COLON/ASCEN-DESC',
            'J1' => 'BLOQUE',
            'K1' => 'LAMINILLA',
            'L1' => 'TIPO DE MUESTRA',
            'M1' => 'FOLIO MERCK',
            'N1' => 'REQUIERE LAB AUXILIAR',
            'O1' => 'NOMBRE LAB AUXILIAR',
            'P1' => 'REPORTE DEL DIAGNOSTICO HISTOPATOLOGICO',
            'Q1' => 'MEDICO TRATANTE',
            'R1' => 'HOSPITAL',
            'S1' => 'PROCEDENCIA',
            'T1' => 'TELÉFONO',
            'U1' => 'E-MAIL',
            'V1' => 'CIUDAD',
            'W1' => 'ESTADO',
            'X1' => 'FECHA DE ANALISIS',
            'Y1' => 'NOTAS ESPECIALES',
            'Z1' => 'RESULTADOS KRAS',
            'AA1' => 'RESULTADOS NRAS',
            'AB1' => 'INTERPRETACION RESULTADOS',
            'AC1' => 'BRAF',
            'AD1' => 'FECHA ENVIO REPORTE E-MAIL'
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        $datos = $this->getDataDetallada($filters);

        $row = 2;
        foreach ($datos as $dato) {
            $fechaRecepcionLab = $dato->FECHA_RECEPCION_LABORATORIO ? Carbon::parse($dato->FECHA_RECEPCION_LABORATORIO) : null;
            $fechaAnalisis = $dato->FECHA_ENTREGA_PROCESAMIENTO ? Carbon::parse($dato->FECHA_ENTREGA_PROCESAMIENTO) : null;
            $fechaEnvioCorreo = $dato->FECHA_RESULTADOS_CORREO ? Carbon::parse($dato->FECHA_RESULTADOS_CORREO) : null;

            $resultadosKras = trim(($dato->R_ESTATUS_KRAS ?? '') . ' ' . ($dato->R_GENOTIPO_KRAS ?? ''));
            $resultadosNras = trim(($dato->R_ESTATUS_NRAS ?? '') . ' ' . ($dato->R_GENOTIPO_NRAS ?? ''));
            $resultadosBraf = trim(($dato->R_ESTATUS_BRAF ?? '') . ' ' . ($dato->R_GENOTIPO_BRAF ?? ''));

            $sheet->setCellValue('A' . $row, $dato->CLAVE_INTERNA ?? '');
            $sheet->setCellValue('B' . $row, $dato->FOLIO_MERCK ?? '');
            $sheet->setCellValue('C' . $row, $fechaRecepcionLab ? $fechaRecepcionLab->format('Y-m-d') : '');
            $sheet->setCellValue('D' . $row, $dato->ESTUDIO_ESTADO ?? '');
            $sheet->setCellValue('E' . $row, $dato->MUESTRA_INICIALES ?? '');
            $sheet->setCellValue('F' . $row, $dato->MUESTRA_GENERO ?? '');
            $sheet->setCellValue('G' . $row, $dato->MUESTRA_EDAD ?? '');
            $sheet->setCellValue('H' . $row, $dato->MUESTRA_SITIO_LESION ?? '');
            $sheet->setCellValue('I' . $row, (function($sitio) {
                $sitio = trim(strtoupper($sitio ?? ''));
                if ($sitio === 'COLON DESCENDENTE') return 'DESC';
                if ($sitio === 'COLON ASCENDENTE') return 'ASC';
                if ($sitio === 'COLON') return 'ND';
                return '';
            })($dato->MUESTRA_SITIO_LESION));
            $sheet->setCellValue('J' . $row, $dato->MUESTRA_BLOQUES ?? '');
            $sheet->setCellValue('K' . $row, $dato->MUESTRA_LAMINILLAS ?? '');
            $sheet->setCellValue('L' . $row, $dato->MUESTRA_TIPO_ESTUDIO ?? '');
            $sheet->setCellValue('M' . $row, $dato->MUESTRA_CLAVE ?? '');
            $sheet->setCellValue('N' . $row, $dato->MUESTRA_REQUIERE_LABORATORIO_AUX ?? '');
            $sheet->setCellValue('O' . $row, $dato->MUESTRA_NOMBRE_LABORATORIO_AUX ?? '');
            $sheet->setCellValue('P' . $row, $dato->MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA ?? '');
            $sheet->setCellValue('Q' . $row, $dato->medico_completo ?? '');
            $sheet->setCellValue('R' . $row, $dato->INSTITUCION_NOMBRE ?? '');
            $sheet->setCellValue('S' . $row, $dato->INSTITUCION_PROCEDENCIA ?? '');
            $sheet->setCellValue('T' . $row, $dato->USUARIO_TELEFONO ?? '');
            $sheet->setCellValue('U' . $row, $dato->USUARIO_CORREO ?? '');
            $sheet->setCellValue('V' . $row, $dato->MUESTRA_CIUDAD ?? '');
            $sheet->setCellValue('W' . $row, $dato->MUESTRA_ESTADO ?? '');
            $sheet->setCellValue('X' . $row, $fechaRecepcionLab ? $fechaRecepcionLab->format('Y-m-d') : '');
            $sheet->setCellValue('Y' . $row, $dato->R_NOTAS_ESPECIALES ?? '');
            $sheet->setCellValue('Z' . $row, $resultadosKras ?: '');
            $sheet->setCellValue('AA' . $row, $resultadosNras ?: '');
            $sheet->setCellValue('AB' . $row, $dato->R_INTERPRETACION ?? '');
            $sheet->setCellValue('AC' . $row, $resultadosBraf ?: '');
            $sheet->setCellValue('AD' . $row, $fechaEnvioCorreo ? $fechaEnvioCorreo->format('Y-m-d') : '');

            $row++;
        }

        $sheet->getStyle('A1:AD1')->getFont()->setBold(true);
        $sheet->getStyle('A1:AD1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE2E8F0');

        foreach (range('A', 'Z') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        $sheet->getColumnDimension('AA')->setAutoSize(true);
        $sheet->getColumnDimension('AB')->setAutoSize(true);
        $sheet->getColumnDimension('AC')->setAutoSize(true);
        $sheet->getColumnDimension('AD')->setAutoSize(true);
    }
    
    private function getDataGeneral($filters)
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
        if (!empty($filters['fecha_inicio'])) {
            $query->where('e.FECHA_RECEPCION', '>=', $filters['fecha_inicio']);
        }
        
        if (!empty($filters['fecha_fin'])) {
            $query->where('e.FECHA_RECEPCION', '<=', $filters['fecha_fin']);
        }

        if (!empty($filters['muestra_estado'])) {
            $query->where('e.MUESTRA_ESTADO', $filters['muestra_estado']);
        }

        if (!empty($filters['tipo_estudio'])) {
            $query->where('e.MUESTRA_TIPO_ESTUDIO', $filters['tipo_estudio']);
        }

        if (!empty($filters['prefijo'])) {
            $query->where('e.CLAVE', $filters['prefijo']);
        }

        return $query->get();
    }
    
    private function getDataDetallada($filters)
    {
        // Similar a getDataGeneral pero con los campos para la hoja detallada
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
                'e.R_NOTAS_ESPECIALES',
                'e.R_ESTATUS_KRAS',
                'e.R_GENOTIPO_KRAS',
                'e.R_ESTATUS_NRAS',
                'e.R_GENOTIPO_NRAS',
                'e.R_INTERPRETACION',
                'e.R_ESTATUS_BRAF',
                'e.R_GENOTIPO_BRAF',
                'e.FECHA_RESULTADOS_CORREO',
                'e.MUESTRA_REQUIERE_LABORATORIO_AUX',
                'e.MUESTRA_NOMBRE_LABORATORIO_AUX'
            );

        // Aplicar los mismos filtros
        if (!empty($filters['fecha_inicio'])) {
            $query->where('e.FECHA_RECEPCION', '>=', $filters['fecha_inicio']);
        }
        
        if (!empty($filters['fecha_fin'])) {
            $query->where('e.FECHA_RECEPCION', '<=', $filters['fecha_fin']);
        }

        if (!empty($filters['muestra_estado'])) {
            $query->where('e.MUESTRA_ESTADO', $filters['muestra_estado']);
        }

        if (!empty($filters['tipo_estudio'])) {
            $query->where('e.MUESTRA_TIPO_ESTUDIO', $filters['tipo_estudio']);
        }

        if (!empty($filters['prefijo'])) {
            $query->where('e.CLAVE', $filters['prefijo']);
        }

        return $query->get();
    }
}