import React, { useEffect, useState } from "react";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getDatasets } from "@app/reducer/dataSlice";

interface DatasetTableProps {
    projectDatasets: ProjectElement[];
}
export const DatasetTable = (props: DatasetTableProps) => {
    const { projectDatasets } = props;
    const dispatch = useDispatch();

    // Redux state
    const datasets = useSelector((state: RootState) => state.data.datasets);

    useEffect(() => {
        if (projectDatasets) {
            const datasetIds = projectDatasets.map((dataset) => dataset.id);
            // @ts-ignore
            dispatch(getDatasets(datasetIds));
        }
    }, [projectDatasets]);

    const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>([]);
    useEffect(() => {
        const temp = datasets.filter((dataset): dataset is Dataset => "title" in dataset);
        setAvailableDatasets(temp);
    }, [datasets]);

    return (
        <>
            {/* Datasets Section */}
            <Typography level="h2" sx={{ mb: 2 }}>
                Datasets
            </Typography>
            <Table aria-label="datasets" hoverRow>
                <thead>
                    <tr>
                        <th>Dataset Name</th>
                        <th>Description</th>
                        <th>Owner</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Loop through filtered datasets and render a row for each one */}
                    {availableDatasets.map((dataset) => (
                        <tr key={dataset.id}>
                            <td>{dataset.title}</td>
                            <td>{dataset.description || "No description provided"}</td>
                            <td>{dataset.owner}</td>
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
