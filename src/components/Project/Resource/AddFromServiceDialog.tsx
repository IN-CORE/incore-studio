import React, { useState } from "react";
import { useAppDispatch } from "@app/store/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { createProjectVisualization } from "@app/reducer/projectSlice";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalClose,
    ModalDialog,
    Option,
    Select,
    Stack,
    Textarea,
    Typography
} from "@mui/material";
import config from "@app/app.config";

interface AddFromServiceDialogProps {
    projectId: string;
    resourceType: string;
    open: boolean;
    onClose: () => void;
    onAddVisualization: (visualizationId: string, styleName?: string) => void;
}

export const AddFromServiceDialog: React.FC<AddFromServiceDialogProps> = ({
    projectId,
    resourceType,
    open,
    onClose,
    onAddVisualization
}) => {
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
                        Add to Project
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl required>
                            <FormLabel>Select {resourceType} from the dropdown</FormLabel>
                            <Select
                                placeholder="Select a Visualization"
                                onChange={(_: React.SyntheticEvent | null, newValue: string | null) => {
                                    setVisualizationId(newValue || "");
                                }}
                            >
                                {projectVisualizations.map((visualization) => (
                                    <Option key={visualization.id} value={visualization.id}>
                                        {visualization.name}
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                        <Button variant="plain" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            // disabled={isCreatingNew || !visualizationId}
                        >
                            Add to Project
                        </Button>
                    </Stack>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
