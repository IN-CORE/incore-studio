import React from "react";

import { Stack, Typography } from "@mui/joy";
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
                <StorageIcon sx={{ color: input ? "#007DFF" : "#AB47BC" }} />
                <Typography level="body-sm">{property}</Typography>
            </Stack>
        </Stack>
    );
};

export default CheckboxLabel;
