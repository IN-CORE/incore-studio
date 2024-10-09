import React, { useState } from "react";
import { FaBell, FaQuestionCircle, FaCog, FaUser } from "react-icons/fa";
import { useAuth } from "react-oidc-context";
import { Menu, MenuItem } from "@mui/material";

const Navbar = () => {
    const auth = useAuth();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const handleIconClick = () => {
        setIsMenuVisible((prevState) => !prevState); // Toggle visibility
    };

    return (
        <div className="navbar">
            <div className="nav-icons">
                <FaBell className="icon" />
                <FaQuestionCircle className="icon" />
                <FaCog className="icon" />
                <FaUser className="icon" onClick={handleIconClick} />
                {/* Dropdown menu */}
                {isMenuVisible && (
                    <Menu className="dropdown-menu">
                        {auth.isAuthenticated ? <MenuItem>Log out</MenuItem> : <MenuItem>Log in</MenuItem>}
                    </Menu>
                )}
            </div>
        </div>
    );
};

export default Navbar;
