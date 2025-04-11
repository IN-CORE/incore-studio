import React, { StrictMode, Suspense, FC, useEffect } from "react";
// eslint-disable-next-line import/no-unresolved
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, useAuth } from "react-oidc-context";

import "@fontsource/inter";
import "@xyflow/react/dist/style.css";

import config from "@app/app.config";
import routes from "@app/routes";
import { theme as joyTheme } from "@app/theme";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { getDependencyGraph } from "@app/reducer/workflowSlice";
import Navbar from "@app/components/Navbar";

import Loading from "@app/components/Loading";
import "@app/styles/main.scss";

import store from "@app/store";

// Mui and Joy theme side by side
import { CssVarsProvider as JoyCssVarsProvider } from "@mui/joy/styles";
import {
    ThemeProvider as MaterialThemeProvider,
    THEME_ID as MATERIAL_THEME_ID,
    createTheme as muiCreateTheme
} from "@mui/material/styles";
// Minimal MUI theme (empty but valid)
const materialTheme = muiCreateTheme({
    typography: {}, // No typography styles
    palette: {}, // No color styles
    components: {}, // No component styles
    colorSchemes: {} // No color schemes
});

const basename = process.env.NODE_ENV === "production" ? "/studio" : "";

const oidcConfig = {
    authority: config.keycloakConfig.authority,
    client_id: config.keycloakConfig.client_id,
    redirect_uri: `${location.origin}${basename}/`
};

const App: FC = () => {
    const auth = useAuth();
    const appDispatch = useAppDispatch();
    const dependencyGraph = useAppSelector((state) => state.workflow.dependencyGraph);
    // Create a new QueryClient instance
    const queryClient = new QueryClient();

    useEffect(() => {
        if (dependencyGraph === null) {
            appDispatch(getDependencyGraph());
        }
    }, []);

    useEffect(() => {
        if (auth.isLoading) return; // Do nothing while loading

        if (!auth.isAuthenticated) {
            auth.signinRedirect().catch((error) => {
                console.error("Login error:", error);
            });
        }
    }, [auth.isLoading, auth.isAuthenticated]);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Oops... {auth.error.message}</div>;
    }

    return (
        <StrictMode>
            <Router basename={basename}>
                <MaterialThemeProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
                    <JoyCssVarsProvider theme={joyTheme}>
                        <QueryClientProvider client={queryClient}>
                            <Navbar />
                            <Suspense fallback={<Loading />}>
                                <Routes>
                                    {Object.entries(routes).map(([path, props]) => (
                                        <Route key={path} path={path} {...props} />
                                    ))}
                                </Routes>
                            </Suspense>
                        </QueryClientProvider>
                    </JoyCssVarsProvider>
                </MaterialThemeProvider>
            </Router>
        </StrictMode>
    );
};

const rootEl = document.getElementById("root");
if (rootEl) {
    createRoot(rootEl).render(
        <Provider store={store}>
            <AuthProvider {...oidcConfig}>
                <App />
            </AuthProvider>
        </Provider>
    );
}

export default App;
