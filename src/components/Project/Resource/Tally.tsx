import React from "react";

import { Box, Divider, Sheet, Stack, Typography } from "@mui/joy";

interface TallyProps {
    title: string;
    tallyList: { label: string; value: string }[];
    totalCount?: number;
}

const Tally: React.FC<TallyProps> = ({ title, tallyList, totalCount }) => {
    return (
        <Sheet sx={{ p: 2, textAlign: "center", width: "100%" }} variant="outlined">
            <Typography level="title-lg" sx={{ mb: 2 }}>
                {`${title}${totalCount ? `: ${totalCount}` : ""}`}
            </Typography>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                divider={<Divider orientation="vertical" />}
                sx={{ width: "100%" }}
            >
                {tallyList.map((tally, index) => (
                    <Box key={index} sx={{ width: "100%" }}>
                        <Typography level="title-md">{tally.label}</Typography>
                        <Typography level="body-md">{tally.value}</Typography>
                    </Box>
                ))}
            </Stack>
        </Sheet>
    );
};

export default Tally;
