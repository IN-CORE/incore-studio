import React from "react";
import { Box, Typography, IconButton, Button, ButtonGroup } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";

import { SvgIconProps } from "@mui/material";
import FilterDropdown from "@app/components/Project/Resource/FilterDropdown";
import SortDropdown from "@app/components/Project/Resource/SortDropdown";
import Searchbox from "@app/components/Project/Resource/Searchbox";

interface ResourceFilterBarProps {
    title: string;
    onSearchClick?: () => void;
    filters?: Record<string, string[]>;
    onFilterSelect?: () => void;
    onCreateClick?: () => void;
    onSortClick?: () => void;
    sortOptions?: string[];
    onViewChangeClick?: () => void;
    isTableView?: boolean;
    createLabel?: string;
    icon: React.ReactElement<SvgIconProps>;
}

const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
    title,
    icon,
    onSearchClick,
    onFilterSelect,
    filters,
    onSortClick,
    sortOptions,
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
                {onSearchClick && <Searchbox onSearchClick={onSearchClick} />}
                {onFilterSelect && filters && <FilterDropdown filters={filters} onFilterSelect={onFilterSelect} />}
                {onSortClick && sortOptions && <SortDropdown sortOptions={sortOptions} onSortClick={onSortClick} />}
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
