import React from "react";
import { Box, Typography, IconButton, Button, ButtonGroup } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import AddIcon from "@mui/icons-material/Add";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";

import { SvgIconProps } from "@mui/material";
import FilterDropdown from "@app/components/Project/Resource/FilterDropdown";

interface ResourceFilterBarProps {
    title: string;
    onSearchClick?: () => void;
    filters?: Record<string, string[]>;
    onFilterSelect?: () => void;
    onCreateClick?: () => void;
    onSortClick?: () => void;
    onViewChangeClick?: () => void;
    isTableView?: boolean;
    createLabel?: string;
    icon: React.ReactElement<SvgIconProps>;
}

const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
    title,
    filters,
    icon,
    onSearchClick,
    onFilterSelect,
    onSortClick,
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
                {onSearchClick && (
                    <IconButton onClick={onSearchClick} variant="soft">
                        <SearchIcon />
                    </IconButton>
                )}
                {onFilterSelect && filters && <FilterDropdown filters={filters} onFilterSelect={onFilterSelect} />}
                {onSortClick && (
                    <Button
                        onClick={onSortClick}
                        variant="soft"
                        startDecorator={<SortIcon />}
                        color="neutral"
                        sx={{ ml: 1 }}
                    >
                        Sort
                    </Button>
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
