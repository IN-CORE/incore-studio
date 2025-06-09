import React from "react";
import { Table } from "@mui/joy";

interface CGEResultsTableProps {
    resultsJson: CGEChartData;
    region?: string;
}

const round = (val: number, decimals = 1) => {
    return Number(`${Math.round(Number(`${val}e${decimals}`))}e-${decimals}`);
};

export const CGEResultsTable: React.FC<CGEResultsTableProps> = ({ resultsJson, region }) => {
    if (!resultsJson) return null;

    let beforeJson = resultsJson.beforeEvent;
    let afterJson = resultsJson.afterEvent;
    let percentageChange = resultsJson["%_change"];

    if (region) {
        const filterFunc = ([key]: [string, number]) => {
            if (region.startsWith("R") || (key.startsWith("H") && !/\d$/.test(key))) {
                return key.endsWith(region);
            }
            return key.startsWith(region);
        };

        beforeJson = Object.fromEntries(Object.entries(beforeJson).filter(filterFunc));
        afterJson = Object.fromEntries(Object.entries(afterJson).filter(filterFunc));
        percentageChange = Object.fromEntries(Object.entries(percentageChange).filter(filterFunc));
    }

    const headers = [
        "",
        ...new Set([...Object.keys(afterJson), ...Object.keys(beforeJson), ...Object.keys(percentageChange)])
    ];

    return (
        <Table size="sm" variant="plain" borderAxis="both">
            <thead>
                <tr>
                    {headers.map((header) => (
                        <th key={header} style={{ fontWeight: 600, fontSize: 12, background: "#EAEEFF" }}>
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{ background: "#A1BE2E", color: "white", fontWeight: 600 }}>Before Event</td>
                    {headers.slice(1).map((header) => (
                        <td key={header} align="center">
                            {beforeJson[header] !== undefined ? round(beforeJson[header], 1) : "-"}
                        </td>
                    ))}
                </tr>

                <tr>
                    <td style={{ background: "#DB4F60", color: "white", fontWeight: 600 }}>After Event</td>
                    {headers.slice(1).map((header) => (
                        <td key={header} align="center">
                            {afterJson[header] !== undefined ? round(afterJson[header], 1) : "-"}
                        </td>
                    ))}
                </tr>

                <tr>
                    <td style={{ background: "#EAEEFF", fontWeight: 600 }}>% of Change</td>
                    {headers.slice(1).map((header) => (
                        <td key={header} align="center">
                            {percentageChange[header] !== undefined ? `${round(percentageChange[header], 1)} %` : "-"}
                        </td>
                    ))}
                </tr>
            </tbody>
        </Table>
    );
};
