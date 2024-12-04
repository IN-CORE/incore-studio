import React, { useState } from "react";
import { useAuth } from "react-oidc-context";

import {
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
import { createNewWorkflow, getDatawolfUser } from "@app/reducer/workflowSlice";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { useNavigate } from "react-router-dom";

interface CreateWorkflowDialogProps {
    open: boolean;
    onClose: () => void;
}

export const CreateProjectDialog = (props: CreateWorkflowDialogProps) => {
    const { open, onClose } = props;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const datawolfUser = useAppSelector((state) => state.workflow.datawolfUser);
    const project = useAppSelector((state) => state.project.project);
    const auth = useAuth();

    const appDispatch = useAppDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (datawolfUser === null) {
            appDispatch(getDatawolfUser({ email: auth?.user?.profile?.email }));
        }
    }, [datawolfUser]);

    const handleCreateNew = async () => {
        try {
            const result = await appDispatch(
                createNewWorkflow({
                    title: name,
                    description: description,
                    creator:
                        datawolfUser === null
                            ? {
                                  email: auth?.user?.profile?.email,
                                  firstName: auth?.user?.profile?.given_name,
                                  lastName: auth?.user?.profile?.family_name
                              }
                            : datawolfUser
                })
            );
            const newWorkflowId = result?.payload?.id;

            if (newWorkflowId && project !== null) {
                // Navigate to the workflow editor page
                navigate(`/project/${project.id}/workflows/${newWorkflowId}/workflow-editor`);
            } else {
                console.error("Error creating Workflow");
            }
            onClose();
        } catch (error) {
            console.error("Error creating workflow:", error);
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
                        Create New Workflow
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl required>
                            <FormLabel>Name your workflow</FormLabel>
                            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
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
                            disabled={!name || !description} // Ensure required fields are filled
                            onClick={handleCreateNew}
                        >
                            Create Workflow
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
