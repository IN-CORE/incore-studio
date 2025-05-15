import React from "react";
import { Modal, ModalDialog, ModalClose, Box, Typography, Sheet } from "@mui/joy";

interface DFR3MappingPropsModal {
    open: boolean;
    onClose: () => void;
    dfr3mapping?: DFR3Mapping | null;
}

export const DFR3MappingModal: React.FC<DFR3MappingPropsModal> = ({ open, onClose, dfr3mapping }) => {
    if (!dfr3mapping) {
        return null;
    }

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog layout="fullscreen" size="lg" sx={{ backgroundColor: "#fff", padding: 10, height: "100%" }}>
                <Box sx={{ padding: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography level="h4" fontWeight="bold">
                            {dfr3mapping?.name}
                        </Typography>
                        <ModalClose />
                    </Box>
                    <Typography level="body-sm">{dfr3mapping?.type}</Typography>
                </Box>
                {/* eslint-disable-next-line no-nested-ternary */}
                <Sheet sx={{ padding: 2, overflow: "auto" }}>
                    <pre>{JSON.stringify(dfr3mapping, null, 2)}</pre>
                </Sheet>
            </ModalDialog>
        </Modal>
    );
};
