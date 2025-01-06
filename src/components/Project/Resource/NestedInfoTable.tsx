import React from "react";
import { Divider, List, ListItem, Table, Tooltip } from "@mui/joy";
import config from "@app/app.config";

interface NestedInfoTableProps {
    data: Record<string, any>; // Define the data structure more specifically if possible
}

export const NestedInfoTable: React.FC<NestedInfoTableProps> = ({ data }) => {
    const startsWithErgoOrIncore = (dataType: string): boolean => /^ergo:/.test(dataType) || /^incore:/.test(dataType);

    const renderDataRows = (data: Record<string, any>): React.ReactNode => {
        return Object.keys(data).map((key) => {
            if (key === "hazardDatasets" && Array.isArray(data[key]) && data[key].length > 0) {
                return (
                    <tr key={key}>
                        <td
                            style={{
                                width: "20%",
                                fontWeight: "bold",
                                padding: "2px"
                            }}
                        >
                            {key}
                        </td>
                        <td style={{ padding: "2px" }}>
                            <List sx={{ padding: 0 }}>
                                {data[key].map((hazardDataset: any) =>
                                    hazardDataset.datasetId ? (
                                        <div key={hazardDataset.datasetId}>
                                            <ListItem sx={{ padding: "2px 0" }}>
                                                {/* <Button */}
                                                {/*    color="primary" */}
                                                {/*    variant="solid" */}
                                                {/*    size="sm" */}
                                                {/*    sx={{ marginRight: 1, fontSize: "12px", padding: "4px 8px" }} */}
                                                {/* > */}
                                                {/*    Preview */}
                                                {/* </Button> */}
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis"
                                                    }}
                                                >
                                                    {hazardDataset.datasetId}
                                                </span>
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    ) : null
                                )}
                            </List>
                        </td>
                    </tr>
                );
            }
            if (data[key]) {
                return (
                    <tr key={key}>
                        <td
                            style={{
                                width: "20%",
                                fontWeight: "bold",
                                padding: "2px"
                            }}
                        >
                            {key === "creator" ? (
                                <Tooltip title="The person who created the resource">
                                    <span>{key}</span>
                                </Tooltip>
                            ) : (
                                key
                            )}
                        </td>
                        <td style={{ padding: "2px" }}>
                            {typeof data[key] === "object" && data[key] ? (
                                <Table size="sm" style={{ marginTop: 1 }}>
                                    <tbody>
                                        {Object.keys(data[key]).map((key2) => (
                                            <tr key={key2}>
                                                <td
                                                    style={{
                                                        width: "20%",
                                                        fontWeight: "bold",
                                                        padding: "2px"
                                                    }}
                                                >
                                                    {key2}
                                                </td>
                                                <td style={{ padding: "2px" }}>
                                                    {typeof data[key][key2] === "object" && data[key][key2] ? (
                                                        <Table size="sm">
                                                            <tbody>
                                                                {Object.keys(data[key][key2]).map((key3) =>
                                                                    key3 !== "legacyEntry" ? (
                                                                        <tr key={key3}>
                                                                            <td
                                                                                style={{
                                                                                    width: "20%",
                                                                                    fontWeight: "bold",
                                                                                    padding: "2px"
                                                                                }}
                                                                            >
                                                                                {key3}
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    padding: "2px",
                                                                                    fontSize: "12px"
                                                                                }}
                                                                            >
                                                                                {JSON.stringify(data[key][key2][key3])}
                                                                            </td>
                                                                        </tr>
                                                                    ) : null
                                                                )}
                                                            </tbody>
                                                        </Table>
                                                    ) : (
                                                        JSON.stringify(data[key][key2])
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : key === "dataType" && startsWithErgoOrIncore(data[key]) ? (
                                <a
                                    href={`${config.semanticService}/${data[key]}`}
                                    style={{
                                        color: "#1976d2",
                                        textDecoration: "none",
                                        fontSize: "12px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {data[key]}
                                </a>
                            ) : (
                                <span
                                    style={{
                                        fontSize: "12px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                >
                                    {data[key]}
                                </span>
                            )}
                        </td>
                    </tr>
                );
            }
            return null;
        });
    };

    return (
        <div
            style={{
                maxHeight: "500px", // Set the fixed height for the container
                overflow: "auto" // Enable vertical scrolling
            }}
        >
            <Table
                size="sm"
                sx={{
                    width: "100%",
                    fontSize: "12px",
                    lineHeight: "1.2"
                }}
            >
                <tbody>{renderDataRows(data)}</tbody>
            </Table>
        </div>
    );
};
