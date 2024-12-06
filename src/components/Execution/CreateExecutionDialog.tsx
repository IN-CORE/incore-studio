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
import { createNewExecution } from "@app/reducer/executionSlice";
import { useNavigate } from "react-router-dom";

interface CreateExecutionDialogProps {
    open: boolean;
    wfId: string | null | undefined;
    id: string | null | undefined;
    onClose: () => void;
}

const CreateExecutionDialog = (props: CreateExecutionDialogProps) => {
    const { open, onClose, id, wfId } = props;
    const auth = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const appDispatch = useAppDispatch();
    const navigate = useNavigate();

    const datawolfUser = useAppSelector((state) => state.workflow.datawolfUser);
    const createExecution = useAppSelector((state) => state.execution.createExecution);

    React.useEffect(() => {
        if (datawolfUser === null) {
            appDispatch(getDatawolfUser({ email: auth?.user?.profile?.email }));
        }
    }, []);

    const handleCreateNew = async () => {
        try {
            const result = await appDispatch(
                createNewExecution({
                    ...createExecution,
                    title: name,
                    creatorId: datawolfUser?.id ?? "",
                    description
                })
            );
            const newExecutionId = result?.payload;

            if (newExecutionId) {
                // Navigate to the new project page
                navigate(`/project/${id}/workflows/${wfId}/execution/${newExecutionId}`);
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
                            Submit Execution
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default CreateExecutionDialog;
