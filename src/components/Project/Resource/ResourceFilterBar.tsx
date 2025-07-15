import React from "react";
import { Box, Typography, IconButton, Button, ButtonGroup, SvgIconProps } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";

import SearchFilterSortDropdown from "@app/components/Project/Resource/SearchFilterSortDropdown";
import { theme } from "@app/theme";

interface ResourceFilterBarProps {
    title: string;
    onCreateClick?: () => void;
    createLabel?: string;
    additionalCreateClick?: () => void;
    addtionalCreateLabel?: string;
    sortOptions?: string[];
    filters?: Record<string, string[]>;
    onApply?: (params: { filters: Record<string, string | number>; sortBy: string; order: string }) => void; // Callback to send filter and sort data
    onViewChangeClick?: () => void;
    isTableView?: boolean;
    icon: React.ReactElement<SvgIconProps>;
    selectedItemsCount?: number;
    resetSelectedItemsCount?: () => void;
    onBatchDeleteClick?: () => void;
    onSelectionChange?: (selectedItems: (Hazard | Visualization | Dataset | Workflow)[]) => void;
}

const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
    title,
    icon,
    filters,
    sortOptions,
    onApply,
    onViewChangeClick,
    isTableView,
    onCreateClick,
    additionalCreateClick,
    createLabel = "Create Item", // Default label for the create button
    addtionalCreateLabel = "Additional Create Item",
    selectedItemsCount,
    onBatchDeleteClick,
    onSelectionChange
}) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {/* Grouped Icon and Title */}
            <Box display="flex" alignItems="center">
                <Box mr={1}>{icon}</Box>
                <Typography level="h4">{title}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
                {onApply && sortOptions && filters && (
                    <SearchFilterSortDropdown sortOptions={sortOptions} filters={filters} onApply={onApply} />
                )}
                {onViewChangeClick && (
                    <ButtonGroup variant="soft" sx={{ ml: 1 }}>
                        <IconButton onClick={onViewChangeClick}>
                            <FormatListBulletedIcon
                                sx={{ color: isTableView ? theme.colorSchemes.light.palette.primary[700] : "inherit" }}
                            />
                        </IconButton>
                        <IconButton onClick={onViewChangeClick}>
                            <GridViewOutlinedIcon
                                sx={{ color: !isTableView ? theme.colorSchemes.light.palette.primary[700] : "inherit" }}
                            />
                        </IconButton>
                    </ButtonGroup>
                )}
                {onCreateClick && (
                    <Button
                        onClick={onCreateClick}
                        variant="soft"
                        startDecorator={<AddIcon />}
                        color="neutral"
                        sx={{ ml: 1 }}
                    >
                        {createLabel}
                    </Button>
                )}
                {additionalCreateClick && (
                    <Button
                        onClick={additionalCreateClick}
                        variant="soft"
                        startDecorator={<AddIcon />}
                        color="neutral"
                        sx={{ ml: 1 }}
                    >
                        {addtionalCreateLabel}
                    </Button>
                )}
                {Boolean(selectedItemsCount) && (
                    <Button
                        variant="soft"
                        color="neutral"
                        sx={{ ml: 1 }}
                        onClick={() => onSelectionChange?.([])}
                        size="sm"
                    >
                        Unselect All ({selectedItemsCount})
                    </Button>
                )}
                {Boolean(selectedItemsCount) && (
                    <Button variant="soft" color="danger" sx={{ ml: 1 }} onClick={onBatchDeleteClick} size="sm">
                        Delete Selected ({selectedItemsCount})
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default ResourceFilterBar;
