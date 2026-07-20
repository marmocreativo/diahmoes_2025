import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, ChevronDown, ChevronUp } from 'lucide-react';

interface EstudioPeriodo {
    id: number;
    clave_interna: string;
    clave: string;
    tipo_estudio: string;
    estado: string;
    muestra_estado: string;
    fecha_solicitud_recoleccion: string | null;
    fecha_recepcion: string | null;
    fecha_recepcion_laboratorio: string | null;
    fecha_obtencion_resultados: string | null;
    fecha_resultados_correo: string | null;
    fecha_retorno_material: string | null;
    folio_merck: string;
    sitio_lesion: string;
    bloques: string;
    laminillas: string;
    diagnostico: string;
    guia: string;
    ciudad: string;
    kras: string;
    nras: string;
    braf: string;
    interpretacion: string;
    notas: string;
}

interface ColumnaConfig {
    key: string;
    label: string;
    defaultVisible: boolean;
}

const COLUMNAS: ColumnaConfig[] = [
    { key: 'numero',       label: '#',                defaultVisible: true  },
    { key: 'clave_interna',label: 'Código',           defaultVisible: true  },
    { key: 'folio_merck',  label: 'Folio Merck',      defaultVisible: true  },
    { key: 'tipo_estudio', label: 'Tipo',             defaultVisible: true  },
    { key: 'estado',       label: 'Estatus',          defaultVisible: true  },
    { key: 'muestra_estado', label: 'Estado Muestra', defaultVisible: false },
    { key: 'ciudad',       label: 'Ciudad',           defaultVisible: false },
    { key: 'guia',         label: 'Núm. Guía',        defaultVisible: false },
    { key: 'sitio_lesion', label: 'Sitio Lesión',     defaultVisible: false },
    { key: 'bloques',      label: 'Bloques',          defaultVisible: false },
    { key: 'laminillas',   label: 'Laminillas',       defaultVisible: false },
    { key: 'diagnostico',  label: 'Diagnóstico Histo.',defaultVisible: false },
    { key: 'kras',         label: 'KRAS',             defaultVisible: true  },
    { key: 'nras',         label: 'NRAS',             defaultVisible: true  },
    { key: 'braf',         label: 'BRAF',             defaultVisible: true  },
    { key: 'interpretacion',label: 'Interpretación',  defaultVisible: false },
    { key: 'notas',        label: 'Notas',            defaultVisible: false },
    { key: 'progreso',     label: 'Progreso',         defaultVisible: true  },
];

const LS_KEY = 'diahmoes_reportes_columnas_visibles';

const colorConfig = [
    { circle: 'bg-red-500 border-red-500 text-white',         line: 'bg-red-400',     ring: 'ring-red-200'       },
    { circle: 'bg-orange-500 border-orange-500 text-white',   line: 'bg-orange-400',  ring: 'ring-orange-200'    },
    { circle: 'bg-yellow-400 border-yellow-400 text-white',   line: 'bg-yellow-300',  ring: 'ring-yellow-200'    },
    { circle: 'bg-green-500 border-green-500 text-white',     line: 'bg-green-400',   ring: 'ring-green-200'     },
    { circle: 'bg-[#189BAF] border-[#189BAF] text-white',     line: 'bg-[#189BAF]',   ring: 'ring-[#189BAF]/30'  },
    { circle: 'bg-purple-500 border-purple-500 text-white',   line: 'bg-purple-400',  ring: 'ring-purple-200'    },
];

function fmt(f: string | null): string | null {
    if (!f) return null;
    return f.split('T')[0].split(' ')[0];
}

interface Props {
    estudios: EstudioPeriodo[];
}

