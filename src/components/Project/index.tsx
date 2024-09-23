import React, { useEffect, useState } from "react";
import { Box, Tab, TabList, TabPanel, Tabs, Typography, Link, Button, Autocomplete } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getProjects } from "@app/reducer/projectSlice";
import { useAuth } from "react-oidc-context";
import { ProjectCard } from "./ProjectCard";
import { Pagination } from "../Home/Pagination";

const Project = (): JSX.Element => {
    const auth = useAuth();
    const dispatch = useDispatch();

    // Redux state
    const projects = useSelector((state: RootState) => state.project.projects);
    const loading = useSelector((state: RootState) => state.project.loading);

    // Filter states
    const [filters, setFilters] = useState({ name: "", creator: "", region: "" });

    // Pagination states
    const [pageNumber, setPageNumber] = useState(1);
    const dataPerPage = 10; // Number of items per page

    const nextPage = () => {
        setPageNumber((prevPage) => prevPage + 1);
    };

    const previousPage = () => {
        setPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    // Fetch projects when filters change
    useEffect(() => {
        const skip = (pageNumber - 1) * dataPerPage;
        // @ts-ignore
        dispatch(getProjects({ skip, limit: dataPerPage, ...filters }));
    }, [dispatch, pageNumber, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters({
            ...filters,
            [key]: value
        });
        setPageNumber(1); // Reset to page 1 when filters change
    };

    return (
        <Box sx={{ flexShrink: 0 }} mt={5}>
            {/* Header Section */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography level="h3" textColor="primary.main" fontWeight="lg">
                    Projects
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Link href="/tutorials" underline="hover" sx={{ fontWeight: "medium" }}>
                        Tutorials
                    </Link>
                    <Button variant="solid" sx={{ backgroundColor: "primary.main" }} startDecorator={<AddIcon />}>
                        Create a new Project
                    </Button>
                </Box>
            </Box>

            {/* Filter Dropdowns */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Autocomplete
                    freeSolo
                    options={projects.map((project) => project.name)}
                    onInputChange={(_, value) => handleFilterChange("name", value)}
                    sx={{ width: 200 }}
                />
                <Autocomplete
                    freeSolo
                    options={[auth?.user?.profile?.preferred_username ?? ""]}
                    onInputChange={(_, value) => handleFilterChange("creator", value)}
                    sx={{ width: 200 }}
                />
                <Autocomplete
                    freeSolo
                    options={["joplin", "galveston", "seaside", "MMSA", "slc"]}
                    onInputChange={(_, value) => handleFilterChange("region", value)}
                    sx={{ width: 200 }}
                />
            </Box>

            {/* Tabs Section */}
            <Tabs aria-label="Project Tabs" defaultValue={0}>
                <TabList>
                    <Tab>All</Tab>
                    <Tab>Recent</Tab>
                    <Tab>Shared With Me</Tab>
                    <Tab>Archived</Tab>
                </TabList>

                <TabPanel value={0}>
                    {/* Project List */}
                    <Box display="flex" flexWrap="wrap" justifyContent="left" gap={4}>
                        {loading ? (
                            <Typography>Loading...</Typography>
                        ) : (
                            projects
                                .slice((pageNumber - 1) * dataPerPage, pageNumber * dataPerPage)
                                .map((project) => <ProjectCard project={project} key={project.id ?? ""} />)
                        )}
                    </Box>

                    {/* Pagination Component */}
                    <Box mt={4} display="flex" justifyContent="center">
                        <Pagination
                            pageNumber={pageNumber}
                            data={projects}
                            dataPerPage={dataPerPage}
                            previous={previousPage}
                            next={nextPage}
                        />
                    </Box>
                </TabPanel>
                <TabPanel value={1}>In Development</TabPanel>
                <TabPanel value={2}>In Development</TabPanel>
                <TabPanel value={3}>In Development</TabPanel>
            </Tabs>
        </Box>
    );
};

export default Project;
