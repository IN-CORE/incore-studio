import React from "react";
import { TabPanel } from "@mui/joy";

interface ModelTornadoProps {
    index: number;
    // handleLayerUpdate: (data: any) => void;
    // handleListUpdate: (config: any, hazardType: string) => void;
}

export const ModelTornado: React.FC<ModelTornadoProps> = ({ index }) => {
    return (
        <TabPanel value={index}>
            <div />
        </TabPanel>
    );
};