export default function EstudiosPeriodoTabla({ estudios }: Props) {
    const [columnasVisibles, setColumnasVisibles] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem(LS_KEY);
            if (saved) return JSON.parse(saved);
        } catch {}
        return Object.fromEntries(COLUMNAS.map(c => [c.key, c.defaultVisible]));
    });

    const [selectorAbierto, setSelectorAbierto] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(columnasVisibles));
        } catch {}
    }, [columnasVisibles]);

    const toggleColumna = (key: string) => {
        setColumnasVisibles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const resetColumnas = () => {
        const defaults = Object.fromEntries(COLUMNAS.map(c => [c.key, c.defaultVisible]));
        setColumnasVisibles(defaults);
    };

    const getPasos = (estudio: EstudioPeriodo) => {
        const pasos = [
            { label: 'Recolección', fecha: fmt(estudio.fecha_solicitud_recoleccion) },
            { label: 'Recepción',   fecha: fmt(estudio.fecha_recepcion) },
            { label: 'Laboratorio', fecha: fmt(estudio.fecha_recepcion_laboratorio) },
            { label: 'Resultados',  fecha: fmt(estudio.fecha_obtencion_resultados) },
            { label: 'Reporte',     fecha: fmt(estudio.fecha_resultados_correo) },
        ];

        if (estudio.tipo_estudio === 'Biopsia Sólida') {
            pasos.push({ label: 'Retorno Mat.', fecha: fmt(estudio.fecha_retorno_material) });
        }

        return pasos;
    };

    const renderCelda = (key: string, estudio: EstudioPeriodo, index: number) => {
        switch (key) {
            case 'numero':        return <td key={key} className="py-2 px-3 text-gray-400 text-xs">{index + 1}</td>;
            case 'clave_interna': return <td key={key} className="py-2 px-3 font-mono font-semibold text-[#189BAF] whitespace-nowrap">{estudio.clave_interna}</td>;
            case 'folio_merck':   return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap">{estudio.folio_merck || '—'}</td>;
            case 'tipo_estudio':  return <td key={key} className="py-2 px-3 text-xs text-gray-600 whitespace-nowrap">{estudio.tipo_estudio}</td>;
            case 'estado':        return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{estudio.estado}</span></td>;
            case 'muestra_estado':return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap">{estudio.muestra_estado || '—'}</td>;
            case 'ciudad':        return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap">{estudio.ciudad || '—'}</td>;
            case 'guia':          return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap">{estudio.guia || '—'}</td>;
            case 'sitio_lesion':  return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap">{estudio.sitio_lesion || '—'}</td>;
            case 'bloques':       return <td key={key} className="py-2 px-3 text-xs text-center">{estudio.bloques || '—'}</td>;
            case 'laminillas':    return <td key={key} className="py-2 px-3 text-xs text-center">{estudio.laminillas || '—'}</td>;
            case 'diagnostico':   return <td key={key} className="py-2 px-3 text-xs max-w-[200px] truncate" title={estudio.diagnostico}>{estudio.diagnostico || '—'}</td>;
            case 'kras':          return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap font-medium">{estudio.kras || '—'}</td>;
            case 'nras':          return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap font-medium">{estudio.nras || '—'}</td>;
            case 'braf':          return <td key={key} className="py-2 px-3 text-xs whitespace-nowrap font-medium">{estudio.braf || '—'}</td>;
            case 'interpretacion':return <td key={key} className="py-2 px-3 text-xs max-w-[200px] truncate" title={estudio.interpretacion}>{estudio.interpretacion || '—'}</td>;
            case 'notas':         return <td key={key} className="py-2 px-3 text-xs max-w-[200px] truncate" title={estudio.notas}>{estudio.notas || '—'}</td>;
            case 'progreso':      return <td key={key} className="py-3 px-4">{renderProgreso(estudio)}</td>;
            default:              return null;
        }
    };

    const renderProgreso = (estudio: EstudioPeriodo) => {
        const pasos = getPasos(estudio);

        let lastDone = -1;
        for (let i = 0; i < pasos.length; i++) {
            if (pasos[i].fecha) lastDone = i;
        }

        const config = lastDone >= 0 ? colorConfig[lastDone] : null;

        return (
            <div className="flex items-start w-full min-w-[320px]">
                {pasos.map((paso, i) => {
                    const done      = paso.fecha !== null;
                    const isActive  = done && i === lastDone;
                    const lineAfter = i < pasos.length - 1;

                    return (
                        <div key={i} className="flex items-start flex-1 last:flex-none">
                            <div className="flex flex-col items-center min-w-[52px]">
                                <div
                                    className={`
                                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0
                                        ${done && config
                                            ? `${config.circle}${isActive ? ` ring-2 ${config.ring}` : ''}`
                                            : 'bg-white border-gray-300 text-gray-400'
                                        }
                                    `}
                                    title={paso.label + (paso.fecha ? ': ' + paso.fecha : ': Pendiente')}
                                >
                                    {done ? (
                                        isActive ? i + 1 : (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                <span className={`text-[9px] mt-0.5 whitespace-nowrap leading-tight font-medium text-center ${done ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {paso.label}
                                </span>
                                {paso.fecha && (
                                    <span className="text-[9px] text-gray-400 whitespace-nowrap leading-tight text-center">
                                        {paso.fecha}
                                    </span>
                                )}
                            </div>

                            {lineAfter && (
                                <div className="flex-1 flex items-start pt-3.5 mx-1">
                                    <div className={`w-full h-0.5 ${i < lastDone && config ? config.line : 'bg-gray-200'}`} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TestTube className="h-5 w-5" />
                            Estudios del periodo
                        </CardTitle>
                        <CardDescription>{estudios.length} estudios encontrados</CardDescription>
                    </div>

                    {/* Control de columnas */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectorAbierto(!selectorAbierto)}
                            className="flex items-center gap-2 text-xs"
                        >
                            Columnas visibles
                            {selectorAbierto ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>

                        {selectorAbierto && (
                            <>
                                {/* Overlay para cerrar al hacer click fuera */}
                                <div className="fixed inset-0 z-10" onClick={() => setSelectorAbierto(false)} />

                                <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-56">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-700">Mostrar columnas</span>
                                        <button
                                            onClick={resetColumnas}
                                            className="text-xs text-[#189BAF] hover:underline"
                                        >
                                            Restablecer
                                        </button>
                                    </div>
                                    <div className="space-y-1 max-h-72 overflow-y-auto">
                                        {COLUMNAS.map(col => (
                                            <label
                                                key={col.key}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!!columnasVisibles[col.key]}
                                                    onChange={() => toggleColumna(col.key)}
                                                    className="accent-[#189BAF]"
                                                />
                                                <span className="text-xs text-gray-700">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                {COLUMNAS.filter(c => columnasVisibles[c.key]).map(col => (
                                    <th
                                        key={col.key}
                                        className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {estudios.map((estudio, index) => (
                                <tr key={estudio.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    {COLUMNAS.filter(c => columnasVisibles[c.key]).map(col =>
                                        renderCelda(col.key, estudio, index)
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}