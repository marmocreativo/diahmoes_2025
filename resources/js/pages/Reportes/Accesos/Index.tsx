import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserPlus, Mail, Lock, User, CheckCircle, XCircle, Trash2, ToggleLeft, ToggleRight, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Accesos a Reportes', href: '/reporte-accesos' },
];

interface Acceso {
    id: number;
    nombre: string;
    email: string;
    activo: number;
    created_at: string;
}

export default function ReporteAccesosIndex() {
    const { accesos, flash } = usePage<{
        accesos: Acceso[];
        flash: { success?: string };
    }>().props;

    const [dialogOpen, setDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombre:                '',
        email:                 '',
        password:              '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reporte-accesos.store'), {
            onSuccess: () => {
                reset();
                setDialogOpen(false);
            },
        });
    };

    const handleToggle = (acceso: Acceso) => {
        router.patch(route('reporte-accesos.toggle-activo', acceso.id));
    };

    const handleDelete = (acceso: Acceso) => {
        router.delete(route('reporte-accesos.destroy', acceso.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accesos a Reportes — DIAHMOES" />

            <div className="flex flex-col gap-6 p-4 lg:p-6">

                {/* Flash message */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-[#189BAF]" />
                            Accesos a Reportes
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Gestiona los usuarios con acceso al reporte analítico externo
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Botón ver reporte */}
                        <Button
                            variant="outline"
                            onClick={() => window.open('/reportes', '_blank')}
                            className="border-[#189BAF] text-[#189BAF] hover:bg-[#189BAF]/10"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Ver Reporte
                        </Button>

                        {/* Botón crear acceso */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#189BAF] hover:bg-[#157a8c] text-white">
                                    <UserPlus className="h-4 w-4" />
                                    Nuevo Acceso
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-[#189BAF]" />
                                        Crear Nuevo Acceso
                                    </DialogTitle>
                                    <DialogDescription>
                                        El usuario podrá iniciar sesión en <strong>/reportes</strong> con estas credenciales.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                                    {/* Nombre */}
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="nombre"
                                                placeholder="Nombre completo"
                                                value={data.nombre}
                                                onChange={(e) => setData('nombre', e.target.value)}
                                                className="pl-10"
                                                autoFocus
                                            />
                                        </div>
                                        {errors.nombre && (
                                            <p className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.nombre}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo electrónico</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="correo@ejemplo.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Mínimo 8 caracteres"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirmar password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                placeholder="Repite la contraseña"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter className="pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => { reset(); setDialogOpen(false); }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                                        >
                                            {processing ? 'Creando...' : 'Crear Acceso'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Tabla de accesos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Usuarios con acceso al reporte
                        </CardTitle>
                        <CardDescription>
                            {accesos.length === 0
                                ? 'No hay usuarios registrados aún.'
                                : `${accesos.length} usuario${accesos.length !== 1 ? 's' : ''} registrado${accesos.length !== 1 ? 's' : ''}`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {accesos.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">Sin accesos registrados</p>
                                <p className="text-sm mt-1">Crea el primer acceso con el botón "Nuevo Acceso"</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Nombre</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Correo</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Estado</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Creado</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accesos.map((acceso) => (
                                            <tr key={acceso.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-[#189BAF]/10 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-[#189BAF]" />
                                                        </div>
                                                        <span className="font-medium text-slate-800">{acceso.nombre}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-slate-600 text-sm">{acceso.email}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {acceso.activo ? (
                                                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Activo
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Inactivo
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-slate-500 text-sm">{acceso.created_at}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Toggle activo */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggle(acceso)}
                                                            className={acceso.activo
                                                                ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                                                : 'border-green-200 text-green-600 hover:bg-green-50'
                                                            }
                                                        >
                                                            {acceso.activo ? (
                                                                <><ToggleLeft className="h-4 w-4" /> Desactivar</>
                                                            ) : (
                                                                <><ToggleRight className="h-4 w-4" /> Activar</>
                                                            )}
                                                        </Button>

                                                        {/* Eliminar */}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Eliminar acceso?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Se eliminará el acceso de <strong>{acceso.nombre}</strong> ({acceso.email}).
                                                                        Esta acción no se puede deshacer.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(acceso)}
                                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                                    >
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                        <strong>ℹ️ Acceso al reporte:</strong> Los usuarios listados aquí pueden iniciar sesión en{' '}
                        <code className="bg-blue-100 px-1 rounded font-mono">/reportes</code>{' '}
                        con su correo y contraseña. Los usuarios desactivados no podrán acceder aunque tengan credenciales válidas.
                    </p>
                </div>

            </div>
        </AppLayout>
    );
}