import React from "react";
import {
    Alert,
    Modal,
    ModalDialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Typography,
    Button
} from "@mui/joy";

const FinalizeWorkflowDialog: React.FC<{ open: boolean; onClose: () => void; confirmFinalize: () => void }> = ({
    open,
    onClose,
    confirmFinalize
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog>
                <DialogTitle>Finalize this Workflow?</DialogTitle>
                <DialogContent>
                    <Typography level="body-md" mt={2}>
                        To create an execution you need to finalize the workflow. Once finalized, you won't be able to
                        make changes to the workflow. Do you wish to proceed?
                    </Typography>
                    <Alert color="warning" sx={{ marginTop: 2 }}>
                        Note: This action is irrerversible.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Stack direction="row" spacing={2}>
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
                        <Button variant="solid" sx={{ backgroundColor: "primary.main" }} onClick={confirmFinalize}>
                            Finalize
                        </Button>
                    </Stack>
                </DialogActions>
            </ModalDialog>
        </Modal>
    );
};

export default FinalizeWorkflowDialog;
