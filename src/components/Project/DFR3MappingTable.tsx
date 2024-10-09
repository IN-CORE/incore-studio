import React from "react";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";

export const DFR3MappingTable = () => {
    const projectDFR3Mappings = useSelector((state: RootState) => state.project.projectDFR3Mappings);

    return (
        <>
            {/* DFR3 Section */}
            <Typography level="h2" sx={{ mb: 2 }}>
                DFR3 Mappings
            </Typography>
            <Table aria-label="dfr3mappings" hoverRow>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Hazard Type</th>
                        <th>Inventory Type</th>
                        <th>Mapping Type</th>
                        <th>Owner</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {projectDFR3Mappings.map((dfr3Mapping) => (
                        <tr key={dfr3Mapping.id}>
                            <td>{dfr3Mapping.name || "Name not provided"}</td>
                            <td>{dfr3Mapping.hazardType || "Hazard type not provided"}</td>
                            <td>{dfr3Mapping.inventoryType || "Inventory type not provided"}</td>
                            <td>{dfr3Mapping.mappingType || "Mapping type not provided"}</td>
                            <td>{dfr3Mapping.owner || "Owner not provided"}</td>
                            <td>
                                <IconButton variant="plain">
                                    <MoreVertIcon />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
};
