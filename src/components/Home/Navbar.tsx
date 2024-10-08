import React from "react";
import { FaBell, FaQuestionCircle, FaCog } from "react-icons/fa";
// eslint-disable-next-line import/no-unresolved
import { useAuth } from "react-oidc-context";
// eslint-disable-next-line import/no-unresolved

// Define getCurrUserInfo in the same file
const Navbar = () => {
    const auth = useAuth();

    return (
        <div className="navbar">
            <div className="nav-icons">
                <FaBell className="icon" />
                <FaQuestionCircle className="icon" />
                <FaCog className="icon" />
            </div>
            {auth.isAuthenticated ? (
                <div className="profile">
                    <p>Log in</p>
                </div>
            ) : (
                <p>Not logged in</p>
            )}
        </div>
    );
};

export default Navbar;
