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
import { editProject } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import { handleBlur } from "@app/utils";

interface EditProjectDialogProps {
    open: boolean;
    onClose: () => void;
    project: Project;
}

export const EditProjectDialog = (props: EditProjectDialogProps) => {
    const { open, onClose, project } = props;
    const [name, setName] = useState(project.name);
    const [region, setRegion] = useState(project.region);
    const [description, setDescription] = useState(project.description);

    const appDispatch = useAppDispatch();

    const handleEdit = async () => {
        try {
            appDispatch(editProject({ projectId: project.id, name, region, description }));
            onClose();
        } catch (error) {
            console.error("Error editing project:", error);
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
                        Edit Project
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl>
                            <FormLabel>Name</FormLabel>
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
                        <FormControl>
                            <FormLabel>Region</FormLabel>
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
                        <FormControl>
                            <FormLabel>Description</FormLabel>
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
                            onClick={handleEdit}
                        >
                            Save
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
