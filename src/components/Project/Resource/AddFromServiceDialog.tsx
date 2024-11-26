import React, { useState } from "react";

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
    Typography
} from "@mui/material";

interface AddFromServiceDialogProps {
    projectId: string;
    resourceType: string;
    open: boolean;
    onClose: () => void;
    onAddClick: (projectId: string, resourceId: string) => void;
}

export const AddFromServiceDialog: React.FC<AddFromServiceDialogProps> = ({
    projectId,
    resourceType,
    open,
    onClose,
    onAddClick
}) => {
    const [resourceId, setResourceId] = useState("");

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
                    <Typography level="h4" sx={{ mb: 1, textTransform: "capitalize" }}>
                        Add {resourceType} to Project
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl required>
                            <FormLabel sx={{ textTransform: "capitalize" }}>{resourceType} ID</FormLabel>
                            <Input
                                placeholder="ID"
                                value={resourceId}
                                onChange={(e) => setResourceId(e.target.value)}
                            />
                        </FormControl>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            disabled={!resourceId}
                            onClick={() => onAddClick(projectId, resourceId)}
                        >
                            Add to Project
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
