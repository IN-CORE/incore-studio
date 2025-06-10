import React from "react";
import { Box } from "@mui/joy";
import { SectorShocksBarChart } from "@app/components/Visualization/SectorShocksBarChart";

interface SectorShocksProps {
    sectorShocksContent: string;
}

export const SectorShocks: React.FC<SectorShocksProps> = ({ sectorShocksContent }) => {
    return (
        <Box>
            {sectorShocksContent && (
                <SectorShocksBarChart
                    data={sectorShocksContent}
                    height="25em"
                    width="100%"
                    xAxisLegend="Sectors"
                    yAxisLegend="Capital Shocks"
                    title="Sector Shocks Results"
                />
            )}
        </Box>
    );
};
