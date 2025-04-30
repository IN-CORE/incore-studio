import { FormLabel, Select, Option } from "@mui/joy";
import React, { useState } from "react";
import config from "@app/app.config";

interface StyledSelectorProps {
    styleName: string;
    setStyleName: (styleName: string) => void;
}

export const StyledSelector = (props: StyledSelectorProps) => {
    const { styleName, setStyleName } = props;
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <>
            <FormLabel>Style Category</FormLabel>
            <Select
                placeholder="Select a style category"
                value={selectedCategory}
                onChange={(_: any, newCategory: string | null) => {
                    setSelectedCategory(newCategory);
                    setStyleName(""); // Reset style when category changes
                }}
            >
                {Object.keys(config.styles).map((category) => (
                    <Option key={category} value={category} sx={{ textTransform: "capitalize" }}>
                        {category}
                    </Option>
                ))}
            </Select>

            {selectedCategory && (
                <>
                    <FormLabel sx={{ mt: 2 }}>Select a Style</FormLabel>
                    <Select
                        placeholder="Select a style"
                        value={styleName}
                        onChange={(_: any, newValue: string | null) => {
                            setStyleName(newValue || "");
                        }}
                    >
                        {(config.styles as Record<string, string[]>)[selectedCategory].map((style: string) => (
                            <Option key={style} value={style}>
                                {style}
                            </Option>
                        ))}
                    </Select>
                </>
            )}
        </>
    );
};
