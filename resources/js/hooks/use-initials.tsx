import { useMemo } from 'react';

interface UseInitialsProps {
    name?: string;
    firstName?: string;
    lastName?: string;
}

export function useInitials({ name, firstName, lastName }: UseInitialsProps): string {
    return useMemo(() => {
        // Si tenemos firstName y lastName, usarlos
        if (firstName?.trim() && lastName?.trim()) {
            return (firstName.trim().charAt(0) + lastName.trim().charAt(0)).toUpperCase();
        }
        
        // Si tenemos name completo, usarlo
        if (name?.trim()) {
            const nameParts = name.trim().split(' ').filter(part => part.length > 0);
            if (nameParts.length >= 2) {
                return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
            }
            if (nameParts.length === 1) {
                return nameParts[0].charAt(0).toUpperCase();
            }
        }
        
        // Si tenemos solo firstName
        if (firstName?.trim()) {
            return firstName.trim().charAt(0).toUpperCase();
        }
        
        // Si tenemos solo lastName
        if (lastName?.trim()) {
            return lastName.trim().charAt(0).toUpperCase();
        }
        
        // Fallback si no hay nada
        return 'U'; // Por "Usuario"
    }, [name, firstName, lastName]);
}