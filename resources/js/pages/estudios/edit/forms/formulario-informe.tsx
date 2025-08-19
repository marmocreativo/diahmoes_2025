import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, FileText, Mail, Plus, Trash2 } from 'lucide-react';

interface FormularioInformeProps {
    estudio: any;
    medicos: any[];
    correosCopia?: any[]; // Lista de correos desde la BD
    onDataChange: (data: any) => void;
    errors?: Partial<Record<string, string>>;
}

interface CorreoCopia {
    ID?: number; // ID de la BD (undefined para nuevos)
    NOMBRE: string;
    CORREO: string;
    ID_ESTUDIO: number;
}

export default function FormularioInforme({
    estudio,
    medicos = [],
    correosCopia = [],
    onDataChange,
    errors = {}
}: FormularioInformeProps) {
    const [localData, setLocalData] = useState({
        // Fecha y hora del informe
        FechaInforme: estudio.FECHA_INFORME ? 
            new Date(estudio.FECHA_INFORME).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
        HoraInforme: estudio.FECHA_INFORME ? 
            new Date(estudio.FECHA_INFORME).toTimeString().slice(0, 5) : 
            new Date().toTimeString().slice(0, 5),
        
        // Campos automáticos del sistema
        FechaResultadosCorreo: new Date().toISOString().split('T')[0],
        HoraResultadosCorreo: new Date().toTimeString().slice(0, 5),
        
        // Estado del estudio
        EstudioFacturado: estudio.ESTUDIO_FACTURADO || '',
        EstudioEstado: estudio.ESTUDIO_ESTADO || '',
        EstudioComentarios: estudio.ESTUDIO_COMENTARIOS || '',
        
        // Configuración de envío
        EnviarAdjunto: false,
        
        // Beneficiario (campo oculto en el original)
        Beneficiario: estudio.BENEFICIARIO || ''
    });

    const [listaCorreos, setListaCorreos] = useState<CorreoCopia[]>(correosCopia);
    const [nuevoCorreo, setNuevoCorreo] = useState({
        nombre: '',
        correo: ''
    });
    const [procesandoCorreo, setProcesandoCorreo] = useState(false);

    const handleChange = (key: string, value: any) => {
        // Convertir "none" a string vacío para mantener compatibilidad
        const processedValue = value === "none" ? "" : value;
        const newData = { ...localData, [key]: processedValue };
        setLocalData(newData);
        
        onDataChange(newData);
    };

    const handleCorreoChange = (key: string, value: string) => {
        setNuevoCorreo(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const agregarCorreoMedico = async () => {
        const medicoActual = medicos.find(m => m.ID_USUARIO == estudio.ID_MEDICO);
        if (!medicoActual || procesandoCorreo) return;
        
        // Verificar que no esté ya agregado
        const yaExiste = listaCorreos.some(c => c.CORREO === medicoActual.USUARIO_CORREO);
        if (yaExiste) return;
        
        setProcesandoCorreo(true);
        
        try {
            // Crear correo en la BD
            const response = await fetch(`/api/estudios/${estudio.ID}/correos-copia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    nombre: `${medicoActual.USUARIO_NOMBRE} ${medicoActual.USUARIO_APELLIDOS}`,
                    correo: medicoActual.USUARIO_CORREO
                })
            });
            
            if (response.ok) {
                const nuevoCorreo = await response.json();
                setListaCorreos(prev => [...prev, nuevoCorreo]);
            }
        } catch (error) {
            console.error('Error al agregar correo del médico:', error);
        } finally {
            setProcesandoCorreo(false);
        }
    };

    const agregarNuevoCorreo = async () => {
        if (!nuevoCorreo.nombre.trim() || !nuevoCorreo.correo.trim() || procesandoCorreo) return;
        
        // Verificar que no esté ya agregado
        const yaExiste = listaCorreos.some(c => c.CORREO === nuevoCorreo.correo.trim());
        if (yaExiste) return;
        
        setProcesandoCorreo(true);
        
        try {
            // Crear correo en la BD
            const response = await fetch(`/api/estudios/${estudio.ID}/correos-copia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    nombre: nuevoCorreo.nombre.trim(),
                    correo: nuevoCorreo.correo.trim()
                })
            });
            
            if (response.ok) {
                const correoCreado = await response.json();
                setListaCorreos(prev => [...prev, correoCreado]);
                // Limpiar campos
                setNuevoCorreo({ nombre: '', correo: '' });
            }
        } catch (error) {
            console.error('Error al agregar nuevo correo:', error);
        } finally {
            setProcesandoCorreo(false);
        }
    };

    const eliminarCorreo = async (id: number) => {
        if (procesandoCorreo) return;
        
        setProcesandoCorreo(true);
        
        try {
            // Eliminar correo de la BD
            const response = await fetch(`/api/estudios/${estudio.ID}/correos-copia/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            
            if (response.ok) {
                setListaCorreos(prev => prev.filter(c => c.ID !== id));
            }
        } catch (error) {
            console.error('Error al eliminar correo:', error);
        } finally {
            setProcesandoCorreo(false);
        }
    };

    const medicoActual = medicos.find(m => m.ID_USUARIO == estudio.ID_MEDICO);

    return (
        <div className="space-y-6">
            {/* Fecha y hora del informe */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#189BAF]" />
                        Informe
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="FechaInforme">
                                Fecha Informe <small className="text-gray-500">(dd/mm/aaaa)</small>
                            </Label>
                            <Input
                                id="FechaInforme"
                                type="date"
                                value={localData.FechaInforme}
                                onChange={(e) => handleChange('FechaInforme', e.target.value)}
                                className={errors.FechaInforme ? 'border-red-500' : ''}
                            />
                            {errors.FechaInforme && <p className="text-red-500 text-sm mt-1">{errors.FechaInforme}</p>}
                        </div>
                        <div>
                            <Label htmlFor="HoraInforme">
                                Hora Informe <small className="text-gray-500">(00:00 am/pm)</small>
                            </Label>
                            <Input
                                id="HoraInforme"
                                type="time"
                                value={localData.HoraInforme}
                                onChange={(e) => handleChange('HoraInforme', e.target.value)}
                                className={errors.HoraInforme ? 'border-red-500' : ''}
                            />
                            {errors.HoraInforme && <p className="text-red-500 text-sm mt-1">{errors.HoraInforme}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda - Lista de correos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-[#189BAF]" />
                            Lista de Correos para envío de informes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Botón para agregar médico */}
                        {medicoActual && (
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-4">
                                    <Button
                                        type="button"
                                        onClick={agregarCorreoMedico}
                                        disabled={procesandoCorreo}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {procesandoCorreo ? 'Agregando...' : 'Enviar copia al médico'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Agregar nuevo correo */}
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-4 space-y-4">
                                <h5 className="font-semibold">Añadir nueva dirección de correo para copia</h5>
                                
                                <div className="grid grid-cols-5 gap-2">
                                    <div className="col-span-2">
                                        <Input
                                            placeholder="Nombre Completo"
                                            value={nuevoCorreo.nombre}
                                            onChange={(e) => handleCorreoChange('nombre', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            placeholder="Correo"
                                            type="email"
                                            value={nuevoCorreo.correo}
                                            onChange={(e) => handleCorreoChange('correo', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            onClick={agregarNuevoCorreo}
                                            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                            disabled={!nuevoCorreo.nombre.trim() || !nuevoCorreo.correo.trim() || procesandoCorreo}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lista de correos agregados */}
                        {listaCorreos.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="font-semibold">Correos agregados:</h5>
                                {listaCorreos.map((correo) => (
                                    <div
                                        key={correo.ID}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                    >
                                        <div>
                                            <p className="font-medium">{correo.NOMBRE}</p>
                                            <p className="text-sm text-gray-600">{correo.CORREO}</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            disabled={procesandoCorreo}
                                            onClick={() => correo.ID && eliminarCorreo(correo.ID)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <hr />

                        {/* Enviar como adjunto */}
                        <div className="space-y-2">
                            <h5 className="font-semibold">Enviar estudio como Adjunto</h5>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="EnviarAdjunto"
                                    checked={localData.EnviarAdjunto}
                                    onCheckedChange={(checked) => handleChange('EnviarAdjunto', checked)}
                                />
                                <Label htmlFor="EnviarAdjunto">Enviar reporte como adjunto</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Columna derecha - Estado y configuración */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado del Estudio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="EstudioFacturado">Facturado</Label>
                                <Select
                                    value={localData.EstudioFacturado || "none"}
                                    onValueChange={(value) => handleChange('EstudioFacturado', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Selecciona</SelectItem>
                                        <SelectItem value="Si">Si</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="EstudioEstado">¿Cancelar?</Label>
                                <Select
                                    value={localData.EstudioEstado === 'Cancelado' ? 'Cancelado' : 'none'}
                                    onValueChange={(value) => handleChange('EstudioEstado', value || estudio.ESTUDIO_ESTADO)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Continuar Normal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Continuar Normal</SelectItem>
                                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="EstudioComentarios">Comentarios</Label>
                                <Textarea
                                    id="EstudioComentarios"
                                    value={localData.EstudioComentarios}
                                    onChange={(e) => handleChange('EstudioComentarios', e.target.value)}
                                    rows={4}
                                    placeholder="Comentarios adicionales..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del médico actual */}
                    {medicoActual && (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-800">Médico Asignado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p><strong>Nombre:</strong> {medicoActual.USUARIO_NOMBRE} {medicoActual.USUARIO_APELLIDOS}</p>
                                    <p><strong>Correo:</strong> {medicoActual.USUARIO_CORREO}</p>
                                    {medicoActual.USUARIO_TELEFONO && (
                                        <p><strong>Teléfono:</strong> {medicoActual.USUARIO_TELEFONO}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Campos ocultos para mantener compatibilidad */}
            <input type="hidden" name="Beneficiario" value={localData.Beneficiario} />
            <input type="hidden" name="FechaResultadosCorreo" value={localData.FechaResultadosCorreo} />
            <input type="hidden" name="HoraResultadosCorreo" value={localData.HoraResultadosCorreo} />
        </div>
    );
}