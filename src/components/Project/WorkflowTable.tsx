import React from "react";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { parseDateTime } from "@app/utils";

export const WorkflowTable = () => {
    const projectWorkflows = useSelector((state: RootState) => state.project.projectWorkflows);

    return (
        <>
            <Typography level="h2" sx={{ mb: 2 }}>
                Workflows
            </Typography>
            <Table aria-label="datasets" hoverRow>
                <thead>
                    <tr>
                        <th>Workflow Title</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Creator</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Loop through filtered datasets and render a row for each one */}
                    {projectWorkflows.map((workflow) => (
                        <tr key={workflow.id}>
                            <td>{workflow.title || "No title provided"}</td>
                            <td>{workflow.description || "No description provided"}</td>
                            <td>{workflow.date ? parseDateTime(workflow.date) : "No date provided"}</td>
                            <td>
                                {workflow.creator && workflow.creator.firstName && workflow.creator.lastName
                                    ? `${workflow.creator.firstName} ${workflow.creator.lastName}`
                                    : "No creator provided"}
                            </td>
                            <td>{workflow.isFinalized ? "Finalized" : "Pending"}</td>
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
