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
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { useAppDispatch } from "@app/store/hooks";
import { createProjectVisualization } from "@app/reducer/projectSlice";
import config from "@app/app.config";

interface VisualizationDialogProps {
    projectId: string;
    open: boolean;
    onClose: () => void;
    onAddVisualization: (visualizationId: string, styleName?: string) => void;
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
    const [boundingBox, setBoundingBox] = useState("");
    const [styleName, setStyleName] = useState("");

    const appDispatch = useAppDispatch();
    const projectVisualizations = useSelector((state: RootState) => state.project.projectVisualizations);

    const resetCreation = () => {
        setIsCreatingNew(false);
        setVisualizationName("");
        setVisualizationId("");
        setVisualizationType("");
        setDescription("");
    };
    const openCreateNew = () => {
        setIsCreatingNew(true);
    };
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
        resetCreation();
    };

    // TODO think of better way to get all visualizations
    // useEffect(() => {
    //     // temporary fix to get all visualizations
    //     appDispatch(getProjectVisualizations({ projectId, skip: 0, limit: 100000 }));
    // }, [projectId]);

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
                        Add to Visualization
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
                                <FormControl>
                                    <FormLabel>Select a style</FormLabel>
                                    <Select
                                        placeholder="Select a style"
                                        onChange={(_: React.SyntheticEvent | null, newValue: string | null) => {
                                            setStyleName(newValue || "");
                                        }}
                                    >
                                        {config.sytles.map((style: string) => (
                                            <Option key={style} value={style}>
                                                {style}
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
                            </>
                        )}
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            onClick={() => onAddVisualization(visualizationId, styleName)}
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
