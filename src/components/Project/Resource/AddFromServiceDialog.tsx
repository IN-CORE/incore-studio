import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalClose,
    ModalDialog,
    Option,
    Select,
    Stack,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    AccordionGroup
} from "@mui/joy";
import { downloadMetadata, searchResource, toSingular } from "@app/utils";
import { NestedInfoTable } from "@app/components/Project/Resource/NestedInfoTable";
import { Pagination } from "@app/components/Home/Pagination";

interface AddFromServiceDialogProps {
    projectId: string;
    resourceType: string;
    open: boolean;
    onClose: () => void;
    onAddClick: any;
    previewFunc?: (resource: Dataset | Hazard | DFR3Mapping | null) => void;
}

export const AddFromServiceDialog: React.FC<AddFromServiceDialogProps> = ({
    projectId,
    resourceType,
    open,
    onClose,
    onAddClick,
    previewFunc
}) => {
    const [hazardType, setHazardType] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "danger" | "primary" | "neutral" | undefined>("danger");
    const [resource, setResource] = useState<Hazard | Dataset | DFR3Mapping | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null); // Tracks expanded accordion

    // Pagination states
    const [pageNumber, setPageNumber] = useState(1);
    const dataPerPage = 10; // Default results per page
    const nextPage = () => {
        setPageNumber((prevPage) => prevPage + 1);
    };
    const previousPage = () => {
        setPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    useEffect(() => {
        setResource(null); // Reset resource when search conditions change
        const fetchSearchResources = async () => {
            if (!searchQuery) {
                setSearchResults([]);
                return;
            }

            const results = await searchResource(
                resourceType,
                searchQuery,
                dataPerPage,
                (pageNumber - 1) * dataPerPage,
                hazardType
            );
            if (results.error) {
                setMessage(results.error);
                setMessageType("danger");
                setSearchResults([]);
            } else {
                setMessage(null);
                setSearchResults(results);
            }
        };

        fetchSearchResources();
    }, [searchQuery, resourceType, hazardType, pageNumber]);

    useEffect(() => {
        setPageNumber(1); // Reset page number when search conditions change
    }, [searchQuery, resourceType, hazardType]);

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ backgroundColor: "#fff", width: "50em" }}>
                <ModalClose sx={{ zIndex: 20 }} />
                <Box sx={{ maxWidth: "100%", padding: "5%", overflow: "auto" }}>
                    <Typography level="h4" sx={{ mb: 1, textTransform: "capitalize" }}>
                        Add {resourceType} to Project
                    </Typography>

                    {resourceType === "hazard" && (
                        <FormControl required sx={{ marginTop: "1em" }}>
                            <FormLabel>Select Hazard Type</FormLabel>
                            <Select
                                placeholder="Hazard Type"
                                value={hazardType}
                                onChange={(_, newValue) => setHazardType(newValue || "")}
                            >
                                <Option value="earthquakes">Earthquake</Option>
                                <Option value="floods">Flood</Option>
                                <Option value="hurricanes">Hurricane</Option>
                                <Option value="tornadoes">Tornado</Option>
                                <Option value="tsunamis">Tsunami</Option>
                            </Select>
                        </FormControl>
                    )}

                    {/* Search Bar */}
                    <FormControl required sx={{ marginTop: "1em" }}>
                        <FormLabel>Search by Name or ID</FormLabel>
                        <Input
                            placeholder="Name or ID"
                            value={searchQuery}
                            onChange={(e) => {
                                if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                    setSearchQuery(e.target.value);
                                }
                            }}
                            disabled={!hazardType && resourceType === "hazard"}
                        />
                    </FormControl>
                    {message && (
                        <Typography color={messageType} sx={{ mt: 1 }}>
                            {message}
                        </Typography>
                    )}

                    {/* Search Results */}
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <AccordionGroup>
                            {searchResults.map((result) => {
                                const isSelected = resource?.id === result.id; // Check if the result is selected
                                const isExpanded = expandedAccordion === result.id; // Check if the accordion is expanded

                                return (
                                    <Accordion
                                        key={result.id}
                                        expanded={isExpanded} // Expand only the active accordion
                                        onChange={() =>
                                            setExpandedAccordion(expandedAccordion === result.id ? null : result.id)
                                        }
                                        sx={{ backgroundColor: isExpanded ? "neutral.50" : "inherit" }}
                                    >
                                        <AccordionSummary
                                            sx={{
                                                color: isSelected ? "primary" : "inherit",
                                                fontWeight: isSelected ? "bold" : "normal"
                                            }}
                                        >
                                            {result.name ?? result.title ?? "Unnamed Resource"} -{" "}
                                            {result.owner ?? "Unknown Owner"}
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {/* Button group on top */}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "flex-start",
                                                    gap: 1
                                                }}
                                                mt={1}
                                                mb={1}
                                            >
                                                <Button
                                                    variant="solid"
                                                    sx={{ backgroundColor: "primary.main" }}
                                                    onClick={() => {
                                                        if (hazardType) result.type = toSingular(hazardType);
                                                        if (resourceType.toLowerCase() === "dfr3 mapping")
                                                            result.type = result.mappingType;
                                                        setResource(result);
                                                        setMessage(
                                                            `Adding "${
                                                                result.name || result.title || "Unnamed Resource"
                                                            }" to project?`
                                                        );
                                                        setMessageType("success");
                                                        setExpandedAccordion(null); // Collapse all accordions
                                                    }}
                                                >
                                                    Select
                                                </Button>
                                                {previewFunc && (
                                                    <Button
                                                        variant="outlined"
                                                        sx={{ color: "primary.main", borderColor: "primary.main" }}
                                                        onClick={() => resource && previewFunc(resource)}
                                                    >
                                                        Preview
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    sx={{ color: "primary.main", borderColor: "primary.main" }}
                                                    onClick={() => {
                                                        downloadMetadata(result);
                                                    }}
                                                >
                                                    Download Metadata
                                                </Button>
                                            </Box>
                                            <NestedInfoTable data={result} />
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </AccordionGroup>
                        {searchResults.length > 0 && (
                            <Box mt={4} display="flex" justifyContent="center">
                                <Pagination
                                    pageNumber={pageNumber}
                                    dataLength={searchResults.length}
                                    dataPerPage={dataPerPage}
                                    previous={previousPage}
                                    next={nextPage}
                                />
                            </Box>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose} sx={{ color: "primary.main" }}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            sx={{ backgroundColor: "primary.main" }}
                            disabled={!resource}
                            onClick={() => {
                                onAddClick(projectId, resource);
                                setResource(null);
                                setHazardType("");
                                setMessage(null);
                            }}
                        >
                            Add to Project
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
