import { useState, useRef, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Plus, X, Search, CheckCircle, Clock, RefreshCw } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface SolicitudCliente {
    id: number;
    folio_merck: string;
    tipo_solicitud: string;
    cantidad: number;
    medico: string;
    id_medico: number | null;
    institucion: string;
    id_institucion: number | null;
    solicita: string;
    preguntar_por: string;
    telefono: string;
    celular: string;
    programar_para: string;
    programar_para_formato: string;
    horario: string;
    dirigirse_a: string;
    muestra_calle: string;
    muestra_numero_ext: string;
    muestra_numero_int: string;
    muestra_colonia: string;
    muestra_municipio: string;
    muestra_estado: string;
    muestra_codigo_postal: string;
    email_guia: string;
    email_resultados: string;
    kam: string;
    pal: string;
    estado: 'pendiente' | 'confirmada' | 'convertida';
    notas: string;
    creado_por: string;
    created_at: string;
}

interface MedicoResult {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
    PREFIJO: string;
    USUARIO_CORREO: string;
}

interface InstitucionResult {
    ID_INSTITUCION: number;
    INSTITUCION_NOMBRE: string;
    INSTITUCION_CIUDAD: string;
}

interface FormData {
    FOLIO_MERCK: string;
    TIPO_SOLICITUD: string;
    CANTIDAD: number;
    ID_MEDICO: number | null;
    MEDICO_NOMBRE_LIBRE: string;
    ID_INSTITUCION: number | null;
    INSTITUCION_NOMBRE_LIBRE: string;
    SOLICITA: string;
    PREGUNTAR_POR: string;
    TELEFONO: string;
    CELULAR: string;
    PROGRAMAR_PARA: string;
    HORARIO: string;
    DIRIGIRSE_A: string;
    MUESTRA_CALLE: string;
    MUESTRA_NUMERO_EXT: string;
    MUESTRA_NUMERO_INT: string;
    MUESTRA_COLONIA: string;
    MUESTRA_MUNICIPIO: string;
    MUESTRA_ESTADO: string;
    MUESTRA_CODIGO_POSTAL: string;
    EMAIL_GUIA: string;
    EMAIL_RESULTADOS: string;
    KAM: string;
    PAL: string;
    NOTAS: string;
}

