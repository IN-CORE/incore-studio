import React from "react";
import { Box, Typography, IconButton } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

interface ResourceFilterBarProps {
    title: string;
    onSearchClick?: () => void;
    onFilterClick?: () => void;
    onCreateClick?: () => void;
    createLabel?: string;
}

const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
    title,
    onSearchClick,
    onFilterClick,
    onCreateClick,
    createLabel = "Create Item" // Default label for the create button
}) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography level="h4">{title}</Typography>
            <Box display="flex" alignItems="center">
                {onSearchClick && (
                    <IconButton onClick={onSearchClick}>
                        <SearchIcon />
                    </IconButton>
                )}
                {onFilterClick && (
                    <IconButton onClick={onFilterClick}>
                        <FilterListIcon />
                    </IconButton>
                )}
                <IconButton onClick={onCreateClick}>
                    <AddIcon />
                    <Typography level="body-sm" ml={1}>
                        {createLabel}
                    </Typography>
                </IconButton>
            </Box>
        </Box>
    );
};

export default ResourceFilterBar;
