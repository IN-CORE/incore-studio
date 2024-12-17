import * as React from "react";
import { Dropdown, MenuButton, Menu, FormControl, FormLabel, Autocomplete, Box } from "@mui/joy";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { breakCamelCaseAndCapitalize } from "@app/utils";

type FilterDropdownProps = {
    filters: Record<string, string[]>; // Hashmap of filter names and possible values
    onFilterSelect: (filter: string, value: string) => void; // Callback for filter selection
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({ filters, onFilterSelect }) => {
    const [selectedValues, setSelectedValues] = React.useState<Record<string, string>>({});
    const handleInputChange = (filterName: string, value: string) => {
        setSelectedValues((prev) => ({
            ...prev,
            [filterName]: value
        }));
        onFilterSelect(filterName, value);
    };

    const isAnyFilterApplied = Object.values(selectedValues).some((value) => value.trim() !== "");

    return (
        <Box mr={1}>
            <Dropdown>
                <MenuButton
                    variant="soft"
                    startDecorator={<FilterAltOutlinedIcon />}
                    color={isAnyFilterApplied ? "primary" : "neutral"} // Change color dynamically
                    sx={{
                        color: isAnyFilterApplied ? "primary.light" : "primary.main"
                    }}
                >
                    Filter
                </MenuButton>
                <Menu placement="bottom-start" sx={{ width: "15em", padding: "1em" }}>
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
                                    onInputChange={(_, value) => handleInputChange(filterName, value)}
                                    sx={{ mt: 1 }}
                                />
                            </FormControl>
                        </Box>
                    ))}
                </Menu>
            </Dropdown>
        </Box>
    );
};

export default FilterDropdown;
