import React from "react";

import { Box, Button, SvgIcon } from "@mui/joy";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";

import ExecuteIcon from "./executeIcon.svg";

import Workflow from "../Workflow";

const WorkflowBuilder = (): JSX.Element => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "5px" }}>
                <Box sx={{ mx: "10px" }}>
                    <Button variant="plain" startDecorator={<ArrowBackIosRoundedIcon />} />
                </Box>
                <Box sx={{ mx: "10px", alignContent: "center" }}>
                    <Button sx={{ marginRight: "10px" }} variant="outlined">
                        Save
                    </Button>
                    <Button
                        variant="solid"
                        startDecorator={
                            <SvgIcon viewBox="0 0 20 20">
                                <ExecuteIcon />
                            </SvgIcon>
                        }
                        sx={{ backgroundColor: "#344563", border: "1px" }}
                    >
                        Execute Workflow
                    </Button>
                </Box>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                <Workflow />
            </Box>
        </Box>
    );
};

export default WorkflowBuilder;
