import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PasoRecoleccionProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    medicos?: Array<{ ID_USUARIO: number; USUARIO_NOMBRE: string; USUARIO_APELLIDOS: string }>;
    pacientes?: Array<{ ID_USUARIO: number; USUARIO_NOMBRE: string; USUARIO_APELLIDOS: string }>;
    instituciones?: Array<{ ID_INSTITUCION: number; INSTITUCION_NOMBRE: string }>;
    clientes?: Array<{ ID_CLIENTE: number; CLIENTE_NOMBRE: string }>;
    tiposMuestra?: Record<string, string>;
    tiposEstudio?: Record<string, string>;
    generos?: Record<string, string>;
}

export default function PasoRecoleccion({
    data,
    setData,
    errors,
    medicos = [],
    pacientes = [],
    instituciones = [],
    clientes = [],
    tiposMuestra = {},
    tiposEstudio = {},
    generos = {}
}: PasoRecoleccionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Información Básica</h3>
                
                <div>
                    <Label htmlFor="FOLIO_MERCK">Folio Merck *</Label>
                    <Input
                        id="FOLIO_MERCK"
                        value={data.FOLIO_MERCK}
                        onChange={(e) => setData('FOLIO_MERCK', e.target.value)}
                        placeholder="Ingrese el folio Merck"
                        className={errors.FOLIO_MERCK ? 'border-red-500' : ''}
                    />
                    {errors.FOLIO_MERCK && <p className="text-red-500 text-sm mt-1">{errors.FOLIO_MERCK}</p>}
                </div>

                <div>
                    <Label htmlFor="ID_CLIENTE">Cliente *</Label>
                    <Select value={data.ID_CLIENTE?.toString()} onValueChange={(value) => setData('ID_CLIENTE', parseInt(value))}>
                        <SelectTrigger className={errors.ID_CLIENTE ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {clientes.map((cliente) => (
                                <SelectItem key={cliente.ID_CLIENTE} value={cliente.ID_CLIENTE.toString()}>
                                    {cliente.CLIENTE_NOMBRE}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.ID_CLIENTE && <p className="text-red-500 text-sm mt-1">{errors.ID_CLIENTE}</p>}
                </div>

                <div>
                    <Label htmlFor="CORREO_COPIA">Correo de Copia *</Label>
                    <Input
                        id="CORREO_COPIA"
                        type="email"
                        value={data.CORREO_COPIA}
                        onChange={(e) => setData('CORREO_COPIA', e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className={errors.CORREO_COPIA ? 'border-red-500' : ''}
                    />
                    {errors.CORREO_COPIA && <p className="text-red-500 text-sm mt-1">{errors.CORREO_COPIA}</p>}
                </div>

                <div>
                    <Label htmlFor="ID_MEDICO">Médico</Label>
                    <Select value={data.ID_MEDICO?.toString() || ''} onValueChange={(value) => setData('ID_MEDICO', value ? parseInt(value) : null)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar médico" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Sin médico asignado</SelectItem>
                            {medicos.map((medico) => (
                                <SelectItem key={medico.ID_USUARIO} value={medico.ID_USUARIO.toString()}>
                                    {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="ID_PACIENTE">Paciente</Label>
                    <Select value={data.ID_PACIENTE?.toString() || ''} onValueChange={(value) => setData('ID_PACIENTE', value ? parseInt(value) : null)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Sin paciente asignado</SelectItem>
                            {pacientes.map((paciente) => (
                                <SelectItem key={paciente.ID_USUARIO} value={paciente.ID_USUARIO.toString()}>
                                    {paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="ID_INSTITUCION">Institución</Label>
                    <Select value={data.ID_INSTITUCION?.toString() || ''} onValueChange={(value) => setData('ID_INSTITUCION', value ? parseInt(value) : null)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar institución" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Sin institución asignada</SelectItem>
                            {instituciones.map((institucion) => (
                                <SelectItem key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION.toString()}>
                                    {institucion.INSTITUCION_NOMBRE}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Información de Muestra */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Información de Muestra</h3>
                
                <div>
                    <Label htmlFor="MUESTRA_FOLIO_SOBRE">Folio Sobre *</Label>
                    <Input
                        id="MUESTRA_FOLIO_SOBRE"
                        value={data.MUESTRA_FOLIO_SOBRE}
                        onChange={(e) => setData('MUESTRA_FOLIO_SOBRE', e.target.value)}
                        className={errors.MUESTRA_FOLIO_SOBRE ? 'border-red-500' : ''}
                    />
                    {errors.MUESTRA_FOLIO_SOBRE && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_FOLIO_SOBRE}</p>}
                </div>

                <div>
                    <Label htmlFor="MUESTRA_FOLIO_KIT_BL">Folio Kit BL *</Label>
                    <Input
                        id="MUESTRA_FOLIO_KIT_BL"
                        value={data.MUESTRA_FOLIO_KIT_BL}
                        onChange={(e) => setData('MUESTRA_FOLIO_KIT_BL', e.target.value)}
                        className={errors.MUESTRA_FOLIO_KIT_BL ? 'border-red-500' : ''}
                    />
                    {errors.MUESTRA_FOLIO_KIT_BL && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_FOLIO_KIT_BL}</p>}
                </div>

                <div>
                    <Label htmlFor="MUESTRA_TIPO">Tipo de Muestra</Label>
                    <Select value={data.MUESTRA_TIPO || ''} onValueChange={(value) => setData('MUESTRA_TIPO', value || null)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Sin especificar</SelectItem>
                            {Object.entries(tiposMuestra).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="MUESTRA_TIPO_ESTUDIO">Tipo de Estudio *</Label>
                    <Select value={data.MUESTRA_TIPO_ESTUDIO} onValueChange={(value) => setData('MUESTRA_TIPO_ESTUDIO', value)}>
                        <SelectTrigger className={errors.MUESTRA_TIPO_ESTUDIO ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Seleccionar tipo de estudio" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(tiposEstudio).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.MUESTRA_TIPO_ESTUDIO && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_TIPO_ESTUDIO}</p>}
                </div>

                <div>
                    <Label htmlFor="MUESTRA_INICIALES">Iniciales del Paciente *</Label>
                    <Input
                        id="MUESTRA_INICIALES"
                        value={data.MUESTRA_INICIALES}
                        onChange={(e) => setData('MUESTRA_INICIALES', e.target.value)}
                        placeholder="A.B.C."
                        className={errors.MUESTRA_INICIALES ? 'border-red-500' : ''}
                    />
                    {errors.MUESTRA_INICIALES && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_INICIALES}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="MUESTRA_GENERO">Género</Label>
                        <Select value={data.MUESTRA_GENERO || ''} onValueChange={(value) => setData('MUESTRA_GENERO', value || null)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Sin especificar</SelectItem>
                                {Object.entries(generos).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_EDAD">Edad</Label>
                        <Input
                            id="MUESTRA_EDAD"
                            value={data.MUESTRA_EDAD || ''}
                            onChange={(e) => setData('MUESTRA_EDAD', e.target.value)}
                            placeholder="Ej: 45 años"
                        />
                    </div>
                </div>
            </div>

            {/* Información Adicional */}
            <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Información Adicional</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="MUESTRA_SITIO_LESION">Sitio de Lesión *</Label>
                        <Input
                            id="MUESTRA_SITIO_LESION"
                            value={data.MUESTRA_SITIO_LESION}
                            onChange={(e) => setData('MUESTRA_SITIO_LESION', e.target.value)}
                            className={errors.MUESTRA_SITIO_LESION ? 'border-red-500' : ''}
                        />
                        {errors.MUESTRA_SITIO_LESION && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_SITIO_LESION}</p>}
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_BLOQUES">Bloques *</Label>
                        <Input
                            id="MUESTRA_BLOQUES"
                            value={data.MUESTRA_BLOQUES}
                            onChange={(e) => setData('MUESTRA_BLOQUES', e.target.value)}
                            className={errors.MUESTRA_BLOQUES ? 'border-red-500' : ''}
                        />
                        {errors.MUESTRA_BLOQUES && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_BLOQUES}</p>}
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_LAMINILLAS">Laminillas *</Label>
                        <Input
                            id="MUESTRA_LAMINILLAS"
                            value={data.MUESTRA_LAMINILLAS}
                            onChange={(e) => setData('MUESTRA_LAMINILLAS', e.target.value)}
                            className={errors.MUESTRA_LAMINILLAS ? 'border-red-500' : ''}
                        />
                        {errors.MUESTRA_LAMINILLAS && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_LAMINILLAS}</p>}
                    </div>
                </div>

                <div>
                    <Label htmlFor="MUESTRA_OTROS_ROTULOS">Otros Rótulos *</Label>
                    <Textarea
                        id="MUESTRA_OTROS_ROTULOS"
                        value={data.MUESTRA_OTROS_ROTULOS}
                        onChange={(e) => setData('MUESTRA_OTROS_ROTULOS', e.target.value)}
                        className={errors.MUESTRA_OTROS_ROTULOS ? 'border-red-500' : ''}
                        rows={3}
                    />
                    {errors.MUESTRA_OTROS_ROTULOS && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_OTROS_ROTULOS}</p>}
                </div>

                <div>
                    <Label htmlFor="MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA">Diagnóstico Histopatológico de Referencia *</Label>
                    <Textarea
                        id="MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA"
                        value={data.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA}
                        onChange={(e) => setData('MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA', e.target.value)}
                        className={errors.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA ? 'border-red-500' : ''}
                        rows={3}
                    />
                    {errors.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA && (
                        <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="MUESTRA_DIAGNOSTICO_CLINICO">Diagnóstico Clínico *</Label>
                    <Textarea
                        id="MUESTRA_DIAGNOSTICO_CLINICO"
                        value={data.MUESTRA_DIAGNOSTICO_CLINICO}
                        onChange={(e) => setData('MUESTRA_DIAGNOSTICO_CLINICO', e.target.value)}
                        className={errors.MUESTRA_DIAGNOSTICO_CLINICO ? 'border-red-500' : ''}
                        rows={3}
                    />
                    {errors.MUESTRA_DIAGNOSTICO_CLINICO && <p className="text-red-500 text-sm mt-1">{errors.MUESTRA_DIAGNOSTICO_CLINICO}</p>}
                </div>

                <div>
                    <Label htmlFor="FECHA_SOLICITUD_RECOLECCION">Fecha de Solicitud</Label>
                    <Input
                        id="FECHA_SOLICITUD_RECOLECCION"
                        type="date"
                        value={data.FECHA_SOLICITUD_RECOLECCION}
                        onChange={(e) => setData('FECHA_SOLICITUD_RECOLECCION', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}