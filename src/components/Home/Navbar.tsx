import React from "react";
import { FaBell, FaQuestionCircle, FaCog, FaUser } from "react-icons/fa";
import { useAuth } from "react-oidc-context";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { Divider, Link, Typography } from "@mui/joy";
// eslint-disable-next-line import/no-unresolved
import config from "../../app.config";

const Navbar = () => {
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
    const handleLogout = () => {
        auth.signoutPopup().catch((error) => {
            console.error("Login error:", error);
        });
    };

    return (
        <div>
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
                    <MenuItem onClick={handleClose}>
                        <Link href={`mailto:${config.mailingList}`} target="_blank" style={{ textDecoration: "none" }}>
                            Contact Us
                        </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Link href={config.slackInvitationLink} target="_blank" style={{ textDecoration: "none" }}>
                            Join Slack
                        </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Link href={config.tosURL} target="_blank" style={{ textDecoration: "none" }}>
                            Terms of Service
                        </Link>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Log out</MenuItem>
                </Menu>
            </div>
        </div>
    );
};

export default Navbar;
