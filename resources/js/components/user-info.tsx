import { useInitials } from '../hooks/use-initials';

interface User {
    id?: number | string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    tipo?: string;
    estado?: string;
    // Campos específicos de tu BD
    ID_USUARIO?: number;
    USUARIO_NOMBRE?: string;
    USUARIO_APELLIDOS?: string;
    USUARIO_CORREO?: string;
    USUARIO_TIPO?: string;
    USUARIO_ESTADO?: string;
}

interface UserInfoProps {
    user?: User;
    className?: string;
    showEmail?: boolean;
    showType?: boolean; // Mostrar tipo de usuario
    size?: 'sm' | 'md' | 'lg'; // Tamaño del componente
}

export function UserInfo({ 
    user, 
    className = '', 
    showEmail = true, 
    showType = true, 
    size = 'md' 
}: UserInfoProps) {
    // Normalizar los datos del usuario para manejar ambos formatos
    const normalizedUser = {
        firstName: user?.firstName || user?.USUARIO_NOMBRE || '',
        lastName: user?.lastName || user?.USUARIO_APELLIDOS || '',
        name: user?.name || (user?.USUARIO_NOMBRE && user?.USUARIO_APELLIDOS 
            ? `${user.USUARIO_NOMBRE} ${user.USUARIO_APELLIDOS}` 
            : ''),
        email: user?.email || user?.USUARIO_CORREO || '',
        tipo: user?.tipo || user?.USUARIO_TIPO || '',
    };

    // Configuración de tamaños
    const sizeClasses = {
        sm: { avatar: 'w-6 h-6', text: 'text-xs', subtext: 'text-xs' },
        md: { avatar: 'w-8 h-8', text: 'text-sm', subtext: 'text-xs' },
        lg: { avatar: 'w-10 h-10', text: 'text-base', subtext: 'text-sm' }
    };

    const currentSize = sizeClasses[size];

    const initials = useInitials({
        name: normalizedUser.name,
        firstName: normalizedUser.firstName,
        lastName: normalizedUser.lastName,
    });

    if (!user) {
        return (
            <div className={`flex items-center space-x-3 ${className}`}>
                <div className={`${currentSize.avatar} bg-gray-300 rounded-full flex items-center justify-center`}>
                    <span className={`${currentSize.subtext} font-medium text-gray-600`}>?</span>
                </div>
                <div className="flex flex-col">
                    <span className={`${currentSize.text} font-medium text-gray-500`}>Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className={`${currentSize.avatar} bg-indigo-500 rounded-full flex items-center justify-center`}>
                <span className={`${currentSize.subtext} font-medium text-white`}>{initials}</span>
            </div>
            <div className="flex flex-col">
                <span className={`${currentSize.text} font-medium text-gray-900`}>
                    {normalizedUser.name || 'Usuario'}
                </span>
                {showEmail && normalizedUser.email && (
                    <span className={`${currentSize.subtext} text-gray-500`}>{normalizedUser.email}</span>
                )}
            </div>
        </div>
    );
}

// También exportar como default para compatibilidad
export default UserInfo;