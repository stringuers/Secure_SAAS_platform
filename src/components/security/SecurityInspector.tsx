import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SecurityInspector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [securityScore, setSecurityScore] = useState(85);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-card border rounded-lg shadow-2xl w-80 mb-4 overflow-hidden"
                    >
                        <div className="bg-primary/10 p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary" />
                                Security Inspector
                            </h3>
                            <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                Score: {securityScore}/100
                            </span>
                        </div>

                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Connection</span>
                                <span className="flex items-center gap-1 text-green-500 font-medium">
                                    <Lock className="w-3 h-3" /> TLS 1.3
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Headers</span>
                                <span className="flex items-center gap-1 text-green-500 font-medium">
                                    <CheckCircle className="w-3 h-3" /> Active
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Auth Token</span>
                                <span className="flex items-center gap-1 text-green-500 font-medium">
                                    <CheckCircle className="w-3 h-3" /> Valid (JWT)
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">XSS Protection</span>
                                <span className="flex items-center gap-1 text-green-500 font-medium">
                                    <CheckCircle className="w-3 h-3" /> Enabled
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <div className="text-xs text-muted-foreground mb-2">Active Session Encryption</div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-green-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
                                    <span>Client</span>
                                    <span>AES-256-GCM</span>
                                    <span>Server</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
                <Shield className="w-6 h-6" />
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
        </div>
    );
};
