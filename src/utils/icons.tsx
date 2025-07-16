import DashboardIcon from "@mui/icons-material/Dashboard";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import RouteIcon from "@mui/icons-material/Route";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import React, { ReactNode } from "react";

export const layerTypeIcons: Record<string, (props: { className?: string }) => ReactNode> = {
    point: (props) => <ScatterPlotIcon {...props} />,
    line: (props) => <RouteIcon {...props} />,
    polygon: (props) => <DashboardIcon {...props} />,
    raster: (props) => <ImageOutlinedIcon {...props} />
};
