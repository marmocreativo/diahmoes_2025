import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PasoLaboratorioProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

export default function PasoLaboratorio({
    data,
    setData,
    errors
}: PasoLaboratorioProps) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Esta información se completará durante el proceso de laboratorio.
                    Los campos son opcionales en la creación inicial del estudio.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fechas de Laboratorio */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Fechas de Laboratorio</h3>
                    
                    <div>
                        <Label htmlFor="FECHA_ENVIO_LABORATORIO">Fecha de Envío a Laboratorio</Label>
                        <Input
                            id="FECHA_ENVIO_LABORATORIO"
                            type="datetime-local"
                            value={data.FECHA_ENVIO_LABORATORIO || ''}
                            onChange={(e) => setData('FECHA_ENVIO_LABORATORIO', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="FECHA_RECEPCION_LABORATORIO">Fecha de Recepción en Laboratorio</Label>
                        <Input
                            id="FECHA_RECEPCION_LABORATORIO"
                            type="datetime-local"
                            value={data.FECHA_RECEPCION_LABORATORIO || ''}
                            onChange={(e) => setData('FECHA_RECEPCION_LABORATORIO', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="FECHA_ENTREGA_PROCESAMIENTO">Fecha de Entrega a Procesamiento</Label>
                        <Input
                            id="FECHA_ENTREGA_PROCESAMIENTO"
                            type="datetime-local"
                            value={data.FECHA_ENTREGA_PROCESAMIENTO || ''}
                            onChange={(e) => setData('FECHA_ENTREGA_PROCESAMIENTO', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="FECHA_OBTENCION_RESULTADOS">Fecha de Obtención de Resultados</Label>
                        <Input
                            id="FECHA_OBTENCION_RESULTADOS"
                            type="datetime-local"
                            value={data.FECHA_OBTENCION_RESULTADOS || ''}
                            onChange={(e) => setData('FECHA_OBTENCION_RESULTADOS', e.target.value)}
                        />
                    </div>
                </div>

                {/* Información de Líquidos (si aplica) */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Información de Líquidos</h3>
                    
                    <div>
                        <Label htmlFor="MUESTRA_LIQ_CONDICION">Condición del Líquido</Label>
                        <Input
                            id="MUESTRA_LIQ_CONDICION"
                            value={data.MUESTRA_LIQ_CONDICION || ''}
                            onChange={(e) => setData('MUESTRA_LIQ_CONDICION', e.target.value)}
                            placeholder="Ej: Claro, turbio, hemorrágico"
                        />
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_LIQ_CONDICION_PRESENCIA">Presencia en Condición</Label>
                        <Input
                            id="MUESTRA_LIQ_CONDICION_PRESENCIA"
                            value={data.MUESTRA_LIQ_CONDICION_PRESENCIA || ''}
                            onChange={(e) => setData('MUESTRA_LIQ_CONDICION_PRESENCIA', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_LIQ_CANTIDAD_ADECUADA">¿Cantidad Adecuada?</Label>
                        <Select value={data.MUESTRA_LIQ_CANTIDAD_ADECUADA || ''} onValueChange={(value) => setData('MUESTRA_LIQ_CANTIDAD_ADECUADA', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar opción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Sin especificar</SelectItem>
                                <SelectItem value="si">Sí</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_LIQ_CANTIDAD_ML">Cantidad en ML</Label>
                        <Input
                            id="MUESTRA_LIQ_CANTIDAD_ML"
                            type="number"
                            step="0.1"
                            value={data.MUESTRA_LIQ_CANTIDAD_ML || ''}
                            onChange={(e) => setData('MUESTRA_LIQ_CANTIDAD_ML', e.target.value)}
                            placeholder="0.0"
                        />
                    </div>

                    <div>
                        <Label htmlFor="MUESTRA_LIQ_HEMOLISIS">Hemólisis</Label>
                        <Select value={data.MUESTRA_LIQ_HEMOLISIS || ''} onValueChange={(value) => setData('MUESTRA_LIQ_HEMOLISIS', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar opción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Sin especificar</SelectItem>
                                <SelectItem value="si">Sí</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="leve">Leve</SelectItem>
                                <SelectItem value="moderada">Moderada</SelectItem>
                                <SelectItem value="severa">Severa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Amplificación */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Información de Amplificación</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="MUESTRA_LIQ_AMP_INDICACION">Indicación de Amplificación</Label>
                            <Select value={data.MUESTRA_LIQ_AMP_INDICACION || ''} onValueChange={(value) => setData('MUESTRA_LIQ_AMP_INDICACION', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar opción" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Sin especificar</SelectItem>
                                    <SelectItem value="si">Sí</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="MUESTRA_LIQ_AMP_RAZON">Razón de Amplificación</Label>
                            <Input
                                id="MUESTRA_LIQ_AMP_RAZON"
                                value={data.MUESTRA_LIQ_AMP_RAZON || ''}
                                onChange={(e) => setData('MUESTRA_LIQ_AMP_RAZON', e.target.value)}
                                placeholder="Especificar razón si aplica"
                            />
                        </div>
                    </div>
                </div>

                {/* Procesamiento y Resultados Preliminares */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Procesamiento</h3>
                    
                    <div>
                        <Label htmlFor="R_METODO_PROCESO">Método de Proceso</Label>
                        <Textarea
                            id="R_METODO_PROCESO"
                            value={data.R_METODO_PROCESO || ''}
                            onChange={(e) => setData('R_METODO_PROCESO', e.target.value)}
                            placeholder="Describir el método de procesamiento utilizado"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_ESTUDIO_SOLICITADO">Estudio Solicitado</Label>
                        <Input
                            id="R_ESTUDIO_SOLICITADO"
                            value={data.R_ESTUDIO_SOLICITADO || ''}
                            onChange={(e) => setData('R_ESTUDIO_SOLICITADO', e.target.value)}
                            placeholder="Tipo de estudio molecular solicitado"
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_EVALUACION_HISTOPATOLOGICA">Evaluación Histopatológica</Label>
                        <Textarea
                            id="R_EVALUACION_HISTOPATOLOGICA"
                            value={data.R_EVALUACION_HISTOPATOLOGICA || ''}
                            onChange={(e) => setData('R_EVALUACION_HISTOPATOLOGICA', e.target.value)}
                            placeholder="Evaluación histopatológica de la muestra"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_PRESERVACION_H_E">Preservación H&E</Label>
                        <Textarea
                            id="R_PRESERVACION_H_E"
                            value={data.R_PRESERVACION_H_E || ''}
                            onChange={(e) => setData('R_PRESERVACION_H_E', e.target.value)}
                            placeholder="Estado de preservación de la tinción H&E"
                            rows={2}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}