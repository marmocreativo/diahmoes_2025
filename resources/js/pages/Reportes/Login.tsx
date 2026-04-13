import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, FlaskConical, AlertCircle } from 'lucide-react';

export default function ReportesLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reportes.login.post'));
    };

    return (
        <>
            <Head title="Acceso a Reportes — DIAHMOES" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                {/* Fondo decorativo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#189BAF]/5" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#189BAF]/5" />
                </div>

                <div className="w-full max-w-md relative">
                    {/* Logo / Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#189BAF] shadow-lg mb-4">
                            <FlaskConical className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">DIAHMOES</h1>
                        <p className="text-slate-500 text-sm mt-1">Sistema de Gestión de Estudios</p>
                    </div>

                    {/* Card de login */}
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl text-center text-slate-800">
                                Acceso a Reportes
                            </CardTitle>
                            <CardDescription className="text-center">
                                Ingresa tus credenciales para ver el reporte analítico
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 font-medium">
                                        Correo electrónico
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="pl-10 border-slate-200 focus:border-[#189BAF] focus:ring-[#189BAF]"
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email && (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs">
                                                {errors.email}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-700 font-medium">
                                        Contraseña
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pl-10 border-slate-200 focus:border-[#189BAF] focus:ring-[#189BAF]"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    {errors.password && (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs">
                                                {errors.password}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                {/* Botón */}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#189BAF] hover:bg-[#157a8c] text-white font-medium py-2.5 transition-colors"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Verificando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            Ingresar
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-400 mt-6">
                        Acceso restringido · Solo personal autorizado
                    </p>
                </div>
            </div>
        </>
    );
}