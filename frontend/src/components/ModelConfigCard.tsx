import {
    Box,
    Button,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import UnifiedCard from './UnifiedCard';

interface ConfigProvider {
    id: string;
    provider: string;
    model: string;
}

interface ConfigRecord {
    id: string;
    requestModel: string;
    responseModel: string;
    providers: ConfigProvider[];
}

interface ModelConfigCardProps {
    defaults: any;
    providers: any[];
    providerModels: any;
    onLoadDefaults: () => Promise<void>;
    onLoadProviderSelectionPanel: () => Promise<void>;
}

const ModelConfigCard = ({
                             defaults,
                             providers,
                             providerModels,
                             onLoadDefaults,
                             onLoadProviderSelectionPanel,
                         }: ModelConfigCardProps) => {
    const [configRecords, setConfigRecords] = useState<ConfigRecord[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (defaults) {
            const initialRecord: ConfigRecord = {
                id: `record-${Date.now()}`,
                requestModel: defaults.requestModel || 'tingly',
                responseModel: defaults.responseModel || '',
                providers: defaults.defaultProvider
                    ? [
                        {
                            id: `provider-${Date.now()}`,
                            provider: defaults.defaultProvider,
                            model: defaults.defaultModel || '',
                        },
                    ]
                    : [],
            };
            setConfigRecords([initialRecord]);
        }
    }, [defaults]);

    const generateId = () => `id-${Date.now()}-${Math.random()}`;

    const addConfigRecord = () => {
        const newRecord: ConfigRecord = {
            id: generateId(),
            requestModel: 'tingly',
            responseModel: '',
            providers: [],
        };
        setConfigRecords([...configRecords, newRecord]);
    };

    const deleteConfigRecord = (recordId: string) => {
        if (configRecords.length > 1) {
            setConfigRecords(configRecords.filter((record) => record.id !== recordId));
        }
    };

    const updateConfigRecord = (recordId: string, field: keyof ConfigRecord, value: any) => {
        setConfigRecords(
            configRecords.map((record) =>
                record.id === recordId ? { ...record, [field]: value } : record
            )
        );
    };

    const addProvider = (recordId: string) => {
        setConfigRecords(
            configRecords.map((record) =>
                record.id === recordId
                    ? {
                        ...record,
                        providers: [
                            ...record.providers,
                            { id: generateId(), provider: '', model: '' },
                        ],
                    }
                    : record
            )
        );
    };

    const deleteProvider = (recordId: string, providerId: string) => {
        setConfigRecords(
            configRecords.map((record) =>
                record.id === recordId
                    ? { ...record, providers: record.providers.filter((p) => p.id !== providerId) }
                    : record
            )
        );
    };

    const updateProvider = (
        recordId: string,
        providerId: string,
        field: keyof ConfigProvider,
        value: string
    ) => {
        setConfigRecords(
            configRecords.map((record) =>
                record.id === recordId
                    ? {
                        ...record,
                        providers: record.providers.map((p) =>
                            p.id === providerId ? { ...p, [field]: value } : p
                        ),
                    }
                    : record
            )
        );
    };

    const handleSaveDefaults = async () => {
        if (configRecords.length === 0) {
            setMessage({ type: 'error', text: 'No configuration records to save' });
            return;
        }

        for (const record of configRecords) {
            if (!record.requestModel) {
                setMessage({
                    type: 'error',
                    text: `Request model name is required for record ${record.id}`,
                });
                return;
            }

            for (const provider of record.providers) {
                if (provider.provider && !provider.model) {
                    setMessage({
                        type: 'error',
                        text: `Please select a model for provider ${provider.provider}`,
                    });
                    return;
                }
            }
        }

        setMessage({ type: 'success', text: 'Configurations saved successfully' });
        await onLoadProviderSelectionPanel();
    };

    return (
        <UnifiedCard
            title="Model Configuration"
            subtitle="Configure model providers and settings"
            size="fullw"
            message={message}
            onClearMessage={() => setMessage(null)}
        >
            <Stack spacing={3}>
                {configRecords.map((record) => (
                    <Box
                        key={record.id}
                        sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1.5fr',
                                gap: 4,
                            }}
                        >
                            {/* Row 1: Headers */}
                            <Box sx={{ gridColumn: '1', gridRow: '1' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle2">
                                        Request
                                    </Typography>

                                    <Button
                                        startIcon={<DeleteIcon />}
                                        onClick={() => deleteConfigRecord(record.id)}
                                        variant="outlined"
                                        size="small"
                                    >
                                        Delete
                                    </Button>
                                </Stack>
                            </Box>
                            <Box sx={{ gridColumn: '2', gridRow: '1' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle2">
                                        Providers ({record.providers.length})
                                    </Typography>
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={() => addProvider(record.id)}
                                        variant="outlined"
                                        size="small"
                                    >
                                        Add Provider
                                    </Button>
                                </Stack>
                            </Box>

                            {/* Row 2: Request Input Fields */}
                            <Box sx={{ gridColumn: '1', gridRow: '2' }}>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <FormControl sx={{ flex: 1 }} size="small">
                                            <TextField
                                                label="Request Model"
                                                value={record.requestModel}
                                                onChange={(e) =>
                                                    updateConfigRecord(record.id, 'requestModel', e.target.value)
                                                }
                                                helperText="Model name"
                                                fullWidth
                                                size="small"
                                            />
                                        </FormControl>
                                        <FormControl sx={{ flex: 1 }} size="small">

                                            <TextField
                                                label="Response Model"
                                                value={record.responseModel}
                                                onChange={(e) =>
                                                    updateConfigRecord(record.id, 'responseModel', e.target.value)
                                                }
                                                helperText="Empty for as-is"
                                                fullWidth
                                                size="small"
                                            />
                                        </FormControl>
                                    </Stack>
                                </Stack>
                            </Box>

                            {/* Row 3+: Provider Configurations (one row per provider) */}
                            <Box sx={{ gridColumn: '2', gridRow: '2' }}>
                                <Stack spacing={1.5}>
                                    {record.providers.map((provider) => (
                                        <>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <FormControl sx={{ flex: 1 }} size="small">
                                                <InputLabel>Provider</InputLabel>
                                                <Select
                                                    value={provider.provider}
                                                    onChange={(e) =>
                                                        updateProvider(
                                                            record.id,
                                                            provider.id,
                                                            'provider',
                                                            e.target.value
                                                        )
                                                    }
                                                    label="Provider"
                                                >
                                                    <MenuItem value="">Select</MenuItem>
                                                    {providers.map((p) => (
                                                        <MenuItem key={p.name} value={p.name}>
                                                            {p.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <FormControl
                                                sx={{ flex: 1 }}
                                                size="small"
                                                disabled={!provider.provider}
                                            >
                                                <InputLabel>Model</InputLabel>
                                                <Select
                                                    value={provider.model}
                                                    onChange={(e) =>
                                                        updateProvider(
                                                            record.id,
                                                            provider.id,
                                                            'model',
                                                            e.target.value
                                                        )
                                                    }
                                                    label="Model"
                                                >
                                                    <MenuItem value="">Select</MenuItem>
                                                    {providerModels[provider.provider]?.models.map(
                                                        (model: string) => (
                                                            <MenuItem key={model} value={model}>
                                                                {model}
                                                            </MenuItem>
                                                        )
                                                    )}
                                                </Select>
                                            </FormControl>

                                            <IconButton
                                                size="small"
                                                onClick={() => deleteProvider(record.id, provider.id)}
                                                color="error"
                                                sx={{ p: 0.5 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                        <Divider sx={{ mt: 1.5 }} />
                                        </>
                                    ))}
                                </Stack>
                            </Box>
                        </Box>
                    </Box>
                ))}

                <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={addConfigRecord} startIcon={<AddIcon />}>
                        Add Configuration
                    </Button>
                    <Button variant="contained" onClick={handleSaveDefaults}>
                        Save All Configurations
                    </Button>
                    <Button variant="outlined" onClick={onLoadDefaults}>
                        Refresh Models
                    </Button>
                </Stack>
            </Stack>
        </UnifiedCard>
    );
};

export default ModelConfigCard;
