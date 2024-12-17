import React from "react";
import { Box, Typography, IconButton, Button, ButtonGroup } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";

import { SvgIconProps } from "@mui/material";
import Searchbox from "@app/components/Project/Resource/Searchbox";
import FilterSortDropdown from "@app/components/Project/Resource/FilterSortDropdown";

interface ResourceFilterBarProps {
    title: string;
    onSearch?: (text: string) => void;
    onCreateClick?: () => void;
    sortOptions?: string[];
    filters?: Record<string, string[]>;
    onApply?: (params: { filters: Record<string, string | number>; sortBy: string; order: string }) => void; // Callback to send filter and sort data
    onViewChangeClick?: () => void;
    isTableView?: boolean;
    createLabel?: string;
    icon: React.ReactElement<SvgIconProps>;
}

const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
    title,
    icon,
    onSearch,
    filters,
    sortOptions,
    onApply,
    onViewChangeClick,
    isTableView,
    onCreateClick,
    createLabel = "Create Item" // Default label for the create button
}) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {/* Grouped Icon and Title */}
            <Box display="flex" alignItems="center">
                <Box mr={1}>{icon}</Box>
                <Typography level="h4">{title}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
                {onSearch && <Searchbox onSearch={onSearch} />}
                {onApply && sortOptions && filters && (
                    <FilterSortDropdown sortOptions={sortOptions} filters={filters} onApply={onApply} />
                )}
                {onViewChangeClick && (
                    <ButtonGroup variant="soft" sx={{ ml: 1 }}>
                        <IconButton onClick={onViewChangeClick}>
                            <GridViewOutlinedIcon sx={{ color: !isTableView ? "primary.light" : "primary.main" }} />
                        </IconButton>
                        <IconButton onClick={onViewChangeClick}>
                            <FormatListBulletedIcon sx={{ color: isTableView ? "primary.light" : "text.secondary" }} />
                        </IconButton>
                    </ButtonGroup>
                )}
                <Button
                    onClick={onCreateClick}
                    variant="soft"
                    startDecorator={<AddIcon />}
                    color="neutral"
                    sx={{ ml: 1 }}
                >
                    {createLabel}
                </Button>
            </Box>
        </Box>
    );
};

export default ResourceFilterBar;
