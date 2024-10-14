import { Card, Typography, IconButton, Box, CardContent, Chip } from "@mui/joy";
import { Autocomplete, Grid, Input } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { parseDateTime } from "@app/utils";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { Pagination } from "@app/components/Home/Pagination";
import { getProjectHazards, searchProjectHazards } from "@app/reducer/projectSlice";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

interface HazardCardsProps {
    projectId?: string;
}

export const HazardCards = ({ projectId }: HazardCardsProps) => {
    const projectHazards = useSelector((state: RootState) => state.project.projectHazards);
    const dispatch = useDispatch();

    // Pagination states
    const [pageNumber, setPageNumber] = useState(1);
    const dataPerPage = 2; // Number of items per page
    const nextPage = () => {
        setPageNumber((prevPage) => prevPage + 1);
    };
    const previousPage = () => {
        setPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    // Search Box
    const [searchTerm, setSearchTerm] = useState(""); // State to hold search term
    const [isSearching, setIsSearching] = useState(false); // Track if we are in search mode
    const [showSearching, setShowSearching] = useState(false);
    const toggleSearch = () => {
        resetSearch();
        setShowSearching((prev) => !prev); // Toggle search visibility
    };
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

    // Filter states
    const [filters, setFilters] = useState({ type: "" });
    const [showFilters, setShowFilters] = useState(false); // Show or hide filters
    const toggleFilters = () => {
        resetFilters(); // Reset filters when toggling
        setShowFilters((prev) => !prev); // Toggle filter visibility
    };
    const [typeInputValue, setTypeInputValue] = useState("");
    const handleFilterChange = (key: string, value: string) => {
        setFilters({
            ...filters,
            [key]: value
        });
        if (key === "type") {
            setTypeInputValue(value);
        }

        setPageNumber(1); // Reset to page 1 when filters change
        resetSearch(); // Clear search term and set search mode to false
    };

    // Reset all filters and inputs
    const resetFilters = () => {
        setFilters({ type: "" });
        setTypeInputValue("");
    };

    // Fetch projects when filters or pagination change (but not during search)
    useEffect(() => {
        if (!isSearching) {
            const skip = (pageNumber - 1) * dataPerPage;
            // @ts-ignore
            dispatch(getProjectHazards({ projectId, skip, limit: dataPerPage, ...filters }));
        } else {
            const skip = (pageNumber - 1) * dataPerPage;
            // @ts-ignore
            dispatch(searchProjectHazards({ projectId, text: searchTerm, skip, limit: dataPerPage }));
        }
    }, [pageNumber, filters, isSearching]);

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pl={2} pr={2}>
                <Typography level="h4">Hazards</Typography>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={toggleSearch}>
                        <SearchIcon />
                    </IconButton>
                    {/* Search Box */}
                    {showSearching && (
                        <Input
                            startDecorator={<SearchIcon />}
                            placeholder="Search"
                            sx={{ width: 400 }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    )}
                    <IconButton>
                        <FilterListIcon onClick={toggleFilters} />
                    </IconButton>
                    {showFilters && (
                        <Autocomplete
                            freeSolo
                            startDecorator={<FilterAltOutlinedIcon />}
                            placeholder="Name"
                            options={projectHazards.map((hazard) => hazard.type)}
                            inputValue={typeInputValue}
                            onInputChange={(_, value) => handleFilterChange("type", value)}
                            sx={{ width: 150 }}
                        />
                    )}
                    <IconButton>
                        <AddIcon />
                        <Typography level="body-sm" ml={1}>
                            Add from service
                        </Typography>
                    </IconButton>
                </Box>
            </Box>

            {/* Wrapping Cards inside Grid Container */}
            <Grid container spacing={3}>
                {projectHazards.map((hazard) => (
                    <Grid key={hazard.id} xs={12} sm={12} md={6} lg={6}>
                        <Card variant="plain" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        height: 200,
                                        backgroundColor: "#e0e0e0",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    <Typography level="body-sm">Hazard Placeholder</Typography>
                                </Box>
                                <Box sx={{ p: 1, flexGrow: 1, height: 80, overflow: "auto" }}>
                                    <Typography level="body-sm" mb={1} textColor="primary.main">
                                        {hazard.name || "Name not provided"}
                                    </Typography>
                                    <Typography level="body-sm">
                                        {hazard.description || "Description not provided"}
                                    </Typography>
                                </Box>
                            </CardContent>
                            <Box
                                sx={{
                                    mt: "auto",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                {/* Pill for hazard type */}
                                <Chip size="sm" sx={{ borderRadius: 0 }}>
                                    {hazard.type || "Type not provided"}
                                </Chip>

                                {/* Date on the right */}
                                <Typography level="body-sm">
                                    {hazard.date ? parseDateTime(hazard.date) : "Date not provided"}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination Component */}
            <Box mt={4} display="flex" justifyContent="center">
                <Pagination
                    pageNumber={pageNumber}
                    data={projectHazards}
                    dataPerPage={dataPerPage}
                    previous={previousPage}
                    next={nextPage}
                />
            </Box>
        </>
    );
};
