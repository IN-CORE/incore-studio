import React, { useState } from "react";
// import { useAppDispatch } from "@app/store/hooks";
// import { createProject } from "@app/reducer/projectSlice";

import {
    Autocomplete,
    Box,
    Button,
    FormControl,
    FormLabel,
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
            // Dispatch the create project action and wait for the result
            const result = await appDispatch(createProject({ project: { name, region, description } }));
            const newProjectId = result?.payload?.id; // Assuming the action returns the new project ID in payload

            if (newProjectId) {
                // Navigate to the new project page
                navigate(`/project/${newProjectId}`);
            }

            // Close the modal or form
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
                            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        </FormControl>
                        <FormControl required>
                            <FormLabel>Set region</FormLabel>
                            <Autocomplete
                                freeSolo
                                placeholder="Region"
                                options={["Galveston", "Joplin", "MMSA", "Seaside", "SLC"]}
                                inputValue={region}
                                onInputChange={(_, value) => setRegion(value)}
                            />
                            {/* <Input placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} /> */}
                        </FormControl>
                        <FormControl required>
                            <FormLabel>Add description</FormLabel>
                            <Textarea
                                placeholder="Add description"
                                minRows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
