import React from "react";

import { Box, Stack, Typography } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorageIcon from "@mui/icons-material/Storage";

const CheckboxLabel = ({ property, disabled, input }: { property: string; disabled: boolean; input: boolean }) => {
    return (
        <Stack spacing={0} direction="column">
            {disabled && (
                <CheckCircleIcon
                    sx={{
                        position: "absolute",
                        top: "50%",
                        right: "5px",
                        color: "#EF6C00",
                        transform: "translate(0, -50%)",
                        fontSize: "20px"
                    }}
                />
            )}
            <Stack direction="row" spacing={1} alignItems="center">
                <Box
                    sx={{
                        p: "1px",
                        height: "20px",
                        width: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        borderRadius: "3px",
                        backgroundColor: input ? "#007DFF" : "#AB47BC"
                    }}
                >
                    <StorageIcon
                        sx={{
                            color: "white",
                            fontSize: "16px"
                        }}
                    />
                </Box>
                <Typography level="body-sm">{property}</Typography>
            </Stack>
        </Stack>
    );
};

export default CheckboxLabel;
