import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    ModalDialog,
    ModalClose,
    Box,
    Typography,
    FormLabel,
    Button,
    Input,
    List,
    ListItem,
    IconButton,
    Option,
    Select
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import { addDatasetToProject } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import { createDataset, handleBlur } from "@app/utils";
import config from "@app/app.config";

interface CreateDatasetDialogProps {
    projectId: string;
    open: boolean;
    onClose: () => void;
}

export const CreateDatasetDialog: React.FC<CreateDatasetDialogProps> = ({ open, onClose, projectId }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [datasetType, setDatasetType] = useState("");
    const [format, setFormat] = useState("Table");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [disabled, setDisabled] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    const appDispatch = useAppDispatch();

    // Form validation: Enable save button only if all fields are filled
    useEffect(() => {
        setDisabled(!(title && description && datasetType && files.length > 0));
    }, [title, description, datasetType, files]);

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
            const datasetJson = await createDataset(title, description, datasetType, format, files);
            if (datasetJson && datasetJson.id) {
                appDispatch(addDatasetToProject({ projectId, datasets: [datasetJson] }));
                setFiles([]);
                setTitle("");
                setDescription("");
                setDatasetType("");
            }
            setLoading(false);
            onClose();
        } catch (error) {
            console.error("Error saving tornado dataset:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog size="lg" sx={{ backgroundColor: "#fff" }}>
                <ModalClose sx={{ zIndex: 20 }} />
                <Box
                    sx={{
                        width: 600,
                        maxWidth: "100%",
                        padding: 2,
                        borderRadius: "md",
                        opacity: loading ? 0.5 : 1
                    }}
                >
                    <Typography level="h4" sx={{ mb: 1 }}>
                        Upload Dataset
                    </Typography>

                    {/* Name Input */}
                    <Box sx={{ mb: 2 }}>
                        <FormLabel required sx={{ fontSize: "1rem" }}>
                            Title
                        </FormLabel>
                        <Input
                            value={title}
                            variant="outlined"
                            placeholder="Dataset Title"
                            onBlur={() => handleBlur(title, setTitle)}
                            onChange={(e) => {
                                if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                    setTitle(e.target.value);
                                }
                            }}
                        />
                    </Box>

                    {/* Description Input */}
                    <Box sx={{ mb: 2 }}>
                        <FormLabel required sx={{ fontSize: "1rem" }}>
                            Description
                        </FormLabel>
                        <Input
                            value={description}
                            variant="outlined"
                            placeholder="Dataset Description"
                            onChange={(e) => {
                                if (/^(?!\\s+$)[A-Za-z0-9 _\\-\\(\\)\\$\\.,!\\?:;\'"]*$/.test(e.target.value)) {
                                    setDescription(e.target.value);
                                }
                            }}
                        />
                    </Box>

                    {/* DataType Input */}
                    <Box sx={{ mb: 2 }}>
                        <FormLabel required sx={{ fontSize: "1rem" }}>
                            Dataset Type
                        </FormLabel>
                        <Typography
                            component="a"
                            href={`${config.hostname}/SemanticViewer`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                fontSize: "0.875rem",
                                fontWeight: "lighter",
                                color: "primary.main",
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontStyle: "italic"
                            }}
                            mt={1}
                            mb={1}
                        >
                            Explore Dataset Types
                        </Typography>
                        <Input
                            value={datasetType}
                            variant="outlined"
                            placeholder="Dataset Type"
                            onBlur={() => handleBlur(datasetType, setDatasetType)}
                            onChange={(e) => {
                                if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                    setDatasetType(e.target.value);
                                }
                            }}
                        />
                    </Box>

                    {/* Format Input */}
                    <Box sx={{ mb: 2 }}>
                        <FormLabel required sx={{ fontSize: "1rem" }}>
                            Format
                        </FormLabel>
                        <Select
                            value={format}
                            onChange={(_, newValue) => setFormat(newValue as string)}
                            placeholder="Select Demand Type"
                        >
                            <Option value="table">Table</Option>
                            <Option value="text">Text</Option>
                            <Option value="mapping">Mapping</Option>
                            <Option value="shapefile">Shapefile</Option>
                        </Select>
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
            </ModalDialog>
        </Modal>
    );
};
