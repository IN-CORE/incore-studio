import React from "react";
import { Box, Typography } from "@mui/joy";
import Navbar from "@app/components/Home/Navbar";

const Topbar: React.FC = () => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "white",
                color: "primary.main",
                p: 2,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                position: "sticky",
                top: 0,
                width: "100%"
            }}
        >
            <Typography level="h4" sx={{ flexGrow: 1 }}>
                IN-CORE Studio
            </Typography>
            <Navbar />
        </Box>
    );
};

export default Topbar;
