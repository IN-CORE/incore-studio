import React, { useState } from "react";
import { Box, Grid } from "@mui/joy";

import { HhsBarChart } from "@app/components/Visualization/HhsBarChart";
import { HhsSlider } from "@app/components/Visualization/HhsSlider";
import { HhsDescription } from "@app/components/Visualization/HhsDescription";

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
        <Grid container spacing={3}>
            <Grid xs={12} sm={12} md={8} lg={8} xl={8}>
                <Box width="80%" mx="auto" mb={3}>
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
                <HhsBarChart
                    data={HHSBarChartContent[time]}
                    height="25em"
                    width="100%"
                    title="Housing Recovery Stage"
                />
            </Grid>
            <Grid xs={12} sm={12} md={4} lg={4} xl={4}>
                <HhsDescription />
            </Grid>
        </Grid>
    );
};
