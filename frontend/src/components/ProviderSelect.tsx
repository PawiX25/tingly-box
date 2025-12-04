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
import type { Provider, ProviderModelsData } from './ProviderCard';

export interface ProviderSelectOption {
    provider: string;
    model?: string;
}

interface SingleProviderSelectProps {
    provider: Provider;
    providerModels?: ProviderModelsData;
    selectedProvider?: string;
    selectedModel?: string;
    isExpanded?: boolean;
    searchTerms?: { [key: string]: string };
    currentPage?: { [key: string]: number };
    onModelSelect?: (provider: Provider, model: string) => void;
    onExpandToggle?: (providerName: string, expanded: boolean) => void;
    onSearchChange?: (providerName: string, searchTerm: string) => void;
    onPageChange?: (providerName: string, page: number) => void;
}

const MODELS_PER_PAGE = 15;

export const SingleProviderSelect = ({
    provider,
    providerModels,
    selectedProvider,
    selectedModel,
    isExpanded = false,
    searchTerms = {},
    currentPage = {},
    onModelSelect,
    onExpandToggle,
    onSearchChange,
    onPageChange,
}: SingleProviderSelectProps) => {
    const models = providerModels?.[provider.name]?.models || [];
    const starModels = providerModels?.[provider.name]?.star_models || [];
    const isProviderSelected = selectedProvider === provider.name;
    const hasSelectedModel = isProviderSelected && selectedModel;

    const handleModelSelect = (model: string) => {
        if (onModelSelect) {
            onModelSelect(provider, model);
        }
    };

    const handleQuickSelectChange = (_: any, newValue: string | null) => {
        if (newValue) {
            handleModelSelect(newValue);
        }
    };

    const getFilteredModels = () => {
        const searchTerm = searchTerms[provider.name] || '';
        if (!searchTerm) return models;

        return models.filter(model =>
            model.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getPaginatedModels = () => {
        const filteredModels = getFilteredModels();
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

    const getCurrentDisplayModel = () => {
        return selectedProvider === provider.name ? selectedModel : '';
    };

    const pagination = getPaginatedModels();
    const filteredModels = getFilteredModels();

    return (
        <Accordion
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
                                    value={getCurrentDisplayModel() || null}
                                    onChange={handleQuickSelectChange}
                                    onInputChange={(_, newInputValue, reason) => {
                                        if (newInputValue && reason === 'input') {
                                            handleModelSelect(newInputValue);
                                        }
                                    }}
                                    renderInput={(params) => {
                                        const currentValue = getCurrentDisplayModel();
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
                                                            // Navigate to page containing current model
                                                            const modelIndex = filteredModels.indexOf(currentValue);
                                                            if (modelIndex !== -1) {
                                                                const targetPage = Math.floor(modelIndex / MODELS_PER_PAGE) + 1;
                                                                if (onPageChange) {
                                                                    onPageChange(provider.name, targetPage);
                                                                }
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
                            if (onExpandToggle) {
                                onExpandToggle(provider.name, !isExpanded);
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
                                onChange={(e) => {
                                    if (onSearchChange) {
                                        onSearchChange(provider.name, e.target.value);
                                        // Reset to first page when searching
                                        if (onPageChange) {
                                            onPageChange(provider.name, 1);
                                        }
                                    }
                                }}
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
                            {pagination.totalPages > 1 && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <IconButton
                                        size="small"
                                        disabled={pagination.currentPage === 1}
                                        onClick={() => {
                                            if (onPageChange) {
                                                onPageChange(provider.name, pagination.currentPage - 1);
                                            }
                                        }}
                                    >
                                        <NavigateBeforeIcon />
                                    </IconButton>
                                    <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
                                        {pagination.currentPage} / {pagination.totalPages}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        onClick={() => {
                                            if (onPageChange) {
                                                onPageChange(provider.name, pagination.currentPage + 1);
                                            }
                                        }}
                                    >
                                        <NavigateNextIcon />
                                    </IconButton>
                                </Stack>
                            )}
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
                                    {starModels.map((starModel) => {
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
                                                    onClick={() => handleModelSelect(starModel)}
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
                                All Models ({pagination.totalModels})
                            </Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    gap: 1,
                                }}
                            >
                                {pagination.models.map((model) => {
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
                                            onClick={() => handleModelSelect(model)}
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

                            {pagination.totalModels === 0 && (
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
};

// Export for backward compatibility, but now it's just the composition logic
interface ProviderSelectProps {
    providers: Provider[];
    providerModels?: ProviderModelsData;
    onSelected?: (option: ProviderSelectOption) => void;
    selectedProvider?: string;
    selectedModel?: string;
}

export default function ProviderSelect({
    providers,
    providerModels,
    onSelected,
    selectedProvider,
    selectedModel,
}: ProviderSelectProps) {
    // This component is deprecated - composition logic should be moved to Dashboard
    // Keeping for backward compatibility only
    return (
        <Stack spacing={2}>
            {providers.map((provider) => (
                <SingleProviderSelect
                    key={provider.name}
                    provider={provider}
                    providerModels={providerModels}
                    selectedProvider={selectedProvider}
                    selectedModel={selectedModel}
                    isExpanded={selectedProvider === provider.name}
                    onModelSelect={(provider, model) => {
                        if (onSelected) {
                            onSelected({ provider: provider.name, model });
                        }
                    }}
                />
            ))}
        </Stack>
    );
}
