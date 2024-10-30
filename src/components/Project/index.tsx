import React, { useEffect, useState } from "react";
import { Box, Tab, TabList, TabPanel, Tabs, Typography, Link, Button, Autocomplete, Input } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getProjects, searchProjects } from "@app/reducer/projectSlice";
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
    const [showFilters, setShowFilters] = useState(false); // Show or hide filters
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
        resetSearch(); // Clear search term and set search mode to false
    };

    // Reset all filters and inputs
    const resetFilters = () => {
        setFilters({ name: "", creator: "", region: "" });
        setNameInputValue(""); // Reset Name input
        setCreatorInputValue(""); // Reset Creator input
        setRegionInputValue(""); // Reset Region input
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

    // Search Box
    const [searchTerm, setSearchTerm] = useState(""); // State to hold search term
    const [isSearching, setIsSearching] = useState(false); // Track if we are in search mode

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setSearchTerm(searchTerm); // Update the search term in state

        // Reset to first page and reset filters
        setPageNumber(1); // Reset to first page when a search is performed
        resetFilters(); // Clear all filters
        setIsSearching(true); // Mark as searching
    };

    const resetSearch = () => {
        setSearchTerm("");
        setIsSearching(false);
    };

    // Fetch projects when filters or pagination change (but not during search)
    useEffect(() => {
        if (!isSearching) {
            const skip = (pageNumber - 1) * dataPerPage;
            // @ts-ignore
            dispatch(getProjects({ skip, limit: dataPerPage, ...filters }));
        } else {
            const skip = (pageNumber - 1) * dataPerPage;
            // @ts-ignore
            dispatch(searchProjects({ text: searchTerm, skip, limit: dataPerPage }));
        }
    }, [pageNumber, filters, isSearching]);

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
                        <Button variant="soft" onClick={toggleFilters} startDecorator={<FilterAltOutlinedIcon />}>
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
                            onChange={handleSearchChange}
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
        </Box>
    );
};

export default Project;
