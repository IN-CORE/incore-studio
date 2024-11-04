import React, { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Table, Menu, MenuItem, MenuButton, Dropdown } from "@mui/joy";
import { formatHeaderName, parseDateTime } from "@app/utils";

interface TableProps {
    projectId?: string;
    columns: string[];
    data: Dataset[] | Hazard[] | Visualization[] | Workflow[] | DFR3Mapping[];
    deleteFunc?: any;
}

// Type narrowing function
const hasCreator = (item: any): item is Workflow => {
    return item.creator && item.creator.firstName && item.creator.lastName;
};

const hasDate = (item: any): item is Workflow | Dataset => {
    return item.date;
};

export const ResourceTable = ({ projectId, columns, data, deleteFunc }: TableProps): JSX.Element => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const handleOpenMenu = (id: string) => {
        setSelectedItemId(id);
    };

    const handleCloseMenu = () => {
        setSelectedItemId(null);
    };

    const handleDelete = () => {
        if (selectedItemId && projectId) {
            deleteFunc(projectId, [selectedItemId]); // Passes the selected ID to delete
            setSelectedItemId(null); // Clear selection after deletion
        }
    };

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
                <td style={{ textAlign: "right" }}>
                    <Dropdown>
                        <MenuButton
                            slots={{ root: IconButton }}
                            slotProps={{ root: { variant: "plain", color: "neutral" } }}
                            onClick={() => handleOpenMenu(item.id)}
                        >
                            <MoreVertIcon />
                        </MenuButton>

                        <Menu onClose={handleCloseMenu} placement="bottom-start">
                            <MenuItem onClick={handleDelete}>Delete</MenuItem>
                        </Menu>
                    </Dropdown>
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
                    <th style={{ backgroundColor: "white", textAlign: "right" }}>Action</th>
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
