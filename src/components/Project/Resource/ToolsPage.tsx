import React from "react";

import { Box, Card, CardContent, Divider, Typography, Container, Grid } from "@mui/joy";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getProject } from "@app/reducer/projectSlice";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";

import { useAppDispatch } from "@app/store/hooks";

import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import NSIBuildingInventoryTool from "@app/components/Project/Resource/NSIBuildingInventoryTool";

const cardPerRow = 2; // Adjust this value to change the number of cards per row

const ToolsPage: React.FC = () => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);

    const [openNSITool, setOpenNSITool] = React.useState(false);
    const handleOpenNSITool = () => {
        setOpenNSITool(true);
    };
    const handleCloseNSITool = () => {
        setOpenNSITool(false);
    };

    React.useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    const TOOL_COMPONENTS = {
        "NSI Building Inventory": {
            label: "NSI Building Inventory",
            description:
                "A tool for managing and analyzing building inventory data from the National Structural Inventory.",
            handleOpenTool: handleOpenNSITool
        }
        // Add other tools here as needed
    };

    return (
        <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
            <NSIBuildingInventoryTool open={openNSITool} onClose={handleCloseNSITool} projectId={id ?? ""} />
            <Box sx={{ flexShrink: 0 }} mt={5}>
                {!project ? (
                    <Typography>Loading...</Typography>
                ) : (
                    <>
                        {/* Header Section */}
                        <ProjectBreadcrumb
                            project={{ href: `/project/${project.id}`, label: project.name }}
                            resource="Tools"
                        />
                        <ProjectHeader project={project} />
                        <Divider />
                        <Grid container spacing={5} mt={3} ml={0}>
                            <Grid sm={2}>
                                <ProjectSidebar id={project.id} />
                            </Grid>
                            <Grid sm={10}>
                                <ResourceFilterBar
                                    title="Tools"
                                    icon={<ConstructionRoundedIcon sx={{ verticalAlign: "middle" }} />}
                                />
                                <Grid container spacing={3}>
                                    {Object.entries(TOOL_COMPONENTS).map(
                                        ([key, { label, description, handleOpenTool }]) => (
                                            <Grid
                                                key={key}
                                                xs={12}
                                                sm={12}
                                                md={Math.ceil(12 / (cardPerRow ?? 2))}
                                                lg={Math.ceil(12 / (cardPerRow ?? 2))}
                                            >
                                                <Card
                                                    sx={{
                                                        "display": "flex",
                                                        "flexDirection": "column",
                                                        "height": "100%",
                                                        "padding": "1em",
                                                        "boxShadow": "none",
                                                        "transition": "all 0.3s ease",
                                                        "opacity": 1,
                                                        "&:hover": {
                                                            boxShadow: "0 0 8px rgba(66, 82, 110, 0.5)",
                                                            cursor: "pointer"
                                                        }
                                                    }}
                                                    onClick={handleOpenTool}
                                                    data-testid={`tool-card-${key}`}
                                                >
                                                    <CardContent>
                                                        <Box sx={{ p: 1, flexGrow: 1, height: "100px" }}>
                                                            <Typography
                                                                level="h4"
                                                                mb={1}
                                                                textColor="primary.main"
                                                                sx={{
                                                                    whiteSpace: "normal",
                                                                    overflowWrap: "break-word",
                                                                    wordBreak: "break-word",
                                                                    display: "-webkit-box",
                                                                    WebkitLineClamp: 1, // optional: limit lines
                                                                    WebkitBoxOrient: "vertical",
                                                                    overflow: "hidden"
                                                                }}
                                                            >
                                                                {`${label} Tool`}
                                                            </Typography>
                                                            <Typography
                                                                level="body-sm"
                                                                sx={{
                                                                    whiteSpace: "normal",
                                                                    overflowWrap: "break-word",
                                                                    wordBreak: "break-word",
                                                                    display: "-webkit-box",
                                                                    WebkitLineClamp: 3, // optional: limit lines
                                                                    WebkitBoxOrient: "vertical",
                                                                    overflow: "hidden"
                                                                }}
                                                            >
                                                                {description}
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        )
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default ToolsPage;
