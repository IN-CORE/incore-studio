import React from "react";
import { MapDrawPrompt } from "@app/components/Map/MapDrawPrompt";

interface EqMapDrawPromptProps {
    mapDialogOpen: boolean;
    handleMapDialogClose: () => void;
}

export const EqMapDrawPrompt: React.FC<EqMapDrawPromptProps> = ({ mapDialogOpen, handleMapDialogClose }) => {
    const promptElem = (
        <>
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
            <span>Epicenter</span>
        </>
    );

    return (
        <MapDrawPrompt
            mapDialogOpen={mapDialogOpen}
            handleMapDialogClose={handleMapDialogClose}
            promptTitle="Define Epicenter"
            promptText="Click on the map to draw the dot below to define the epicenter of an earthquake.
                        The locations will automatically be entered into the form.
                        Alternatively, you can directly edit the coordinates."
            promptElem={promptElem}
        />
    );
};
