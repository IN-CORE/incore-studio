import React, { useState } from "react";
import {
    Modal,
    Typography,
    Button,
    Select,
    Option,
    Input,
    Textarea,
    Stack,
    Box,
    ModalDialog,
    ModalClose,
    FormControl,
    FormLabel
} from "@mui/joy";
import { useAppDispatch } from "@app/store/hooks";
import { createProjectVisualization } from "@app/reducer/projectSlice";
import { handleBlur } from "@app/utils";

interface CreateVisualizationDialogProps {
    projectId: string;
    open: boolean;
    onClose: () => void;
}

export const CreateVisualizationDialog: React.FC<CreateVisualizationDialogProps> = ({ projectId, open, onClose }) => {
    const [visualizationName, setVisualizationName] = useState("");
    const [visualizationType, setVisualizationType] = useState("");
    const [boundingBox, setBoundingBox] = useState("");
    const [description, setDescription] = useState("");

    const appDispatch = useAppDispatch();

    const handleCreateNew = () => {
        const visualizations = [
            {
                name: visualizationName,
                type: visualizationType,
                description,
                ...(boundingBox !== "" && { boundingBox: boundingBox.split(",").map(Number) }),
                ...(visualizationType === "MAP" && { layers: [] }) // Add empty layers array if type is "MAP"
            }
        ];
        appDispatch(createProjectVisualization({ projectId, visualizations }));
        onClose(); // Close the dialog after dispatching
    };

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
                    <Typography level="h4" sx={{ mb: 1 }}>
                        Create New Visualization
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl required>
                            <FormLabel>Name your visualization</FormLabel>
                            <Input
                                placeholder="Name"
                                value={visualizationName}
                                onBlur={() => handleBlur(visualizationName, setVisualizationName)}
                                onChange={(e) => {
                                    if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                        setVisualizationName(e.target.value);
                                    }
                                }}
                            />
                        </FormControl>
                        <FormControl required>
                            <FormLabel>Select Visualization Type</FormLabel>
                            <Select
                                placeholder="Type"
                                value={visualizationType}
                                onChange={(_, newValue) => setVisualizationType(newValue || "")}
                            >
                                <Option value="MAP">Map</Option>
                                <Option value="TABLE" disabled>
                                    Table
                                </Option>
                                <Option value="CHART" disabled>
                                    Chart
                                </Option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Add description</FormLabel>
                            <Textarea
                                placeholder="Add description"
                                minRows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Set Bounding Box</FormLabel>
                            <Input
                                placeholder="minLon, minLat, maxLon, maxLat"
                                value={boundingBox}
                                onChange={(e) => setBoundingBox(e.target.value)}
                            />
                        </FormControl>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleCreateNew}
                            disabled={!visualizationName || !visualizationType} // Ensure required fields are filled
                        >
                            Create Visualization
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
