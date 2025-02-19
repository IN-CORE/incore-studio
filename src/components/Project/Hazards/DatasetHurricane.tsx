import React from "react";
import { TabPanel } from "@mui/joy";

interface DatasetHurricaneProps {
    index: number;
    // handleLayerUpdate: (data: any) => void;
    // handleListUpdate: (config: any, hazardType: string) => void;
}

export const DatasetHurricane: React.FC<DatasetHurricaneProps> = ({ index }) => {
    return (
        <TabPanel value={index}>
            <div />
        </TabPanel>
    );
};
