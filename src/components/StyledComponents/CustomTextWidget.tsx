import { Box, Typography, Textarea } from "@mui/joy";
import React from "react";

interface CustomTextInputProps {
    schema: {
        title: string;
        required?: boolean;
    };
    value: string;
    onChange: (value: string) => void;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({ schema, value, onChange }) => {
    return (
        <Box sx={{ marginTop: "10px" }}>
            <Typography className={schema.required ? "required-field" : ""}>{schema.title}</Typography>
            <Textarea value={value} variant="outlined" onChange={(e) => onChange(e.target.value)} />
        </Box>
    );
};
