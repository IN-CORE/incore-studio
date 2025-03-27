import * as React from "react";
import { IconButton, Input, Box } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect } from "react";

type SearchboxProps = {
    onSearch: (text: string) => void;
};

const Searchbox: React.FC<SearchboxProps> = ({ onSearch }) => {
    const [isExpanded, setIsExpanded] = React.useState(false); // Track if the search box is expanded
    const [searchValue, setSearchValue] = React.useState(""); // Track the search input value

    const handleSearchClick = () => {
        setIsExpanded((prev) => !prev); // Toggle the expanded state
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    useEffect(() => {
        if (isExpanded) {
            onSearch(searchValue);
        }
    }, [searchValue]);

    return (
        <Box display="flex" alignItems="center" gap={1} mr={1}>
            {/* Search Button */}
            <IconButton
                onClick={handleSearchClick}
                variant="soft"
                color={searchValue ? "primary" : "neutral"} // Change
                sx={{
                    color: searchValue ? "primary.light" : "primary.main"
                }}
            >
                <SearchIcon />
            </IconButton>

            {/* Conditionally Render Search Input */}
            {isExpanded && (
                <Input
                    value={searchValue}
                    onChange={(e) => {
                        if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                            handleInputChange(e);
                        }
                    }}
                    placeholder="Search..."
                    autoFocus
                    sx={{
                        width: 200, // Set width for the search box
                        transition: "width 0.3s ease-in-out" // Smooth expansion
                    }}
                />
            )}
        </Box>
    );
};

export default Searchbox;
