import { Plus, X, Mail } from 'lucide-react';

interface Props {
    value: string; // correos separados por comas, ej: "a@x.com,b@y.com"
    onChange: (value: string) => void;
    placeholder?: string;
}

const inputClass = 'w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]/30 focus:border-[#189BAF]';

export default function RepeaterEmails({ value, onChange, placeholder = 'correo@ejemplo.com' }: Props) {
    const correos = value ? value.split(',').map(c => c.trim()) : [''];
    const lista = correos.length > 0 ? correos : [''];

    const actualizarCorreo = (index: number, nuevoValor: string) => {
        const nuevos = [...lista];
        nuevos[index] = nuevoValor;
        onChange(nuevos.join(','));
    };

    const agregarCorreo = () => {
        onChange([...lista, ''].join(','));
    };

    const quitarCorreo = (index: number) => {
        const nuevos = lista.filter((_, i) => i !== index);
        onChange((nuevos.length ? nuevos : ['']).join(','));
    };

    return (
        <div className="space-y-2">
            {lista.map((correo, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="email"
                            className={inputClass}
                            placeholder={placeholder}
                            value={correo}
                            onChange={(e) => actualizarCorreo(index, e.target.value)}
                        />
                    </div>
                    {lista.length > 1 && (
                        <button
                            type="button"
                            onClick={() => quitarCorreo(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                            title="Quitar correo"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={agregarCorreo}
                className="text-xs text-[#189BAF] hover:text-[#157a8c] font-medium flex items-center gap-1"
            >
                <Plus className="h-3.5 w-3.5" /> Agregar otro correo
            </button>
        </div>
    );
}