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
    Typography,
    Select,
    Option
} from "@mui/joy";

import fipsData from "@app/components/Project/Resource/fips.json";
import { getHeaders } from "@app/utils";
import config from "@app/app.config";
import BoundingBoxDrawer from "@app/components/Map/BoundingBoxDrawer";

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
    const [selectionMethod, setSelectionMethod] = React.useState<"fips" | "bbox">("fips");

    // BBox state
    const [bbox, setBbox] = React.useState<[number, number, number, number] | null>(null);
    const [confirmOpen, setConfirmOpen] = React.useState(false);

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

    // Submit handler
    const handleApply = () => {
        const payload = {
            title: title,
            description: description,
            hazardType: "earthquake",
            fips_list: selectedFips ? [selectedFips] : []
        };

        try {
            axios.post(`${config.toolsApi}/bldg-inventory?projectid=${projectId}`, payload, {
                headers: getHeaders()
            });
            handleSnackbar?.("success");
        } catch (error) {
            handleSnackbar?.("failure");
            console.error("Error creating building inventory dataset:", error);
        }
        onClose();
    };

    // Handle bbox selection from BoundingBoxDrawer
    const handleBboxSelected = (selectedBbox: [number, number, number, number]) => {
        console.log("NSI Modal: Received bbox", selectedBbox);
        setBbox(selectedBbox);
        setConfirmOpen(true);
    };

    // Clear bbox when switching to FIPS
    React.useEffect(() => {
        if (selectionMethod === "fips") {
            setBbox(null);
            setConfirmOpen(false);
        }
    }, [selectionMethod]);

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <ModalDialog 
                    variant="outlined" 
                    sx={{ 
                        maxWidth: selectionMethod === "bbox" ? "90vw" : "60vw",
                        width: selectionMethod === "bbox" ? "90vw" : "60vw",
                        display: "flex",
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "flex-start"
                    }}
                >
                    <ModalClose sx={{ zIndex: 20 }} />
                    
                    {/* Left side - Form content */}
                    <Box sx={{ 
                        padding: 1, 
                        flex: "1 1 400px",
                        minWidth: "400px"
                    }}>
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

                            <FormControl required sx={{ mb: 2 }}>
                                <FormLabel>Selection Method</FormLabel>
                                <Select value={selectionMethod} onChange={(_e, val) => setSelectionMethod(val as "fips" | "bbox")}
                                    placeholder="Select a method">
                                    <Option value="fips">FIPS Lookup</Option>
                                    <Option value="bbox">Bounding Box</Option>
                                </Select>
                            </FormControl>

                            {selectionMethod === "fips" && (
                                <FormControl error={showError} sx={{ mb: 2 }}>
                                    <FormLabel required>FIPS Lookup</FormLabel>
                                    <Autocomplete
                                        freeSolo
                                        placeholder="Search by FIPS code, state, or county"
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
                            )}

                            {selectionMethod === "bbox" && (
                                <Box sx={{ mb: 2 }}>
                                    <FormLabel>Bounding Box</FormLabel>
                                    <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
                                        Use the map on the right to draw a bounding box. Check "Draw Bounding Box" and click-drag to create a selection.
                                    </Typography>
                                    {/* Live bbox readout for confirmation while drawing */}
                                    {bbox ? (
                                        <Box sx={{ mt: 1, p: 1, border: "1px solid #ddd", borderRadius: 4, backgroundColor: "#f5f5f5" }}>
                                            <Typography level="body-sm" fontWeight="bold">Selected Bounding Box:</Typography>
                                            <Typography level="body-xs">minx: {bbox[0].toFixed(6)}, miny: {bbox[1].toFixed(6)}</Typography>
                                            <Typography level="body-xs">maxx: {bbox[2].toFixed(6)}, maxy: {bbox[3].toFixed(6)}</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ mt: 1, p: 1, border: "1px solid #ddd", borderRadius: 4, backgroundColor: "#f5f5f5" }}>
                                            <Typography level="body-sm" color="neutral">No bounding box selected yet. Draw one on the map.</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

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
                                <Button type="submit">Submit</Button>
                            </Box>
                        </form>
                    </Box>

                    {/* Right side - Map (only when bbox is selected) */}
                    {selectionMethod === "bbox" && (
                        <Box sx={{
                            flex: "0 0 400px",
                            height: "500px",
                            backgroundColor: "white",
                            border: "2px solid #1976d2",
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                            position: "relative"
                        }}>
                            <Box sx={{
                                position: "absolute",
                                top: "-30px",
                                left: "0",
                                right: "0",
                                textAlign: "center",
                                zIndex: 1002
                            }}>
                                <Typography level="body-sm" sx={{
                                    backgroundColor: "#1976d2",
                                    color: "white",
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: "4px 4px 0 0",
                                    display: "inline-block"
                                }}>
                                    Bounding Box Selection
                                </Typography>
                            </Box>
                            <BoundingBoxDrawer 
                                onBboxSelected={handleBboxSelected}
                                height={500}
                            />
                        </Box>
                    )}
                </ModalDialog>
            </Modal>



            {/* Confirmation dialog for bbox */}
            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <ModalDialog variant="outlined">
                    <Typography component="h2" fontSize="lg" fontWeight="bold" sx={{ mb: 1 }}>
                        Confirm Bounding Box
                    </Typography>
                    {bbox ? (
                        <Box sx={{ mb: 2 }}>
                            <Typography level="body-sm">minx: {bbox[0].toFixed(6)}</Typography>
                            <Typography level="body-sm">miny: {bbox[1].toFixed(6)}</Typography>
                            <Typography level="body-sm">maxx: {bbox[2].toFixed(6)}</Typography>
                            <Typography level="body-sm">maxy: {bbox[3].toFixed(6)}</Typography>
                        </Box>
                    ) : null}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button
                            variant="outlined"
                            sx={{
                                borderColor: "primary.subtle",
                                color: "primary.subtle",
                                backgroundColor: "white"
                            }}
                            onClick={() => {
                                setConfirmOpen(false);
                                setBbox(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={() => setConfirmOpen(false)}>Confirm</Button>
                    </Box>
                </ModalDialog>
            </Modal>
        </>
    );
};

export default FipsLookupModal;
