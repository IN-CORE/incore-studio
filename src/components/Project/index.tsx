import React from "react";
import { Box } from "@mui/joy";
import { ProjectCard } from "./ProjectCard"; // Assuming this is the path to your ProjectCard component

const Project = (): JSX.Element => {
    return (
        <Box display="flex" flexWrap="wrap" justifyContent="left" gap={4}>
            {[...Array(10)].map((_, index) => (
                <ProjectCard key={index} />
            ))}
        </Box>
    );
};

export default Project;
