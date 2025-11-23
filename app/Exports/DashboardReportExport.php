<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class DashboardReportExport implements WithMultipleSheets
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        return [
            0 => new HojaGeneralExport($this->filters),
            1 => new HojaDetalladaExport($this->filters),
        ];
    }
}