import React from "react";
import {
    Modal,
    Typography,
    Button,
    CircularProgress,
    Stack,
    ModalDialog,
    ModalClose,
    FormControl,
    FormLabel,
    FormHelperText,
    Select,
    Option
} from "@mui/joy";
import axios from "axios";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";

import { getProject, updateProjectDatasetsParent } from "@app/reducer/projectSlice";
import { getHeaders } from "@app/utils";
import config from "@app/app.config";

const DATA_API_URL = config.dataApi;

interface AddParentDatasetDialogProps {
    projectId: string;
    open: boolean;
    onClose: () => void;
    resource: Dataset | Hazard | Visualization | Workflow | null;
}

const AddParentDatasetDialog: React.FC<AddParentDatasetDialogProps> = ({ projectId, open, onClose, resource }) => {
    const appDispatch = useAppDispatch();
    const project = useAppSelector((state) => state.project.project);
    const [selectedDataset, setSelectedDataset] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [serviceError, setServiceError] = React.useState<string | null>(null);
    const error = useAppSelector((state) => state.project.error);
    const [addSuccess, setAddSuccess] = React.useState(false);

    React.useEffect(() => {
        if (!project) {
            appDispatch(getProject(projectId));
        }
    }, [project]);

    const handleAddParentDataset = async () => {
        if (selectedDataset && resource && project) {
            try {
                setLoading(true);
                const formData = new FormData();

                // Construct the JSON string manually
                const updatePayload = JSON.stringify({
                    "property name": "sourceDataset",
                    "property value": selectedDataset
                });

                // Append it as a key-value pair under "update"
                formData.append("update", updatePayload);
                const response = await axios.put(`${DATA_API_URL}/datasets/${resource.id}`, formData, {
                    headers: {
                        ...getHeaders(),
                        "Content-Type": "multipart/form-data"
                    }
                });
                if (response.status === 200) {
                    appDispatch(
                        updateProjectDatasetsParent({
                            projectId,
                            datasets: project.datasets.map((ds) => (ds.id === response.data.id ? response.data : ds))
                        })
                    );
                    setAddSuccess(true);
                } else {
                    setServiceError(`Failed to add parent dataset. Please try again.\nReason: ${response.statusText}`);
                }
            } catch (err) {
                console.error("Error adding parent dataset:", err);
                setServiceError(`Failed to add parent dataset. Please try again.\nReason: ${(err as Error).message}`);
                setLoading(false);
            }
        }
    };

    React.useEffect(() => {
        if (addSuccess) {
            setLoading(false);
            setServiceError(null);
            setSelectedDataset(null);
            setAddSuccess(false);
            onClose();
        }
    }, [addSuccess]);

    return (
        <Modal
            open={open}
            onClose={(_event: React.MouseEvent<HTMLButtonElement>, reason: string) => {
                if (reason !== "backdropClick") {
                    setLoading(false);
                    setServiceError(null);
                    setSelectedDataset(null);
                    setAddSuccess(false);
                    onClose();
                }
            }}
        >
            <ModalDialog
                aria-labelledby="add-parent-dataset-dialog-title"
                aria-describedby="add-parent-dataset-dialog-description"
                size="lg"
                sx={{ mx: "auto", backgroundColor: "#fff" }}
            >
                <ModalClose disabled={loading} />
                <Typography id="add-parent-dataset-dialog-title" component="h2" fontSize="lg" fontWeight="bold">
                    Add Parent Dataset
                </Typography>
                <Typography id="add-parent-dataset-dialog-description" textColor="text.tertiary">
                    This Dataset is missing a parent Dataset. You need to choose the correct parent Dataset before you
                    can add it to a Visualization. Select a dataset to add as a parent to this {resource?.type}
                </Typography>
                <Stack spacing={2} mt={2}>
                    <FormControl required>
                        <FormLabel>Choose Parent Shapefile</FormLabel>
                        <Select
                            placeholder="Select a dataset"
                            value={selectedDataset}
                            onChange={(_, newValue: string | null) => {
                                setSelectedDataset(newValue);
                            }}
                        >
                            {project?.datasets
                                .filter((ds) => ds.format === "shapefile")
                                .map((dataset) => (
                                    <Option key={dataset.id} value={dataset.id}>
                                        {dataset.title}
                                    </Option>
                                ))}
                        </Select>
                        <FormHelperText>
                            <InfoOutlined fontSize="small" color="error" sx={{ mr: 0.5 }} />
                            <Typography fontSize="sm" color="danger">
                                This step is irreversible. You will not be able to change the parent Dataset after this
                                step.
                            </Typography>
                        </FormHelperText>
                    </FormControl>
                    {(error || serviceError) && (
                        <Typography fontSize="sm" color="danger">
                            {error || serviceError}
                        </Typography>
                    )}
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: "primary.subtle",
                            color: "primary.subtle",
                            backgroundColor: "white"
                        }}
                        onClick={async () => {
                            await handleAddParentDataset();
                        }}
                        disabled={!selectedDataset || loading}
                    >
                        {loading ? <CircularProgress /> : "Add Dataset"}
                    </Button>
                </Stack>
            </ModalDialog>
        </Modal>
    );
};

export default AddParentDatasetDialog;
