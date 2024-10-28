import React from "react";

import { Stack, Typography } from "@mui/joy";

const CheckboxLabel = ({ name, from, to, disabled }: { name: string; from: string; to: string; disabled: boolean }) => {
    return (
        <Stack spacing={0} direction="column">
            <Typography level="body-md" sx={{ color: disabled ? "#42526EB2" : "#172B4D" }}>
                {name}
            </Typography>
            <Typography level="body-sm">{`${from} -> ${to}`}</Typography>
        </Stack>
    );
};

export default CheckboxLabel;
