import React from "react";
import axios from "axios";

import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    Modal,
    ModalDialog,
    ModalClose,
    Stack,
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
}

const FipsLookupModal: React.FC<FipsLookupModalProps> = ({ open, onClose, projectId }) => {
    const [inputValue, setInputValue] = React.useState<string>("");
    const [filteredOptions, setFilteredOptions] = React.useState<FipsEntry[]>([]);
    const [selectedEntries, setSelectedEntries] = React.useState<FipsEntry[]>([]);
    const [title, setTitle] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [touched, setTouched] = React.useState(false);

    const isValid = selectedEntries.length > 0;
    const showError = touched && !isValid;

    const handleBlur = () => {
        setTouched(true);
    };

    // Debounced filtering
    React.useEffect(() => {
        const handler = setTimeout(() => {
            const filter = inputValue.toLowerCase().trim();
            if (!filter) {
                setFilteredOptions([]);
                return;
            }
            const results = (fipsData as FipsEntry[]).filter(
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
        console.log("Project ID:", projectId);
        try {
            const payload = {
                title: title + " - NSI Building Inventory",
                description: description,
                fips_list: selectedEntries.map((entry) => entry.fips)
            };
            axios.post(`${config.projectApi}/${projectId}/tools/nsi-tool`, payload, { headers: getHeaders() });
            console.log("Payload to be sent:", payload);
        } catch (error) {
            console.error("Error creating NSI Dataset:", error);
            // Handle error, e.g., show notification
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog variant="outlined" sx={{ width: 500, maxWidth: "90vw" }}>
                <ModalClose sx={{ zIndex: 20 }} />
                <Typography id="create-nsi-dataset-dialog-title" component="h2" fontSize="lg" fontWeight="bold">
                    Create NSI Dataset
                </Typography>
                <Stack spacing={2} mt={2}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleApply();
                            onClose();
                        }}
                    >
                        <FormControl required>
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
                                endDecorator={
                                    <React.Fragment>
                                        <Divider sx={{ mr: 1 }} orientation="vertical" />
                                        <Typography color="neutral" level="body-sm" variant="plain">
                                            - NSI Building Inventory
                                        </Typography>
                                    </React.Fragment>
                                }
                            />
                            <FormHelperText>
                                Enter a title for the dataset. Only Alpha-numeric characters, Underscores and Hyphens
                                are allowed.
                            </FormHelperText>
                        </FormControl>

                        <FormControl>
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
                            <FormHelperText>
                                Provide a brief description of the dataset. Only Alpha-numeric characters, Underscores
                                and Hyphens are allowed.
                            </FormHelperText>
                        </FormControl>

                        <FormControl error={showError}>
                            <FormLabel required>FIPS Lookup</FormLabel>
                            <Autocomplete
                                multiple
                                freeSolo
                                limitTags={2}
                                placeholder="Search by FIPS, state, or county"
                                // Exclude already selected entries
                                options={filteredOptions.filter(
                                    (opt) => !selectedEntries.some((sel) => sel.fips === opt.fips)
                                )}
                                getOptionLabel={(option) =>
                                    typeof option === "string"
                                        ? option
                                        : `${option.fips} - ${option.county}, ${option.state}`
                                }
                                onBlur={handleBlur}
                                value={selectedEntries}
                                onChange={(_e, newValue) => setSelectedEntries(newValue as FipsEntry[])}
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
                            <FormHelperText>
                                Search by FIPS code, state, or county name. Select multiple entries.
                            </FormHelperText>
                            {showError && (
                                <Typography fontSize="sm" color="danger">
                                    Please select at least one FIPS entry.
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
                </Stack>
            </ModalDialog>
        </Modal>
    );
};

export default FipsLookupModal;
