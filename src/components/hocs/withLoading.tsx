import React from "react";

import { Box, CircularProgress } from "@mui/joy";

export default function withLoading<T>(Component: React.FC<T>) {
    return function WithLoadingComponent(props: T & { isLoading: boolean }) {
        const { isLoading } = props;
        if (isLoading) {
            return (
                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                    <CircularProgress />
                </Box>
            );
        }
        return <Component {...props} />;
    };
}
