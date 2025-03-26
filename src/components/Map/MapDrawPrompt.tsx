import React from "react";

import { Card, Box, Typography, Button } from "@mui/joy";

interface MapDrawPromptProps {
    mapDialogOpen: boolean;
    handleMapDialogClose: () => void;
    promptTitle: string;
    promptText: string;
    promptElem: React.ReactNode;
}

export const MapDrawPrompt: React.FC<MapDrawPromptProps> = ({
    mapDialogOpen,
    handleMapDialogClose,
    promptTitle,
    promptText,
    promptElem
}) => {
    return (
        <Card
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "40%",
                padding: "2em",
                zIndex: 3000,
                backgroundColor: "#fff",
                display: mapDialogOpen ? "inherit" : "none"
            }}
        >
            <Typography sx={{ color: "#00619D", fontSize: "12px" }}>{promptTitle}</Typography>
            <Typography sx={{ padding: "1em 0", fontSize: "12px" }}>{promptText}</Typography>
            <Box sx={{ margin: "auto", textAlign: "center", padding: "1em", fontSize: "12px" }}>{promptElem}</Box>
            <Button onClick={handleMapDialogClose} size="sm" sx={{ display: "block", margin: "auto" }}>
                Got It
            </Button>
        </Card>
    );
};
