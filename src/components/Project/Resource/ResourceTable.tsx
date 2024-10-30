import React from "react";
import Table from "@mui/joy/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton } from "@mui/material";
import { formatHeaderName, parseDateTime } from "@app/utils";

interface TableProps {
    columns: string[];
    data: Dataset[] | Hazard[] | Visualization[] | Workflow[] | DFR3Mapping[];
}

// Type narrowing function
const hasCreator = (item: any): item is Workflow => {
    return item.creator && item.creator.firstName && item.creator.lastName;
};

const hasDate = (item: any): item is Workflow | Dataset => {
    return item.date;
};

export const ResourceTable = ({ columns, data }: TableProps): JSX.Element => {
    const renderRow = (item: Dataset | Hazard | Visualization | Workflow | DFR3Mapping) => {
        return (
            <>
                {columns.map((column) => {
                    if (column === "date" && hasDate(item)) {
                        return (
                            <td key={`${item.id.toString()}-${column}`}>
                                {item.date ? parseDateTime(item.date) : "No date provided"}
                            </td>
                        );
                    }
                    if (column === "isFinalized" && "isFinalized" in item) {
                        return (
                            <td key={`${item.id.toString()}-${column}`}>
                                {item.isFinalized ? "Finalized" : "Pending"}
                            </td>
                        );
                    }
                    if (column === "creator" && hasCreator(item)) {
                        return (
                            <td key={`${item.id.toString()}-${column}`}>
                                {`${item.creator.firstName} ${item.creator.lastName}`}
                            </td>
                        );
                    }

                    return (
                        <td key={`${item.id.toString()}-${column}`}>
                            {(item as any)[column] || `No ${column} provided`}
                        </td>
                    );
                })}
                <td>
                    <IconButton variant="plain">
                        <MoreVertIcon />
                    </IconButton>
                </td>
            </>
        );
    };

    return (
        <Table>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column} style={{ backgroundColor: "white" }}>
                            {formatHeaderName(column)}
                        </th>
                    ))}
                    <th style={{ backgroundColor: "white" }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.id}>{renderRow(item)}</tr>
                ))}
            </tbody>
        </Table>
    );
};
