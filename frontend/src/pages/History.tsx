import {
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import UnifiedCard from '../components/UnifiedCard';
import CardGrid, { CardGridItem } from '../components/CardGrid';

const History = () => {
    const [allHistory, setAllHistory] = useState<any[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Auto refresh state
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        error: 0,
        today: 0,
    });

    const updateStats = useCallback((data: any[]) => {
        const total = data.length;
        const success = data.filter(entry => entry.success).length;
        const error = total - success;
        const today = new Date().toDateString();
        const todayCount = data.filter(entry =>
            new Date(entry.timestamp).toDateString() === today
        ).length;

        setStats({
            total,
            success,
            error,
            today: todayCount,
        });
    }, []);

    const applyFilters = useCallback(() => {
        const filtered = allHistory.filter(entry => {
            // Search filter
            if (searchTerm && !entry.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !entry.message.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Type filter
            if (filterType !== 'all' && entry.action !== filterType) {
                return false;
            }

            // Status filter
            if (filterStatus !== 'all' && entry.success.toString() !== filterStatus) {
                return false;
            }

            return true;
        });

        setFilteredHistory(filtered);
    }, [allHistory, searchTerm, filterType, filterStatus]);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        const result = await api.getHistory(200);
        if (result.success) {
            setAllHistory(result.data);
            updateStats(result.data);
            applyFilters();
        }
        setLoading(false);
    }, [updateStats, applyFilters]);

    // Initial load and filter updates
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Auto refresh effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (autoRefresh) {
            interval = setInterval(loadHistory, refreshInterval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, refreshInterval, loadHistory]);

    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDetails = (details: any) => {
        if (!details) return 'N/A';
        if (typeof details === 'string') return details;
        return Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ');
    };

    const handleExportJSON = () => {
        const dataStr = JSON.stringify(filteredHistory, null, 2);
        downloadFile('history.json', dataStr, 'application/json');
    };

    const handleExportCSV = () => {
        const headers = ['Timestamp', 'Action', 'Success', 'Message', 'Details'];
        const csvContent = [
            headers.join(','),
            ...filteredHistory.map(entry => [
                new Date(entry.timestamp).toISOString(),
                entry.action,
                entry.success,
                `"${entry.message.replace(/"/g, '""')}"`,
                `"${formatDetails(entry.details).replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        downloadFile('history.csv', csvContent, 'text/csv');
    };

    const handleExportTXT = () => {
        const txtContent = filteredHistory.map(entry =>
            `[${new Date(entry.timestamp).toLocaleString()}] ${entry.success ? 'Success' : 'Failed'}: ${entry.action}: ${entry.message}`
        ).join('\n');

        downloadFile('history.txt', txtContent, 'text/plain');
    };

    const downloadFile = (filename: string, content: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
            <CardGrid>
                {/* Filter and Export Controls */}
                <CardGridItem xs={12}>
                    <UnifiedCard
                        title="Filters & Controls"
                        subtitle="Search, filter, and export history data"
                        size="medium"
                    >
                        <Stack spacing={3}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Search history..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Filter by Action</InputLabel>
                                    <Select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        label="Filter by Action"
                                    >
                                        <MenuItem value="all">All Actions</MenuItem>
                                        <MenuItem value="start_server">Start Server</MenuItem>
                                        <MenuItem value="stop_server">Stop Server</MenuItem>
                                        <MenuItem value="restart_server">Restart Server</MenuItem>
                                        <MenuItem value="add_provider">Add Provider</MenuItem>
                                        <MenuItem value="delete_provider">Delete Provider</MenuItem>
                                        <MenuItem value="generate_token">Generate Token</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>Filter by Status</InputLabel>
                                    <Select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        label="Filter by Status"
                                    >
                                        <MenuItem value="all">All Status</MenuItem>
                                        <MenuItem value="true">Success</MenuItem>
                                        <MenuItem value="false">Error</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                                <Stack direction="row" spacing={2}>
                                    <Button variant="outlined" onClick={loadHistory}>
                                        Refresh
                                    </Button>
                                    <Button variant="contained" onClick={handleExportJSON}>
                                        Export
                                    </Button>
                                </Stack>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={autoRefresh}
                                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Auto Refresh"
                                    />
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Interval</InputLabel>
                                        <Select
                                            value={refreshInterval}
                                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                            label="Interval"
                                            disabled={!autoRefresh}
                                        >
                                            <MenuItem value={10000}>10s</MenuItem>
                                            <MenuItem value={30000}>30s</MenuItem>
                                            <MenuItem value={60000}>1m</MenuItem>
                                            <MenuItem value={300000}>5m</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {autoRefresh && (
                                        <Chip
                                            label="Active"
                                            color="success"
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </Stack>
                        </Stack>
                    </UnifiedCard>
                </CardGridItem>

                {/* Statistics */}
                <CardGridItem xs={12} sm={6} md={3}>
                    <UnifiedCard
                        title="Total Actions"
                        subtitle={`${stats.total} total entries`}
                        size="small"
                    >
                        <Typography variant="h3" color="primary" sx={{ textAlign: 'center' }}>
                            {stats.total}
                        </Typography>
                    </UnifiedCard>
                </CardGridItem>

                <CardGridItem xs={12} sm={6} md={3}>
                    <UnifiedCard
                        title="Successful"
                        subtitle={`${stats.success} successful actions`}
                        size="small"
                    >
                        <Typography variant="h3" color="success.main" sx={{ textAlign: 'center' }}>
                            {stats.success}
                        </Typography>
                    </UnifiedCard>
                </CardGridItem>

                <CardGridItem xs={12} sm={6} md={3}>
                    <UnifiedCard
                        title="Failed"
                        subtitle={`${stats.error} failed actions`}
                        size="small"
                    >
                        <Typography variant="h3" color="error.main" sx={{ textAlign: 'center' }}>
                            {stats.error}
                        </Typography>
                    </UnifiedCard>
                </CardGridItem>

                <CardGridItem xs={12} sm={6} md={3}>
                    <UnifiedCard
                        title="Today"
                        subtitle={`${stats.today} actions today`}
                        size="small"
                    >
                        <Typography variant="h3" color="info.main" sx={{ textAlign: 'center' }}>
                            {stats.today}
                        </Typography>
                    </UnifiedCard>
                </CardGridItem>

                {/* History Table */}
                <CardGridItem xs={12}>
                    <UnifiedCard
                        title="History Table"
                        subtitle={`${filteredHistory.length} filtered entries`}
                        size="full"
                    >
                        <Stack spacing={1}>
                            <TableContainer component={Paper} sx={{ maxHeight: 280 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Timestamp</TableCell>
                                            <TableCell>Action</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Message</TableCell>
                                            <TableCell>Details</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredHistory.length > 0 ? (
                                            filteredHistory.map((entry, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                        {new Date(entry.timestamp).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>{formatAction(entry.action)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={entry.success ? 'Success' : 'Error'}
                                                            color={entry.success ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {entry.message}
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {formatDetails(entry.details)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <Typography color="text.secondary" py={3}>
                                                        No history found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Stack direction="row" spacing={2}>
                                <Button variant="outlined" onClick={handleExportJSON}>
                                    Export JSON
                                </Button>
                                <Button variant="outlined" onClick={handleExportCSV}>
                                    Export CSV
                                </Button>
                                <Button variant="outlined" onClick={handleExportTXT}>
                                    Export TXT
                                </Button>
                            </Stack>
                        </Stack>
                    </UnifiedCard>
                </CardGridItem>
            </CardGrid>
        </Box>
    );
};

export default History;
