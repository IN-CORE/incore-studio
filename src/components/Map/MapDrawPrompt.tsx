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
                maxWidth: "400px",
                padding: "3em",
                zIndex: 3000,
                display: mapDialogOpen ? "inherit" : "none"
            }}
        >
            <Typography sx={{ color: "#00619D" }}>{promptTitle}</Typography>
            <Typography sx={{ padding: "1em 0" }}>{promptText}</Typography>
            <Box sx={{ margin: "auto", textAlign: "center", padding: "2em" }}>{promptElem}</Box>
            <Button onClick={handleMapDialogClose}>Got It</Button>
        </Card>
    );
};
