import React from "react";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/Polyline";
import DFR3Icon from "@mui/icons-material/ShowChart";
import HazardIcon from "@mui/icons-material/Storm";
import VisualizationIcon from "@mui/icons-material/Map";

interface ProjectBreadcrumbProps {
    project: {
        href: string;
        label: string;
    };
    resource?: string;
}

const getResourceIcon = (resource: string | undefined) => {
    switch (resource?.toLowerCase()) {
        case "datasets":
            return <DatasetIcon sx={{ mr: 0.5 }} />;
        case "workflows":
            return <WorkflowIcon sx={{ mr: 0.5 }} />;
        case "dfr3Mappings":
            return <DFR3Icon sx={{ mr: 0.5 }} />;
        case "hazards":
            return <HazardIcon sx={{ mr: 0.5 }} />;
        case "visualizations":
            return <VisualizationIcon sx={{ mr: 0.5 }} />;
        default:
            return null;
    }
};

export const ProjectBreadcrumb = (props: ProjectBreadcrumbProps) => {
    const { project, resource } = props;

    return (
        <Breadcrumbs separator="›" aria-label="breadcrumbs">
            <Link textColor="primary.main" underline="none" href="/">
                <HomeIcon sx={{ mr: 0.5 }} />
                Home
            </Link>
            <Link textColor="primary.main" fontWeight="bolder" underline="none" href={project.href}>
                <FolderIcon sx={{ mr: 0.5 }} />
                {project.label}
            </Link>
            {resource && (
                <Typography textColor="primary.main" fontWeight="bolder">
                    {getResourceIcon(resource)}
                    {resource}
                </Typography>
            )}
        </Breadcrumbs>
    );
};
