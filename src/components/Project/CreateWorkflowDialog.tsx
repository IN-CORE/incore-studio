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
import { createNewWorkflow, getDatawolfUser, saveWorkflow } from "@app/reducer/workflowSlice";
import { addWorkflowToProject } from "@app/reducer/projectSlice";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { useNavigate } from "react-router-dom";
import { handleBlur } from "@app/utils";

interface CreateWorkflowDialogProps {
    open: boolean;
    onClose: () => void;
    editMode?: boolean; // Optional prop to indicate if it's in edit mode
}

export const CreateWorkflowDialog = (props: CreateWorkflowDialogProps) => {
    const { open, onClose, editMode } = props;
    const currentWorkflow = useAppSelector((state) => state.workflow.currentWorkflow);
    const [name, setName] = useState(currentWorkflow?.title || "");
    const [description, setDescription] = useState(currentWorkflow?.description || "");
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

    const handleEdit = async () => {
        try {
            if (currentWorkflow !== null) {
                const updatedWorkflow = {
                    ...currentWorkflow,
                    title: name,
                    description: description
                };
                const result = await appDispatch(
                    saveWorkflow({
                        workflowID: currentWorkflow.id ? currentWorkflow.id : "",
                        workflow: updatedWorkflow
                    })
                );

                if (!result) {
                    console.error("Error updating Workflow");
                }
            }
            onClose();
        } catch (error) {
            console.error("Error editing workflow:", error);
        }
    };

    const handleCreateNew = async () => {
        try {
            const result = await appDispatch(
                createNewWorkflow({
                    title: name,
                    description: description,
                    creator:
                        datawolfUser === null
                            ? {
                                  email:
                                      auth?.user?.profile?.preferred_username === "" ||
                                      auth?.user?.profile?.preferred_username === null ||
                                      auth?.user?.profile?.preferred_username === undefined
                                          ? auth?.user?.profile?.email
                                          : auth?.user?.profile?.preferred_username,
                                  firstName: auth?.user?.profile?.given_name,
                                  lastName: auth?.user?.profile?.family_name
                              }
                            : datawolfUser
                })
            );
            const newWorkflowId = result?.payload?.id;

            if (newWorkflowId && project !== null) {
                let created = "";
                let dateString = result.payload.created;
                // Check if milliseconds are missing
                if (!dateString.includes(".")) {
                    // Insert ".000" before the timezone (+0000 or -0000)
                    created = dateString.replace(/([+-]\d{4})$/, ".000$1");
                }
                let workflowObj = [
                    {
                        ...result.payload,
                        created: created,
                        type: "workflow"
                    }
                ];
                // Add the new workflow to the project
                const addWorkflowResult = await appDispatch(
                    addWorkflowToProject({ projectId: project.id, workflows: workflowObj })
                );

                if (addWorkflowResult?.payload?.workflows) {
                    // Navigate to the workflow editor page
                    navigate(`/project/${project.id}/workflows/${newWorkflowId}/workflow-editor`);
                } else {
                    console.error("Error adding Workflow to project");
                }
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
                        {editMode ? "Edit Workflow" : "Create New Workflow"}
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl required>
                            <FormLabel>Name your workflow</FormLabel>
                            <Input
                                placeholder="Name"
                                onBlur={() => handleBlur(name, setName)}
                                value={name}
                                onChange={(e) => {
                                    if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                        setName(e.target.value);
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
                        <Button
                            variant="outlined"
                            sx={{
                                borderColor: "primary.subtle",
                                color: "primary.subtle",
                                backgroundColor: "white"
                            }}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            sx={{ backgroundColor: "primary.main" }}
                            disabled={!name || !description} // Ensure required fields are filled
                            onClick={editMode ? handleEdit : handleCreateNew}
                        >
                            {editMode ? "Save Changes" : "Create Workflow"}
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
