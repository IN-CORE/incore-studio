import React, { useEffect, useRef, useState } from "react";
import { Box, TabPanel, FormLabel, Input, List, ListItem, IconButton, Button } from "@mui/joy";
import { createDatasetTornado } from "@app/utils";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import config from "@app/app.config";
import DeleteIcon from "@mui/icons-material/Delete";

interface DatasetTornadoProps {
    value: string;
    projectId: string;
    handleLayerUpdate: (layers: IncoreLayer[]) => void;
}

export const DatasetTornado: React.FC<DatasetTornadoProps> = ({ value, projectId, handleLayerUpdate }) => {
    const appDispatch = useAppDispatch();

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [disabled, setDisabled] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    // Form validation: Enable save button only if all fields are filled
    useEffect(() => {
        setDisabled(!(name && description && files.length > 0));
    }, [name, description, files]);

    // Handle file input change (manual file selection)
    const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
            event.target.value = ""; // Reset input so the same file can be added again
        }
    };

    // Handle file deletion
    const onDeleteClick = (filename: string) => {
        setFiles((prevFiles) => {
            const updatedFiles = prevFiles.filter((file) => file.name !== filename);

            if (updatedFiles.length === 0 && fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset input if all files are deleted
            }

            return updatedFiles;
        });
    };

    // Handle form submission
    const onSave = async () => {
        setLoading(true);
        try {
            const tornadoJson = await createDatasetTornado(name, description, files);
            if (tornadoJson && tornadoJson.id) {
                appDispatch(addHazardToProject({ projectId, hazards: [{ ...tornadoJson, type: "tornado" }] }));
                handleLayerUpdate(
                    tornadoJson.hazardDatasets.map((dataset: HazardDataset) => ({
                        workspace: "incore",
                        layerId: dataset.datasetId,
                        styleName: config.defaultLayerStyles.MapUtil.tornado
                    }))
                );
                setFiles([]);
                setName("");
                setDescription("");
            }
        } catch (error) {
            console.error("Error saving tornado dataset:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TabPanel value={value}>
            <Box sx={{ opacity: loading ? 0.5 : 1 }}>
                {/* Name Input */}
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Name
                    </FormLabel>
                    <Input value={name} variant="outlined" onChange={(e) => setName(e.target.value)} />
                </Box>

                {/* Description Input */}
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Description
                    </FormLabel>
                    <Input value={description} variant="outlined" onChange={(e) => setDescription(e.target.value)} />
                </Box>

                {/* File Upload */}
                <Box sx={{ mb: 2 }}>
                    {/* File Upload Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileInputChange}
                        multiple
                        style={{ display: "none" }} // Hide default input UI
                    />

                    {/* Display Selected Files */}
                    {files.length > 0 && (
                        <List sx={{ mt: 2 }}>
                            {files.map((file) => (
                                <ListItem
                                    endAction={
                                        <IconButton
                                            variant="plain"
                                            color="danger"
                                            onClick={() => onDeleteClick(file.name)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    {file.name}
                                </ListItem>
                            ))}
                        </List>
                    )}

                    {/* Button to trigger file input */}
                    <Button
                        variant="plain"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ marginLeft: "auto", marginRight: 0, display: "block" }}
                    >
                        Select Files
                    </Button>
                </Box>

                {/* Save Button */}
                <Box sx={{ mb: 2 }}>
                    <Button variant="solid" onClick={onSave} disabled={disabled}>
                        Save
                    </Button>
                </Box>
            </Box>
        </TabPanel>
    );
};
