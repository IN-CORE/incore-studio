import React from "react";

import { Box, Typography, List, ListItem } from "@mui/joy";
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
            <Typography textColor="grey" sx={{ fontSize: "sm" }}>
                Compatible Types for the Input
            </Typography>
            <Box sx={{ display: "flex", gap: 1, width: "100%", mt: 1 }}>
                <CheckRoundedIcon color="success" />
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
