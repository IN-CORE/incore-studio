import React from "react";
import { Box, Typography, IconButton } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SortIcon from "@mui/icons-material/Sort";
import AddIcon from "@mui/icons-material/Add";
import { SvgIconProps } from "@mui/material";

interface ResourceFilterBarProps {
    title: string;
    onSearchClick?: () => void;
    onFilterClick?: () => void;
    onCreateClick?: () => void;
    onSortClick?: () => void;
    createLabel?: string;
    icon: React.ReactElement<SvgIconProps>;
}

const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
    title,
    icon,
    onSearchClick,
    onFilterClick,
    onSortClick,
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
                    <IconButton onClick={onSearchClick}>
                        <SearchIcon />
                    </IconButton>
                )}
                {onFilterClick && (
                    <IconButton onClick={onFilterClick}>
                        <FilterAltOutlinedIcon />
                    </IconButton>
                )}
                {onSortClick && (
                    <IconButton onClick={onSortClick}>
                        <SortIcon />
                    </IconButton>
                )}
                <IconButton onClick={onCreateClick} variant="outlined">
                    <AddIcon />
                    <Typography level="body-sm" mr={1}>
                        {createLabel}
                    </Typography>
                </IconButton>
            </Box>
        </Box>
    );
};

export default ResourceFilterBar;
