import React from "react";
import { Box, List, ListItem, Typography } from "@mui/joy";
import { Link, useLocation } from "react-router-dom";
import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/Polyline";
import DFR3Icon from "@mui/icons-material/ShowChart";
import HazardIcon from "@mui/icons-material/Storm";
import VisualizationIcon from "@mui/icons-material/Map";
import DashboardIcon from "@mui/icons-material/Dashboard";

export const ProjectSidebar = ({ id }: { id: string }) => {
    const location = useLocation(); // Get current route location

    const menuItems = [
        { label: "Project Dashboard", path: `/project/${id}`, icon: <DashboardIcon /> },
        { label: "Workflows", path: `/project/${id}/workflows`, icon: <WorkflowIcon /> },
        { label: "Hazards", path: `/project/${id}/hazards`, icon: <HazardIcon /> },
        { label: "Datasets", path: `/project/${id}/datasets`, icon: <DatasetIcon /> },
        { label: "Visualizations", path: `/project/${id}/visualizations`, icon: <VisualizationIcon /> },
        { label: "DFR3 Mappings", path: `/project/${id}/dfr3Mappings`, icon: <DFR3Icon /> }
    ];

    return (
        <Box mt={-2}>
            <List>
                {menuItems.map((item, index) => {
                    const isSelected = location.pathname === item.path;
                    const iconWithColor = React.cloneElement(item.icon, {
                        sx: {
                            color: isSelected ? "primary.light" : "primary.main"
                        }
                    });

                    return (
                        <ListItem
                            key={index}
                            sx={{
                                "padding": "1em",
                                "display": "flex",
                                "alignItems": "center",
                                "backgroundColor": isSelected ? "#E9F2FF" : "transparent",
                                "fontWeight": isSelected ? 500 : 400,
                                "&:hover": {
                                    backgroundColor: "neutral.background"
                                }
                            }}
                        >
                            <Link
                                to={item.path}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    textDecoration: "none",
                                    color: "inherit",
                                    width: "100%"
                                }}
                            >
                                <Box mr={1}>{iconWithColor}</Box>
                                <Typography level="body-md" textColor={isSelected ? "primary.light" : "primary.main"}>
                                    {item.label}
                                </Typography>
                            </Link>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default ProjectSidebar;
