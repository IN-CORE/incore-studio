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

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
}

export const CreateProjectDialog = (props: CreateProjectDialogProps) => {
    const { open, onClose } = props;
    const [name, setName] = useState("");
    const [region, setRegion] = useState("");
    const [description, setDescription] = useState("");

    // const appDispatch = useAppDispatch();

    // const handleCreateNew = () => {
    //     appDispatch(createProject({ projectId, visualizations }));
    //     onClose(); // Close the dialog after dispatching
    // };

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
                        >
                            Create Project
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
