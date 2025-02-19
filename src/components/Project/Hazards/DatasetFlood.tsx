import React from "react";
import { TabPanel } from "@mui/joy";

interface DatasetFloodProps {
    index: number;
    // handleLayerUpdate: (data: any) => void;
    // handleListUpdate: (config: any, hazardType: string) => void;
}

export const DatasetFlood: React.FC<DatasetFloodProps> = ({ index }) => {
    return (
        <TabPanel value={index}>
            <div />
        </TabPanel>
    );
};
