import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Chip, Dropdown, Button, IconButton, Link, Menu, MenuButton, MenuItem, Typography } from "@mui/joy";
import { useTheme } from "@mui/joy/styles"; // or from '@mui/material/styles' if you're using MUI theme
import useMediaQuery from "@mui/material/useMediaQuery"; // works with Joy UI too

import { SxProps } from "@mui/system";
import { SvgIconProps } from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

interface DashboardItemTitleBarProps {
    title: string;
    link: string;
    icon: React.ReactElement<SvgIconProps>;
    total: string;
    btnList?: { label: string; icon: React.ReactElement<SvgIconProps>; sx: SxProps; onClick: () => void }[];
}

const DashboardItemTitleBar: React.FC<DashboardItemTitleBarProps> = ({ title, icon, link, btnList, total }) => {
    const theme = useTheme();
    const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
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
                <Chip sx={{ ml: 2 }}>{total}</Chip>
            </Box>
            <>
                {isLgUp && btnList ? (
                    <Box display="flex" gap={1}>
                        {btnList.map((btn, index) => (
                            <Button
                                key={index}
                                variant="solid"
                                startDecorator={btn.icon}
                                sx={btn.sx}
                                onClick={btn.onClick}
                            >
                                {btn.label}
                            </Button>
                        ))}
                    </Box>
                ) : (
                    btnList && (
                        <Dropdown>
                            <MenuButton
                                slots={{ root: IconButton }}
                                slotProps={{ root: { variant: "outlined", color: "neutral" } }}
                            >
                                <MoreHorizRoundedIcon />
                            </MenuButton>
                            <Menu>
                                {btnList.map((option, index) => (
                                    <MenuItem key={index} onClick={option.onClick}>
                                        {option.icon}
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Dropdown>
                    )
                )}
            </>
        </Box>
    );
};

export default DashboardItemTitleBar;
