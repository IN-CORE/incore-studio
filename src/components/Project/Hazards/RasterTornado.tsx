import React from "react";
import { TabPanel } from "@mui/joy";

interface RasterTornadoProps {
    index: number;
    // handleLayerUpdate: (data: any) => void;
    // handleListUpdate: (config: any, hazardType: string) => void;
}

export const RasterTornado: React.FC<RasterTornadoProps> = ({ index }) => {
    return (
        <TabPanel value={index}>
            <div />
        </TabPanel>
    );
};
