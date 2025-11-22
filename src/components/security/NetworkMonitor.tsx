import React, { useState, useEffect } from 'react';
import { Activity, Globe, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkRequest {
    method: string;
    url: string;
    secure: boolean;
    ip: string;
    timestamp: number;
}

export const NetworkMonitor = ({ requests }: { requests: NetworkRequest[] }) => {
    return (
        <div className="bg-card border rounded-lg p-6 shadow-lg h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Live Network Traffic
                <span className="ml-auto text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Monitoring
                </span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-sm">
                <AnimatePresence initial={false}>
                    {requests.slice().reverse().map((req, i) => (
                        <motion.div
                            key={req.timestamp + i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-2 rounded bg-muted/50 border border-transparent hover:border-primary/20 transition-colors"
                        >
                            <div className={`w-16 text-center text-xs font-bold px-1 py-0.5 rounded ${req.method === 'GET' ? 'bg-blue-500/20 text-blue-500' :
                                    req.method === 'POST' ? 'bg-green-500/20 text-green-500' :
                                        'bg-yellow-500/20 text-yellow-500'
                                }`}>
                                {req.method}
                            </div>

                            <div className="flex-1 truncate text-xs opacity-80">
                                {req.url}
                            </div>

                            <div className="flex items-center gap-2">
                                {req.secure ? (
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-xs text-muted-foreground w-16 text-right">
                                    {new Date(req.timestamp).toLocaleTimeString().split(' ')[0]}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {requests.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 opacity-50">
                        No network activity detected
                    </div>
                )}
            </div>
        </div>
    );
};
