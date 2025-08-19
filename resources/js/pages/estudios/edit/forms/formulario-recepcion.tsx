import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, FileText, Plus } from 'lucide-react';

interface FormularioRecepcionProps {
    estudio: any;
    pacientes: any[];
    onDataChange: (data: any) => void;
    errors?: Partial<Record<string, string>>;
}

const TIPOS_MUESTRA = [
    'Bloque de parafina',
    'Bloque de parafina y laminillas', 
    'Laminillas',
    'Sangre total',
    'Muestra Tisular',
    'Muestra Citológica'
];

const TIPOS_ESTUDIO = [
    'Biopsia Sólida',
    'Biopsia Líquida'
];

const GENEROS = [
    'Masculino',
    'Femenino'
];

export default function FormularioRecepcion({
    estudio,
    pacientes = [],
    onDataChange,
    errors = {}
}: FormularioRecepcionProps) {
    const [localData, setLocalData] = useState({
        // Fecha y hora de recepción
        FechaRecepcion: estudio.FECHA_RECEPCION ? new Date(estudio.FECHA_RECEPCION).toISOString().split('T')[0] : '',
        HoraRecepcion: estudio.FECHA_RECEPCION ? new Date(estudio.FECHA_RECEPCION).toTimeString().slice(0, 5) : '',
        
        // Paciente
        IdPaciente: estudio.ID_PACIENTE || '',
        NombreUsuario: '',
        ApellidosUsuario: '',
        CorreoUsuario: '',
        TelefonoUsuario: '',
        
        // Información de muestra
        MuestraGenero: estudio.MUESTRA_GENERO || '',
        MuestraEdad: estudio.MUESTRA_EDAD || '',
        MuestraClave: estudio.MUESTRA_CLAVE || '',
        MuestraFolioSobre: estudio.MUESTRA_FOLIO_SOBRE || '',
        MuestraFolioKitBl: estudio.MUESTRA_FOLIO_KIT_BL || '',
        MuestraOtrosRotulos: estudio.MUESTRA_OTROS_ROTULOS || '',
        MuestraIniciales: estudio.MUESTRA_INICIALES || '',
        MuestraSitioLesion: estudio.MUESTRA_SITIO_LESION || '',
        MuestraTipoEstudio: estudio.MUESTRA_TIPO_ESTUDIO || '',
        MuestraTipo: estudio.MUESTRA_TIPO || '',
        MuestraBloques: estudio.MUESTRA_BLOQUES || '',
        MuestraLaminillas: estudio.MUESTRA_LAMINILLAS || '',
        MuestraDiagnosticoClinico: estudio.MUESTRA_DIAGNOSTICO_CLINICO || '',
        MuestraDiagnosticoHistopatologicoReferencia: estudio.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA || '',
    });

    const [mostrarNuevoPaciente, setMostrarNuevoPaciente] = useState(false);
    const [correosCopia, setCorreosCopia] = useState([]);

    const handleChange = (key: string, value: any) => {
        // Convertir "none" a string vacío para mantener compatibilidad
        const processedValue = value === "none" ? "" : value;
        const newData = { ...localData, [key]: processedValue };
        setLocalData(newData);
        onDataChange(newData);
    };

    const handlePacienteChange = (value: string) => {
        if (value === 'nuevo') {
            setMostrarNuevoPaciente(true);
            handleChange('IdPaciente', 0);
        } else {
            setMostrarNuevoPaciente(false);
            handleChange('IdPaciente', parseInt(value));
        }
    };

    const agregarCorreoCopia = () => {
        // Funcionalidad para agregar correos de copia
        console.log('Agregar correo de copia');
    };

    const pacienteActual = pacientes.find(p => p.ID_USUARIO == estudio.ID_PACIENTE);
    const requiereBloques = localData.MuestraTipo === 'Bloque de parafina' || localData.MuestraTipo === 'Bloque de parafina y laminillas';
    const requiereLaminillas = localData.MuestraTipo === 'Bloque de parafina y laminillas' || localData.MuestraTipo === 'Laminillas';

    return (
        <div className="space-y-6">
            {/* Fecha y hora de recepción */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#189BAF]" />
                        Recepción de la muestra
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="FechaRecepcion">
                                Fecha <small className="text-gray-500">(dd/mm/aaaa)</small>
                            </Label>
                            <Input
                                id="FechaRecepcion"
                                type="date"
                                value={localData.FechaRecepcion}
                                onChange={(e) => handleChange('FechaRecepcion', e.target.value)}
                                className={errors.FechaRecepcion ? 'border-red-500' : ''}
                            />
                            {errors.FechaRecepcion && <p className="text-red-500 text-sm mt-1">{errors.FechaRecepcion}</p>}
                        </div>
                        <div>
                            <Label htmlFor="HoraRecepcion">
                                Hora <small className="text-gray-500">(00:00 am/pm)</small>
                            </Label>
                            <Input
                                id="HoraRecepcion"
                                type="time"
                                value={localData.HoraRecepcion}
                                onChange={(e) => handleChange('HoraRecepcion', e.target.value)}
                                className={errors.HoraRecepcion ? 'border-red-500' : ''}
                            />
                            {errors.HoraRecepcion && <p className="text-red-500 text-sm mt-1">{errors.HoraRecepcion}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del paciente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-[#189BAF]" />
                            Paciente y Muestra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pacienteActual && estudio.ID_PACIENTE ? (
                            <div className="space-y-2">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p><strong>Paciente:</strong> {pacienteActual.USUARIO_NOMBRE} {pacienteActual.USUARIO_APELLIDOS}</p>
                                    <p><strong>Correo:</strong> {pacienteActual.USUARIO_CORREO}</p>
                                    <p><strong>Teléfono:</strong> {pacienteActual.USUARIO_TELEFONO}</p>
                                </div>
                                
                                <div>
                                    <Label htmlFor="IdPaciente">Cambiar Paciente</Label>
                                    <Select
                                        value={localData.IdPaciente?.toString() || ''}
                                        onValueChange={handlePacienteChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar paciente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pacientes.map((paciente) => (
                                                <SelectItem key={paciente.ID_USUARIO} value={paciente.ID_USUARIO.toString()}>
                                                    {paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS} ({paciente.USUARIO_CORREO})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="IdPaciente">Elije el Paciente</Label>
                                <Select
                                    value={localData.IdPaciente?.toString() || ''}
                                    onValueChange={handlePacienteChange}
                                >
                                    <SelectTrigger className={errors.IdPaciente ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecciona un Paciente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Selecciona un Paciente</SelectItem>
                                        <SelectItem value="nuevo">Nuevo Paciente</SelectItem>
                                        {pacientes.map((paciente) => (
                                            <SelectItem key={paciente.ID_USUARIO} value={paciente.ID_USUARIO.toString()}>
                                                {paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS} ({paciente.USUARIO_CORREO})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.IdPaciente && <p className="text-red-500 text-sm mt-1">{errors.IdPaciente}</p>}
                            </div>
                        )}

                        {mostrarNuevoPaciente && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-semibold">Nuevo Paciente</h5>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="NombreUsuario">Nombre Paciente</Label>
                                        <Input
                                            id="NombreUsuario"
                                            value={localData.NombreUsuario}
                                            onChange={(e) => handleChange('NombreUsuario', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="ApellidosUsuario">Apellidos Paciente</Label>
                                        <Input
                                            id="ApellidosUsuario"
                                            value={localData.ApellidosUsuario}
                                            onChange={(e) => handleChange('ApellidosUsuario', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="CorreoUsuario">Correo Paciente</Label>
                                    <Input
                                        id="CorreoUsuario"
                                        type="email"
                                        value={localData.CorreoUsuario}
                                        onChange={(e) => handleChange('CorreoUsuario', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="TelefonoUsuario">Teléfono Paciente</Label>
                                    <Input
                                        id="TelefonoUsuario"
                                        value={localData.TelefonoUsuario}
                                        onChange={(e) => handleChange('TelefonoUsuario', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Lista de correos para envío de informes */}
                        <Card className="mt-4">
                            <CardContent className="p-4">
                                <h4 className="flex items-center gap-2 mb-4">
                                    <FileText className="h-4 w-4" />
                                    Lista de Correos para envío de informes
                                </h4>
                                
                                <div className="space-y-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={agregarCorreoCopia}
                                    >
                                        Enviar copia al médico
                                    </Button>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Input placeholder="Nombre completo" />
                                        <div className="flex gap-2">
                                            <Input placeholder="Correo" className="flex-1" />
                                            <Button type="button" size="sm">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Información de la muestra */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Muestra</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="MuestraGenero">Género</Label>
                                <Select
                                    value={localData.MuestraGenero || "none"}
                                    onValueChange={(value) => handleChange('MuestraGenero', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Selecciona</SelectItem>
                                        {GENEROS.map((genero) => (
                                            <SelectItem key={genero} value={genero}>
                                                {genero}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="MuestraEdad">Edad</Label>
                                <Input
                                    id="MuestraEdad"
                                    value={localData.MuestraEdad}
                                    onChange={(e) => handleChange('MuestraEdad', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="MuestraClave">ID Muestra Recibida</Label>
                            <Input
                                id="MuestraClave"
                                value={localData.MuestraClave}
                                onChange={(e) => handleChange('MuestraClave', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="MuestraFolioSobre">Folio Sobre</Label>
                                <Input
                                    id="MuestraFolioSobre"
                                    value={localData.MuestraFolioSobre}
                                    onChange={(e) => handleChange('MuestraFolioSobre', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="MuestraFolioKitBl">Folio KIT BL</Label>
                                <Input
                                    id="MuestraFolioKitBl"
                                    value={localData.MuestraFolioKitBl}
                                    onChange={(e) => handleChange('MuestraFolioKitBl', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="MuestraOtrosRotulos">Otros Rótulos</Label>
                            <Textarea
                                id="MuestraOtrosRotulos"
                                value={localData.MuestraOtrosRotulos}
                                onChange={(e) => handleChange('MuestraOtrosRotulos', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="MuestraIniciales">Iniciales del Paciente</Label>
                            <Input
                                id="MuestraIniciales"
                                value={localData.MuestraIniciales}
                                onChange={(e) => handleChange('MuestraIniciales', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="MuestraSitioLesion">Sitio de la lesión</Label>
                            <Input
                                id="MuestraSitioLesion"
                                value={localData.MuestraSitioLesion}
                                onChange={(e) => handleChange('MuestraSitioLesion', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="MuestraTipoEstudio">Tipo de Estudio</Label>
                            <Select
                                value={localData.MuestraTipoEstudio || "none"}
                                onValueChange={(value) => handleChange('MuestraTipoEstudio', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Selecciona</SelectItem>
                                    {TIPOS_ESTUDIO.map((tipo) => (
                                        <SelectItem key={tipo} value={tipo}>
                                            {tipo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="MuestraTipo">Tipo de Muestra</Label>
                            <Select
                                value={localData.MuestraTipo || "none"}
                                onValueChange={(value) => handleChange('MuestraTipo', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Selecciona</SelectItem>
                                    {TIPOS_MUESTRA.map((tipo) => (
                                        <SelectItem key={tipo} value={tipo}>
                                            {tipo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {requiereBloques && (
                            <div>
                                <Label htmlFor="MuestraBloques">Bloques</Label>
                                <Input
                                    id="MuestraBloques"
                                    value={localData.MuestraBloques}
                                    onChange={(e) => handleChange('MuestraBloques', e.target.value)}
                                />
                            </div>
                        )}

                        {requiereLaminillas && (
                            <div>
                                <Label htmlFor="MuestraLaminillas">Laminillas</Label>
                                <Input
                                    id="MuestraLaminillas"
                                    value={localData.MuestraLaminillas}
                                    onChange={(e) => handleChange('MuestraLaminillas', e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="MuestraDiagnosticoClinico">Diagnóstico Clínico</Label>
                            <Input
                                id="MuestraDiagnosticoClinico"
                                value={localData.MuestraDiagnosticoClinico}
                                onChange={(e) => handleChange('MuestraDiagnosticoClinico', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="MuestraDiagnosticoHistopatologicoReferencia">
                                Diagnóstico Histopatológico de Referencia
                            </Label>
                            <Textarea
                                id="MuestraDiagnosticoHistopatologicoReferencia"
                                value={localData.MuestraDiagnosticoHistopatologicoReferencia}
                                onChange={(e) => handleChange('MuestraDiagnosticoHistopatologicoReferencia', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}