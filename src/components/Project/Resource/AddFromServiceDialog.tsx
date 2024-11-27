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
    Typography
} from "@mui/material";
import { fetchResource, toSingular } from "@app/utils";

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
    const [resourceId, setResourceId] = useState("");
    const [hazardType, setHazardType] = useState("");
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [isResourceValid, setIsResourceValid] = useState(false);
    const [resource, setResource] = useState<Hazard | Dataset | DFR3Mapping | null>(null);

    useEffect(() => {
        const validateResource = async () => {
            if (!resourceId) {
                setValidationMessage(null);
                setIsResourceValid(false);
                setResource(null);
                return;
            }

            const result = await fetchResource(resourceType, resourceId, hazardType);
            if (result.error) {
                setValidationMessage(result.error);
                setIsResourceValid(false);
                setResource(null);
            } else {
                setValidationMessage(null);
                setIsResourceValid(true);

                // adjust type of the resource
                if (hazardType) result.type = toSingular(hazardType);
                if (resourceType.toLowerCase() === "dfr3 mapping") result.type = result.mappingType;
                setResource(result);
            }
        };

        validateResource();
    }, [resourceId, resourceType, hazardType]);

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
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl required>
                            <FormLabel sx={{ textTransform: "capitalize" }}>{resourceType} ID</FormLabel>
                            <Input
                                placeholder="ID"
                                value={resourceId}
                                onChange={(e) => setResourceId(e.target.value)}
                                error={!!validationMessage}
                            />
                            {validationMessage && (
                                <Typography color="danger" sx={{ mt: 1 }}>
                                    {validationMessage}
                                </Typography>
                            )}
                            {isResourceValid && resource && (
                                <Typography color="success" sx={{ mt: 1 }}>
                                    {
                                        // eslint-disable-next-line no-nested-ternary
                                        "description" in resource && resource.description
                                            ? resource.description
                                            : // eslint-disable-next-line no-nested-ternary
                                              "name" in resource && resource.name
                                              ? resource.name
                                              : "title" in resource && resource.title
                                                ? resource.title
                                                : "Resource is valid"
                                    }{" "}
                                    - {resource.owner}
                                </Typography>
                            )}
                        </FormControl>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            disabled={
                                resourceType === "hazard"
                                    ? !resourceId || !hazardType || !isResourceValid
                                    : !resourceId || !isResourceValid
                            }
                            onClick={() => {
                                onAddClick(projectId, resource);
                                setResource(null);
                                setResourceId("");
                                setHazardType("");
                                setValidationMessage(null);
                                setIsResourceValid(false);
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
