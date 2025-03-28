import React from "react";
import { Box } from "@mui/joy";
import { MapDrawPrompt } from "./MapDrawPrompt";

// Define props type
interface TornadoMapDrawPromptProps {
    mapDialogOpen: boolean;
    handleMapDialogClose: () => void;
}

export const TornadoMapDrawPrompt: React.FC<TornadoMapDrawPromptProps> = ({ mapDialogOpen, handleMapDialogClose }) => {
    const promptElem = (
        <Box display="flex">
            <Box display="flex" flexDirection="column">
                <span
                    style={{
                        height: "1.5em",
                        width: "1.5em",
                        backgroundColor: "#96B712",
                        borderRadius: "50%",
                        display: "block",
                        margin: "auto"
                    }}
                />
                <span>Start</span>
            </Box>
            <span
                style={{
                    height: "20px",
                    width: "100%",
                    borderTop: "0.2em dashed #979797",
                    display: "block",
                    margin: "auto"
                }}
            />
            <Box display="flex" flexDirection="column">
                <span
                    style={{
                        height: "2em",
                        width: "2em",
                        backgroundColor: "#D63649",
                        borderRadius: "50%",
                        display: "block",
                        margin: "auto"
                    }}
                />
                <span>End</span>
            </Box>
        </Box>
    );

    return (
        <MapDrawPrompt
            mapDialogOpen={mapDialogOpen}
            handleMapDialogClose={handleMapDialogClose}
            promptTitle="Define Start and End"
            promptText="Click to draw circles below to define the start and stop positions of the tornado path that
                       you are defining. The locations will automatically be entered into the form.
                       Alternatively, you can directly edit the coordinates."
            promptElem={promptElem}
        />
    );
};
