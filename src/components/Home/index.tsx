import React from "react";
import { Box } from "@mui/joy";

import Workflow from "../Workflow";
import Topbar from "./Topbar";

const Home = (): JSX.Element => {
    return (
        <>
            <Topbar />
            <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                <Box sx={{ flexShrink: 0 }}>
                    <h1>Home</h1>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                    <Workflow />
                </Box>
            </Box>
        </>
    );
};

export default Home;
