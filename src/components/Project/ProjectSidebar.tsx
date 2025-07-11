import React from "react";
import { Box, Stack, Typography, Link } from "@mui/joy";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/AccountTree";
import DFR3Icon from "@mui/icons-material/ShowChart";
import HazardIcon from "@mui/icons-material/Storm";
import VisualizationIcon from "@mui/icons-material/Map";
import DashboardIcon from "@mui/icons-material/Dashboard";

import { theme } from "@app/theme";

interface MenuItem {
    label: string;
    path: string;
    icon: React.ReactElement;
    subMenu: MenuItem[];
}

export const ProjectSidebar = ({ id }: { id: string }) => {
    const location = useLocation(); // Get current route location

    const menuItems: MenuItem[] = [
        { label: "Project Dashboard", path: `/project/${id}`, icon: <DashboardIcon />, subMenu: [] },
        { label: "Workflows", path: `/project/${id}/workflows`, icon: <WorkflowIcon />, subMenu: [] },
        { label: "Hazards", path: `/project/${id}/hazards`, icon: <HazardIcon />, subMenu: [] },
        {
            label: "Datasets",
            path: `/project/${id}/datasets`,
            icon: <DatasetIcon />,
            subMenu: [
                {
                    label: "Datasets by Execution",
                    path: `/project/${id}/datasets/execution`,
                    icon: <DatasetIcon />,
                    subMenu: []
                }
            ]
        },
        {
            label: "Visualizations",
            path: `/project/${id}/visualizations`,
            icon: <VisualizationIcon />,
            subMenu: []
        },
        { label: "DFR3 Mappings", path: `/project/${id}/dfr3Mappings`, icon: <DFR3Icon />, subMenu: [] }
    ];

    const getTreeItem = (item: MenuItem) => (
        <TreeItem
            key={item.path}
            itemId={item.label}
            label={
                <Link
                    to={item.path}
                    style={{
                        padding: "1em",
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                        fontWeight: location.pathname === item.path ? 500 : 400,
                        color: "inherit"
                    }}
                    component={RouterLink}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        {React.cloneElement(item.icon, {
                            sx: {
                                color:
                                    location.pathname === item.path
                                        ? theme.colorSchemes.light.palette.primary[700]
                                        : "black"
                            }
                        })}
                        <Typography
                            level="body-md"
                            textColor={location.pathname === item.path ? "primary.main" : "black"}
                        >
                            {item.label}
                        </Typography>
                    </Stack>
                </Link>
            }
        >
            {item.subMenu && item.subMenu.map((subItem) => getTreeItem(subItem))}
        </TreeItem>
    );

    return (
        <Box mt={-2}>
            <Box sx={{ minHeight: 352, mt: 2 }}>
                <SimpleTreeView
                    aria-label="project sidebar"
                    defaultExpandedItems={["Datasets"]}
                    slots={{
                        collapseIcon: ExpandMoreIcon,
                        expandIcon: ChevronRightIcon,
                        endIcon: () => <div style={{ width: 24 }} />
                    }}
                    sx={{ flexGrow: 1, maxWidth: 400 }}
                >
                    {menuItems.map((item) => getTreeItem(item))}
                </SimpleTreeView>
            </Box>
        </Box>
    );
};

export default ProjectSidebar;
