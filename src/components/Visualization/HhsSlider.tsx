import React from "react";
import { Slider, Typography } from "@mui/joy";

interface HhsSliderProps {
    marks: { value: number; label?: string }[];
    value: number;
    handleChange: (event: Event, value: number | number[]) => void;
}

export const HhsSlider: React.FC<HhsSliderProps> = ({ marks, value, handleChange }) => {
    const min = marks[0]?.value ?? 0;
    const max = marks[marks.length - 1]?.value ?? 100;

    return (
        <>
            <Typography level="body-sm" gutterBottom>
                Months after the disaster
            </Typography>
            <Slider
                step={null}
                defaultValue={min}
                aria-label="Discrete slider"
                valueLabelDisplay="off"
                marks={marks}
                min={min}
                max={max}
                value={value}
                onChange={handleChange}
                track={false}
            />
        </>
    );
};