const FORM_INICIAL: FormData = {
    FOLIO_MERCK: '',
    TIPO_SOLICITUD: '',
    CANTIDAD: 1,
    ID_MEDICO: null,
    MEDICO_NOMBRE_LIBRE: '',
    ID_INSTITUCION: null,
    INSTITUCION_NOMBRE_LIBRE: '',
    SOLICITA: '',
    PREGUNTAR_POR: '',
    TELEFONO: '',
    CELULAR: '',
    PROGRAMAR_PARA: '',
    HORARIO: '',
    DIRIGIRSE_A: '',
    MUESTRA_CALLE: '',
    MUESTRA_NUMERO_EXT: '',
    MUESTRA_NUMERO_INT: '',
    MUESTRA_COLONIA: '',
    MUESTRA_MUNICIPIO: '',
    MUESTRA_ESTADO: 'ninguno',
    MUESTRA_CODIGO_POSTAL: '',
    EMAIL_GUIA: '',
    EMAIL_RESULTADOS: '',
    KAM: '',
    PAL: '',
    NOTAS: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function BadgeEstado({ estado }: { estado: SolicitudCliente['estado'] }) {
    if (estado === 'convertida') {
        return (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" /> Convertida
            </span>
        );
    }
    if (estado === 'confirmada') {
        return (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" /> Confirmada
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" /> Pendiente
        </span>
    );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
    solicitudes: SolicitudCliente[];
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function SolicitudesClienteTabla({ solicitudes: solicitudesIniciales }: Props) {
    const [solicitudes, setSolicitudes] = useState<SolicitudCliente[]>(solicitudesIniciales);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    const [form, setForm] = useState<FormData>(FORM_INICIAL);

    // Búsqueda de médico
    const [medicoSearch, setMedicoSearch] = useState({ texto: '', resultados: [] as MedicoResult[], abierto: false, cargando: false });
    const medicoTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Búsqueda de institución
    const [institucionSearch, setInstitucionSearch] = useState({ texto: '', resultados: [] as InstitucionResult[], abierto: false, cargando: false });
    const institucionTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // -----------------------------------------------------------------------
    // Cargar solicitudes al montar el componente
    // -----------------------------------------------------------------------

    const cargarSolicitudes = useCallback(async () => {
        try {
            const data = await fetch('/reportes/solicitudes/mias', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            }).then(r => r.json());
            setSolicitudes(data);
        } catch {
            // Si falla, dejamos lo que ya estaba en el estado
        }
    }, []);

    useEffect(() => {
        cargarSolicitudes();
    }, [cargarSolicitudes]);

    // -----------------------------------------------------------------------
    // Búsqueda de médico
    // -----------------------------------------------------------------------

    const buscarMedico = useCallback((q: string) => {
        if (!q.trim()) {
            setMedicoSearch(prev => ({ ...prev, resultados: [], abierto: false }));
            return;
        }
        setMedicoSearch(prev => ({ ...prev, cargando: true, abierto: true }));
        fetch(`/reportes/api/medicos?q=${encodeURIComponent(q)}`)
            .then(r => r.json())
            .then(data => setMedicoSearch(prev => ({ ...prev, resultados: data, cargando: false })))
            .catch(() => setMedicoSearch(prev => ({ ...prev, cargando: false })));
    }, []);

    const handleMedicoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setMedicoSearch(prev => ({ ...prev, texto: v }));
        setForm(prev => ({ ...prev, ID_MEDICO: null, MEDICO_NOMBRE_LIBRE: v }));
        if (medicoTimeoutRef.current) clearTimeout(medicoTimeoutRef.current);
        medicoTimeoutRef.current = setTimeout(() => buscarMedico(v), 350);
    };

    const seleccionarMedico = (m: MedicoResult) => {
        const nombre = `${m.PREFIJO ? m.PREFIJO + ' ' : ''}${m.USUARIO_NOMBRE} ${m.USUARIO_APELLIDOS}`;
        setMedicoSearch({ texto: nombre, resultados: [], abierto: false, cargando: false });
        setForm(prev => ({ ...prev, ID_MEDICO: m.ID_USUARIO, MEDICO_NOMBRE_LIBRE: nombre }));
    };

    // -----------------------------------------------------------------------
    // Búsqueda de institución
    // -----------------------------------------------------------------------

    const buscarInstitucion = useCallback((q: string) => {
        if (!q.trim()) {
            setInstitucionSearch(prev => ({ ...prev, resultados: [], abierto: false }));
            return;
        }
        setInstitucionSearch(prev => ({ ...prev, cargando: true, abierto: true }));
        fetch(`/reportes/api/instituciones?q=${encodeURIComponent(q)}`)
            .then(r => r.json())
            .then(data => setInstitucionSearch(prev => ({ ...prev, resultados: data, cargando: false })))
            .catch(() => setInstitucionSearch(prev => ({ ...prev, cargando: false })));
    }, []);

    const handleInstitucionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setInstitucionSearch(prev => ({ ...prev, texto: v }));
        setForm(prev => ({ ...prev, ID_INSTITUCION: null, INSTITUCION_NOMBRE_LIBRE: v }));
        if (institucionTimeoutRef.current) clearTimeout(institucionTimeoutRef.current);
        institucionTimeoutRef.current = setTimeout(() => buscarInstitucion(v), 350);
    };

    const seleccionarInstitucion = (i: InstitucionResult) => {
        setInstitucionSearch({ texto: i.INSTITUCION_NOMBRE, resultados: [], abierto: false, cargando: false });
        setForm(prev => ({ ...prev, ID_INSTITUCION: i.ID_INSTITUCION, INSTITUCION_NOMBRE_LIBRE: i.INSTITUCION_NOMBRE }));
    };

    // -----------------------------------------------------------------------
    // Formulario
    // -----------------------------------------------------------------------

    const setField = (key: keyof FormData, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const resetFormulario = () => {
        setForm(FORM_INICIAL);
        setMedicoSearch({ texto: '', resultados: [], abierto: false, cargando: false });
        setInstitucionSearch({ texto: '', resultados: [], abierto: false, cargando: false });
        setMensaje(null);
    };

    const handleCancelar = () => {
        resetFormulario();
        setMostrarFormulario(false);
    };

    const handleSubmit = async () => {
        if (!form.TIPO_SOLICITUD || !form.PROGRAMAR_PARA) {
            setMensaje({ tipo: 'error', texto: 'Tipo de solicitud y fecha son obligatorios.' });
            return;
        }

        setGuardando(true);
        setMensaje(null);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const response = await fetch('/reportes/solicitudes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                await cargarSolicitudes();
                setMensaje({ tipo: 'ok', texto: 'Solicitud enviada correctamente. En breve nos pondremos en contacto.' });
                resetFormulario();
                setMostrarFormulario(false);
            } else {
                const data = await response.json().catch(() => ({}));
                const errores = data.errors ? Object.values(data.errors).flat().join(' ') : 'Error al enviar la solicitud.';
                setMensaje({ tipo: 'error', texto: errores as string });
            }
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error de conexión. Intenta de nuevo.' });
        } finally {
            setGuardando(false);
        }
    };

    // -----------------------------------------------------------------------
    // Estilos compartidos de input
    // -----------------------------------------------------------------------

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const sectionTitle = "text-xs font-semibold text-[#189BAF] uppercase tracking-wide border-b border-[#189BAF]/20 pb-1 mb-3 mt-5";

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <div className="space-y-4">

            {/* Mensaje global */}
            {mensaje && (
                <div className={`rounded-lg px-4 py-3 text-sm flex items-start justify-between gap-2 ${
                    mensaje.tipo === 'ok'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <span>{mensaje.texto}</span>
                    <button onClick={() => setMensaje(null)} className="shrink-0 mt-0.5">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Botón nueva solicitud */}
            {!mostrarFormulario && (
                <div className="flex justify-end">
                    <Button
                        onClick={() => setMostrarFormulario(true)}
                        className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Solicitud
                    </Button>
                </div>
            )}

            {/* Formulario de nueva solicitud */}
            {mostrarFormulario && (
                <Card className="border-2 border-[#189BAF]/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-[#189BAF]" />
                                Nueva Solicitud de Recolección
                            </CardTitle>
                            <button onClick={handleCancelar} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        {/* Datos generales */}
                        <p className={sectionTitle}>Datos generales</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Folio</label>
                                <input className={inputClass} type="text" placeholder="Ej. 13930"
                                    value={form.FOLIO_MERCK} onChange={e => setField('FOLIO_MERCK', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Tipo de Solicitud *</label>
                                <select className={inputClass} value={form.TIPO_SOLICITUD} onChange={e => setField('TIPO_SOLICITUD', e.target.value)}>
                                    <option value="">Selecciona...</option>
                                    <option value="Envío de KIT BL">Envío de KIT BL</option>
                                    <option value="Envío de KIT BL">Envío de KIT BS</option>
                                    <option value="Guía y recolección BS">Guía y recolección BL</option>
                                    <option value="Guía y recolección BS">Guía y recolección BS</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Cantidad de muestras *</label>
                                <input className={inputClass} type="number" min={1} max={20}
                                    value={form.CANTIDAD} onChange={e => setField('CANTIDAD', parseInt(e.target.value) || 1)} />
                            </div>
                        </div>

                        {/* Médico */}
                        <p className={sectionTitle}>Médico</p>
                        <div className="relative">
                            <label className={labelClass}>Buscar médico registrado (o escribe el nombre)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    className={`${inputClass} pl-9`}
                                    type="text"
                                    placeholder="Nombre del médico..."
                                    value={medicoSearch.texto}
                                    onChange={handleMedicoInput}
                                    onFocus={() => medicoSearch.resultados.length > 0 && setMedicoSearch(p => ({ ...p, abierto: true }))}
                                />
                            </div>
                            {form.ID_MEDICO && (
                                <p className="text-xs text-green-600 mt-1">✓ Médico registrado seleccionado (ID: {form.ID_MEDICO})</p>
                            )}
                            {medicoSearch.abierto && medicoSearch.resultados.length > 0 && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMedicoSearch(p => ({ ...p, abierto: false }))} />
                                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {medicoSearch.resultados.map(m => (
                                            <button
                                                key={m.ID_USUARIO}
                                                type="button"
                                                onClick={() => seleccionarMedico(m)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-[#189BAF]/10 border-b border-gray-100 last:border-0"
                                            >
                                                <span className="font-medium">{m.PREFIJO ? m.PREFIJO + ' ' : ''}{m.USUARIO_NOMBRE} {m.USUARIO_APELLIDOS}</span>
                                                <span className="text-gray-400 text-xs ml-2">{m.USUARIO_CORREO}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Institución */}
                        <p className={sectionTitle}>Institución</p>
                        <div className="relative">
                            <label className={labelClass}>Buscar institución registrada (o escribe el nombre)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    className={`${inputClass} pl-9`}
                                    type="text"
                                    placeholder="Nombre de la institución..."
                                    value={institucionSearch.texto}
                                    onChange={handleInstitucionInput}
                                    onFocus={() => institucionSearch.resultados.length > 0 && setInstitucionSearch(p => ({ ...p, abierto: true }))}
                                />
                            </div>
                            {form.ID_INSTITUCION && (
                                <p className="text-xs text-green-600 mt-1">✓ Institución registrada seleccionada (ID: {form.ID_INSTITUCION})</p>
                            )}
                            {institucionSearch.abierto && institucionSearch.resultados.length > 0 && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setInstitucionSearch(p => ({ ...p, abierto: false }))} />
                                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {institucionSearch.resultados.map(i => (
                                            <button
                                                key={i.ID_INSTITUCION}
                                                type="button"
                                                onClick={() => seleccionarInstitucion(i)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-[#189BAF]/10 border-b border-gray-100 last:border-0"
                                            >
                                                <span className="font-medium">{i.INSTITUCION_NOMBRE}</span>
                                                {i.INSTITUCION_CIUDAD && <span className="text-gray-400 text-xs ml-2">{i.INSTITUCION_CIUDAD}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Contacto */}
                        <p className={sectionTitle}>Contacto</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Solicita</label>
                                <input className={inputClass} type="text" placeholder="Nombre de quien solicita"
                                    value={form.SOLICITA} onChange={e => setField('SOLICITA', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Preguntar por</label>
                                <input className={inputClass} type="text"
                                    value={form.PREGUNTAR_POR} onChange={e => setField('PREGUNTAR_POR', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Teléfono</label>
                                <input className={inputClass} type="text"
                                    value={form.TELEFONO} onChange={e => setField('TELEFONO', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Celular</label>
                                <input className={inputClass} type="text"
                                    value={form.CELULAR} onChange={e => setField('CELULAR', e.target.value)} />
                            </div>
                        </div>

                        {/* Recolección */}
                        <p className={sectionTitle}>Recolección programada</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Recolectar el día *</label>
                                <input className={inputClass} type="date"
                                    value={form.PROGRAMAR_PARA}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setField('PROGRAMAR_PARA', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Horario</label>
                                <input className={inputClass} type="text" placeholder="Ej. 09:00 A 17:00 HRS."
                                    value={form.HORARIO} onChange={e => setField('HORARIO', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Dirigirse a</label>
                            <input className={inputClass} type="text" placeholder="Área, recepción, etc."
                                value={form.DIRIGIRSE_A} onChange={e => setField('DIRIGIRSE_A', e.target.value)} />
                        </div>

                        {/* Dirección */}
                        <p className={sectionTitle}>Dirección de recolección</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Calle</label>
                                <input className={inputClass} type="text"
                                    value={form.MUESTRA_CALLE} onChange={e => setField('MUESTRA_CALLE', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Núm. Ext.</label>
                                <input className={inputClass} type="text"
                                    value={form.MUESTRA_NUMERO_EXT} onChange={e => setField('MUESTRA_NUMERO_EXT', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Núm. Int.</label>
                                <input className={inputClass} type="text"
                                    value={form.MUESTRA_NUMERO_INT} onChange={e => setField('MUESTRA_NUMERO_INT', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Colonia</label>
                                <input className={inputClass} type="text"
                                    value={form.MUESTRA_COLONIA} onChange={e => setField('MUESTRA_COLONIA', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Municipio</label>
                                <input className={inputClass} type="text"
                                    value={form.MUESTRA_MUNICIPIO} onChange={e => setField('MUESTRA_MUNICIPIO', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Estado</label>
                                <select className={inputClass} value={form.MUESTRA_ESTADO} onChange={e => setField('MUESTRA_ESTADO', e.target.value)}>
                                    <option value="ninguno">Selecciona...</option>
                                    <option value="Aguascalientes">Aguascalientes</option>
                                    <option value="Baja California">Baja California</option>
                                    <option value="Baja California Sur">Baja California Sur</option>
                                    <option value="Campeche">Campeche</option>
                                    <option value="Chiapas">Chiapas</option>
                                    <option value="Chihuahua">Chihuahua</option>
                                    <option value="Coahuila">Coahuila</option>
                                    <option value="Colima">Colima</option>
                                    <option value="Ciudad de México">Ciudad de México</option>
                                    <option value="Durango">Durango</option>
                                    <option value="Estado de México">Estado de México</option>
                                    <option value="Guanajuato">Guanajuato</option>
                                    <option value="Guerrero">Guerrero</option>
                                    <option value="Hidalgo">Hidalgo</option>
                                    <option value="Jalisco">Jalisco</option>
                                    <option value="Michoacán">Michoacán</option>
                                    <option value="Morelos">Morelos</option>
                                    <option value="Nayarit">Nayarit</option>
                                    <option value="Nuevo León">Nuevo León</option>
                                    <option value="Oaxaca">Oaxaca</option>
                                    <option value="Puebla">Puebla</option>
                                    <option value="Querétaro">Querétaro</option>
                                    <option value="Quintana Roo">Quintana Roo</option>
                                    <option value="San Luis Potosí">San Luis Potosí</option>
                                    <option value="Sinaloa">Sinaloa</option>
                                    <option value="Sonora">Sonora</option>
                                    <option value="Tabasco">Tabasco</option>
                                    <option value="Tamaulipas">Tamaulipas</option>
                                    <option value="Tlaxcala">Tlaxcala</option>
                                    <option value="Veracruz">Veracruz</option>
                                    <option value="Yucatán">Yucatán</option>
                                    <option value="Zacatecas">Zacatecas</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>C.P.</label>
                                <input className={inputClass} type="text" placeholder="12345"
                                    value={form.MUESTRA_CODIGO_POSTAL} onChange={e => setField('MUESTRA_CODIGO_POSTAL', e.target.value)} />
                            </div>
                        </div>

                        {/* Correos */}
                        <p className={sectionTitle}>Correos</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Email envío de guía</label>
                                <input className={inputClass} type="email"
                                    value={form.EMAIL_GUIA} onChange={e => setField('EMAIL_GUIA', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Email envío de resultados</label>
                                <input className={inputClass} type="email"
                                    value={form.EMAIL_RESULTADOS} onChange={e => setField('EMAIL_RESULTADOS', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>KAM</label>
                                <input className={inputClass} type="text"
                                    value={form.KAM} onChange={e => setField('KAM', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>PAL</label>
                                <input className={inputClass} type="text"
                                    value={form.PAL} onChange={e => setField('PAL', e.target.value)} />
                            </div>
                        </div>

                        {/* Notas */}
                        <p className={sectionTitle}>Notas adicionales</p>
                        <textarea className={inputClass} rows={3} placeholder="Indicaciones especiales, referencias, etc."
                            value={form.NOTAS} onChange={e => setField('NOTAS', e.target.value)} />

                        {/* Acciones */}
                        <div className="flex justify-end gap-3 pt-2 border-t">
                            <Button variant="outline" onClick={handleCancelar} disabled={guardando}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={guardando}
                                className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                            >
                                {guardando ? (
                                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
                                ) : (
                                    <><ClipboardList className="h-4 w-4 mr-2" /> Enviar Solicitud</>
                                )}
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            )}

            {/* Tabla de solicitudes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Mis Solicitudes
                    </CardTitle>
                    <CardDescription>{solicitudes.length} solicitud(es) registrada(s)</CardDescription>
                </CardHeader>
                <CardContent>
                    {solicitudes.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No tienes solicitudes registradas.</p>
                            <p className="text-xs mt-1">Usa el botón "Nueva Solicitud" para crear una.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">#</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Folio</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Tipo</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Cant.</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Médico</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Institución</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Programada para</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Estado</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Enviada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.map((s, index) => (
                                        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-2 px-3 text-gray-400 text-xs">{index + 1}</td>
                                            <td className="py-2 px-3 font-mono font-semibold text-[#189BAF] whitespace-nowrap">
                                                {s.folio_merck || '—'}
                                            </td>
                                            <td className="py-2 px-3 text-xs text-gray-600 whitespace-nowrap">{s.tipo_solicitud}</td>
                                            <td className="py-2 px-3 text-xs text-center font-semibold">{s.cantidad}</td>
                                            <td className="py-2 px-3 text-xs whitespace-nowrap">{s.medico}</td>
                                            <td className="py-2 px-3 text-xs whitespace-nowrap">{s.institucion}</td>
                                            <td className="py-2 px-3 text-xs whitespace-nowrap">
                                                {s.programar_para_formato || s.programar_para || '—'}
                                            </td>
                                            <td className="py-2 px-3 whitespace-nowrap">
                                                <BadgeEstado estado={s.estado} />
                                            </td>
                                            <td className="py-2 px-3 text-xs text-gray-400 whitespace-nowrap">{s.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}