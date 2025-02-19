import React from "react";
import { TabPanel } from "@mui/joy";

interface ModelEarthquakeProps {
    index: number;
    // handleLayerUpdate: (data: any) => void;
    // handleListUpdate: (config: any, hazardType: string) => void;
}

export const ModelEarthquake: React.FC<ModelEarthquakeProps> = ({ index }) => {
    return (
        <TabPanel value={index}>
            <div />
        </TabPanel>
    );
};
