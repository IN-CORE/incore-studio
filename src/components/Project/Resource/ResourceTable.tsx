import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Table, Menu, MenuItem, MenuButton, Dropdown, Link } from "@mui/joy";
import { formatHeaderName, parseDateTime } from "@app/utils";
import { IncoreDialog } from "@app/components/IncoreDialog";
import { VisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";

interface TableProps {
    projectId: string;
    columns: string[];
    data: Dataset[] | Hazard[] | Visualization[] | Workflow[] | DFR3Mapping[];
    deleteFunc?: any;
    resourceType?: string;
    viewFunc?: any;
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
    viewFunc,
    addVisualizationFunc,
    resourceType
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
    const handleAddVisualization = (visualizationId: string, styleName?: string) => {
        if (selectedItem && projectId) {
            addVisualizationFunc(projectId, visualizationId, selectedItem, styleName);
            setSelectedItem(null);
        }
        setOpenVisDialog(false);
    };

    const renderRow = (resource: Dataset | Hazard | Visualization | Workflow | DFR3Mapping) => {
        return (
            <>
                {columns.map((column) => {
                    if (column === "date" && hasDate(resource)) {
                        return (
                            <td key={`${resource.id.toString()}-${column}`}>
                                {resource.date ? parseDateTime(resource.date) : "No date provided"}
                            </td>
                        );
                    }
                    if (column === "isFinalized" && "isFinalized" in resource) {
                        return (
                            <td key={`${resource.id.toString()}-${column}`}>
                                {resource.isFinalized ? "Finalized" : "Pending"}
                            </td>
                        );
                    }
                    if (column === "creator" && hasCreator(resource)) {
                        return (
                            <td key={`${resource.id.toString()}-${column}`}>
                                {`${resource.creator.firstName} ${resource.creator.lastName}`}
                            </td>
                        );
                    }

                    return (
                        <td key={`${resource.id.toString()}-${column}`}>
                            {(resource as any)[column] || `No ${column} provided`}
                        </td>
                    );
                })}
                <td style={{ textAlign: "right" }}>
                    <Dropdown>
                        <MenuButton
                            slots={{ root: IconButton }}
                            slotProps={{ root: { variant: "plain", color: "neutral" } }}
                            onClick={() => handleOpenMenu(resource)}
                        >
                            <MoreVertIcon />
                        </MenuButton>
                        <Menu onClose={handleCloseMenu} placement="bottom-start">
                            {resourceType?.toLowerCase() === "workflow" && (
                                <MenuItem>
                                    <Link
                                        textColor="primary.main"
                                        component={RouterLink}
                                        underline="none"
                                        to={`/project/${projectId}/workflows/${resource.id}`}
                                    >
                                        Open
                                    </Link>
                                </MenuItem>
                            )}
                            {addVisualizationFunc && (
                                <MenuItem
                                    onClick={() => {
                                        setOpenVisDialog(true);
                                    }}
                                >
                                    Add to Visualization
                                </MenuItem>
                            )}
                            {viewFunc && (
                                <MenuItem
                                    onClick={() => {
                                        viewFunc(resource);
                                    }}
                                >
                                    View
                                </MenuItem>
                            )}
                            <MenuItem
                                onClick={() => {
                                    setOpenDeleteDialog(true);
                                }}
                            >
                                Delete
                            </MenuItem>
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
                {data.map((resource) => (
                    <tr key={resource.id}>{renderRow(resource)}</tr>
                ))}
            </tbody>
        </Table>
    );
};
