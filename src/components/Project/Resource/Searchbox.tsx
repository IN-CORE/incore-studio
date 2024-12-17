import * as React from "react";
import { IconButton, Input, Box } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect } from "react";

type SearchboxProps = {
    onSearchClick: (text: string) => void;
};

const Searchbox: React.FC<SearchboxProps> = ({ onSearchClick }) => {
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
            onSearchClick(searchValue);
        }
    }, [searchValue]);

    return (
        <Box display="flex" alignItems="center" gap={1} mr={1}>
            {/* Search Button */}
            <IconButton onClick={handleSearchClick} variant="soft">
                <SearchIcon />
            </IconButton>

            {/* Conditionally Render Search Input */}
            {isExpanded && (
                <Input
                    value={searchValue}
                    onChange={handleInputChange}
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
