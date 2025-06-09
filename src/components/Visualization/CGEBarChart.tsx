import React from "react";
import Chart from "react-google-charts";
import { Typography } from "@mui/joy";

interface CGEBarChartProps {
    height: string | number;
    width?: string | number;
    data: CGEChartData;
    title: string;
    xAxisLegend: string;
    yAxisLegend: string;
    region?: string | null;
}

const ParseData = (data: CGEChartData, region: string | null = null, yAxisLegend = ""): (string | number)[][] => {
    let { beforeEvent, afterEvent } = data;

    if (region) {
        const filterFunc = ([key]: [string, number]): boolean => {
            if (region.startsWith("R") || (key.startsWith("H") && !/\d$/.test(key))) {
                return key.endsWith(region);
            }
            return key.startsWith(region);
        };

        beforeEvent = Object.fromEntries(Object.entries(beforeEvent).filter(filterFunc));
        afterEvent = Object.fromEntries(Object.entries(afterEvent).filter(filterFunc));
    }

    const chartData: (string | number)[][] = [];
    chartData.push([yAxisLegend, "Before Event", "After Event"]);

    Object.keys(beforeEvent).forEach((key) => {
        chartData.push([key, beforeEvent[key], afterEvent[key]]);
    });

    return chartData;
};

export const CGEBarChart: React.FC<CGEBarChartProps> = ({
    height,
    width,
    data,
    title,
    xAxisLegend,
    yAxisLegend,
    region
}) => {
    return (
        <div className="barChart">
            <Typography
                sx={{
                    fontSize: "16px",
                    fontWeight: 500,
                    padding: "12px 8px",
                    marginBottom: "17px",
                    display: "block"
                }}
            >
                {title}
            </Typography>
            <Chart
                width={width}
                height={height}
                chartType="BarChart"
                loader={<div>Loading Chart</div>}
                data={ParseData(data, region, yAxisLegend)}
                options={{
                    title: undefined,
                    legend: { position: "right" },
                    colors: ["#A1BE2E", "#DB4F60"],
                    hAxis: {
                        title: xAxisLegend
                    },
                    vAxis: {
                        title: yAxisLegend
                    }
                }}
                rootProps={{ "data-testid": "1" }}
            />
        </div>
    );
};
