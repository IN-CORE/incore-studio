import React, { useEffect, useState } from "react";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getDFR3Mappings } from "@app/reducer/dfr3MappingSlice";

interface DFR3MappingTableProps {
    projectDFR3Mappings: ProjectElement[];
}

export const DFR3MappingTable = (props: DFR3MappingTableProps) => {
    const { projectDFR3Mappings } = props;
    const dispatch = useDispatch();

    const dfr3mappings = useSelector((state: RootState) => state.dfr3.dfr3mappings);

    useEffect(() => {
        if (projectDFR3Mappings) {
            const dfr3mappingsIds = projectDFR3Mappings.map((dfr3mapping) => dfr3mapping.id);
            // @ts-ignore
            dispatch(getDFR3Mappings(dfr3mappingsIds));
        }
    }, [projectDFR3Mappings]);

    const [availableDFR3Mappings, setAvailableDFR3Mappings] = useState<DFR3Mapping[]>([]);
    useEffect(() => {
        const temp = dfr3mappings.filter((dfr3mapping): dfr3mapping is DFR3Mapping => "name" in dfr3mapping);
        setAvailableDFR3Mappings(temp);
    }, [dfr3mappings]);

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
                    {availableDFR3Mappings.map((dfr3Mapping) => (
                        <tr key={dfr3Mapping.id}>
                            <td>{dfr3Mapping.name}</td>
                            <td>{dfr3Mapping.hazardType}</td>
                            <td>{dfr3Mapping.inventoryType}</td>
                            <td>{dfr3Mapping.mappingType}</td>
                            <td>{dfr3Mapping.owner}</td>
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
