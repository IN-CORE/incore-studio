import React from "react";

import { Box, Typography, List, ListItem, Stack } from "@mui/joy";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

interface CompatibleTypeTooltipProps {
    compatibleTypes: string[];
}

const CompatibleTypeTooltip: React.FC<CompatibleTypeTooltipProps> = ({ compatibleTypes }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                maxWidth: 320,
                justifyContent: "center",
                p: 1
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CheckRoundedIcon color="success" />
                <Typography sx={{ fontSize: "md" }}>Compatible Datatypes</Typography>
            </Stack>
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    width: "100%",
                    maxHeight: "300px",
                    overflow: "auto",
                    scrollbarWidth: "thin"
                }}
            >
                <List marker="disc">
                    {compatibleTypes.map((type) => {
                        return <ListItem key={type}>{type}</ListItem>;
                    })}
                </List>
            </Box>
        </Box>
    );
};

export default CompatibleTypeTooltip;
