import React from "react";
import Chart from "react-google-charts";

interface HhsBarChartProps {
    height: string | number;
    width?: string | number;
    data: number[];
    title: string;
}

const parseData = (data: number[]): (string | number | { role: string })[][] => {
    const chartData: (string | number | { role: string })[][] = [];
    const colors = ["#DB4F60", "#ff7e0f", "#A1BE2E", "#1e77b4", "#3fbecf"];

    chartData.push(["Housing Recovery Stage", "Frequency", { role: "style" }]);

    data.forEach((value, i) => {
        chartData.push([`Stage ${i + 1}`, value, colors[i % colors.length]]);
    });

    return chartData;
};

export const HhsBarChart: React.FC<HhsBarChartProps> = ({ height, width, data, title }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="barChart">
            <Chart
                width={width}
                height={height}
                chartType="ColumnChart"
                loader={<div>Loading Chart</div>}
                data={parseData(data)}
                options={{
                    title,
                    legend: { position: "none" },
                    bar: { groupWidth: "50%" },
                    vAxis: {
                        title: "Frequency",
                        titleTextStyle: { italic: false }
                    }
                }}
            />
        </div>
    );
};
