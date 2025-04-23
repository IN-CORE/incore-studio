import React, { useEffect, useState } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { Box, Grid, Option, Select, Typography, Sheet } from "@mui/joy";

import { guessDataType } from "@app/utils";

// VegaLite supports specific mark types
type MarkType = "area" | "bar" | "circle" | "line" | "point" | "rect" | "rule" | "square" | "tick";

const allowedTypes = ["quantitative", "temporal", "ordinal", "nominal"] as const;
type EncodingType = (typeof allowedTypes)[number];

interface CSVVegaChartProps {
    data: Record<string, any>[];
}

export const CSVVegaChart: React.FC<CSVVegaChartProps> = ({ data }) => {
    const [mark, setMark] = useState<MarkType>("bar");
    const [availableColumns, setAvailableColumns] = useState<string[]>([]);
    const [xColumn, setXColumn] = useState("");
    const [yColumn, setYColumn] = useState("");
    const [xColumnType, setXColumnType] = useState<EncodingType>("quantitative");
    const [yColumnType, setYColumnType] = useState<EncodingType>("quantitative");

    useEffect(() => {
        if (data?.length > 0) {
            const keys = Object.keys(data[0]);
            setAvailableColumns(keys);
        }
    }, [data]);

    useEffect(() => {
        if (availableColumns.length > 0) {
            const x = availableColumns[0];
            const y = availableColumns[1] || x;

            setXColumn(x);
            setYColumn(y);
            setXColumnType(guessDataType(data[0][x]) as EncodingType);
            setYColumnType(guessDataType(data[0][y]) as EncodingType);
        }
    }, [availableColumns]);

    // Explicitly type the spec as VisualizationSpec
    const spec: VisualizationSpec = {
        mark: {
            type: mark,
            color: "#344563"
        },
        encoding: {
            x: { field: xColumn, type: xColumnType },
            y: { field: yColumn, type: yColumnType }
        },
        data: { name: "table" },
        width: "container",
        height: 500,
        autosize: {
            type: "fit",
            contains: "padding"
        },
        config: {
            view: { stroke: "transparent" } // optional cleanup
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid xs={12} sm={3}>
                <Sheet
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: "sm",
                        backgroundColor: "background.body"
                    }}
                >
                    <Typography level="body-md" mb={2}>
                        Chart Settings
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid xs={12}>
                            <Typography level="body-sm" mb={1}>
                                Plot Type
                            </Typography>
                            <Select value={mark} onChange={(_, val) => setMark((val as MarkType) || "bar")}>
                                <Option value="bar">Bar Chart</Option>
                                <Option value="line">Line Chart</Option>
                                <Option value="point">Scatter Plot</Option>
                                <Option value="area">Area Plot</Option>
                                <Option value="circle">Circle Plot</Option>
                                <Option value="square">Square Plot</Option>
                                <Option value="tick">Tick Plot</Option>
                                <Option value="rule">Rule (Guide Line)</Option>
                                <Option value="rect">Rectangle Plot</Option>
                            </Select>
                        </Grid>

                        <Grid xs={12}>
                            <Typography level="body-sm" mb={1}>
                                X Axis
                            </Typography>
                            <Select value={xColumn} onChange={(_, val) => setXColumn(val || "")}>
                                {availableColumns.map((col) => (
                                    <Option key={col} value={col}>
                                        {col}
                                    </Option>
                                ))}
                            </Select>
                        </Grid>

                        <Grid xs={12}>
                            <Typography level="body-sm" mb={1}>
                                X Axis Type
                            </Typography>
                            <Select
                                value={xColumnType}
                                onChange={(_, val) => setXColumnType((val as EncodingType) || "quantitative")}
                            >
                                {allowedTypes.map((type) => (
                                    <Option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Option>
                                ))}
                            </Select>
                        </Grid>

                        <Grid xs={12}>
                            <Typography level="body-sm" mb={1}>
                                Y Axis
                            </Typography>
                            <Select value={yColumn} onChange={(_, val) => setYColumn(val || "")}>
                                {availableColumns.map((col) => (
                                    <Option key={col} value={col}>
                                        {col}
                                    </Option>
                                ))}
                            </Select>
                        </Grid>

                        <Grid xs={12}>
                            <Typography level="body-sm" mb={1}>
                                Y Axis Type
                            </Typography>
                            <Select
                                value={yColumnType}
                                onChange={(_, val) => setYColumnType((val as EncodingType) || "quantitative")}
                            >
                                {allowedTypes.map((type) => (
                                    <Option key={type} value={type}>
                                        {type}
                                    </Option>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                </Sheet>
            </Grid>

            <Grid xs={12} sm={9}>
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%", flexGrow: 1, height: "100%" }}>
                    <VegaLite spec={spec} data={{ table: data }} />
                </Box>
            </Grid>
        </Grid>
    );
};
