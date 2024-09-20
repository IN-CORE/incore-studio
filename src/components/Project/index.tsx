import React from "react";
import { Box } from "@mui/joy";
import { ProjectCard } from "./ProjectCard"; // Assuming this is the path to your ProjectCard component

const projectDataList = [
    {
        name: "Test",
        id: "5f6323a0c11bb380daa9cbc1",
        description: "This is a description of the example project.",
        region: "Joplin",
        hazards: [
            { id: "5c6323a0c11bb380daa9cbc1", type: "tornado" },
            { id: "5b902cb273c3371e1236b36b", type: "earthquake" }
        ],
        dfr3Mappings: [{ id: "5b47b2d9337d4a36187c7563", type: "fragility" }],
        datasets: [
            { id: "5a284f0bc7d30d13bc081a28", type: "ergo:buildingInventoryVer5" },
            { id: "5a284f0bc7d30d13bc081a20", type: "ergo:buildingInventoryVer5" }
        ],
        workflows: []
    },
    {
        name: "Flood Risk Analysis",
        id: "6f6323a0c11bb380daa9cbc1",
        description: "An in-depth analysis of flood risk in coastal regions.",
        region: "MMSA",
        hazards: [{ id: "5d6323a0c11bb380daa9cbc1", type: "flood" }],
        dfr3Mappings: [{ id: "6b47b2d9337d4a36187c7563", type: "vulnerability" }],
        datasets: [{ id: "7a284f0bc7d30d13bc081a28", type: "ergo:floodZoneInventory" }],
        workflows: [{ id: "9b47b2d9337d4a36187c7563", type: "floodImpactWorkflow" }]
    },
    {
        name: "Seismic Resilience Study",
        id: "7f6323a0c11bb380daa9cbc1",
        description: "Evaluation of seismic resilience in urban areas.",
        region: "Galveston",
        hazards: [
            { id: "4c6323a0c11bb380daa9cbc1", type: "earthquake" },
            { id: "8d902cb273c3371e1236b36b", type: "aftershock" }
        ],
        dfr3Mappings: [{ id: "3e47b2d9337d4a36187c7563", type: "seismic" }],
        datasets: [
            { id: "6a284f0bc7d30d13bc081a30", type: "ergo:seismicRiskData" },
            { id: "6a284f0bc7d30d13bc081a31", type: "ergo:buildingInventory" }
        ],
        workflows: [{ id: "7c47b2d9337d4a36187c7565", type: "seismicImpactWorkflow" }]
    },
    {
        name: "Hurricane Preparedness Plan",
        id: "8f6323a0c11bb380daa9cbc1",
        description: "A detailed preparedness plan for mitigating hurricane impacts.",
        region: "Galveston",
        hazards: [{ id: "9c6323a0c11bb380daa9cbc1", type: "hurricane" }],
        dfr3Mappings: [{ id: "9b47b2d9337d4a36187c7563", type: "fragility" }],
        datasets: [
            { id: "8a284f0bc7d30d13bc081a30", type: "ergo:hurricaneRiskData" },
            { id: "8a284f0bc7d30d13bc081a31", type: "ergo:coastalInventory" }
        ],
        workflows: [{ id: "7d47b2d9337d4a36187c7565", type: "hurricaneMitigationWorkflow" }]
    }
];

const Project = (): JSX.Element => {
    return (
        <Box display="flex" flexWrap="wrap" justifyContent="left" gap={4}>
            {projectDataList.map((projectData, index) => (
                <ProjectCard project={projectData} key={index} />
            ))}
        </Box>
    );
};

export default Project;
