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
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { getDatawolfUser } from "@app/reducer/workflowSlice";
import { createNewExecution, clearSidePanelData } from "@app/reducer/executionSlice";
import { useNavigate } from "react-router-dom";
import { handleBlur } from "@app/utils";

interface CreateExecutionDialogProps {
    open: boolean;
    wfId: string | null | undefined;
    id: string | null | undefined;
    reRun: boolean;
    resetReRun: () => void;
    onClose: () => void;
}

const CreateExecutionDialog = (props: CreateExecutionDialogProps) => {
    const { open, onClose, id, wfId, reRun, resetReRun } = props;
    const auth = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const appDispatch = useAppDispatch();
    const navigate = useNavigate();

    const datawolfUser = useAppSelector((state) => state.workflow.datawolfUser);
    const createExecution = useAppSelector((state) => state.execution.createExecution);
    const currentExecution = useAppSelector((state) => state.execution.currentExecution);

    React.useEffect(() => {
        if (datawolfUser === null) {
            appDispatch(
                getDatawolfUser({
                    email:
                        auth?.user?.profile?.preferred_username === "" ||
                        auth?.user?.profile?.preferred_username === null ||
                        auth?.user?.profile?.preferred_username === undefined
                            ? auth?.user?.profile?.email
                            : auth?.user?.profile?.preferred_username
                })
            );
        }
    }, []);

    const handleCreateNew = async () => {
        try {
            let newExecutionId: string | undefined = undefined;
            if (reRun && currentExecution && wfId) {
                // If reRun is true, we need to create a new execution based on the current one
                const newExecution = {
                    title: name,
                    creatorId: datawolfUser?.id ?? "",
                    description,
                    workflowId: wfId,
                    deleted: false,
                    parameters: currentExecution.parameters,
                    datasets: currentExecution.datasets
                };
                const result = await appDispatch(createNewExecution(newExecution));
                resetReRun();
                newExecutionId = result?.payload;
            } else {
                const result = await appDispatch(
                    createNewExecution({
                        ...createExecution,
                        title: name,
                        creatorId: datawolfUser?.id ?? "",
                        description
                    })
                );
                newExecutionId = result?.payload;
            }

            if (newExecutionId) {
                appDispatch(clearSidePanelData());
                navigate(`/project/${id}/workflows/${wfId}`);
            } else {
                console.error("Error creating Execution");
            }
            onClose();
        } catch (error) {
            console.error("Error creating Execution:", error);
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
                        Create New Execution
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl required>
                            <FormLabel>Name your execution</FormLabel>
                            <Input
                                placeholder="Name"
                                value={name}
                                onBlur={() => handleBlur(name, setName)}
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
                            onClick={handleCreateNew}
                        >
                            Submit Execution
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default CreateExecutionDialog;
