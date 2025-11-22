import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from 'lucide-react';

interface ConsoleLog {
    timestamp: string;
    level: string;
    message: string;
}

interface BackendTerminalProps {
    logs: ConsoleLog[];
}

export const BackendTerminal: React.FC<BackendTerminalProps> = ({ logs }) => {
    return (
        <Card className="bg-black/90 border-green-500/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-green-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Live Backend Server Logs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] overflow-y-auto font-mono text-xs bg-black rounded-md p-4 space-y-1">
                    {logs.slice(-20).map((log, idx) => {
                        const time = new Date(log.timestamp).toLocaleTimeString();
                        const levelColor = log.level === 'error' ? 'text-red-400' :
                            log.level === 'warn' ? 'text-yellow-400' :
                                'text-green-400';

                        return (
                            <div key={idx} className="flex gap-2">
                                <span className="text-gray-500 shrink-0">[{time}]</span>
                                <span className={`${levelColor} shrink-0`}>{log.level.toUpperCase()}</span>
                                <span className="text-gray-300 break-all">{log.message}</span>
                            </div>
                        );
                    })}
                    {logs.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            Waiting for backend logs...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
