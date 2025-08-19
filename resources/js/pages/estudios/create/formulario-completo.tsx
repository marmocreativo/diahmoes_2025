import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, User, Building, MapPin, DollarSign } from 'lucide-react';

import { EstudioFormData } from '@/types';

interface FormularioCompletoProps {
    data: EstudioFormData;
    setData: (key: string, value: any) => void;
    errors: Partial<Record<string, string>>;
    medicos?: Array<{ ID_USUARIO: number; USUARIO_NOMBRE: string; USUARIO_APELLIDOS: string; USUARIO_CORREO: string }>;
    pacientes?: Array<{ ID_USUARIO: number; USUARIO_NOMBRE: string; USUARIO_APELLIDOS: string }>;
    instituciones?: Array<{ ID_INSTITUCION: number; INSTITUCION_NOMBRE: string }>;
    clientes?: Array<{ ID_CLIENTE: number; CLIENTE_NOMBRE: string }>;
    mensajerias?: Array<{ ID: number; NOMBRE: string }>;
    tiposMuestra?: Record<string, string>;
    tiposEstudio?: Record<string, string>;
    generos?: Record<string, string>;
    tiposEnvio?: Record<string, string>;
}

const ESTADOS_MEXICO = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

export default function FormularioCompleto({
    data,
    setData,
    errors,
    medicos = [],
    pacientes = [],
    instituciones = [],
    clientes = [],
    mensajerias = [],
    tiposMuestra = {},
    tiposEstudio = {},
    generos = {},
    tiposEnvio = {}
}: FormularioCompletoProps) {
    const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
    const [mostrarNuevoMedico, setMostrarNuevoMedico] = useState(false);
    const [mostrarNuevaInstitucion, setMostrarNuevaInstitucion] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-6">
                {/* Campos Hidden */}
                <input type="hidden" name="IdAleatorio" value={data.IdAleatorio} />
                <input type="hidden" name="Seriado" value={data.Seriado} />
                <input type="hidden" name="Anio" value={data.Anio} />
                <input type="hidden" name="SiguienteNumero" value={data.SiguienteNumero} />
                <input type="hidden" name="Prefijo" value={data.Prefijo} />

                {/* Sección 1: Clave y Fecha */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-[#189BAF]" />
                            Clave y Fecha
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="ClaveInterna">Clave Interna</Label>
                            <Input
                                id="ClaveInterna"
                                value={data.ClaveInterna}
                                onChange={(e) => setData('ClaveInterna', e.target.value)}
                                className={`verificar-clave ${errors.ClaveInterna ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.ClaveInterna && <p className="text-red-500 text-sm mt-1">{errors.ClaveInterna}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="FolioMerck">Folio Merck</Label>
                                <Input
                                    id="FolioMerck"
                                    value={data.FolioMerck}
                                    onChange={(e) => setData('FolioMerck', e.target.value)}
                                    className={errors.FolioMerck ? 'border-red-500' : ''}
                                />
                                {errors.FolioMerck && <p className="text-red-500 text-sm mt-1">{errors.FolioMerck}</p>}
                            </div>

                            <div>
                                <Label htmlFor="FechaSolicitudRecoleccion">
                                    Fecha <small className="text-gray-500">(dd/mm/aaaa)</small>
                                </Label>
                                <Input
                                    id="FechaSolicitudRecoleccion"
                                    type="date"
                                    value={data.FechaSolicitudRecoleccion}
                                    onChange={(e) => setData('FechaSolicitudRecoleccion', e.target.value)}
                                    className={errors.FechaSolicitudRecoleccion ? 'border-red-500' : ''}
                                    required
                                />
                                {errors.FechaSolicitudRecoleccion && <p className="text-red-500 text-sm mt-1">{errors.FechaSolicitudRecoleccion}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="HoraSolicitudRecoleccion">
                                Hora <small className="text-gray-500">(00:00 am/pm)</small>
                            </Label>
                            <Input
                                id="HoraSolicitudRecoleccion"
                                type="time"
                                value={data.HoraSolicitudRecoleccion}
                                onChange={(e) => setData('HoraSolicitudRecoleccion', e.target.value)}
                                className={errors.HoraSolicitudRecoleccion ? 'border-red-500' : ''}
                                required
                            />
                            {errors.HoraSolicitudRecoleccion && <p className="text-red-500 text-sm mt-1">{errors.HoraSolicitudRecoleccion}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 2: Clientes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-[#189BAF]" />
                            Clientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="IdCliente">Clientes</Label>
                            <Select
                                value={data.IdCliente?.toString() || ''}
                                onValueChange={(value) => {
                                    if (value === 'nuevo') {
                                        setMostrarNuevoCliente(true);
                                        setData('IdCliente', 0);
                                    } else {
                                        setMostrarNuevoCliente(false);
                                        setData('IdCliente', parseInt(value));
                                    }
                                }}
                            >
                                <SelectTrigger className={errors.IdCliente ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona un Cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Selecciona un Cliente</SelectItem>
                                    <SelectItem value="medico">Médico</SelectItem>
                                    <SelectItem value="paciente">Paciente</SelectItem>
                                    <SelectItem value="nuevo">Nuevo Cliente</SelectItem>
                                    {clientes.map((cliente) => (
                                        <SelectItem 
                                            key={cliente.ID_CLIENTE} 
                                            value={cliente.ID_CLIENTE.toString()}
                                        >
                                            {cliente.CLIENTE_NOMBRE}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.IdCliente && <p className="text-red-500 text-sm mt-1">{errors.IdCliente}</p>}
                        </div>

                        {mostrarNuevoCliente && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-semibold">Nuevo Cliente</h5>
                                
                                <div>
                                    <Label htmlFor="NombreCliente">Nombre</Label>
                                    <Input
                                        id="NombreCliente"
                                        value={data.NombreCliente || ''}
                                        onChange={(e) => setData('NombreCliente', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="CorreoCliente">Correo</Label>
                                    <Input
                                        id="CorreoCliente"
                                        type="email"
                                        value={data.CorreoCliente || ''}
                                        onChange={(e) => setData('CorreoCliente', e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="EnviarCorreoCliente"
                                        checked={data.EnviarCorreoCliente || false}
                                        onCheckedChange={(checked) => setData('EnviarCorreoCliente', checked)}
                                    />
                                    <Label htmlFor="EnviarCorreoCliente">Enviar Correos Automáticamente</Label>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sección 3: Médico */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-[#189BAF]" />
                            Médico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="IdMedico">Médico</Label>
                            <Select
                                value={data.IdMedico?.toString() || ''}
                                onValueChange={(value) => {
                                    if (value === 'nuevo') {
                                        setMostrarNuevoMedico(true);
                                        setData('IdMedico', 0);
                                    } else {
                                        setMostrarNuevoMedico(false);
                                        setData('IdMedico', parseInt(value));
                                    }
                                }}
                            >
                                <SelectTrigger className={errors.IdMedico ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona un Médico" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Selecciona un Médico</SelectItem>
                                    <SelectItem value="nuevo">Nuevo Médico</SelectItem>
                                    {medicos.map((medico) => (
                                        <SelectItem key={medico.ID_USUARIO} value={medico.ID_USUARIO.toString()}>
                                            {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS} ({medico.USUARIO_CORREO})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.IdMedico && <p className="text-red-500 text-sm mt-1">{errors.IdMedico}</p>}
                        </div>

                        {mostrarNuevoMedico && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-semibold">Nuevo Médico</h5>
                                
                                {/* Campos hidden para médico */}
                                <input type="hidden" name="UsuarioTipo" value="medico" />
                                <input type="hidden" name="PassUsuario" value="135DIAHMOES" />
                                
                                <div>
                                    <Label htmlFor="NombreUsuario">Nombre</Label>
                                    <Input
                                        id="NombreUsuario"
                                        value={data.NombreUsuario || ''}
                                        onChange={(e) => setData('NombreUsuario', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="ApellidosUsuario">Apellidos</Label>
                                    <Input
                                        id="ApellidosUsuario"
                                        value={data.ApellidosUsuario || ''}
                                        onChange={(e) => setData('ApellidosUsuario', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="CorreoUsuario">Correo</Label>
                                    <Input
                                        id="CorreoUsuario"
                                        type="email"
                                        value={data.CorreoUsuario || ''}
                                        onChange={(e) => setData('CorreoUsuario', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="TelefonoUsuario">Teléfono</Label>
                                    <Input
                                        id="TelefonoUsuario"
                                        value={data.TelefonoUsuario || ''}
                                        onChange={(e) => setData('TelefonoUsuario', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sección 4: Institución */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-[#189BAF]" />
                            Institución
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="IdInstitucion">Institución</Label>
                            <Select
                                value={data.IdInstitucion?.toString() || ''}
                                onValueChange={(value) => {
                                    if (value === 'nuevo') {
                                        setMostrarNuevaInstitucion(true);
                                        setData('IdInstitucion', 0);
                                    } else {
                                        setMostrarNuevaInstitucion(false);
                                        setData('IdInstitucion', parseInt(value));
                                    }
                                }}
                            >
                                <SelectTrigger className={errors.IdInstitucion ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona una Institución" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Selecciona una Institución</SelectItem>
                                    <SelectItem value="nuevo">Nueva Institución</SelectItem>
                                    {instituciones.map((institucion) => (
                                        <SelectItem key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION.toString()}>
                                            {institucion.INSTITUCION_NOMBRE}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.IdInstitucion && <p className="text-red-500 text-sm mt-1">{errors.IdInstitucion}</p>}
                        </div>

                        {mostrarNuevaInstitucion && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-semibold">Nueva Institución</h5>
                                
                                <div>
                                    <Label htmlFor="NombreInstitucion">Nombre Comercial</Label>
                                    <Input
                                        id="NombreInstitucion"
                                        value={data.NombreInstitucion || ''}
                                        onChange={(e) => setData('NombreInstitucion', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="CorreoInstitucion">Correo</Label>
                                    <Input
                                        id="CorreoInstitucion"
                                        type="email"
                                        value={data.CorreoInstitucion || ''}
                                        onChange={(e) => setData('CorreoInstitucion', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="TelefonoInstitucion">Teléfono</Label>
                                    <Input
                                        id="TelefonoInstitucion"
                                        value={data.TelefonoInstitucion || ''}
                                        onChange={(e) => setData('TelefonoInstitucion', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
                {/* Sección 5: Dirección de Recolección */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[#189BAF]" />
                            Dirección de Recolección
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="NoAplica"
                                checked={data.NoAplica || false}
                                onCheckedChange={(checked) => setData('NoAplica', checked)}
                            />
                            <Label htmlFor="NoAplica">No aplica</Label>
                        </div>

                        {!data.NoAplica && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="MuestraGuiaMensajeria">
                                        Mensajería <small className="text-gray-500">(En caso de ya estar disponible)</small>
                                    </Label>
                                    <Select
                                        value={data.MuestraGuiaMensajeria || ''}
                                        onValueChange={(value) => setData('MuestraGuiaMensajeria', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ninguna">Seleccionar</SelectItem>
                                            {mensajerias.map((mensajeria) => (
                                                <SelectItem key={mensajeria.ID} value={mensajeria.NOMBRE}>
                                                    {mensajeria.NOMBRE}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="MuestraGuia">
                                        No. de Guía <small className="text-gray-500">(En caso de ya estar disponible)</small>
                                    </Label>
                                    <Input
                                        id="MuestraGuia"
                                        value={data.MuestraGuia || ''}
                                        onChange={(e) => setData('MuestraGuia', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="MuestraDirigirse">Dirigirse a:</Label>
                                        <Input
                                            id="MuestraDirigirse"
                                            value={data.MuestraDirigirse || ''}
                                            onChange={(e) => setData('MuestraDirigirse', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="MuestraPreguntar">Preguntar por:</Label>
                                        <Input
                                            id="MuestraPreguntar"
                                            value={data.MuestraPreguntar || ''}
                                            onChange={(e) => setData('MuestraPreguntar', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <Label htmlFor="MuestraDireccion">Dirección</Label>
                                        <Textarea
                                            id="MuestraDireccion"
                                            value={data.MuestraDireccion || ''}
                                            onChange={(e) => setData('MuestraDireccion', e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="MuestraNumeroExt">Número Exterior</Label>
                                            <Input
                                                id="MuestraNumeroExt"
                                                value={data.MuestraNumeroExt || ''}
                                                onChange={(e) => setData('MuestraNumeroExt', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="MuestraNumeroInt">Número Interior</Label>
                                            <Input
                                                id="MuestraNumeroInt"
                                                value={data.MuestraNumeroInt || ''}
                                                onChange={(e) => setData('MuestraNumeroInt', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="MuestraColonia">Colonia</Label>
                                        <Input
                                            id="MuestraColonia"
                                            value={data.MuestraColonia || ''}
                                            onChange={(e) => setData('MuestraColonia', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="MuestraMunicipio">Municipio</Label>
                                        <Input
                                            id="MuestraMunicipio"
                                            value={data.MuestraMunicipio || ''}
                                            onChange={(e) => setData('MuestraMunicipio', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <input type="hidden" name="MuestraCiudad" value={data.MuestraCiudad || ''} />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="MuestraEstado">Localidad (Estado)</Label>
                                        <Select
                                            value={data.MuestraEstado || ''}
                                            onValueChange={(value) => setData('MuestraEstado', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ninguno">Seleccionar</SelectItem>
                                                {ESTADOS_MEXICO.map((estado) => (
                                                    <SelectItem key={estado} value={estado}>
                                                        {estado}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="MuestraEnvioTipo">Tipo de Envío</Label>
                                        <Select
                                            value={data.MuestraEnvioTipo || ''}
                                            onValueChange={(value) => setData('MuestraEnvioTipo', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ninguno">Seleccionar</SelectItem>
                                                <SelectItem value="Local">Local</SelectItem>
                                                <SelectItem value="Nacional">Nacional</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="MuestraCodigoPostal">Código Postal</Label>
                                    <Input
                                        id="MuestraCodigoPostal"
                                        value={data.MuestraCodigoPostal || ''}
                                        onChange={(e) => setData('MuestraCodigoPostal', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="MuestraHorarios">Horarios</Label>
                                    <Textarea
                                        id="MuestraHorarios"
                                        value={data.MuestraHorarios || ''}
                                        onChange={(e) => setData('MuestraHorarios', e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}