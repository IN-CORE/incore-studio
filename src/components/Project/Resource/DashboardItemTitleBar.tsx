import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Dropdown, IconButton, Link, Menu, MenuButton, MenuItem, Typography, SvgIconProps } from "@mui/joy";
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
                <Dropdown>
                    <MenuButton
                        slots={{ root: IconButton }}
                        slotProps={{ root: { variant: "outlined", color: "neutral" } }}
                    >
                        <MoreVertRoundedIcon />
                    </MenuButton>
                    <Menu>
                        {optionsList.map((option, index) => (
                            <MenuItem key={index} onClick={option.onClick}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Dropdown>
            )}
        </Box>
    );
};

export default DashboardItemTitleBar;
