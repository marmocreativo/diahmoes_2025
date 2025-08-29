import { CheckCircle, XCircle } from 'lucide-react';

export const renderResult = (action: string, results: Record<string, any>) => {
    const result = results[action];
    if (!result) return null;

    const { success, message, error, details } = result;
    const Icon = success ? CheckCircle : XCircle;
    const colorClass = success 
        ? 'text-green-600 bg-green-50 border-green-200' 
        : 'text-red-600 bg-red-50 border-red-200';

    return (
        <div className={`mt-4 p-4 border rounded-lg ${colorClass}`}>
            <div className="flex items-start gap-2">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <p className="font-medium">{message}</p>
                    {error && (
                        <p className="text-sm mt-1 opacity-80">Error: {error}</p>
                    )}
                    {details && (
                        <p className="text-sm mt-1 opacity-80">{details}</p>
                    )}
                    {result.debug_info && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <details>
                                <summary className="cursor-pointer font-medium">Ver información de debug</summary>
                                <pre className="mt-2 whitespace-pre-wrap overflow-x-auto">
                                    {typeof result.debug_info === 'string' 
                                        ? result.debug_info 
                                        : JSON.stringify(result.debug_info, null, 2)
                                    }
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};