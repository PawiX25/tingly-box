import { CheckCircle } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Box,
    Card,
    CardActionArea,
    CardContent,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useEffect, useState } from 'react';
import type { Provider, ProviderModelsData } from './ProviderCard';

export interface ProviderSelectOption {
    provider: string;
    model?: string;
}

interface ProviderSelectProps {
    providers: Provider[];
    providerModels?: ProviderModelsData;
    onSelected?: (option: ProviderSelectOption) => void;
    selectedProvider?: string;
    selectedModel?: string;
}

const ProviderSelect = ({
    providers,
    providerModels,
    onSelected,
    selectedProvider,
    selectedModel,
}: ProviderSelectProps) => {
    const [expandedProviders, setExpandedProviders] = useState<string[]>(
        selectedProvider ? [selectedProvider] : []
    );
    const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
    const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({});
    const MODELS_PER_PAGE = 15;

    // Auto-expand provider and navigate to model page when selections change
    useEffect(() => {
        if (selectedProvider) {
            // Auto-expand the selected provider if not already expanded
            setExpandedProviders(prev =>
                prev.includes(selectedProvider) ? prev : [...prev, selectedProvider]
            );

            // Auto-navigate to the page containing the selected model
            if (selectedModel) {
                const allModels = providerModels?.[selectedProvider]?.models || [];
                const modelIndex = allModels.indexOf(selectedModel);

                // Only navigate if the model exists in the provider's model list
                if (modelIndex !== -1) {
                    const targetPage = Math.floor(modelIndex / MODELS_PER_PAGE) + 1;
                    setCurrentPage(prev => ({
                        ...prev,
                        [selectedProvider]: targetPage
                    }));
                }
            }
        }
    }, [selectedProvider, selectedModel, providers, providerModels]);


    const handleModelSelect = (provider: Provider, model: string) => {
        if (onSelected) {
            console.log("on select", provider, model)
            onSelected({ provider: provider.name, model: model });
        }

        // 确保选中的provider是展开状态
        if (!expandedProviders.includes(provider.name)) {
            setExpandedProviders(prev => [...prev, provider.name]);
        }
    };



    const handleQuickSelectChange = (provider: Provider) => (_: any, newValue: string | null) => {
        if (newValue) {
            handleModelSelect(provider, newValue);
        }
    };

    const getFilteredModels = (provider: Provider) => {
        const models = providerModels?.[provider.name]?.models || [];
        const searchTerm = searchTerms[provider.name] || '';
        if (!searchTerm) return models;

        return models.filter(model =>
            model.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getPaginatedModels = (provider: Provider) => {
        const filteredModels = getFilteredModels(provider);
        const page = currentPage[provider.name] || 1;
        const startIndex = (page - 1) * MODELS_PER_PAGE;
        const endIndex = startIndex + MODELS_PER_PAGE;

        return {
            models: filteredModels.slice(startIndex, endIndex),
            totalPages: Math.ceil(filteredModels.length / MODELS_PER_PAGE),
            currentPage: page,
            totalModels: filteredModels.length,
        };
    };

    const handlePageChange = (providerName: string, newPage: number) => {
        setCurrentPage(prev => ({ ...prev, [providerName]: newPage }));
    };

    const handleSearchChangeWithReset = (providerName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerms(prev => ({ ...prev, [providerName]: event.target.value }));
        // 重置到第一页
        setCurrentPage(prev => ({ ...prev, [providerName]: 1 }));
    };

    const getCurrentDisplayModel = (provider: Provider) => {
        // 显示当前选中的模型
        return selectedProvider === provider.name ? selectedModel : '';
    };


    return (
        <>
            <Stack spacing={2}>
                {providers.map((provider) => {
                    const models = providerModels?.[provider.name]?.models || [];
                    const starModels = providerModels?.[provider.name]?.star_models || [];
                    const isProviderSelected = selectedProvider === provider.name;
                    const isExpanded = expandedProviders.includes(provider.name);

                    // 检查当前provider是否有选中的模型（包括自定义模型）
                    const hasSelectedModel = isProviderSelected && selectedModel;

                    return (
                        <Accordion
                            key={provider.name}
                            expanded={isExpanded}
                            sx={{
                                border: hasSelectedModel ? 3 : 2,
                                borderColor: hasSelectedModel ? 'primary.main' : 'grey.300',
                                borderRadius: 2,
                                '&:before': { display: 'none' },
                                boxShadow: hasSelectedModel ? 4 : 0,
                                backgroundColor: hasSelectedModel ? 'primary.50' : 'background.paper',
                            }}
                        >
                            <AccordionSummary
                                sx={{
                                    borderRadius: 2,
                                    cursor: 'default !important',
                                    '&.Mui-expanded': {
                                        borderBottom: 1,
                                        borderBottomColor: 'divider',
                                        minHeight: 'auto',
                                    },
                                    '& .MuiAccordionSummary-content': {
                                        margin: '12px 0',
                                        cursor: 'default !important',
                                    },
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" sx={{ mr: 2 }}>
                                    {/* Provider Info - Left */}
                                    <Stack spacing={1} sx={{ minWidth: 200, flex: 'none' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {provider.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {models.length > 0 ? `${models.length} models available` : 'No models loaded'}
                                        </Typography>
                                    </Stack>

                                    {/* Quick Model Selector - Center */}
                                    {provider.enabled && (
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 280, maxWidth: 400, flex: 1, mx: 2 }}>
                                            <Box
                                                sx={{ flex: 1 }}
                                                onClick={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                            >
                                                <Autocomplete
                                                    freeSolo
                                                    size="small"
                                                    options={models}
                                                    value={getCurrentDisplayModel(provider) || null}
                                                    onChange={handleQuickSelectChange(provider)}
                                                    onInputChange={(_, newInputValue, reason) => {
                                                        if (newInputValue && reason === 'input') {
                                                            handleModelSelect(provider, newInputValue);
                                                        }
                                                    }}
                                                    renderInput={(params) => {
                                                        const currentValue = getCurrentDisplayModel(provider);
                                                        return (
                                                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                                <TextField
                                                                    {...params}
                                                                    label="Select or type model name"
                                                                    placeholder="Select a model or type custom name..."
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            backgroundColor: 'background.paper',
                                                                            paddingRight: currentValue ? '40px' : '14px',
                                                                        }
                                                                    }}
                                                                />
                                                                {currentValue && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            // 展开到包含当前模型的页面
                                                                            const allModels = getFilteredModels(provider);
                                                                            const modelIndex = allModels.indexOf(currentValue);
                                                                            if (modelIndex !== -1) {
                                                                                const targetPage = Math.floor(modelIndex / MODELS_PER_PAGE) + 1;
                                                                                handlePageChange(provider.name, targetPage);
                                                                            }
                                                                        }}
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            right: 8,
                                                                            top: '50%',
                                                                            transform: 'translateY(-50%)',
                                                                            backgroundColor: 'background.paper',
                                                                            '&:hover': {
                                                                                backgroundColor: 'action.hover',
                                                                            }
                                                                        }}
                                                                        title="Go to current model in list"
                                                                    >
                                                                        <ArrowDropDownIcon />
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                        );
                                                    }}
                                                    renderOption={(props, option) => (
                                                        <li {...props}>
                                                            {option}
                                                        </li>
                                                    )}
                                                    slotProps={{
                                                        paper: {
                                                            style: {
                                                                maxHeight: 300,
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Stack>
                                    )}

                                    {/* Expand/Collapse Button - Right */}
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newExpanded = !isExpanded;
                                            if (newExpanded) {
                                                setExpandedProviders(prev => [...prev, provider.name]);
                                            } else {
                                                setExpandedProviders(prev => prev.filter(name => name !== provider.name));
                                            }
                                        }}
                                        sx={{
                                            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                            transition: 'transform 0.2s ease-in-out',
                                            flex: 'none',
                                        }}
                                    >
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ pt: 2 }}>
                                    {/* Search and Filter */}
                                    <Box sx={{ mb: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                            <TextField
                                                size="small"
                                                placeholder="Search models..."
                                                value={searchTerms[provider.name] || ''}
                                                onChange={handleSearchChangeWithReset(provider.name)}
                                                onClick={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                                sx={{ width: 300 }}
                                            />

                                            {/* Pagination Controls */}
                                            {(() => {
                                                const pagination = getPaginatedModels(provider);
                                                if (pagination.totalPages <= 1) return null;

                                                return (
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <IconButton
                                                            size="small"
                                                            disabled={pagination.currentPage === 1}
                                                            onClick={() => handlePageChange(provider.name, pagination.currentPage - 1)}
                                                        >
                                                            <NavigateBeforeIcon />
                                                        </IconButton>
                                                        <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
                                                            {pagination.currentPage} / {pagination.totalPages}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            disabled={pagination.currentPage === pagination.totalPages}
                                                            onClick={() => handlePageChange(provider.name, pagination.currentPage + 1)}
                                                        >
                                                            <NavigateNextIcon />
                                                        </IconButton>
                                                    </Stack>
                                                );
                                            })()}
                                        </Stack>
                                    </Box>

                                    {/* Star Models Section */}
                                    <Stack spacing={2}>
                                        {starModels.length > 0 && (
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                    Starred Models
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                        flexWrap: 'wrap',
                                                        mb: 3,
                                                    }}
                                                >
                                                    {starModels.map((starModel, index) => {
                                                        const isModelSelected = isProviderSelected && selectedModel === starModel;
                                                        return (
                                                            <Box key={starModel}>
                                                                <Card
                                                                    sx={{
                                                                        width: 180,
                                                                        height: 90,
                                                                        border: isModelSelected ? 3 : 2,
                                                                        borderColor: isModelSelected ? 'primary.main' : 'warning.main',
                                                                        borderRadius: 2,
                                                                        backgroundColor: isModelSelected ? 'primary.100' : 'warning.50',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease-in-out',
                                                                        boxShadow: isModelSelected ? 4 : 1,
                                                                        transform: isModelSelected ? 'scale(1.02)' : 'scale(1)',
                                                                        '&:hover': {
                                                                            borderColor: 'primary.main',
                                                                            boxShadow: 3,
                                                                            transform: 'scale(1.02)',
                                                                        },
                                                                    }}
                                                                    onClick={() => handleModelSelect(provider, starModel)}
                                                                >
                                                                    <CardActionArea sx={{ height: '100%' }}>
                                                                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>
                                                                                {starModel.length > 20 ? `${starModel.substring(0, 20)}...` : starModel}
                                                                            </Typography>
                                                                            {isModelSelected && (
                                                                                <Box sx={{ mt: 0.5 }}>
                                                                                    <CheckCircle color="primary" sx={{ fontSize: 20 }} />
                                                                                </Box>
                                                                            )}
                                                                        </CardContent>
                                                                    </CardActionArea>
                                                                </Card>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* All Models Section */}
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                All Models ({getPaginatedModels(provider).totalModels})
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                                    gap: 1,
                                                }}
                                            >
                                                {getPaginatedModels(provider).models.map((model) => {
                                                    const isModelSelected = isProviderSelected && selectedModel === model;
                                                    const isStarred = starModels.includes(model);

                                                    return (
                                                        <Card
                                                            key={model}
                                                            sx={{
                                                                width: 180,
                                                                height: 90,
                                                                border: isModelSelected ? 3 : 2,
                                                                borderColor: isModelSelected ? 'primary.main' : 'grey.300',
                                                                borderRadius: 2,
                                                                backgroundColor: isModelSelected ? 'primary.100' : 'background.paper',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease-in-out',
                                                                position: 'relative',
                                                                boxShadow: isModelSelected ? 4 : 1,
                                                                transform: isModelSelected ? 'scale(1.02)' : 'scale(1)',
                                                                '&:hover': {
                                                                    borderColor: 'primary.main',
                                                                    boxShadow: 3,
                                                                    transform: 'scale(1.02)',
                                                                },
                                                            }}
                                                            onClick={() => handleModelSelect(provider, model)}
                                                        >
                                                            <CardActionArea sx={{ height: '100%' }}>
                                                                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>
                                                                        {model.length > 20 ? `${model.substring(0, 20)}...` : model}
                                                                    </Typography>
                                                                    {isModelSelected && (
                                                                        <Box sx={{ mt: 0.5 }}>
                                                                            <CheckCircle color="primary" sx={{ fontSize: 20 }} />
                                                                        </Box>
                                                                    )}
                                                                </CardContent>
                                                            </CardActionArea>
                                                            {isStarred && (
                                                                <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                                                                    <Typography variant="caption" color="warning.main">★</Typography>
                                                                </Box>
                                                            )}
                                                        </Card>
                                                    );
                                                })}
                                            </Box>

                                            {getPaginatedModels(provider).totalModels === 0 && (
                                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No models found matching "{searchTerms[provider.name] || ''}"
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Stack>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Stack>
        </>
    );
};

export default ProviderSelect;
