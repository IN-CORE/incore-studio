import * as React from "react";
import { Button, Menu, FormControl, FormLabel, Select, Option, Box } from "@mui/joy";
import SortIcon from "@mui/icons-material/Sort";
import { breakCamelCaseAndCapitalize } from "@app/utils";

type SortDropdownProps = {
    sortOptions: string[];
    onSortClick: (sortBy: string, sortOrder: string) => void;
};

const SortDropdown: React.FC<SortDropdownProps> = ({ sortOptions, onSortClick }) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [selectedSort, setSelectedSort] = React.useState<string>(sortOptions[0] || "");
    const [sortOrder, setSortOrder] = React.useState<string>("desc");

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSortChange = (sortBy: string) => {
        setSelectedSort(sortBy);
        onSortClick(sortBy, sortOrder); // Notify parent component of changes
    };

    const handleSortOrderChange = (order: string) => {
        setSortOrder(order);
        onSortClick(selectedSort, order); // Notify parent component of changes
    };

    return (
        <div>
            <Button onClick={handleOpen} variant="soft" startDecorator={<SortIcon />} color="neutral">
                Sort
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                placement="bottom-start"
                sx={{ width: "15em", padding: "1em" }}
            >
                <Box mb={2}>
                    <FormControl sx={{ width: "100%" }}>
                        <FormLabel sx={{ fontWeight: "bold" }}>Sort By</FormLabel>
                        <Select
                            value={selectedSort}
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
                <Box mb={2}>
                    <FormControl sx={{ width: "100%" }}>
                        <FormLabel sx={{ fontWeight: "bold" }}>Sort Order</FormLabel>
                        <Select
                            value={sortOrder}
                            onChange={(_, newValue) => handleSortOrderChange(newValue || "Ascending")}
                            sx={{ mt: 1 }}
                        >
                            <Option value="desc">Descending</Option>
                            <Option value="asc">Ascending</Option>
                        </Select>
                    </FormControl>
                </Box>
            </Menu>
        </div>
    );
};

export default SortDropdown;
