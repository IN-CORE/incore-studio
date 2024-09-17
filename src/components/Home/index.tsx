import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Box} from "@mui/joy";
import {useAuth} from "react-oidc-context";

import Workflow from "../Workflow";


const Home = (): JSX.Element => {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) {
            // Remove query parameters from URL
            navigate(window.location.pathname, { replace: true });
        }
    }, [auth.isAuthenticated, navigate]);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Oops... {auth.error.message}</div>;
    }

    const handleLogin = () => {
        auth.signinRedirect().catch(error => {
            console.error('Login error:', error);
        });
    };

    if (auth.isAuthenticated) {
        return (
            <Box sx={{display: "flex", flexDirection: "column", height: "100vh"}}>
                <Box sx={{flexShrink: 0}}>
                    <h1>Home</h1>
                </Box>
                <Box sx={{flexGrow: 1, overflow: "auto"}}>
                    <Workflow/>
                </Box>
            </Box>
        );
    }

    return <Button onClick={handleLogin}>Log in</Button>;
};

export default Home;
