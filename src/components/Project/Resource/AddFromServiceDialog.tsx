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
    AccordionDetails
} from "@mui/material";
import { searchResource, toSingular } from "@app/utils";

interface AddFromServiceDialogProps {
    projectId: string;
    resourceType: string;
    open: boolean;
    onClose: () => void;
    onAddClick: any;
}

export const AddFromServiceDialog: React.FC<AddFromServiceDialogProps> = ({
    projectId,
    resourceType,
    open,
    onClose,
    onAddClick
}) => {
    const [hazardType, setHazardType] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "danger" | "primary" | "neutral" | undefined>("danger");
    const [resource, setResource] = useState<Hazard | Dataset | DFR3Mapping | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const resultsPerPage = 5; // Default results per page

    useEffect(() => {
        const fetchSearchResources = async () => {
            if (!searchQuery) {
                setSearchResults([]);
                return;
            }

            const results = await searchResource(resourceType, searchQuery, resultsPerPage, 0, hazardType);
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
    }, [searchQuery, resourceType, hazardType]);

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog size="lg" sx={{ backgroundColor: "#fff" }}>
                <ModalClose />
                <Box
                    sx={{
                        width: 600,
                        maxWidth: "100%",
                        padding: 2,
                        borderRadius: "md"
                    }}
                >
                    <Typography level="h4" sx={{ mb: 1, textTransform: "capitalize" }}>
                        Add {resourceType} to Project
                    </Typography>

                    {resourceType === "hazard" && (
                        <FormControl required>
                            <FormLabel>Select Hazard Type</FormLabel>
                            <Select
                                placeholder="Type"
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
                    <FormControl>
                        <FormLabel>Search by Name or ID</FormLabel>
                        <Input
                            placeholder="Enter name or ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </FormControl>

                    {/* Search Results */}
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {searchResults.map((result) => (
                            <Accordion key={result.id} variant="outlined">
                                <AccordionSummary>
                                    <Typography sx={{ textTransform: "capitalize" }}>
                                        {result.name || result.title || "Unnamed Resource"}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>{result.description || "No description available."}</Typography>
                                    <Button
                                        variant="outlined"
                                        sx={{ mt: 1 }}
                                        onClick={() => {
                                            // adjust type of the resource
                                            if (hazardType) result.type = toSingular(hazardType);
                                            if (resourceType.toLowerCase() === "dfr3 mapping")
                                                result.type = result.mappingType;
                                            setResource(result);
                                            setMessage(
                                                `Adding ${
                                                    result.name || result.title || "Unnamed Resource"
                                                } to project?`
                                            );
                                            setMessageType("success");
                                        }}
                                    >
                                        Select
                                    </Button>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                        {message && (
                            <Typography color={messageType} sx={{ mt: 1 }}>
                                {message}
                            </Typography>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
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
