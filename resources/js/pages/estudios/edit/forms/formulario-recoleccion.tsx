import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, DollarSign, Building, User, MapPin } from 'lucide-react';

interface FormularioRecoleccionProps {
    estudio: any;
    medicos: any[];
    instituciones: any[];
    clientes: any[];
    onDataChange: (data: any) => void;
    errors?: Partial<Record<string, string>>;
}

const ESTADOS_MEXICO = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const MENSAJERIAS = [
    'Fedex', 'DHL', 'Punto a Punto', 'Porteo', 'GOAX', '3d', 'Soluciones', 'Voydevolada', 'Otra'
];

const TIPOS_ENVIO = ['Local', 'Nacional'];

export default function FormularioRecoleccion({
    estudio,
    medicos = [],
    instituciones = [],
    clientes = [],
    onDataChange,
    errors = {}
}: FormularioRecoleccionProps) {
    const [localData, setLocalData] = useState({
        // Información básica
        ClaveInterna: estudio.CLAVE_INTERNA || '',
        FolioMerck: estudio.FOLIO_MERCK || '',
        FechaSolicitudRecoleccion: estudio.FECHA_SOLICITUD_RECOLECCION ? 
            new Date(estudio.FECHA_SOLICITUD_RECOLECCION).toISOString().split('T')[0] : '',
        HoraSolicitudRecoleccion: estudio.FECHA_SOLICITUD_RECOLECCION ? 
            new Date(estudio.FECHA_SOLICITUD_RECOLECCION).toTimeString().slice(0, 5) : '',
        
        // Relaciones
        IdCliente: estudio.ID_CLIENTE || '',
        IdMedico: estudio.ID_MEDICO || '',
        IdInstitucion: estudio.ID_INSTITUCION || '',
        
        // Dirección de recolección
        NoAplica: estudio.MUESTRA_ENVIO === 'no aplica',
        MuestraGuiaMensajeria: estudio.MUESTRA_GUIA_MENSAJERIA || '',
        MuestraGuia: estudio.MUESTRA_GUIA || '',
        MuestraReferencias: estudio.MUESTRA_REFERENCIAS || '',
        MuestraDireccion: estudio.MUESTRA_DIRECCION || '',
        MuestraNumeroExt: estudio.MUESTRA_NUMERO_EXT || '',
        MuestraNumeroInt: estudio.MUESTRA_NUMERO_INT || '',
        MuestraColonia: estudio.MUESTRA_COLONIA || '',
        MuestraMunicipio: estudio.MUESTRA_MUNICIPIO || '',
        MuestraCiudad: estudio.MUESTRA_CIUDAD || '',
        MuestraEstado: estudio.MUESTRA_ESTADO || '',
        MuestraEnvioTipo: estudio.MUESTRA_ENVIO_TIPO || '',
        MuestraCodigoPostal: estudio.MUESTRA_CODIGO_POSTAL || '',
        MuestraHorarios: estudio.MUESTRA_HORARIOS || '',
    });

    const handleChange = (key: string, value: any) => {
        // Convertir "none" a string vacío para mantener compatibilidad
        const processedValue = value === "none" ? "" : value;
        const newData = { ...localData, [key]: processedValue };
        setLocalData(newData);
        onDataChange(newData);
    };

    // Buscar información de entidades relacionadas
    const clienteActual = clientes.find(c => c.ID_CLIENTE == estudio.ID_CLIENTE);
    const medicoActual = medicos.find(m => m.ID_USUARIO == estudio.ID_MEDICO);
    const institucionActual = instituciones.find(i => i.ID_INSTITUCION == estudio.ID_INSTITUCION);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda - Información básica */}
                <div className="space-y-6">
                    {/* Información básica */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-[#189BAF]" />
                                Información Básica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="ClaveInterna">Clave Interna</Label>
                                <Input
                                    id="ClaveInterna"
                                    value={localData.ClaveInterna}
                                    onChange={(e) => handleChange('ClaveInterna', e.target.value)}
                                    className={errors.ClaveInterna ? 'border-red-500' : ''}
                                />
                                {errors.ClaveInterna && <p className="text-red-500 text-sm mt-1">{errors.ClaveInterna}</p>}
                            </div>

                            <div>
                                <Label htmlFor="FolioMerck">Folio Merck</Label>
                                <Input
                                    id="FolioMerck"
                                    value={localData.FolioMerck}
                                    onChange={(e) => handleChange('FolioMerck', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="FechaSolicitudRecoleccion">
                                    Fecha <small className="text-gray-500">(dd/mm/aaaa)</small>
                                </Label>
                                <Input
                                    id="FechaSolicitudRecoleccion"
                                    type="date"
                                    value={localData.FechaSolicitudRecoleccion}
                                    onChange={(e) => handleChange('FechaSolicitudRecoleccion', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="HoraSolicitudRecoleccion">
                                    Hora <small className="text-gray-500">(00:00 am/pm)</small>
                                </Label>
                                <Input
                                    id="HoraSolicitudRecoleccion"
                                    type="time"
                                    value={localData.HoraSolicitudRecoleccion}
                                    onChange={(e) => handleChange('HoraSolicitudRecoleccion', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-[#189BAF]" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {clienteActual && (
                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                    <p><strong>Cliente:</strong> {clienteActual.CLIENTE_NOMBRE}</p>
                                    <p><strong>Correo:</strong> {clienteActual.CLIENTE_CORREO}</p>
                                    <p><strong>Se le envía correo:</strong> {clienteActual.CLIENTE_ENVIAR_CORREO}</p>
                                </div>
                            )}
                            
                            <div>
                                <Label htmlFor="IdCliente">Cambiar al cliente</Label>
                                <Select
                                    value={localData.IdCliente?.toString() || ''}
                                    onValueChange={(value) => handleChange('IdCliente', parseInt(value))}
                                >
                                    <SelectTrigger>
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Institución */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-[#189BAF]" />
                                Institución
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {institucionActual && (
                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                    <p><strong>Institución:</strong> {institucionActual.INSTITUCION_NOMBRE}</p>
                                    <p><strong>Razón Social:</strong> {institucionActual.INSTITUCION_RAZON_SOCIAL}</p>
                                    <p><strong>R.F.C.:</strong> {institucionActual.INSTITUCION_RFC}</p>
                                    <p><strong>Correo:</strong> {institucionActual.INSTITUCION_CORREO}</p>
                                    <p><strong>Teléfono:</strong> {institucionActual.INSTITUCION_TELEFONO}</p>
                                </div>
                            )}
                            
                            <div>
                                <Label htmlFor="IdInstitucion">Cambiar la Institución</Label>
                                <Select
                                    value={localData.IdInstitucion?.toString() || ''}
                                    onValueChange={(value) => handleChange('IdInstitucion', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar institución" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instituciones.map((institucion) => (
                                            <SelectItem key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION.toString()}>
                                                {institucion.INSTITUCION_NOMBRE}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Médico */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-[#189BAF]" />
                                Médico
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {medicoActual && (
                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                    <p><strong>Médico:</strong> {medicoActual.USUARIO_NOMBRE} {medicoActual.USUARIO_APELLIDOS}</p>
                                    <p><strong>Correo:</strong> {medicoActual.USUARIO_CORREO}</p>
                                    <p><strong>Teléfono:</strong> {medicoActual.USUARIO_TELEFONO}</p>
                                </div>
                            )}
                            
                            <div>
                                <Label htmlFor="IdMedico">Cambiar Médico</Label>
                                <Select
                                    value={localData.IdMedico?.toString() || ''}
                                    onValueChange={(value) => handleChange('IdMedico', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar médico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medicos.map((medico) => (
                                            <SelectItem key={medico.ID_USUARIO} value={medico.ID_USUARIO.toString()}>
                                                {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS} ({medico.USUARIO_CORREO})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha - Dirección de recolección */}
                <div className="space-y-6">
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
                                    checked={localData.NoAplica}
                                    onCheckedChange={(checked) => handleChange('NoAplica', checked)}
                                />
                                <Label htmlFor="NoAplica">No aplica</Label>
                            </div>

                            {!localData.NoAplica && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="MuestraGuiaMensajeria">
                                            Mensajería <small className="text-gray-500">(En caso de ya estar disponible)</small>
                                        </Label>
                                        <Select
                                            value={localData.MuestraGuiaMensajeria || "none"}
                                            onValueChange={(value) => handleChange('MuestraGuiaMensajeria', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Seleccionar</SelectItem>
                                                {MENSAJERIAS.map((mensajeria) => (
                                                    <SelectItem key={mensajeria} value={mensajeria}>
                                                        {mensajeria}
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
                                            value={localData.MuestraGuia}
                                            onChange={(e) => handleChange('MuestraGuia', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="MuestraReferencias">Referencias</Label>
                                        <Textarea
                                            id="MuestraReferencias"
                                            value={localData.MuestraReferencias}
                                            onChange={(e) => handleChange('MuestraReferencias', e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <Label htmlFor="MuestraDireccion">Dirección</Label>
                                            <Textarea
                                                id="MuestraDireccion"
                                                value={localData.MuestraDireccion}
                                                onChange={(e) => handleChange('MuestraDireccion', e.target.value)}
                                                rows={4}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="MuestraNumeroExt">Número Exterior</Label>
                                                <Input
                                                    id="MuestraNumeroExt"
                                                    value={localData.MuestraNumeroExt}
                                                    onChange={(e) => handleChange('MuestraNumeroExt', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="MuestraNumeroInt">Número Interior</Label>
                                                <Input
                                                    id="MuestraNumeroInt"
                                                    value={localData.MuestraNumeroInt}
                                                    onChange={(e) => handleChange('MuestraNumeroInt', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="MuestraColonia">Colonia</Label>
                                            <Input
                                                id="MuestraColonia"
                                                value={localData.MuestraColonia}
                                                onChange={(e) => handleChange('MuestraColonia', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="MuestraMunicipio">Municipio</Label>
                                            <Input
                                                id="MuestraMunicipio"
                                                value={localData.MuestraMunicipio}
                                                onChange={(e) => handleChange('MuestraMunicipio', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="MuestraEstado">Localidad (Estado)</Label>
                                            <Select
                                                value={localData.MuestraEstado || "none"}
                                                onValueChange={(value) => handleChange('MuestraEstado', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Seleccionar</SelectItem>
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
                                                value={localData.MuestraEnvioTipo || "none"}
                                                onValueChange={(value) => handleChange('MuestraEnvioTipo', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Seleccionar</SelectItem>
                                                    {TIPOS_ENVIO.map((tipo) => (
                                                        <SelectItem key={tipo} value={tipo}>
                                                            {tipo}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="MuestraCodigoPostal">Código Postal</Label>
                                        <Input
                                            id="MuestraCodigoPostal"
                                            value={localData.MuestraCodigoPostal}
                                            onChange={(e) => handleChange('MuestraCodigoPostal', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="MuestraHorarios">Horarios</Label>
                                        <Textarea
                                            id="MuestraHorarios"
                                            value={localData.MuestraHorarios}
                                            onChange={(e) => handleChange('MuestraHorarios', e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}