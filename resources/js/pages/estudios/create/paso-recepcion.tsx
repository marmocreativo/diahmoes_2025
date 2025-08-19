import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PasoRecepcionProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    tiposEnvio?: Record<string, string>;
}

export default function PasoRecepcion({
    data,
    setData,
    errors,
    tiposEnvio = {}
}: PasoRecepcionProps) {
    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Este paso se completará cuando se reciba la muestra en el laboratorio.
                    Los campos aquí son opcionales en la creación inicial.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fechas de Recepción */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Fechas de Recepción</h3>
                    
                    <div>
                        <Label htmlFor="FECHA_RECOLECCION">Fecha de Recolección</Label>
                        <Input
                            id="FECHA_RECOLECCION"
                            type="datetime-local"
                            value={data.FECHA_RECOLECCION || ''}
                            onChange={(e) => setData('FECHA_RECOLECCION', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="FECHA_RECEPCION">Fecha de Recepción</Label>
                        <Input
                            id="FECHA_RECEPCION"
                            type="datetime-local"
                            value={data.FECHA_RECEPCION || ''}
                            onChange={(e) => setData('FECHA_RECEPCION', e.target.value)}
                        />
                    </div>
                </div>

                {/* Información de Envío */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Información de Envío</h3>
                    
                    <div>
                        <Label htmlFor="MUESTRA_ENVIO">¿Requiere Envío?</Label>
                        <Select value={data.MUESTRA_ENVIO || ''} onValueChange={(value) => setData('MUESTRA_ENVIO', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar opción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Sin especificar</SelectItem>
                                <SelectItem value="aplica">Sí, aplica envío</SelectItem>
                                <SelectItem value="no_aplica">No aplica envío</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {data.MUESTRA_ENVIO === 'aplica' && (
                        <>
                            <div>
                                <Label htmlFor="MUESTRA_ENVIO_TIPO">Tipo de Envío</Label>
                                <Select value={data.MUESTRA_ENVIO_TIPO || ''} onValueChange={(value) => setData('MUESTRA_ENVIO_TIPO', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(tiposEnvio).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="MUESTRA_GUIA">Número de Guía</Label>
                                <Input
                                    id="MUESTRA_GUIA"
                                    value={data.MUESTRA_GUIA || ''}
                                    onChange={(e) => setData('MUESTRA_GUIA', e.target.value)}
                                    placeholder="Número de guía de envío"
                                />
                            </div>

                            <div>
                                <Label htmlFor="MUESTRA_GUIA_MENSAJERIA">Mensajería</Label>
                                <Input
                                    id="MUESTRA_GUIA_MENSAJERIA"
                                    value={data.MUESTRA_GUIA_MENSAJERIA || ''}
                                    onChange={(e) => setData('MUESTRA_GUIA_MENSAJERIA', e.target.value)}
                                    placeholder="Nombre de la mensajería"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Dirección de Recolección/Envío */}
                {data.MUESTRA_ENVIO === 'aplica' && (
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Dirección de Recolección</h3>
                        
                        <div>
                            <Label htmlFor="MUESTRA_DIRECCION">Dirección</Label>
                            <Textarea
                                id="MUESTRA_DIRECCION"
                                value={data.MUESTRA_DIRECCION || ''}
                                onChange={(e) => setData('MUESTRA_DIRECCION', e.target.value)}
                                placeholder="Calle y número"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="MUESTRA_NUMERO_EXT">Número Exterior</Label>
                                <Input
                                    id="MUESTRA_NUMERO_EXT"
                                    value={data.MUESTRA_NUMERO_EXT || ''}
                                    onChange={(e) => setData('MUESTRA_NUMERO_EXT', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="MUESTRA_NUMERO_INT">Número Interior</Label>
                                <Input
                                    id="MUESTRA_NUMERO_INT"
                                    value={data.MUESTRA_NUMERO_INT || ''}
                                    onChange={(e) => setData('MUESTRA_NUMERO_INT', e.target.value)}
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="MUESTRA_COLONIA">Colonia</Label>
                                <Input
                                    id="MUESTRA_COLONIA"
                                    value={data.MUESTRA_COLONIA || ''}
                                    onChange={(e) => setData('MUESTRA_COLONIA', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="MUESTRA_MUNICIPIO">Municipio/Delegación</Label>
                                <Input
                                    id="MUESTRA_MUNICIPIO"
                                    value={data.MUESTRA_MUNICIPIO || ''}
                                    onChange={(e) => setData('MUESTRA_MUNICIPIO', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="MUESTRA_CIUDAD">Ciudad</Label>
                                <Input
                                    id="MUESTRA_CIUDAD"
                                    value={data.MUESTRA_CIUDAD || ''}
                                    onChange={(e) => setData('MUESTRA_CIUDAD', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="MUESTRA_ESTADO">Estado</Label>
                                <Input
                                    id="MUESTRA_ESTADO"
                                    value={data.MUESTRA_ESTADO || ''}
                                    onChange={(e) => setData('MUESTRA_ESTADO', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="MUESTRA_CODIGO_POSTAL">Código Postal</Label>
                                <Input
                                    id="MUESTRA_CODIGO_POSTAL"
                                    value={data.MUESTRA_CODIGO_POSTAL || ''}
                                    onChange={(e) => setData('MUESTRA_CODIGO_POSTAL', e.target.value)}
                                    placeholder="00000"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="MUESTRA_REFERENCIAS">Referencias</Label>
                            <Textarea
                                id="MUESTRA_REFERENCIAS"
                                value={data.MUESTRA_REFERENCIAS || ''}
                                onChange={(e) => setData('MUESTRA_REFERENCIAS', e.target.value)}
                                placeholder="Referencias para localizar la dirección"
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="MUESTRA_HORARIOS">Horarios de Recolección</Label>
                            <Input
                                id="MUESTRA_HORARIOS"
                                value={data.MUESTRA_HORARIOS || ''}
                                onChange={(e) => setData('MUESTRA_HORARIOS', e.target.value)}
                                placeholder="Ej: Lunes a Viernes 9:00-17:00"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Información de Guías Especializadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Guías Especializadas</h3>
                    
                    <div>
                        <Label htmlFor="MUESTRA_GUIA_ESPECIALIZADA">Guía Especializada</Label>
                        <Input
                            id="MUESTRA_GUIA_ESPECIALIZADA"
                            value={data.MUESTRA_GUIA_ESPECIALIZADA || ''}
                            onChange={(e) => setData('MUESTRA_GUIA_ESPECIALIZADA', e.target.value)}
                            placeholder="Número de guía especializada"
                        />
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA">Mensajería Especializada</Label>
                        <Input
                            id="MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA"
                            value={data.MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA || ''}
                            onChange={(e) => setData('MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA', e.target.value)}
                            placeholder="Nombre de mensajería especializada"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Guías de Retorno</h3>
                    
                    <div>
                        <Label htmlFor="MUESTRA_GUIA_RETORNO">Guía de Retorno</Label>
                        <Input
                            id="MUESTRA_GUIA_RETORNO"
                            value={data.MUESTRA_GUIA_RETORNO || ''}
                            onChange={(e) => setData('MUESTRA_GUIA_RETORNO', e.target.value)}
                            placeholder="Número de guía de retorno"
                        />
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_GUIA_RETORNO_MENSAJERIA">Mensajería de Retorno</Label>
                        <Input
                            id="MUESTRA_GUIA_RETORNO_MENSAJERIA"
                            value={data.MUESTRA_GUIA_RETORNO_MENSAJERIA || ''}
                            onChange={(e) => setData('MUESTRA_GUIA_RETORNO_MENSAJERIA', e.target.value)}
                            placeholder="Nombre de mensajería de retorno"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}