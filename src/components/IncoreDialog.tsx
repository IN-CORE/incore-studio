import React from "react";
import {
    Modal,
    ModalDialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    ModalClose
} from "@mui/joy";

interface IncoreDialogProps {
    open: boolean;
    onClose: () => void;
    actionButtonName?: string;
    onAction: () => void;
    message?: string;
    dialogTitle?: string;
}

export const IncoreDialog: React.FC<IncoreDialogProps> = ({
    open,
    onClose,
    onAction,
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    dialogTitle = "Confirm Deletion",
    actionButtonName = "Delete"
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <Typography>{message}</Typography>
                </DialogContent>
                <DialogActions>
                    <ModalClose onClick={onClose} color="neutral" variant="plain" />
                    <Button onClick={onAction} color="danger">
                        {actionButtonName}
                    </Button>
                </DialogActions>
            </ModalDialog>
        </Modal>
    );
};
