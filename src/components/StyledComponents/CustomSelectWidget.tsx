import React from "react";
import { Box, Typography, Select, Option } from "@mui/joy";

interface CustomSelectWidgetProps {
    schema: {
        title: string;
        enum: string[];
        enumNames?: string[];
    };
    onChange: (value: string) => void;
}

export const CustomSelectWidget: React.FC<CustomSelectWidgetProps> = ({ schema, onChange }) => {
    return (
        <Box>
            <Typography>{schema.title}</Typography>
            <Select
                id="select"
                variant="outlined"
                defaultValue={schema.enum[0]}
                onChange={(_, value) => {
                    if (value) onChange(value);
                }}
            >
                {schema.enum.map((option, i) => (
                    <Option value={option} key={option}>
                        {schema.enumNames ? schema.enumNames[i] : option}
                    </Option>
                ))}
            </Select>
        </Box>
    );
};
