import React from "react";
import { Box, Typography } from "@mui/joy";
import Navbar from "@app/components/Home/Navbar";
import logo from "../../public/resilience-logo.png";

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
            <Typography
                level="h4"
                textColor="primary.main"
                fontWeight="lg"
                sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
            >
                <Box
                    component="img"
                    src={logo}
                    alt="Studio"
                    sx={{
                        width: "3em",
                        marginRight: "0.5em"
                    }}
                />
                <Box component="span">Studio</Box>
            </Typography>
            <Navbar />
        </Box>
    );
};

export default Topbar;
