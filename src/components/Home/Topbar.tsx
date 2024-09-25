import React from "react";
import { Box, Typography, Button } from "@mui/joy";
import { useAuth } from "react-oidc-context";

const Topbar: React.FC = () => {
    const auth = useAuth();
    const handleLogout = () => {
        auth.signoutPopup().catch((error) => {
            console.error("Login error:", error);
        });
    };

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
            <Button color="primary" onClick={handleLogout} variant="plain">
                Log out
            </Button>
        </Box>
    );
};

export default Topbar;
