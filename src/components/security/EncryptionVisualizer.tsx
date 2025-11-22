import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, Database, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EncryptionEvent {
    id: string;
    type: string;
    details: any;
    timestamp: string;
}

export const EncryptionVisualizer = ({ events }: { events: EncryptionEvent[] }) => {
    const [activeProcess, setActiveProcess] = useState<EncryptionEvent | null>(null);

    useEffect(() => {
        if (events.length > 0) {
            const latest = events[events.length - 1];
            if (latest.type.includes('START') || latest.type.includes('GENERATED')) {
                setActiveProcess(latest);
                // Auto clear after 3 seconds if no completion event
                const timer = setTimeout(() => setActiveProcess(null), 3000);
                return () => clearTimeout(timer);
            } else if (latest.type.includes('COMPLETE')) {
                setActiveProcess(latest);
                const timer = setTimeout(() => setActiveProcess(null), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [events]);

    return (
        <div className="bg-card border rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Real-Time Encryption Engine
            </h3>

            <div className="relative h-48 bg-muted/30 rounded-md flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    {!activeProcess ? (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-muted-foreground flex flex-col items-center"
                        >
                            <Shield className="w-12 h-12 mb-2 opacity-20" />
                            <p>Waiting for encryption events...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeProcess.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="w-full max-w-md p-4"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="text-center">
                                    <div className="bg-background p-3 rounded-full border mb-2 mx-auto w-12 h-12 flex items-center justify-center">
                                        <Key className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <span className="text-xs font-mono">Plaintext</span>
                                </div>

                                <div className="flex-1 mx-4 relative">
                                    <motion.div
                                        className="h-1 bg-primary/20 rounded-full overflow-hidden"
                                    >
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        />
                                    </motion.div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs font-bold text-primary">
                                        {activeProcess.details.algorithm || 'AES-256'}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="bg-background p-3 rounded-full border mb-2 mx-auto w-12 h-12 flex items-center justify-center">
                                        <Lock className="w-6 h-6 text-green-500" />
                                    </div>
                                    <span className="text-xs font-mono">Ciphertext</span>
                                </div>
                            </div>

                            <div className="bg-black/90 p-3 rounded font-mono text-xs text-green-400 overflow-hidden">
                                <div className="mb-1 opacity-50">// {activeProcess.type}</div>
                                {activeProcess.details.hash && (
                                    <div className="break-all">{activeProcess.details.hash}</div>
                                )}
                                {activeProcess.details.salt && (
                                    <div>Salt: {activeProcess.details.salt}</div>
                                )}
                                {activeProcess.details.timeTaken && (
                                    <div className="text-yellow-400 mt-1">Time: {activeProcess.details.timeTaken}</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
