import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Estudio } from '@/types/estudios';

interface WhatsAppDialogProps {
    estudio: Estudio;
    isOpen: boolean;
    onClose: () => void;
}

export default function WhatsAppDialog({ estudio, isOpen, onClose }: WhatsAppDialogProps) {
    const [countryCode, setCountryCode] = useState('52');
    const [phoneNumber, setPhoneNumber] = useState(estudio.medico?.USUARIO_TELEFONO || '');

    if (!isOpen) return null;

    const generateWhatsAppMessage = () => {
        const medicoName = estudio.medico 
            ? `${estudio.medico.USUARIO_NOMBRE} ${estudio.medico.USUARIO_APELLIDOS}`
            : 'Doctor';
        
        const message = `Estimado ${medicoName}
Por medio del siguiente enlace podrá ver los resultados de su estudio.
El enlace es privado, por favor no lo comparta.
${window.location.origin}/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}`;

        return encodeURIComponent(message);
    };

    const handleSendWhatsApp = () => {
        if (!phoneNumber.trim()) {
            alert('Por favor ingrese un número de teléfono');
            return;
        }

        const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remover caracteres no numéricos
        const fullNumber = `${countryCode}${cleanPhone}`;
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${fullNumber}?text=${message}`;
        
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-2">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Enviar por WhatsApp
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Información del estudio */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Estudio: {estudio.CLAVE_INTERNA}
                        </h4>
                        {estudio.medico && (
                            <p className="text-sm text-gray-600">
                                Dr. {estudio.medico.USUARIO_NOMBRE} {estudio.medico.USUARIO_APELLIDOS}
                            </p>
                        )}
                        {estudio.institucion && (
                            <p className="text-sm text-gray-500">
                                {estudio.institucion.INSTITUCION_NOMBRE}
                            </p>
                        )}
                    </div>

                    {/* Formulario de teléfono */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Código de país
                            </label>
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                            >
                                <option value="52">+52 (México)</option>
                                <option value="1">+1 (Estados Unidos)</option>
                                <option value="34">+34 (España)</option>
                                <option value="57">+57 (Colombia)</option>
                                <option value="54">+54 (Argentina)</option>
                                <option value="56">+56 (Chile)</option>
                                <option value="51">+51 (Perú)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de teléfono
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Ingrese el número de teléfono"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Número completo: +{countryCode} {phoneNumber}
                            </p>
                        </div>

                        {/* Vista previa del mensaje */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vista previa del mensaje
                            </label>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-700">
                                <p>Estimado {estudio.medico ? `${estudio.medico.USUARIO_NOMBRE} ${estudio.medico.USUARIO_APELLIDOS}` : 'Doctor'}</p>
                                <p className="mt-1">Por medio del siguiente enlace podrá ver los resultados de su estudio.</p>
                                <p className="mt-1">El enlace es privado, por favor no lo comparta.</p>
                                <p className="mt-2 text-blue-600 text-xs break-all">
                                    {window.location.origin}/publicos/estudio?id={estudio.ID}&aleatorio={estudio.ID_ALEATORIO}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSendWhatsApp}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <Send className="h-4 w-4" />
                        <span>Enviar por WhatsApp</span>
                    </button>
                </div>
            </div>
        </div>
    );
}