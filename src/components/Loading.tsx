import React from "react";
import CircularProgress from "@mui/joy/CircularProgress";
import Box from "@mui/joy/Box";

const Loading = (): JSX.Element => (
    <Box sx={{position: "absolute", top: "50%", left: "50%", transform: 'translate(-50%, -50%)'}}>
        <CircularProgress />
    </Box>
);

export default Loading;
