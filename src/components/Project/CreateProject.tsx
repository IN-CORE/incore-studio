import React, { useState } from "react";

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    Modal,
    ModalClose,
    ModalDialog,
    Stack,
    Textarea,
    Typography
} from "@mui/joy";
import { createProject } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import { useNavigate } from "react-router-dom";
import { handleBlur } from "@app/utils";

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
}

export const CreateProjectDialog = (props: CreateProjectDialogProps) => {
    const { open, onClose } = props;
    const [name, setName] = useState("");
    const [region, setRegion] = useState("");
    const [description, setDescription] = useState("");

    const appDispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleCreateNew = async () => {
        try {
            const result = await appDispatch(createProject({ project: { name, region, description } }));
            const newProjectId = result?.payload?.id;

            if (newProjectId) {
                // Navigate to the new project page
                navigate(`/project/${newProjectId}`);
            } else {
                console.error("Error creating project");
            }
            onClose();
        } catch (error) {
            console.error("Error creating project:", error);
        }
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
                        Create New Project
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl required>
                            <FormLabel>Name your project</FormLabel>
                            <Input
                                placeholder="Name"
                                value={name}
                                onBlur={() => handleBlur(name, setName)}
                                onChange={(e) => {
                                    // Only update the state if the new value is valid.
                                    if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                        setName(e.target.value);
                                    }
                                }}
                            />
                            <FormHelperText>
                                Project name should only contain letters, numbers, spaces, underscores, and hyphens.
                            </FormHelperText>
                            <FormHelperText>e.g. Hurricane Harvey, Flood 2023, etc.</FormHelperText>
                        </FormControl>
                        <FormControl required>
                            <FormLabel>Set region</FormLabel>
                            <Input
                                placeholder="Region e.g. MMSA, Seaside, Joplin, Galveston, etc"
                                value={region}
                                onBlur={() => handleBlur(region, setRegion)}
                                onChange={(e) => {
                                    // Only update the state if the new value is valid.
                                    if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                        setRegion(e.target.value);
                                    }
                                }}
                            />
                        </FormControl>
                        <FormControl required>
                            <FormLabel>Add description</FormLabel>
                            <Textarea
                                placeholder="Add description"
                                minRows={5}
                                value={description}
                                onChange={(e) => {
                                    // Only update the state if the new value is valid.
                                    if (/^(?!\\s+$)[A-Za-z0-9 _\\-\\(\\)\\$\\.,!\\?:;\'"]*$/.test(e.target.value)) {
                                        setDescription(e.target.value);
                                    }
                                }}
                            />
                        </FormControl>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            disabled={!name || !description || !region} // Ensure required fields are filled
                            onClick={handleCreateNew}
                        >
                            Create Project
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
