import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, IconButton, Link, Typography } from "@mui/joy";
import { SvgIconProps } from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

interface DashboardItemTitleBarProps {
    title: string;
    link: string;
    icon: React.ReactElement<SvgIconProps>;
    optionsList?: { label: string; onClick: () => void }[];
}

const DashboardItemTitleBar: React.FC<DashboardItemTitleBarProps> = ({ title, optionsList, icon, link }) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {/* Grouped Icon and Title */}
            <Box display="flex" alignItems="center">
                {/* add hover property below */}
                <Link startDecorator={icon} component={RouterLink} underline="none" to={link}>
                    <Typography sx={{ "&:hover": { color: "primary.main" } }} level="h4">
                        {title}
                    </Typography>
                </Link>
            </Box>
            {optionsList && (
                <IconButton size="sm">
                    <MoreVertRoundedIcon />
                </IconButton>
            )}
        </Box>
    );
};

export default DashboardItemTitleBar;
