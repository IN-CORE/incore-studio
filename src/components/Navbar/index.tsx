import React from "react";
import { Box, Typography } from "@mui/joy";
import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { FaBell, FaCog, FaQuestionCircle, FaUser } from "react-icons/fa";
// eslint-disable-next-line import/no-unresolved
import config from "@app/app.config";
import logo from "/public/resilience-logo.png";

const Navbar: React.FC = () => {
    const auth = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Toggle the menu open or close based on whether anchorEl is null
        if (anchorEl) {
            setAnchorEl(null); // Close the menu
        } else {
            setAnchorEl(event.currentTarget); // Open the menu
        }
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLinkClick = (url: string | URL | undefined) => {
        window.open(url, "_blank"); // Opens the specified URL in a new tab
        handleClose();
    };
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
                height: "6vh",
                width: "100%",
                zIndex: 1001
            }}
        >
            <Link
                to="/"
                style={{ textDecoration: "none" }} // Removes underline
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
            </Link>

            <div>
                <IconButton>
                    <FaBell className="icon" />
                </IconButton>
                <IconButton>
                    <FaQuestionCircle className="icon" />
                </IconButton>
                <IconButton>
                    <FaCog className="icon" />
                </IconButton>
                <IconButton
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    color="primary"
                    onClick={handleClick}
                >
                    <FaUser className="icon" />
                </IconButton>

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    {auth?.user && (
                        <Typography style={{ padding: "8px 16px", margin: "0 auto" }}>
                            <div>Hi! {auth.user.profile.given_name || "Unknown User"} </div>
                            <div>{auth.user.profile.email}</div>
                        </Typography>
                    )}
                    <Divider orientation="horizontal" />
                    <MenuItem onClick={() => handleLinkClick(`mailto:${config.mailingList}`)}>Contact Us</MenuItem>
                    <MenuItem onClick={() => handleLinkClick(config.slackInvitationLink)}>Join Slack</MenuItem>
                    <MenuItem onClick={() => handleLinkClick(config.tosURL)}>Terms of Service</MenuItem>
                    <MenuItem onClick={handleLogout}>Log out</MenuItem>
                </Menu>
            </div>
        </Box>
    );
};

export default Navbar;
