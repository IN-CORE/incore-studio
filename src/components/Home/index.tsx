import React from "react";
import {Button, Box} from "@mui/joy";
import {useAuth} from "react-oidc-context";

import Workflow from "../Workflow";


const Home = (): JSX.Element => {
    const auth = useAuth();

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Oops... {auth.error.message}</div>;
    }

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

    return <Button onClick={auth.signinRedirect}>Log in</Button>;
};

export default Home;
