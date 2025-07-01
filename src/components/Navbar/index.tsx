import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Divider, IconButton, Menu, MenuItem, Avatar, Box, Typography } from "@mui/joy";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpIcon from "@mui/icons-material/Help";
import SettingsIcon from "@mui/icons-material/Settings";
// eslint-disable-next-line import/no-unresolved
import config from "@app/app.config";
import Gravatar from "react-gravatar";

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
                position: "sticky",
                top: 0,
                height: "6vh",
                borderBottom: "solid 1px #0000001F",
                zIndex: 20
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
                    sx={{ flexGrow: 1, display: "flex", alignItems: "center", ml: 4 }}
                >
                    <Box
                        component="img"
                        src="/resilience-logo.png"
                        alt="Studio"
                        sx={{
                            width: "3em",
                            marginRight: "0.5em"
                        }}
                    />
                    <Box component="span" sx={{ fontWeight: 700, fontSize: "20px" }}>
                        Studio
                    </Box>
                </Typography>
            </Link>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mr: 2 }}>
                <IconButton>
                    <NotificationsIcon className="icon" />
                </IconButton>
                <IconButton>
                    <HelpIcon className="icon" />
                </IconButton>
                <IconButton>
                    <SettingsIcon className="icon" />
                </IconButton>
                <IconButton
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    color="primary"
                    onClick={handleClick}
                >
                    <Avatar variant="outlined" size="sm">
                        <Gravatar
                            email={auth?.user?.profile?.email || "placeholder@example.com"}
                            size={40}
                            default="identicon"
                        />
                    </Avatar>
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
            </Box>
        </Box>
    );
};

export default Navbar;
