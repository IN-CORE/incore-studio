import React, { useState } from "react";
import { Box, Typography } from "@mui/joy";

import { HhsBarChart } from "@app/components/Visualization/HhsBarChart";
import { HhsSlider } from "@app/components/Visualization/HhsSlider";

interface HHSProps {
    HHSBarChartContent: Record<string, number[]>;
}

export const HHS: React.FC<HHSProps> = ({ HHSBarChartContent }) => {
    const marks = Object.keys(HHSBarChartContent).map((key) => ({
        value: parseInt(key, 10),
        label: `${parseInt(key, 10) - 1}`
    }));

    const [time, setTime] = useState<string>(marks[0]?.value.toString() ?? "1");

    return (
        <>
            <Box width="80%" mx="auto" mb={3}>
                <Typography level="body-sm" gutterBottom>
                    Months after the disaster
                </Typography>
                <HhsSlider
                    marks={marks}
                    value={parseInt(time, 10)}
                    handleChange={(_, newValue) => {
                        if (typeof newValue === "number") {
                            setTime(String(newValue));
                        }
                    }}
                />
            </Box>
            <HhsBarChart data={HHSBarChartContent[time]} height="25em" width="100%" title="Housing Recovery Stage" />
        </>
    );
};
