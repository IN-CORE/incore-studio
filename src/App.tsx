import React, { StrictMode, Suspense, FC, useEffect } from "react";
// eslint-disable-next-line import/no-unresolved
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CssVarsProvider } from "@mui/joy/styles";
import { AuthProvider, useAuth } from "react-oidc-context";

import CssBaseline from "@mui/joy/CssBaseline";
import "@fontsource/inter";
import "@xyflow/react/dist/style.css";

import config from "@app/app.config";
import { Provider } from "react-redux";
import routes from "./routes";
import { theme } from "./theme";

import Loading from "./components/Loading";
import "./styles/main.scss";

import store from "./store";

console.log("API_SERVER", process.env.INCORE_REMOTE_HOSTNAME, config.hostname, location.pathname, location.origin);

const oidcConfig = {
    authority: config.keycloakConfig.authority,
    client_id: config.keycloakConfig.client_id,
    redirect_uri: `${location.origin}${location.pathname}`
};

const App: FC = () => {
    const auth = useAuth();

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
            <Router basename="studio">
                <CssVarsProvider theme={theme}>
                    <CssBaseline />
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            {Object.entries(routes).map(([path, props]) => (
                                <Route key={path} path={path} {...props} />
                            ))}
                        </Routes>
                    </Suspense>
                </CssVarsProvider>
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
