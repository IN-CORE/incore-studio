import React from "react";
import { Box, Container, Typography } from "@mui/joy";

import Navbar from "../Navigation/Navbar";
import Project from "../Project";

const Home = (): JSX.Element => {
    return (
        <>
            <Navbar />
            <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
                <Box sx={{ flexShrink: 0 }} mt={5}>
                    <Typography level="h1" textColor="primary.main" fontWeight="md">
                        Welcome to IN-CORE Studio
                    </Typography>
                    <Typography textColor="primary.main" mt={2}>
                        IN-CORE Studio is built upon the IN-CORE (Interdependent Networked Community Resilience Modeling
                        Environment) platform, which enables the modeling and analysis of community resilience to
                        various hazards. IN-CORE Studio allows users to create customized workflows to simulate
                        resilience scenarios for their communities, reproduce results consistently, and share findings
                        with others. It facilitates knowledge discovery and helps users explore the interdependencies
                        between infrastructure systems and community resilience in the face of disasters.
                    </Typography>
                </Box>
                <Project />
            </Container>
        </>
    );
};

export default Home;
