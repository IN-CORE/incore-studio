import React, { useState } from "react";
import { Box, Typography, Table, RadioGroup, Radio, FormControl, FormLabel, Sheet } from "@mui/joy";
import { round } from "@app/utils";

interface DislocationRecord {
    household_characteristics: string;
    household_dislocated: number;
    total_households: number;
    percent_household_dislocated: number;
}

interface HuaResultsTableProps {
    resultsJson: Record<string, DislocationRecord[]>;
    isMetrics?: boolean;
}

const filterOptions = [
    { value: "tenure", label: "by Tenure" },
    { value: "race", label: "by Race / Ethnicity" },
    { value: "income", label: "by Household Income Level" },
    { value: "housingType", label: "by Housing Type" },
    { value: "disability", label: "by Disability" }
];

export const HuaResultsTable: React.FC<HuaResultsTableProps> = ({ resultsJson, isMetrics = false }) => {
    const [huaBy, setHuaBy] = useState("tenure");

    const headers = [
        "HOUSEHOLD CHARACTERISTICS",
        "# HOUSEHOLDS DISLOCATED",
        "TOTAL HOUSEHOLDS",
        "% HOUSEHOLDS DISLOCATED"
    ];

    const currentData = resultsJson[huaBy];

    return (
        <Box>
            <FormControl orientation="vertical" sx={{ mb: 2 }}>
                <FormLabel
                    sx={{
                        fontSize: "16px",
                        fontWeight: 500,
                        letterSpacing: "0.6px",
                        color: "#2E384D",
                        mb: 1
                    }}
                >
                    Household Dislocation
                </FormLabel>
                <RadioGroup
                    orientation="horizontal"
                    name="radioGroup"
                    value={huaBy}
                    onChange={(e) => setHuaBy(e.target.value)}
                >
                    {filterOptions.map((option) => (
                        <Radio
                            key={option.value}
                            value={option.value}
                            label={<Typography level="body-sm">{option.label}</Typography>}
                            size="sm"
                            color="primary"
                        />
                    ))}
                </RadioGroup>
            </FormControl>

            {currentData ? (
                <Sheet
                    variant="outlined"
                    sx={{
                        overflow: "auto",
                        maxHeight: 400,
                        borderRadius: "sm"
                    }}
                >
                    <Table size="sm" stickyHeader>
                        <thead>
                            <tr>
                                {headers.map((header, idx) => (
                                    <th
                                        key={header}
                                        style={{
                                            backgroundColor: idx === 0 ? "#F8F9FF" : "rgba(234, 238, 255, 0.6)",
                                            fontWeight: 600,
                                            fontSize: 12,
                                            textAlign: "center",
                                            letterSpacing: idx === 0 ? "inherit" : "1.13px",
                                            minWidth: isMetrics ? 200 : undefined
                                        }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((row, idx) => (
                                <tr key={row.household_characteristics}>
                                    <td
                                        style={{
                                            backgroundColor:
                                                idx === currentData.length - 1
                                                    ? "rgba(234, 238, 255, 0.6)"
                                                    : "rgba(234, 238, 255, 1)",
                                            fontWeight: 500,
                                            fontSize: 12
                                        }}
                                    >
                                        {row.household_characteristics}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: "#FEEFF1",
                                            textAlign: "center"
                                        }}
                                    >
                                        {row.household_dislocated.toLocaleString("en-US")}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        {row.total_households.toLocaleString("en-US")}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        {round(row.percent_household_dislocated, 1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Sheet>
            ) : (
                <Typography level="body-sm" sx={{ mt: 2 }}>
                    No data available for the selected category.
                </Typography>
            )}
        </Box>
    );
};
