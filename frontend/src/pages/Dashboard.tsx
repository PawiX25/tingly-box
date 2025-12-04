import { Box, Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import CardGrid, { CardGridItem } from '../components/CardGrid';
import ProviderSelect from '../components/ProviderSelect';
import ServerInfoCard from '../components/ServerInfoCard';
import UnifiedCard from '../components/UnifiedCard';
import { api } from '../services/api';

const Dashboard = () => {
    const [serverStatus, setServerStatus] = useState<any>(null);
    const [providers, setProviders] = useState<any[]>([]);
    const [defaults, setDefaults] = useState<any>({});
    const [providerModels, setProviderModels] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<any>({ provider: "", model: "" })

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([
            loadServerStatus(),
            loadProviders(),
            loadDefaults(),
            loadProviderModels(),
        ]);
        setLoading(false);
    };

    const loadServerStatus = async () => {
        const result = await api.getStatus();
        if (result.success) {
            setServerStatus(result.data);
        }
    };

    const loadProviders = async () => {
        const result = await api.getProviders();
        if (result.success) {
            setProviders(result.data);
        }
    };

    const loadDefaults = async () => {
        const result = await api.getDefaults();
        if (result.success) {
            setDefaults(result.data);
        }
    };

    const loadProviderModels = async () => {
        const result = await api.getProviderModels();
        if (result.success) {
            setProviderModels(result.data);
        }
    };

    const setDefaultProviderHandler = async (_providerName: string) => {
        const currentDefaults = await api.getDefaults();
        if (!currentDefaults.success) {
            return;
        }

        // Update the default RequestConfig with the selected provider
        const requestConfigs = currentDefaults.data.request_configs || [];
        if (requestConfigs.length === 0) {
            return;
        }

        const payload = {
            request_configs: requestConfigs,
        };

        const result = await api.setDefaults(payload);
        if (result.success) {
            await loadDefaults();
        }
    };

    const fetchProviderModels = async (_providerName: string) => {
        const result = await api.getProviderModelsByName(_providerName);
        if (result.success) {
            await loadProviders();
            await loadProviderModels();
        }
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
                {/* Server Information Header */}
                <CardGridItem xs={12}>
                    <ServerInfoCard serverStatus={serverStatus} />
                </CardGridItem>

                {/* Providers Quick Settings */}
                <CardGridItem xs={12} md={6}>
                    <UnifiedCard
                        title="Providers Management"
                        subtitle={`Total: ${providers.length} providers | Enabled: ${providers.filter((p: any) => p.enabled).length}`}
                        size="full"
                        rightAction={
                            <Box>
                                <Button
                                    variant="contained"
                                    onClick={() => window.location.href = '/providers'}
                                >
                                    Manage Providers
                                </Button>
                            </Box>
                        }
                    >
                        <ProviderSelect
                            providers={providers}
                            providerModels={providerModels}
                            onSelected={(option) => {
                                setSelectedOption(option)
                            }}
                            selectedProvider={selectedOption?.provider}
                            selectedModel={selectedOption?.model}
                        />
                    </UnifiedCard>
                </CardGridItem>
            </CardGrid>
        </Box>
    );
};

export default Dashboard;
