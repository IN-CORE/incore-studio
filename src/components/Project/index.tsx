import React, { useEffect } from "react";
import { Box } from "@mui/joy";
import { getProjects } from "@app/reducer/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { ProjectCard } from "./ProjectCard";

const Project = (): JSX.Element => {
    const dispatch = useDispatch();

    const projects = useSelector((state: RootState) => state.project.projects);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjects({ skip: 0, limit: 10 }));
    }, [dispatch]);

    return (
        // TODO add loading spinner and error message
        // {loading && <p>Loading...</p>}
        // {error && <p>Error: {error}</p>}
        <Box display="flex" flexWrap="wrap" justifyContent="left" gap={4}>
            {projects.map((project: Project) => (
                <ProjectCard project={project} key={project.id ?? ""} />
            ))}
        </Box>
    );
};

export default Project;
