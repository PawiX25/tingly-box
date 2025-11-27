import { Cancel, CheckCircle } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import UnifiedCard from '../components/UnifiedCard';
import CardGrid, { CardGridItem } from '../components/CardGrid';

const Server = () => {
    const [serverStatus, setServerStatus] = useState<any>(null);
    const [activityLog, setActivityLog] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllData();

        const statusInterval = setInterval(() => {
            loadServerStatus();
        }, 30000);

        const logInterval = setInterval(() => {
            loadActivityLog();
        }, 10000);

        return () => {
            clearInterval(statusInterval);
            clearInterval(logInterval);
        };
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([loadServerStatus(), loadActivityLog()]);
        setLoading(false);
    };

    const loadServerStatus = async () => {
        const result = await api.getStatus();
        if (result.success) {
            setServerStatus(result.data);
        }
    };

    const loadActivityLog = async () => {
        const result = await api.getHistory(50);
        if (result.success) {
            setActivityLog(result.data);
        }
    };

    const handleStartServer = async () => {
        const port = prompt('Enter port for server (8080):', '8080');
        if (port) {
            const result = await api.startServer(parseInt(port));
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setTimeout(() => {
                    loadServerStatus();
                    loadActivityLog();
                }, 1000);
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const handleStopServer = async () => {
        if (confirm('Are you sure you want to stop the server?')) {
            const result = await api.stopServer();
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setTimeout(() => {
                    loadServerStatus();
                    loadActivityLog();
                }, 1000);
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const handleRestartServer = async () => {
        const port = prompt('Enter port for server (8080):', '8080');
        if (port) {
            const result = await api.restartServer(parseInt(port));
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setTimeout(() => {
                    loadServerStatus();
                    loadActivityLog();
                }, 1000);
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const handleGenerateToken = async () => {
        const clientId = prompt('Enter client ID (web):', 'web');
        if (clientId) {
            const result = await api.generateToken(clientId);
            if (result.success) {
                navigator.clipboard.writeText(result.data.token);
                setMessage({ type: 'success', text: 'Token copied to clipboard!' });
                loadActivityLog();
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const clearLog = () => {
        setActivityLog([]);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {message && (
                <Alert
                    severity={message.type}
                    sx={{ mb: 2 }}
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            <CardGrid>
                {/* Server Status */}
                <CardGridItem xs={12} md={6}>
                    <UnifiedCard
                        title="Server Status"
                        subtitle={serverStatus ? (serverStatus.server_running ? "Server is running" : "Server is stopped") : "Loading..."}
                        size="large"
                    >
                        {serverStatus ? (
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {serverStatus.server_running ? (
                                        <CheckCircle color="success" />
                                    ) : (
                                        <Cancel color="error" />
                                    )}
                                    <Typography variant="h6">
                                        Status: {serverStatus.server_running ? 'Running' : 'Stopped'}
                                    </Typography>
                                </Stack>
                                <Typography variant="body2">
                                    <strong>Port:</strong> {serverStatus.port}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Providers:</strong> {serverStatus.providers_enabled}/{serverStatus.providers_total}
                                </Typography>
                                {serverStatus.uptime && (
                                    <Typography variant="body2">
                                        <strong>Uptime:</strong> {serverStatus.uptime}
                                    </Typography>
                                )}
                                {serverStatus.last_updated && (
                                    <Typography variant="body2">
                                        <strong>Last Updated:</strong> {serverStatus.last_updated}
                                    </Typography>
                                )}
                                {serverStatus.request_count !== undefined && (
                                    <Typography variant="body2">
                                        <strong>Request Count:</strong> {serverStatus.request_count}
                                    </Typography>
                                )}
                                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleStartServer}
                                        disabled={serverStatus.server_running}
                                    >
                                        Start
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handleStopServer}
                                        disabled={!serverStatus.server_running}
                                    >
                                        Stop
                                    </Button>
                                    <Button variant="contained" onClick={handleRestartServer}>
                                        Restart
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <Typography color="text.secondary">Loading...</Typography>
                        )}
                    </UnifiedCard>
                </CardGridItem>

                {/* Configuration */}
                <CardGridItem xs={12} md={6}>
                    <UnifiedCard
                        title="Configuration"
                        subtitle="Server configuration and management"
                        size="large"
                    >
                        {serverStatus ? (
                            <Stack spacing={3}>
                                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Server Port
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        {serverStatus.port}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Enabled Providers
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        {serverStatus.providers_enabled} of {serverStatus.providers_total}
                                    </Typography>
                                </Box>
                                {serverStatus.action_stats && (
                                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Total Actions
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {String(Object.values(serverStatus.action_stats).reduce((a: any, b: any) => a + b, 0))}
                                        </Typography>
                                    </Box>
                                )}
                                <Stack direction="row" spacing={2}>
                                    <Button variant="outlined" onClick={loadServerStatus}>
                                        Refresh Status
                                    </Button>
                                    <Button variant="contained" onClick={handleGenerateToken}>
                                        Generate Token
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <Typography color="text.secondary">Loading...</Typography>
                        )}
                    </UnifiedCard>
                </CardGridItem>

                {/* Activity Log */}
                <CardGridItem xs={12}>
                    <UnifiedCard
                        title="Activity Log"
                        subtitle={`${activityLog.length} recent activity entries`}
                        size="full"
                    >
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={2}>
                                <Button variant="outlined" onClick={loadActivityLog}>
                                    Refresh Log
                                </Button>
                                <Button variant="outlined" onClick={clearLog}>
                                    Clear Log
                                </Button>
                            </Stack>
                            <Box
                                sx={{
                                    flex: 1,
                                    backgroundColor: '#1e293b',
                                    color: '#e2e8f0',
                                    p: 2,
                                    borderRadius: 2,
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    overflowY: 'auto',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    minHeight: 320,
                                }}
                            >
                                {activityLog.length > 0 ? (
                                    activityLog.map((entry, index) => {
                                        const timestamp = new Date(entry.timestamp).toLocaleString();
                                        const isSuccess = entry.success;
                                        return (
                                            <Box key={index} mb={0.5}>
                                                <Typography
                                                    component="span"
                                                    sx={{ color: '#64748b', fontSize: '0.75rem' }}
                                                >
                                                    [{timestamp}]
                                                </Typography>{' '}
                                                <Typography component="span" sx={{ color: isSuccess ? '#059669' : '#dc2626' }}>
                                                    {isSuccess ? 'Success' : 'Failed'}
                                                </Typography>{' '}
                                                <Typography component="span">
                                                    {entry.action}: {entry.message}
                                                </Typography>
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Typography color="#64748b">No recent activity</Typography>
                                )}
                            </Box>
                        </Stack>
                    </UnifiedCard>
                </CardGridItem>
            </CardGrid>
        </Box>
    );
};

export default Server;
