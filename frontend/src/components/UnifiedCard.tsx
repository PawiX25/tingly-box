import { Box, Card, CardContent, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface UnifiedCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  // 格子倍数配置：widthUnits × heightUnits
  size?: 'small' | 'medium' | 'large' | 'full';
  variant?: 'default' | 'outlined' | 'elevated';
  // 自定义格子倍数
  gridUnits?: {
    widthUnits?: number;
    heightUnits?: number;
  };
  sx?: SxProps<Theme>;
}

// 基本格子尺寸单位（像素）
const BASE_UNIT = 40;

// 预设的格子倍数系统
const presetCardDimensions = {
  small: {
    widthUnits: 8,  // 240px
    heightUnits: 10, // 160px
  },
  medium: {
    widthUnits: 8,  // 240px
    heightUnits: 10, // 280px
  },
  large: {
    widthUnits: 13,  // 320px
    heightUnits: 13, // 360px
  },
  full: {
    widthUnits: 13, // 480px
    heightUnits: 13, // 480px
  },
};

// 计算卡片尺寸的函数
const getCardDimensions = (size: 'small' | 'medium' | 'large' | 'full', customGridUnits?: { widthUnits?: number; heightUnits?: number }) => {
  const dimensions = customGridUnits || presetCardDimensions[size];
  const width = dimensions.widthUnits * BASE_UNIT;
  const height = dimensions.heightUnits * BASE_UNIT;

  return {
    width,
    height,
    display: 'flex',
    flexDirection: 'column' as const,
  };
};

const cardVariants = {
  default: {},
  outlined: {
    border: 2,
    borderColor: 'divider',
    boxShadow: 'none',
  },
  elevated: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: 'none',
  },
};

export const UnifiedCard = ({
  title,
  subtitle,
  children,
  size = 'medium',
  variant = 'default',
  gridUnits,
  sx = {},
}: UnifiedCardProps) => {
  return (
    <Card
      sx={{
        ...getCardDimensions(size, gridUnits),
        ...cardVariants[variant],
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 2,
        },
        ...sx,
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {title && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: subtitle ? 1 : 0 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnifiedCard;