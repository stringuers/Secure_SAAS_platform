import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { EncryptionVisualizer } from '../components/security/EncryptionVisualizer';
import { NetworkMonitor } from '../components/security/NetworkMonitor';
import { BackendTerminal } from '../components/security/BackendTerminal';
import { Shield, Lock, Server, AlertTriangle, CheckCircle, Activity, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";

const socket = io(API_BASE_URL);

export default function SecurityDashboard() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<any[]>([]);
    const [networkRequests, setNetworkRequests] = useState<any[]>([]);
    const [consoleLogs, setConsoleLogs] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Helper function to mask email (show first 4 chars only)
    const maskEmail = (email: string) => {
        if (!email || email.length <= 4) return email;
        const firstFour = email.substring(0, 4);
        const atIndex = email.indexOf('@');
        if (atIndex > 0) {
            return firstFour + '*'.repeat(atIndex - 4) + email.substring(atIndex);
        }
        return firstFour + '*'.repeat(email.length - 4);
    };

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            toast.success("Connected to Security Event Stream");
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            toast.error("Disconnected from Security Event Stream");
        });

        socket.on('security-event', (event) => {
            setEvents(prev => [...prev, event].slice(-20)); // Keep last 20 events

            if (event.type === 'ATTACK_ATTEMPT') {
                toast.error(`Security Alert: ${event.details.type} Blocked!`);
            }
        });

        socket.on('network-request', (req) => {
            setNetworkRequests(prev => [...prev, { ...req, timestamp: Date.now() }].slice(-50));
        });

        socket.on('console-log', (log) => {
            setConsoleLogs(prev => [...prev, log].slice(-50));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('security-event');
            socket.off('console-log');
            socket.off('network-request');
        };
    }, []);

    const runDemo = async (type: string) => {
        try {
            if (type === 'password') {
                await fetch(`${API_BASE_URL}/demo/encrypt-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: 'SuperSecretPassword123!' })
                });
            } else if (type === 'sqli') {
                await fetch(`${API_BASE_URL}/demo/simulate-attack`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'SQL Injection', payload: "' OR 1=1 --" })
                });
            }
        } catch (error) {
            console.error('Demo error:', error);
            toast.error('Failed to run demo. Make sure backend is running.');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 pb-24">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        Security Command Center
                    </h1>
                    <p className="text-muted-foreground mt-2">Real-time security visualization and threat monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-sm font-medium">{isConnected ? 'Live System Active' : 'Connecting...'}</span>
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                        size="sm"
                        className="border-border hover:bg-accent/10 hover:text-accent hover:border-accent/50"
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                    </Button>
                    <Button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            toast.success('Logged out successfully');
                            navigate('/login');
                        }}
                        variant="outline"
                        size="sm"
                        className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Security Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-500">98/100</div>
                        <p className="text-xs text-muted-foreground mt-1">System Hardened</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Threats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-500">0</div>
                        <p className="text-xs text-muted-foreground mt-1">All systems normal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Encryption Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-500">AES-256</div>
                        <p className="text-xs text-muted-foreground mt-1">At Rest & In Transit</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EncryptionVisualizer events={events} />
                <NetworkMonitor requests={networkRequests} />
            </div>

            <BackendTerminal logs={consoleLogs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Security Event Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] overflow-y-auto space-y-2 font-mono text-xs bg-muted/30 p-4 rounded-md">
                            {events.slice().reverse().map((event) => {
                                // Mask email if present in details
                                const details = { ...event.details };
                                if (details.email) {
                                    details.email = maskEmail(details.email);
                                }
                                if (details.user && details.user.email) {
                                    details.user.email = maskEmail(details.user.email);
                                }

                                return (
                                    <div key={event.id} className="flex gap-4 border-b border-border/50 pb-2 last:border-0">
                                        <span className="text-muted-foreground w-32 shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                        <span className={`font-bold w-32 shrink-0 ${event.type === 'ATTACK_ATTEMPT' ? 'text-red-500' :
                                                event.type === 'ENCRYPTION' ? 'text-blue-500' : 'text-green-500'
                                            }`}>{event.type}</span>
                                        <div className="flex-1 break-all opacity-80">
                                            {/* Show encrypted hash if present */}
                                            {details.hash && (
                                                <div className="mb-1">
                                                    <span className="text-green-400">🔒 Encrypted: </span>
                                                    <span className="text-yellow-300">{details.hash}</span>
                                                </div>
                                            )}
                                            <span>{JSON.stringify(details)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {events.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">No security events recorded yet</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Demo Controls</CardTitle>
                        <CardDescription>Trigger security events to visualize</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={() => runDemo('password')} className="w-full justify-start gap-2" variant="outline">
                            <Lock className="w-4 h-4" />
                            Simulate Password Hash
                        </Button>
                        <Button onClick={() => runDemo('sqli')} className="w-full justify-start gap-2 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50" variant="outline">
                            <AlertTriangle className="w-4 h-4" />
                            Simulate SQL Injection
                        </Button>
                        <Button className="w-full justify-start gap-2" variant="outline" disabled>
                            <Server className="w-4 h-4" />
                            Simulate DB Encryption (Auto)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
