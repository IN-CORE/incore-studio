import React from "react";
import Chart from "react-google-charts";
import { csvToArray } from "@app/utils";

interface SectorShocksBarChartProps {
    height: string | number;
    width: string | number;
    data: string;
    title: string;
    xAxisLegend: string;
    yAxisLegend: string;
}

const parseData = (data: string): (string | number | { role: string })[][] => {
    const chartData: (string | number | { role: string })[][] = [];
    const colors = ["#aededb", "#2d8686", "#00619D", "#2c698d", "#272643"];

    chartData.push(["Sector", "Ratio of Capital Remaining", { role: "style" }]);

    const dataArr = csvToArray(data, ",", false);

    if (dataArr[0][0].lastIndexOf("_") === -1) {
        const firstKey = dataArr[0][0];

        const isPlainKey =
            !firstKey.startsWith("M") &&
            !firstKey.endsWith("M") &&
            !firstKey.startsWith("I") &&
            !firstKey.endsWith("I");

        if (isPlainKey) {
            dataArr.forEach((row, i) => {
                chartData.push([row[0], parseFloat(row[1]), colors[i % 5]]);
            });
            return chartData;
        }

        const galDataArray = dataArr.map((row) => {
            const name = row[0].startsWith("H") && !/\d$/.test(row[0]) ? row[0].slice(0, -1) : row[0].slice(1);
            return [name, parseFloat(row[1])] as [string, number];
        });

        galDataArray.forEach(([name, value], i) => {
            const label = name.startsWith("H") && /\d$/.test(name) ? `${name}I` : `I${name}`;
            chartData.push([label, value, colors[i % 5]]);
        });
    }

    return chartData;
};

export const SectorShocksBarChart: React.FC<SectorShocksBarChartProps> = ({
    height,
    width,
    data,
    title,
    xAxisLegend,
    yAxisLegend
}) => {
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
                    hAxis: {
                        title: xAxisLegend,
                        textStyle: { fontSize: 10 }
                    },
                    vAxis: {
                        title: yAxisLegend,
                        titleTextStyle: { italic: false },
                        minValue: 0,
                        maxValue: 1
                    }
                }}
                rootProps={{ "data-testid": "1" }}
            />
        </div>
    );
};
