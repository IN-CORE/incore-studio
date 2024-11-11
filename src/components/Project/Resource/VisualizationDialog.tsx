import React, { useState, useEffect } from "react";
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
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { useAppDispatch } from "@app/store/hooks";
import { createProjectVisualization, getProjectVisualizations } from "@app/reducer/projectSlice";

interface VisualizationDialogProps {
    projectId: string;
    open: boolean;
    onClose: () => void;
    onAddVisualization: (data: { name: string; type: string; description: string }) => void;
}

export const VisualizationDialog: React.FC<VisualizationDialogProps> = ({
    projectId,
    open,
    onClose,
    onAddVisualization
}) => {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [visualizationName, setVisualizationName] = useState("");
    const [visualizationId, setVisualizationId] = useState("");
    const [visualizationType, setVisualizationType] = useState("");
    const [description, setDescription] = useState("");

    const appDispatch = useAppDispatch();
    const projectVisualizations = useSelector((state: RootState) => state.project.projectVisualizations);

    const openCreateNew = () => {
        setIsCreatingNew(true);
    };
    const handleCreateNew = () => {
        const visualizations = [
            {
                name: visualizationName,
                type: visualizationType,
                description
            }
        ];
        appDispatch(createProjectVisualization({ projectId, visualizations }));
    };

    const handleAddToVisualization = () => {
        onAddVisualization({
            name: visualizationName,
            type: visualizationType,
            description
        });
        console.log(visualizationId);
        onClose();
    };

    useEffect(() => {
        // temporary fix to get all visualizations
        appDispatch(getProjectVisualizations({ projectId, skip: 0, limit: 100000 }));
    }, [projectId]);

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog size="lg">
                <ModalClose />
                <Box
                    sx={{
                        width: 600,
                        maxWidth: "100%",
                        padding: 2,
                        borderRadius: "md",
                        backgroundColor: "background.surface"
                    }}
                >
                    <Typography level="h4" sx={{ mb: 1 }}>
                        Add Data to Visualization
                    </Typography>
                    <Typography level="body-md" color="neutral">
                        Dataset:
                    </Typography>

                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {!isCreatingNew ? (
                            <>
                                <FormControl required>
                                    <FormLabel>
                                        Select a visualization from the dropdown, or add to a new visualization file.
                                    </FormLabel>
                                    <Select
                                        placeholder="Select a Visualization"
                                        onChange={(_: React.SyntheticEvent | null, newValue: string | null) => {
                                            setVisualizationId(newValue || "");
                                        }}
                                    >
                                        {projectVisualizations.map((visualization) => (
                                            <Option key={visualization.id} value={visualization.id}>
                                                {visualization.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="soft"
                                    onClick={openCreateNew}
                                    color="neutral"
                                    sx={{ width: "auto", alignSelf: "flex-start" }}
                                >
                                    Create New Visualization
                                </Button>
                            </>
                        ) : (
                            <>
                                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                                    <Button
                                        variant="solid"
                                        onClick={handleCreateNew}
                                        sx={{ width: "auto" }}
                                        disabled={!visualizationType && !visualizationName}
                                    >
                                        Create New Visualization
                                    </Button>
                                    <Button
                                        variant="soft"
                                        onClick={() => setIsCreatingNew(false)}
                                        color="neutral"
                                        sx={{ width: "auto" }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                                <FormControl required>
                                    <FormLabel>Name your visualization</FormLabel>
                                    <Input
                                        placeholder="Name"
                                        value={visualizationName}
                                        onChange={(e) => setVisualizationName(e.target.value)}
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
                                        <Option value="TABLE">Table</Option>
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
                            </>
                        )}
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleAddToVisualization}
                            disabled={isCreatingNew || !visualizationId}
                        >
                            Add to Visualization
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
