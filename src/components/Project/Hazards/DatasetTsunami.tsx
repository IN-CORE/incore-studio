import React from "react";
import { TabPanel } from "@mui/joy";

interface DatasetTsunamiProps {
    index: number;
    // handleLayerUpdate: (data: any) => void;
    // handleListUpdate: (config: any, hazardType: string) => void;
}

export const DatasetTsunami: React.FC<DatasetTsunamiProps> = ({ index }) => {
    return (
        <TabPanel value={index}>
            <div />
        </TabPanel>
    );
};
