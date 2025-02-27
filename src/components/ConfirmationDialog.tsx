import React from "react";

import { Button, DialogTitle, DialogContent, DialogActions, Divider, Modal, ModalDialog } from "@mui/joy";

import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    confirmationDialogTitle: string;
    confirmationDialogText: string;
    confirmationDialogAction: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    confirmationDialogAction,
    confirmationDialogText,
    confirmationDialogTitle
}) => {
    return (
        <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ModalDialog variant="outlined" role="alertdialog">
                <DialogTitle sx={{ fontWeight: "lg" }}>
                    <WarningRoundedIcon />
                    {confirmationDialogTitle}
                </DialogTitle>
                <Divider />
                <DialogContent>{confirmationDialogText}</DialogContent>
                <DialogActions>
                    <Button variant="solid" color="danger" onClick={onConfirm}>
                        {confirmationDialogAction}
                    </Button>
                    <Button variant="plain" color="neutral" onClick={onClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </ModalDialog>
        </Modal>
    );
};

export default ConfirmationDialog;
