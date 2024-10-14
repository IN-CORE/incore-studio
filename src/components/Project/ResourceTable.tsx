import React from "react";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, IconButton } from "@mui/material";
import { parseDateTime } from "@app/utils";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

interface TableProps {
    resourceTitle: string;
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

export const ResourceTable = ({ resourceTitle, columns, data }: TableProps): JSX.Element => {
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
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography level="h4">{resourceTitle}</Typography>
                <Box display="flex" alignItems="center">
                    <IconButton>
                        <SearchIcon />
                    </IconButton>
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                    <IconButton>
                        <AddIcon />
                        <Typography level="body-sm" ml={1}>
                            Add from Service
                        </Typography>
                    </IconButton>
                </Box>
            </Box>
            <Table aria-label={resourceTitle.toLowerCase()}>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>{renderRow(item)}</tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
};
