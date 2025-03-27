import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Tab, TabList, TabPanel, Tabs, Link, Typography, Button, Autocomplete, Input } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { getProjects } from "@app/reducer/projectSlice";
import { useAuth } from "react-oidc-context";
import { RootState } from "@app/store";
import Snackbar from "@mui/joy/Snackbar";
import { useSelector } from "react-redux";
import { CreateProjectDialog } from "@app/components/Project/CreateProject";
import { ProjectCard } from "./ProjectCard";
import { Pagination } from "../Home/Pagination";

const Project = (): JSX.Element => {
    const auth = useAuth();
    const appDispatch = useAppDispatch();

    // Redux state
    const projects = useAppSelector((state: RootState) => state.project.projects);
    const loading = useAppSelector((state: RootState) => state.project.loading);
    const deletedProjectId = useAppSelector((state: RootState) => state.project.deletedProjectId);

    // Filter states
    const [filters, setFilters] = useState({ name: "", creator: "", region: "" });
    const [showFilters, setShowFilters] = useState(false); // Show or hide filters
    // Reset all filters and inputs
    const resetFilters = () => {
        setFilters({ name: "", creator: "", region: "" });
        setNameInputValue(""); // Reset Name input
        setCreatorInputValue(""); // Reset Creator input
        setRegionInputValue(""); // Reset Region input
    };
    const toggleFilters = () => {
        resetFilters(); // Reset filters when toggling
        setShowFilters((prev) => !prev); // Toggle filter visibility
    };
    const [nameInputValue, setNameInputValue] = useState(""); // Input value for Name filter
    const [creatorInputValue, setCreatorInputValue] = useState(""); // Input value for Creator filter
    const [regionInputValue, setRegionInputValue] = useState(""); // Input value for Region filter

    const handleFilterChange = (key: string, value: string) => {
        setFilters({
            ...filters,
            [key]: value
        });
        if (key === "name") {
            setNameInputValue(value);
        } else if (key === "creator") {
            setCreatorInputValue(value);
        } else if (key === "region") {
            setRegionInputValue(value);
        }

        setPageNumber(1); // Reset to page 1 when filters change
    };

    // Search Box
    const [searchTerm, setSearchTerm] = useState(""); // State to hold search term
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value); // Update the search term in state

        // Reset to first page and reset filters
        setPageNumber(1); // Reset to first page when a search is performed
    };

    // Pagination states
    const [pageNumber, setPageNumber] = useState(1);
    const dataPerPage = 9; // Number of items per page
    const nextPage = () => {
        setPageNumber((prevPage) => prevPage + 1);
    };
    const previousPage = () => {
        setPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    // Fetch projects when filters or pagination change (but not during search)
    useEffect(() => {
        const skip = (pageNumber - 1) * dataPerPage;
        appDispatch(
            getProjects({
                skip,
                limit: dataPerPage,
                filters: {
                    ...filters,
                    ...(searchTerm ? { text: searchTerm } : {}) // Add searchTerm if available
                }
            })
        );
    }, [pageNumber, filters, searchTerm, deletedProjectId]);

    // snackbar
    const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");
    const [snackbarColor, setSnackbarColor] = React.useState<"success" | "danger" | "warning" | "neutral">("neutral");
    const success = useSelector((state: RootState) => state.project.success);
    const error = useSelector((state: RootState) => state.project.error);
    React.useEffect(() => {
        if (error) {
            setSnackbarMessage(`Error: ${error}`);
            setSnackbarColor("danger");
            setSnackbarOpen(true);
        } else if (success) {
            setSnackbarMessage(success);
            setSnackbarColor("success");
            setSnackbarOpen(true);
        }
    }, [success, error]);

    // Create project
    const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);

    return (
        <Box sx={{ flexShrink: 0 }} mt={5}>
            {/* Header Section */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography level="h3" textColor="primary.main" fontWeight="lg">
                    Projects
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Link to="/tutorials" component={RouterLink} underline="hover" sx={{ fontWeight: "medium" }}>
                        Tutorials
                    </Link>
                    <Button
                        variant="solid"
                        sx={{ backgroundColor: "primary.main" }}
                        startDecorator={<AddIcon />}
                        onClick={() => {
                            setCreateProjectDialogOpen(true);
                        }}
                    >
                        Create a new Project
                    </Button>
                </Box>
            </Box>
            <CreateProjectDialog open={createProjectDialogOpen} onClose={() => setCreateProjectDialogOpen(false)} />
            {/* Tabs and Filters in the same flexbox */}
            <Tabs aria-label="Project Tabs" defaultValue={0} sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{ gap: 2 }}>
                    {/* Tabs */}
                    <TabList>
                        <Tab>All</Tab>
                        <Tab>Recent</Tab>
                        <Tab>Shared With Me</Tab>
                        <Tab>Archived</Tab>
                    </TabList>

                    {/* Filter Dropdowns aligned to the right */}
                    <Box display="flex" gap={2}>
                        <Button
                            variant="soft"
                            onClick={toggleFilters}
                            startDecorator={<FilterAltOutlinedIcon />}
                            color="neutral"
                        >
                            Filter
                        </Button>
                        {showFilters && (
                            <>
                                <Autocomplete
                                    freeSolo
                                    startDecorator={<FilterAltOutlinedIcon />}
                                    placeholder="Name"
                                    options={projects.map((project) => project.name)}
                                    inputValue={nameInputValue}
                                    onInputChange={(_, value) => handleFilterChange("name", value)}
                                    sx={{ width: 150 }}
                                />
                                <Autocomplete
                                    freeSolo
                                    startDecorator={<FilterAltOutlinedIcon />}
                                    placeholder="Creator"
                                    options={[auth?.user?.profile?.preferred_username ?? ""]}
                                    inputValue={creatorInputValue}
                                    onInputChange={(_, value) => handleFilterChange("creator", value)}
                                    sx={{ width: 150 }}
                                />
                                <Autocomplete
                                    freeSolo
                                    startDecorator={<FilterAltOutlinedIcon />}
                                    placeholder="Region"
                                    options={["Galveston", "Joplin", "MMSA", "Seaside", "SLC"]}
                                    inputValue={regionInputValue}
                                    onInputChange={(_, value) => handleFilterChange("region", value)}
                                    sx={{ width: 150 }}
                                />
                            </>
                        )}
                        {/* Search Box */}
                        <Input
                            startDecorator={<SearchIcon />}
                            placeholder="Search"
                            sx={{ width: 400 }}
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                    handleSearchChange(e);
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Project List and Pagination */}
                <TabPanel value={0}>
                    <Box display="flex" flexWrap="wrap" justifyContent="left" gap={4}>
                        {loading ? (
                            <Typography>Loading...</Typography>
                        ) : (
                            projects.map((project) => <ProjectCard project={project} key={project.id ?? ""} />)
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
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                open={snackbarOpen}
                onClose={() => {
                    setSnackbarOpen(false);
                    setSnackbarMessage("");
                }}
                variant="outlined"
                color={snackbarColor}
                autoHideDuration={2000}
            >
                {snackbarMessage}
            </Snackbar>
        </Box>
    );
};

export default Project;
