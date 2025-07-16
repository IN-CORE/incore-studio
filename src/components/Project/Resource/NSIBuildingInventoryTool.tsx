import React from "react";
import axios from "axios";

import {
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    Modal,
    ModalDialog,
    ModalClose,
    Textarea,
    Typography
} from "@mui/joy";

import fipsData from "@app/components/Project/Resource/fips.json";
import { getHeaders } from "@app/utils";
import config from "@app/app.config";

// Define the shape of a FIPS record
interface FipsEntry {
    fips: string;
    state: string;
    county: string;
}

// Props for the lookup modal
interface FipsLookupModalProps {
    open: boolean;
    onClose: () => void;
    projectId?: string; // Optional projectId if needed for further actions
    handleSnackbar?: (status: string) => void; // Optional callback for snackbar notification
}

const allowedStates = ["Tennessee", "Oregon", "California"];

const FipsLookupModal: React.FC<FipsLookupModalProps> = ({ open, onClose, projectId, handleSnackbar }) => {
    const [inputValue, setInputValue] = React.useState<string>("");
    const [filteredOptions, setFilteredOptions] = React.useState<FipsEntry[]>([]);
    const [selectedFips, setSelectedFips] = React.useState<string | null>(null);
    const [title, setTitle] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [touched, setTouched] = React.useState(false);

    const allowedFipsData = (fipsData as FipsEntry[]).filter((entry) => allowedStates.includes(entry.state));

    const isValid = selectedFips !== null;
    const showError = touched && !isValid;

    const handleBlur = () => {
        setTouched(true);
    };

    React.useEffect(() => {
        // Initialize filtered options with all FIPS data
        setFilteredOptions(allowedFipsData as FipsEntry[]);
    }, []);

    // Debounced filtering
    React.useEffect(() => {
        const handler = setTimeout(() => {
            const filter = inputValue.toLowerCase().trim();
            if (!filter) {
                setFilteredOptions(allowedFipsData as FipsEntry[]);
                return;
            }
            const results = (allowedFipsData as FipsEntry[]).filter(
                (entry) =>
                    entry.fips.includes(filter) ||
                    entry.state.toLowerCase().includes(filter) ||
                    entry.county.toLowerCase().includes(filter)
            );
            setFilteredOptions(results);
        }, 300);
        return () => clearTimeout(handler);
    }, [inputValue]);

    const handleApply = () => {
        const payload = {
            title: title,
            description: description,
            hazardType: "earthquake", // Default to flood if not selected
            fips_list: selectedFips ? [selectedFips] : []
        };

        try {
            axios.post(`${config.toolsApi}/bldg-inventory?projectid=${projectId}`, payload, {
                headers: getHeaders()
            });
            handleSnackbar?.("success"); // Notify parent component
        } catch (error) {
            handleSnackbar?.("failure"); // Notify parent component of error
            console.error("Error creating building inventory dataset:", error);
        }
        onClose(); // Close the modal after submission
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog variant="outlined" sx={{ maxWidth: "90vw" }}>
                <ModalClose sx={{ zIndex: 20 }} />
                <Box sx={{ padding: 1 }}>
                    <Typography
                        id="create-nsi-dataset-dialog-title"
                        component="h2"
                        fontSize="lg"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                    >
                        Generate Building Inventory Dataset
                    </Typography>
                    <Typography level="body-sm" color="neutral" sx={{ mb: 2 }}>
                        This tool will generate an IN-CORE building inventory dataset based on NSI (National Structure
                        Inventory) for a FIPS code. The dataset is configured to work with fragility curves for IN-CORE.
                        Currently, the tool supports the following hazards: Earthquake, Tsunami, Flood, Hurricane wind.
                    </Typography>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleApply();
                            onClose();
                        }}
                    >
                        <FormControl required sx={{ mb: 2 }}>
                            <FormLabel>Title</FormLabel>
                            <Input
                                variant="outlined"
                                required
                                placeholder="Dataset Title"
                                value={title}
                                onChange={(e) => {
                                    if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                        setTitle(e.target.value);
                                    }
                                }}
                            />
                            <FormHelperText sx={{ mb: 1 }}>Enter a title for the dataset.</FormHelperText>
                            <Typography level="body-xs" color="neutral">
                                Only Alpha-numeric characters, Underscores and Hyphens are allowed.
                            </Typography>
                        </FormControl>

                        <FormControl required sx={{ mb: 2 }}>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                placeholder="Enter a description for the dataset"
                                value={description}
                                minRows={3}
                                maxRows={5}
                                onChange={(e) => {
                                    if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                        setDescription(e.target.value);
                                    }
                                }}
                            />
                            <FormHelperText sx={{ mb: 1 }}>Provide a brief description of the dataset.</FormHelperText>
                            <Typography level="body-xs" color="neutral">
                                Only Alpha-numeric characters, Underscores and Hyphens are allowed.
                            </Typography>
                        </FormControl>

                        <FormControl error={showError} sx={{ mb: 2 }}>
                            <FormLabel required>FIPS Lookup</FormLabel>
                            <Autocomplete
                                freeSolo
                                placeholder="Search by FIPS, state, or county"
                                // Exclude already selected entries
                                options={filteredOptions}
                                getOptionLabel={(option) =>
                                    typeof option === "string"
                                        ? option
                                        : `${option.fips} - ${option.county}, ${option.state}`
                                }
                                onBlur={handleBlur}
                                value={selectedFips}
                                onChange={(_e, newValue) =>
                                    setSelectedFips(
                                        typeof newValue === "object" && newValue !== null && "fips" in newValue
                                            ? (newValue as FipsEntry).fips
                                            : typeof newValue === "string"
                                              ? newValue
                                              : null
                                    )
                                }
                                inputValue={inputValue}
                                onInputChange={(_e, newValue) => setInputValue(newValue)}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip {...getTagProps({ index })} variant="soft" size="sm">
                                            {`${option.fips} - ${option.county}`}
                                        </Chip>
                                    ))
                                }
                            />
                            <FormHelperText sx={{ mb: 1 }}>
                                Search by FIPS code, state, or county name. (Only California, Oregon, and Tennessee are
                                available.)
                            </FormHelperText>
                            {showError && (
                                <Typography fontSize="sm" color="danger">
                                    Please select a FIPS entry.
                                </Typography>
                            )}
                        </FormControl>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: "primary.subtle",
                                    color: "primary.subtle",
                                    backgroundColor: "white"
                                }}
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                sx={{ backgroundColor: "primary.main" }}
                                disabled={!isValid}
                            >
                                Create
                            </Button>
                        </Box>
                    </form>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default FipsLookupModal;
