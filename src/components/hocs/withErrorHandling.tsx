import React from "react";

import { Alert, Box } from "@mui/joy";

export default function withErrorHandling<T>(Component: React.FC<T>) {
    return function WithErrorHandlingComponent(props: T & { error: string | null }) {
        const { error } = props;
        if (error !== null) {
            return (
                <Box sx={{ my: "10px" }}>
                    <Alert variant="soft" color={error.includes("Failed") ? "danger" : "warning"}>
                        {error}
                    </Alert>
                </Box>
            );
        }
        return <Component {...props} />;
    };
}
