import React from "react";
import { Table } from "@mui/joy";
import { round } from "@app/utils";

interface PopDislocationTableTableProps {
    resultsJson: any;
    headers: string[];
    title: string;
    isMetrics?: boolean;
}

export const PopDislocationTable: React.FC<PopDislocationTableTableProps> = ({
    resultsJson,
    headers,
    title,
    isMetrics = false
}) => {
    const fullHeaders = ["", ...headers];

    const getValue = (type: string, key: string): string => {
        const value = resultsJson[type]?.[key];
        return value !== undefined ? value.toLocaleString("en-US") : "-";
    };

    const getPercent = (type: string, key: string): string => {
        const value = resultsJson[type]?.[key];
        return value !== undefined ? `${round(value, 1)}%` : "-";
    };

    return (
        <>
            <div
                style={{
                    height: "19px",
                    color: "#2E384D",
                    fontSize: "16px",
                    fontWeight: 500,
                    letterSpacing: "0.6px",
                    lineHeight: "19px",
                    padding: "12px 8px",
                    marginBottom: "17px",
                    display: "block"
                }}
            >
                {title}
            </div>
            <Table size="sm">
                <thead>
                    <tr>
                        {fullHeaders.map((header, idx) => (
                            <th
                                key={header}
                                style={{
                                    backgroundColor: idx === 0 ? "#F8F9FF" : "rgba(234, 238, 255, 0.6)",
                                    fontWeight: 500,
                                    textAlign: "center",
                                    fontSize: 12,
                                    letterSpacing: idx === 0 ? "inherit" : "1.13px",
                                    border: "solid 1px #FFFFFF",
                                    minWidth: isMetrics ? 200 : undefined
                                }}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td
                            style={{
                                backgroundColor: "#DB4F60",
                                color: "white",
                                fontSize: 12,
                                fontWeight: 500,
                                textAlign: "right"
                            }}
                        >
                            Dislocated
                        </td>
                        <td style={{ backgroundColor: "#FEEFF1", textAlign: "center" }}>
                            {"households" in resultsJson.dislocated
                                ? getValue("dislocated", "households")
                                : getValue("dislocated", "population")}
                        </td>
                        <td style={{ backgroundColor: "#FEEFF1", textAlign: "center" }}>
                            {"percent_of_households" in resultsJson.dislocated
                                ? getPercent("dislocated", "percent_of_households")
                                : getPercent("dislocated", "percent_of_population")}
                        </td>
                    </tr>

                    <tr>
                        <td
                            style={{
                                backgroundColor: "#A1BE2E",
                                color: "white",
                                fontSize: 12,
                                fontWeight: 500,
                                textAlign: "right"
                            }}
                        >
                            Not Dislocated
                        </td>
                        <td style={{ textAlign: "center" }}>
                            {"households" in resultsJson.not_dislocated
                                ? getValue("not_dislocated", "households")
                                : getValue("not_dislocated", "population")}
                        </td>
                        <td style={{ textAlign: "center" }}>
                            {"percent_of_households" in resultsJson.not_dislocated
                                ? getPercent("not_dislocated", "percent_of_households")
                                : getPercent("not_dislocated", "percent_of_population")}
                        </td>
                    </tr>

                    <tr>
                        <td
                            style={{
                                backgroundColor: "rgba(234, 238, 255, 0.6)",
                                fontWeight: 500,
                                textAlign: "right"
                            }}
                        >
                            Total
                        </td>
                        <td style={{ textAlign: "center" }}>
                            {"households" in resultsJson.total
                                ? getValue("total", "households")
                                : getValue("total", "population")}
                        </td>
                        <td style={{ textAlign: "center" }} />
                    </tr>
                </tbody>
            </Table>
        </>
    );
};
