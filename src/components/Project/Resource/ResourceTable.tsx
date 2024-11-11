import React, { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Table, Menu, MenuItem, MenuButton, Dropdown } from "@mui/joy";
import { formatHeaderName, parseDateTime } from "@app/utils";
import { IncoreDialog } from "@app/components/IncoreDialog";
import { VisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";

interface TableProps {
    projectId: string;
    columns: string[];
    data: Dataset[] | Hazard[] | Visualization[] | Workflow[] | DFR3Mapping[];
    deleteFunc?: any;
    addVisualizationFunc?: any;
}

// Type narrowing function
const hasCreator = (item: any): item is Workflow => {
    return item.creator && item.creator.firstName && item.creator.lastName;
};

const hasDate = (item: any): item is Workflow | Dataset => {
    return item.date;
};

export const ResourceTable = ({
    projectId,
    columns,
    data,
    deleteFunc,
    addVisualizationFunc
}: TableProps): JSX.Element => {
    const [selectedItem, setSelectedItem] = useState<Hazard | Visualization | Dataset | Workflow | DFR3Mapping | null>(
        null
    );

    const handleOpenMenu = (item: Hazard | Visualization | Dataset | Workflow | DFR3Mapping) => {
        setSelectedItem(item);
    };

    const handleCloseMenu = () => {
        setSelectedItem(null);
    };

    // delete
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
    };
    const handleDelete = () => {
        if (selectedItem && projectId) {
            deleteFunc(projectId, selectedItem);
            setSelectedItem(null);
        }
        setOpenDeleteDialog(false);
    };

    // add to visualization
    const [openVisDialog, setOpenVisDialog] = useState(false);
    const handleCloseVisDialog = () => {
        setOpenVisDialog(false);
    };
    const handleAddVisualization = (visualizationId: string) => {
        if (selectedItem && projectId) {
            addVisualizationFunc(projectId, visualizationId, selectedItem);
            setSelectedItem(null);
        }
        setOpenVisDialog(false);
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
                            onClick={() => handleOpenMenu(item)}
                        >
                            <MoreVertIcon />
                        </MenuButton>
                        <Menu onClose={handleCloseMenu} placement="bottom-start">
                            <MenuItem
                                onClick={() => {
                                    setOpenDeleteDialog(true);
                                }}
                            >
                                Delete
                            </MenuItem>
                            {addVisualizationFunc && (
                                <MenuItem
                                    onClick={() => {
                                        setOpenVisDialog(true);
                                    }}
                                >
                                    Add to Visualization
                                </MenuItem>
                            )}
                        </Menu>
                    </Dropdown>
                    <VisualizationDialog
                        projectId={projectId}
                        open={openVisDialog}
                        onClose={handleCloseVisDialog}
                        onAddVisualization={handleAddVisualization}
                    />
                    <IncoreDialog
                        open={openDeleteDialog}
                        onClose={handleCloseDialog}
                        onAction={handleDelete}
                        message="Are you sure you want to delete this item? This action cannot be undone."
                        dialogTitle="Confirm Deletion"
                        actionButtonName="Delete"
                    />
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
