import React, { useEffect, useState } from "react";
import { VegaLite } from "react-vega";
import { Box, Container, Grid, Option, Select, Typography, Sheet } from "@mui/joy";

import { guessDataType } from "@app/utils";
import { theme } from "@app/theme";
import { GridRowsProp } from "@mui/x-data-grid";

const allowedTypes = ["quantitative", "temporal", "ordinal", "nominal"];

interface CSVVegaChartProps {
    data: GridRowsProp;
}

export const CSVVegaChart: React.FC<CSVVegaChartProps> = ({ data }) => {
    const [mark, setMark] = useState("bar");
    const [availableColumns, setAvailableColumns] = useState<string[]>([]);
    const [xColumn, setXColumn] = useState("");
    const [yColumn, setYColumn] = useState("");
    const [xColumnType, setXColumnType] = useState(allowedTypes[0]);
    const [yColumnType, setYColumnType] = useState(allowedTypes[0]);

    // Extract available columns from data
    useEffect(() => {
        if (data?.length > 0) {
            const keys = Object.keys(data[0]);
            setAvailableColumns(keys);
        }
    }, [data]);

    // Auto-select first two columns and guess their types
    useEffect(() => {
        if (availableColumns.length > 0) {
            const x = availableColumns[0];
            const y = availableColumns[1] || x;

            setXColumn(x);
            setYColumn(y);
            setXColumnType(guessDataType(data[0][x]));
            setYColumnType(guessDataType(data[0][y]));
        }
    }, [availableColumns]);

    const spec = {
        mark: { type: mark, color: theme.palette.primary[700] },
        encoding: {
            x: { field: xColumn, type: xColumnType },
            y: { field: yColumn, type: yColumnType }
        },
        data: { name: "table" }
    };

    return (
        <Box>
            <Sheet
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: "sm",
                    backgroundColor: "background.body",
                    mb: 4
                }}
            >
                <Typography level="body-md" mb={2}>
                    Chart Settings
                </Typography>

                <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                        <Typography level="body-sm" mb={1}>
                            Plot Type
                        </Typography>
                        <Select value={mark} onChange={(_, val) => setMark(val || "bar")}>
                            <Option value="bar">Bar Chart</Option>
                            <Option value="point">Scatter Plot</Option>
                            <Option value="line">Line Chart</Option>
                        </Select>
                    </Grid>

                    <Grid xs={12} sm={6}>
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

                    <Grid xs={12} sm={6}>
                        <Typography level="body-sm" mb={1}>
                            X Axis Type
                        </Typography>
                        <Select value={xColumnType} onChange={(_, val) => setXColumnType(val || allowedTypes[0])}>
                            {allowedTypes.map((type) => (
                                <Option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Option>
                            ))}
                        </Select>
                    </Grid>

                    <Grid xs={12} sm={6}>
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

                    <Grid xs={12} sm={6}>
                        <Typography level="body-sm" mb={1}>
                            Y Axis Type
                        </Typography>
                        <Select value={yColumnType} onChange={(_, val) => setYColumnType(val || allowedTypes[0])}>
                            {allowedTypes.map((type) => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    </Grid>
                </Grid>
            </Sheet>

            <Container sx={{ mt: 2 }}>
                <VegaLite spec={spec} data={{ table: data }} />
            </Container>
        </Box>
    );
};
