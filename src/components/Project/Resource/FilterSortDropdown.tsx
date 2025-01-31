import * as React from "react";
import { Button, Box, FormControl, FormLabel, Select, Option, Autocomplete, Sheet } from "@mui/joy";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SortIcon from "@mui/icons-material/Sort";
import { breakCamelCaseAndCapitalize } from "@app/utils";

type FilterSortDropdownProps = {
    filters: Record<string, string[]>; // Filters: key-value pairs
    sortOptions: string[]; // Options for sorting fields
    onApply: (params: { filters: Record<string, string>; sortBy: string; order: string }) => void; // Callback to send filter and sort data
};

const FilterSortDropdown: React.FC<FilterSortDropdownProps> = ({ filters, sortOptions, onApply }) => {
    const [selectedFilters, setSelectedFilters] = React.useState<Record<string, string>>({});
    const [sortBy, setSortBy] = React.useState<string>("");
    const [order, setOrder] = React.useState<string>("");

    const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
    const [showSortDropdown, setShowSortDropdown] = React.useState(false);

    // Handle filter change
    const handleFilterChange = (filterName: string, value: string) => {
        setSelectedFilters((prev) => {
            const updatedFilters = { ...prev, [filterName]: value };
            triggerApply(updatedFilters, sortBy, order);
            return updatedFilters;
        });
    };

    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy);
        triggerApply(selectedFilters, newSortBy, order);
    };

    const handleSortOrderChange = (newOrder: string) => {
        setOrder(newOrder);
        triggerApply(selectedFilters, sortBy, newOrder);
    };

    const triggerApply = (newFilters: Record<string, string>, newSortBy: string, newOrder: string) => {
        onApply({ filters: newFilters, sortBy: newSortBy, order: newOrder });
    };

    const isAnyFilterApplied = Object.values(selectedFilters).some((value) => value.toString().trim() !== "");

    return (
        <Box display="flex" gap={1}>
            {/* Filter Button */}
            <Box position="relative">
                <Button
                    variant="soft"
                    startDecorator={<FilterAltOutlinedIcon />}
                    color={isAnyFilterApplied ? "primary" : "neutral"}
                    sx={{ color: isAnyFilterApplied ? "primary.light" : "primary.main" }}
                    onClick={() => {
                        setShowSortDropdown(false);
                        setShowFilterDropdown((prev) => !prev);
                    }}
                >
                    Filter
                </Button>
                {showFilterDropdown && (
                    <Sheet
                        variant="outlined"
                        sx={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            zIndex: 20,
                            width: "15em",
                            p: 2,
                            borderRadius: "sm",
                            boxShadow: "md",
                            backgroundColor: "background.surface"
                        }}
                    >
                        {Object.entries(filters).map(([filterName, options]) => (
                            <Box key={filterName} mb={2}>
                                <FormControl sx={{ width: "100%" }}>
                                    <FormLabel sx={{ fontWeight: "bold" }}>
                                        {breakCamelCaseAndCapitalize(filterName)}
                                    </FormLabel>
                                    <Autocomplete
                                        freeSolo
                                        placeholder={`Type to filter by ${breakCamelCaseAndCapitalize(filterName)}`}
                                        options={options}
                                        onInputChange={(_, value) => handleFilterChange(filterName, value)}
                                        value={selectedFilters[filterName] || ""}
                                        sx={{ mt: 1 }}
                                    />
                                </FormControl>
                            </Box>
                        ))}
                    </Sheet>
                )}
            </Box>

            {/* Sort Button */}
            <Box position="relative">
                <Button
                    variant="soft"
                    startDecorator={<SortIcon />}
                    onClick={() => {
                        setShowFilterDropdown(false);
                        setShowSortDropdown((prev) => !prev);
                    }}
                    color={order && sortBy ? "primary" : "neutral"}
                    sx={{ color: order && sortBy ? "primary.light" : "primary.main" }}
                >
                    Sort
                </Button>
                {showSortDropdown && (
                    <Sheet
                        variant="outlined"
                        sx={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            zIndex: 20,
                            width: "15em",
                            p: 2,
                            borderRadius: "sm",
                            boxShadow: "md",
                            backgroundColor: "background.surface"
                        }}
                    >
                        <Box mb={2}>
                            <FormControl sx={{ width: "100%" }}>
                                <FormLabel sx={{ fontWeight: "bold" }}>Sort By</FormLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(_, newValue) => handleSortChange(newValue || "")}
                                    sx={{ mt: 1 }}
                                >
                                    {sortOptions.map((option) => (
                                        <Option key={option} value={option}>
                                            {breakCamelCaseAndCapitalize(option)}
                                        </Option>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box>
                            <FormControl sx={{ width: "100%" }}>
                                <FormLabel sx={{ fontWeight: "bold" }}>Sort Order</FormLabel>
                                <Select
                                    value={order}
                                    onChange={(_, newValue) => handleSortOrderChange(newValue || "")}
                                    sx={{ mt: 1 }}
                                >
                                    <Option key="desc" value="desc">
                                        Descending
                                    </Option>
                                    <Option key="asc" value="asc">
                                        Ascending
                                    </Option>
                                </Select>
                            </FormControl>
                        </Box>
                    </Sheet>
                )}
            </Box>
        </Box>
    );
};

export default FilterSortDropdown;
