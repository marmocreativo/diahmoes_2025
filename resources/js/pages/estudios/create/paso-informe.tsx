import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PasoInformeProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

export default function PasoInforme({
    data,
    setData,
    errors
}: PasoInformeProps) {
    return (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                    <strong>Nota:</strong> Esta sección contiene los resultados finales del estudio.
                    Se completará una vez que el laboratorio haya procesado la muestra.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fechas de Informe */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Fechas de Informe</h3>
                    
                    <div>
                        <Label htmlFor="FECHA_INFORME">Fecha de Informe</Label>
                        <Input
                            id="FECHA_INFORME"
                            type="datetime-local"
                            value={data.FECHA_INFORME || ''}
                            onChange={(e) => setData('FECHA_INFORME', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="FECHA_RESULTADOS_CORREO">Fecha de Envío por Correo</Label>
                        <Input
                            id="FECHA_RESULTADOS_CORREO"
                            type="datetime-local"
                            value={data.FECHA_RESULTADOS_CORREO || ''}
                            onChange={(e) => setData('FECHA_RESULTADOS_CORREO', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="FECHA_RETORNO_MATERIAL">Fecha de Retorno de Material</Label>
                        <Input
                            id="FECHA_RETORNO_MATERIAL"
                            type="datetime-local"
                            value={data.FECHA_RETORNO_MATERIAL || ''}
                            onChange={(e) => setData('FECHA_RETORNO_MATERIAL', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="FECHA_RECEPCION_RESULTADOS_FISICOS">Fecha de Recepción Resultados Físicos</Label>
                        <Input
                            id="FECHA_RECEPCION_RESULTADOS_FISICOS"
                            type="datetime-local"
                            value={data.FECHA_RECEPCION_RESULTADOS_FISICOS || ''}
                            onChange={(e) => setData('FECHA_RECEPCION_RESULTADOS_FISICOS', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="FECHA_FIN_PROCESO">Fecha de Fin de Proceso</Label>
                        <Input
                            id="FECHA_FIN_PROCESO"
                            type="datetime-local"
                            value={data.FECHA_FIN_PROCESO || ''}
                            onChange={(e) => setData('FECHA_FIN_PROCESO', e.target.value)}
                        />
                    </div>
                </div>

                {/* Información Tumoral */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Información Tumoral</h3>
                    
                    <div>
                        <Label htmlFor="R_NUMERO_CELULAS_TUMORALES">Número de Células Tumorales</Label>
                        <Input
                            id="R_NUMERO_CELULAS_TUMORALES"
                            value={data.R_NUMERO_CELULAS_TUMORALES || ''}
                            onChange={(e) => setData('R_NUMERO_CELULAS_TUMORALES', e.target.value)}
                            placeholder="Conteo de células tumorales"
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_AREA_TUMORAL">Área Tumoral</Label>
                        <Input
                            id="R_AREA_TUMORAL"
                            value={data.R_AREA_TUMORAL || ''}
                            onChange={(e) => setData('R_AREA_TUMORAL', e.target.value)}
                            placeholder="Área tumoral medida"
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_PORCENTAJE_TUMOR_TEJIDO">Porcentaje de Tumor en Tejido (%)</Label>
                        <Input
                            id="R_PORCENTAJE_TUMOR_TEJIDO"
                            type="number"
                            min="0"
                            max="100"
                            value={data.R_PORCENTAJE_TUMOR_TEJIDO || ''}
                            onChange={(e) => setData('R_PORCENTAJE_TUMOR_TEJIDO', e.target.value)}
                            placeholder="0-100"
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_ENRIQUECIMIENTO">Enriquecimiento</Label>
                        <Input
                            id="R_ENRIQUECIMIENTO"
                            value={data.R_ENRIQUECIMIENTO || ''}
                            onChange={(e) => setData('R_ENRIQUECIMIENTO', e.target.value)}
                            placeholder="Técnica de enriquecimiento utilizada"
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_ADECUADO_PROCESAMIENTO">¿Procesamiento Adecuado?</Label>
                        <Select value={data.R_ADECUADO_PROCESAMIENTO || ''} onValueChange={(value) => setData('R_ADECUADO_PROCESAMIENTO', value)}>
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
                        <Label htmlFor="R_RAZON_ADECUADO_PROCESAMIENTO">Razón del Procesamiento</Label>
                        <Textarea
                            id="R_RAZON_ADECUADO_PROCESAMIENTO"
                            value={data.R_RAZON_ADECUADO_PROCESAMIENTO || ''}
                            onChange={(e) => setData('R_RAZON_ADECUADO_PROCESAMIENTO', e.target.value)}
                            placeholder="Explicar la razón del procesamiento adecuado o inadecuado"
                            rows={2}
                        />
                    </div>
                </div>

                {/* Resultados Genéticos */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Resultados Genéticos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* KRAS */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">KRAS</h4>
                            <div>
                                <Label htmlFor="R_ESTATUS_KRAS">Estatus KRAS</Label>
                                <Select value={data.R_ESTATUS_KRAS || ''} onValueChange={(value) => setData('R_ESTATUS_KRAS', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Sin especificar</SelectItem>
                                        <SelectItem value="wild_type">Wild Type</SelectItem>
                                        <SelectItem value="mutado">Mutado</SelectItem>
                                        <SelectItem value="no_determinado">No Determinado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="R_GENOTIPO_KRAS">Genotipo KRAS</Label>
                                <Input
                                    id="R_GENOTIPO_KRAS"
                                    value={data.R_GENOTIPO_KRAS || ''}
                                    onChange={(e) => setData('R_GENOTIPO_KRAS', e.target.value)}
                                    placeholder="Ej: G12D, G13D"
                                />
                            </div>
                        </div>

                        {/* NRAS */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">NRAS</h4>
                            <div>
                                <Label htmlFor="R_ESTATUS_NRAS">Estatus NRAS</Label>
                                <Select value={data.R_ESTATUS_NRAS || ''} onValueChange={(value) => setData('R_ESTATUS_NRAS', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Sin especificar</SelectItem>
                                        <SelectItem value="wild_type">Wild Type</SelectItem>
                                        <SelectItem value="mutado">Mutado</SelectItem>
                                        <SelectItem value="no_determinado">No Determinado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="R_GENOTIPO_NRAS">Genotipo NRAS</Label>
                                <Input
                                    id="R_GENOTIPO_NRAS"
                                    value={data.R_GENOTIPO_NRAS || ''}
                                    onChange={(e) => setData('R_GENOTIPO_NRAS', e.target.value)}
                                    placeholder="Ej: Q61K, Q61R"
                                />
                            </div>
                        </div>

                        {/* BRAF */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">BRAF</h4>
                            <div>
                                <Label htmlFor="R_ESTATUS_BRAF">Estatus BRAF</Label>
                                <Select value={data.R_ESTATUS_BRAF || ''} onValueChange={(value) => setData('R_ESTATUS_BRAF', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Sin especificar</SelectItem>
                                        <SelectItem value="wild_type">Wild Type</SelectItem>
                                        <SelectItem value="mutado">Mutado</SelectItem>
                                        <SelectItem value="no_determinado">No Determinado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="R_GENOTIPO_BRAF">Genotipo BRAF</Label>
                                <Input
                                    id="R_GENOTIPO_BRAF"
                                    value={data.R_GENOTIPO_BRAF || ''}
                                    onChange={(e) => setData('R_GENOTIPO_BRAF', e.target.value)}
                                    placeholder="Ej: V600E, V600K"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resultados e Interpretación */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Resultados e Interpretación</h3>
                    
                    <div>
                        <Label htmlFor="R_RESULTADO_HISTOPATOLOGICO">Resultado Histopatológico</Label>
                        <Textarea
                            id="R_RESULTADO_HISTOPATOLOGICO"
                            value={data.R_RESULTADO_HISTOPATOLOGICO || ''}
                            onChange={(e) => setData('R_RESULTADO_HISTOPATOLOGICO', e.target.value)}
                            placeholder="Descripción detallada del resultado histopatológico"
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_INTERPRETACION">Interpretación</Label>
                        <Textarea
                            id="R_INTERPRETACION"
                            value={data.R_INTERPRETACION || ''}
                            onChange={(e) => setData('R_INTERPRETACION', e.target.value)}
                            placeholder="Interpretación clínica de los resultados"
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="R_COMPLETOS">¿Resultados Completos?</Label>
                        <Select value={data.R_COMPLETOS || 'no'} onValueChange={(value) => setData('R_COMPLETOS', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="si">Sí</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Información Administrativa */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Información Administrativa</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="ESTUDIO_FACTURADO">¿Facturado?</Label>
                            <Select value={data.ESTUDIO_FACTURADO || 'no'} onValueChange={(value) => setData('ESTUDIO_FACTURADO', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="si">Sí</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="ESTUDIO_ESTADO">Estado del Estudio</Label>
                            <Select value={data.ESTUDIO_ESTADO || 'pendiente'} onValueChange={(value) => setData('ESTUDIO_ESTADO', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                                    <SelectItem value="completado">Completado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="ESTUDIO_NOTAS">Notas del Estudio</Label>
                        <Textarea
                            id="ESTUDIO_NOTAS"
                            value={data.ESTUDIO_NOTAS || ''}
                            onChange={(e) => setData('ESTUDIO_NOTAS', e.target.value)}
                            placeholder="Notas adicionales sobre el estudio"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="ESTUDIO_COMENTARIOS">Comentarios</Label>
                        <Textarea
                            id="ESTUDIO_COMENTARIOS"
                            value={data.ESTUDIO_COMENTARIOS || ''}
                            onChange={(e) => setData('ESTUDIO_COMENTARIOS', e.target.value)}
                            placeholder="Comentarios adicionales"
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}