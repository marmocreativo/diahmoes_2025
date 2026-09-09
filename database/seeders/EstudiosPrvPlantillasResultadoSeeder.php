<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlantillaResultadoPrv;

class EstudiosPrvPlantillasResultadoSeeder extends Seeder
{
    public function run(): void
    {
        $plantillas = [

            // 1) FISH HER2
            [
                'CODIGO' => 'FISH_HER2',
                'NOMBRE' => 'FISH - Amplificación de gen HER-2',
                'DESCRIPCION' => 'Hibridación in situ Fluorescente (FISH) para amplificación de HER-2neu',
                'CAMPOS' => [
                    [
                        'seccion' => 'Calidad del Espécimen',
                        'campos' => [
                            ['key' => 'calidad_especimen', 'label' => 'Calidad del espécimen', 'tipo' => 'select',
                                'opciones' => ['Adecuada', 'Subóptima', 'Inadecuada'], 'requerido' => true],
                        ],
                    ],
                    [
                        'seccion' => 'Resultado FISH',
                        'campos' => [
                            ['key' => 'resultado_nuc_ish', 'label' => 'Resultado (notación nuc ish)', 'tipo' => 'text',
                                'placeholder' => 'nuc ish ( D17Z1x1~4, ERBB2x1~5)[XX]', 'requerido' => true],
                            ['key' => 'razon_her2_cep17', 'label' => 'Razón HER2-neu/CEP17', 'tipo' => 'number', 'requerido' => true],
                            ['key' => 'cuentas_promedio_her2', 'label' => 'Cuentas promedio de HER2', 'tipo' => 'number'],
                        ],
                    ],
                    [
                        'seccion' => 'Interpretación',
                        'campos' => [
                            ['key' => 'interpretacion_resultado', 'label' => 'Resultado', 'tipo' => 'select',
                                'opciones' => ['Negativo', 'Positivo', 'Equívoco'], 'requerido' => true],
                            ['key' => 'interpretacion_texto', 'label' => 'Interpretación (texto libre adicional)', 'tipo' => 'textarea'],
                        ],
                    ],
                ],
            ],

            // 2) CelTum
            [
                'CODIGO' => 'CELTUM',
                'NOMBRE' => 'Evaluación de Celularidad Tumoral',
                'DESCRIPCION' => 'Escaneo y evaluación de celularidad tumoral',
                'CAMPOS' => [
                    [
                        'seccion' => 'Evaluación',
                        'campos' => [
                            ['key' => 'calidad_especimen', 'label' => 'Calidad del espécimen', 'tipo' => 'select',
                                'opciones' => ['Adecuada', 'Limitada', 'Inadecuada'], 'requerido' => true],
                            ['key' => 'bloques_con_tumor', 'label' => 'Bloques con tumor', 'tipo' => 'text', 'requerido' => true],
                            ['key' => 'porcentaje_celularidad', 'label' => 'Porcentaje de núcleos de células tumorales (celularidad)', 'tipo' => 'number', 'requerido' => true],
                        ],
                    ],
                ],
            ],

            // 3) HER2 gástrico IHQ
            [
                'CODIGO' => 'HER2_GASTRICO_IHQ',
                'NOMBRE' => 'HER2 Gástrico - Inmunohistoquímica',
                'DESCRIPCION' => 'Evaluación inmunohistoquímica de HER-2 (clona CB11)',
                'CAMPOS' => [
                    [
                        'seccion' => 'Calidad y Controles',
                        'campos' => [
                            ['key' => 'calidad_especimen', 'label' => 'Calidad del espécimen', 'tipo' => 'select',
                                'opciones' => ['Adecuada', 'Subóptima', 'Inadecuada'], 'requerido' => true],
                            ['key' => 'control_positivo', 'label' => 'Control positivo', 'tipo' => 'select',
                                'opciones' => ['Adecuado', 'Inadecuado'], 'requerido' => true],
                            ['key' => 'control_negativo', 'label' => 'Control negativo (de reacción)', 'tipo' => 'select',
                                'opciones' => ['Adecuado', 'Inadecuado'], 'requerido' => true],
                        ],
                    ],
                    [
                        'seccion' => 'Evaluación Inmunohistoquímica',
                        'campos' => [
                            ['key' => 'porcentaje_tincion', 'label' => 'Porcentaje de células con tinción', 'tipo' => 'number', 'requerido' => true],
                            ['key' => 'intensidad_tincion', 'label' => 'Intensidad de la tinción', 'tipo' => 'text', 'requerido' => true],
                            ['key' => 'estatus_her2', 'label' => 'Estatus HER-2', 'tipo' => 'select',
                                'opciones' => ['Positivo – 3+', 'Equívoco/indeterminado – 2+', 'Negativo – 1+', 'Negativo – 0'], 'requerido' => true],
                        ],
                    ],
                    [
                        'seccion' => 'Interpretación',
                        'campos' => [
                            ['key' => 'interpretacion_texto', 'label' => 'Interpretación', 'tipo' => 'text',
                                'placeholder' => 'Her2 / CerbB2 negativo 1+', 'requerido' => true],
                        ],
                    ],
                ],
            ],

            // 4) Idylla MSI
            [
                'CODIGO' => 'IDYLLA_MSI',
                'NOMBRE' => 'Idylla - Inestabilidad Microsatelital (MSI)',
                'DESCRIPCION' => 'PCR, Sistema Idylla, Biocartis',
                'CAMPOS' => [
                    [
                        'seccion' => 'Calidad del Espécimen',
                        'campos' => [
                            ['key' => 'celulas_tumorales_aprox', 'label' => 'Células tumorales aproximadas', 'tipo' => 'text'],
                            ['key' => 'area_mm2', 'label' => 'Área (mm²)', 'tipo' => 'number'],
                            ['key' => 'porcentaje_celularidad', 'label' => '% de celularidad del tejido (enriquecido)', 'tipo' => 'number'],
                            ['key' => 'calidad_muestra', 'label' => 'Calidad de la muestra', 'tipo' => 'select',
                                'opciones' => ['Suficiente', 'Subóptima', 'Inadecuada'], 'requerido' => true],
                        ],
                    ],
                    [
                        'seccion' => 'Loci Evaluados',
                        'campos' => [
                            ['key' => 'loci_tabla', 'label' => 'Estatus por loci', 'tipo' => 'tabla',
                                'columnas' => ['Loci evaluados', 'Estatus', 'Observaciones'],
                                'filas_fijas' => [['ACVR2A, BTBD7, DIDO1, MRE11, RYR3, SEC31A, SULF2', '', '']]],
                        ],
                    ],
                    [
                        'seccion' => 'Interpretación',
                        'campos' => [
                            ['key' => 'interpretacion_msi', 'label' => 'Resultado', 'tipo' => 'select',
                                'opciones' => ['Estable en microsatélites (MSS)', 'Inestabilidad microsatelital alta (MSI-H)', 'Inestabilidad microsatelital baja (MSI-L)'],
                                'requerido' => true],
                        ],
                    ],
                ],
            ],

            // 5) VPH Amplio
            [
                'CODIGO' => 'VPH_AMPLIO',
                'NOMBRE' => 'VPH - Panel Amplio (Alto y Bajo Riesgo)',
                'DESCRIPCION' => 'Detección y tipificación de VPH, panel amplio',
                'CAMPOS' => [
                    [
                        'seccion' => 'Resultado',
                        'campos' => [
                            ['key' => 'calidad_especimen', 'label' => 'Calidad del espécimen', 'tipo' => 'select',
                                'opciones' => ['Adecuada', 'Subóptima', 'Inadecuada'], 'requerido' => true],
                            ['key' => 'resultado_vph', 'label' => 'Resultado', 'tipo' => 'select',
                                'opciones' => ['Positivo', 'Negativo'], 'requerido' => true],
                            ['key' => 'tipo_vph', 'label' => 'Tipo(s) de VPH detectado(s)', 'tipo' => 'text'],
                            ['key' => 'nivel_riesgo', 'label' => 'Nivel de riesgo', 'tipo' => 'select',
                                'opciones' => ['Alto Riesgo', 'Bajo Riesgo', 'No aplica (negativo)']],
                        ],
                    ],
                ],
            ],

            // 6) VPH Alto Riesgo
            [
                'CODIGO' => 'VPH_ALTO_RIESGO',
                'NOMBRE' => 'VPH - Panel Genotipos Alto Riesgo',
                'DESCRIPCION' => 'Detección y tipificación de VPH, solo genotipos de alto riesgo',
                'CAMPOS' => [
                    [
                        'seccion' => 'Resultado',
                        'campos' => [
                            ['key' => 'calidad_especimen', 'label' => 'Calidad del espécimen', 'tipo' => 'select',
                                'opciones' => ['Adecuada', 'Subóptima', 'Inadecuada'], 'requerido' => true],
                            ['key' => 'resultado_vph', 'label' => 'Resultado', 'tipo' => 'select',
                                'opciones' => ['Positivo', 'Negativo'], 'requerido' => true],
                            ['key' => 'tipo_vph', 'label' => 'Tipo(s) de VPH detectado(s)', 'tipo' => 'text'],
                        ],
                    ],
                ],
            ],

            // 7) Panel GeneFusion + BRCA (dos secciones)
            [
                'CODIGO' => 'PANEL_GENEFUSION_BRCA',
                'NOMBRE' => 'Panel GeneFusion (ALK/ROS1/RET/NTRK/MET) + BRCA',
                'DESCRIPCION' => 'Detección de translocaciones y mutación MET ex14, más análisis germinal BRCA1/2',
                'CAMPOS' => [
                    [
                        'seccion' => 'Calidad del Espécimen',
                        'campos' => [
                            ['key' => 'celulas_aprox', 'label' => 'Células aproximadas', 'tipo' => 'text'],
                            ['key' => 'porcentaje_nucleos', 'label' => '% de núcleos en la muestra', 'tipo' => 'number'],
                            ['key' => 'area_mm2', 'label' => 'Área (mm²)', 'tipo' => 'number'],
                        ],
                    ],
                    [
                        'seccion' => 'Panel de Fusiones / Translocaciones',
                        'campos' => [
                            ['key' => 'resultado_alk', 'label' => 'ALK', 'tipo' => 'text', 'requerido' => true],
                            ['key' => 'resultado_ros1', 'label' => 'ROS1', 'tipo' => 'text', 'requerido' => true],
                            ['key' => 'resultado_ret', 'label' => 'RET', 'tipo' => 'text', 'requerido' => true],
                            ['key' => 'resultado_ntrk1', 'label' => 'NTRK1', 'tipo' => 'text'],
                            ['key' => 'resultado_ntrk2', 'label' => 'NTRK2', 'tipo' => 'text'],
                            ['key' => 'resultado_ntrk3', 'label' => 'NTRK3', 'tipo' => 'text'],
                            ['key' => 'resultado_met_ex14', 'label' => 'MET (omisión exón 14)', 'tipo' => 'text'],
                        ],
                    ],
                    [
                        'seccion' => 'Análisis BRCA1/2 (Secuenciación Masiva)',
                        'campos' => [
                            ['key' => 'brca_resultado', 'label' => 'Resultado', 'tipo' => 'select',
                                'opciones' => ['Positivo - Variante identificada', 'Negativo - Sin variantes patogénicas']],
                            ['key' => 'brca_gen_afectado', 'label' => 'Gen afectado', 'tipo' => 'select', 'opciones' => ['BRCA1', 'BRCA2', 'N/A']],
                            ['key' => 'brca_variante', 'label' => 'Variante identificada (nomenclatura HGVS)', 'tipo' => 'text'],
                            ['key' => 'brca_interpretacion', 'label' => 'Interpretación', 'tipo' => 'textarea'],
                        ],
                    ],
                ],
            ],

            // 8) PDL1
            [
                'CODIGO' => 'PDL1_IHQ',
                'NOMBRE' => 'PD-L1 - Inmunohistoquímica (clona 22C3)',
                'DESCRIPCION' => 'Evaluación de expresión de PD-L1',
                'CAMPOS' => [
                    [
                        'seccion' => 'Calidad y Controles',
                        'campos' => [
                            ['key' => 'calidad_especimen', 'label' => 'Calidad del espécimen', 'tipo' => 'select',
                                'opciones' => ['Adecuada', 'Limitada', 'Inadecuada'], 'requerido' => true],
                            ['key' => 'numero_celulas_tumorales', 'label' => 'Número aproximado de células tumorales', 'tipo' => 'text'],
                            ['key' => 'control_positivo', 'label' => 'Control positivo', 'tipo' => 'select', 'opciones' => ['Adecuado', 'Inadecuado']],
                            ['key' => 'control_negativo', 'label' => 'Control negativo (de reacción)', 'tipo' => 'select', 'opciones' => ['Adecuado', 'Inadecuado']],
                        ],
                    ],
                    [
                        'seccion' => 'Evaluación Inmunohistoquímica',
                        'campos' => [
                            ['key' => 'porcentaje_celulas_positivas', 'label' => '% de células tumorales positivas', 'tipo' => 'number', 'requerido' => true],
                            ['key' => 'tps', 'label' => 'TPS (Tumor Proportion Score)', 'tipo' => 'text'],
                            ['key' => 'cps', 'label' => 'CPS (Combined Proportion Score)', 'tipo' => 'text'],
                        ],
                    ],
                    [
                        'seccion' => 'Interpretación',
                        'campos' => [
                            ['key' => 'expresion_tumorales', 'label' => 'Expresión en células tumorales', 'tipo' => 'text', 'requerido' => true],
                            ['key' => 'expresion_inmunitarias', 'label' => 'Expresión en células inmunitarias', 'tipo' => 'text'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($plantillas as $plantilla) {
            PlantillaResultadoPrv::updateOrCreate(
                ['CODIGO' => $plantilla['CODIGO']],
                $plantilla
            );
        }
    }
}