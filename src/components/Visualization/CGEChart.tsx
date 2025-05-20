import React from "react";
import { Box, Grid, Typography, Select, Option } from "@mui/joy";
import { CGEBarChart } from "@app/components/Visualization/CGEBarChart";
import { CGEResultsTable } from "@app/components/Visualization/CGEResultsTable";

interface CGEDataProps {
    cgeDomesticSupplyContent: CGEChartData;
    cgeEmploymentContent: CGEChartData;
    cgeHouseholdIncomeContent: CGEChartData;
}

export const CGEChart: React.FC<CGEDataProps> = ({
    cgeDomesticSupplyContent,
    cgeEmploymentContent,
    cgeHouseholdIncomeContent
}) => {
    const [selectedView, setSelectedView] = React.useState<string>("Total Household Income");
    // TODO: leave region out for now
    // const [region, setRegion] = React.useState<string | null>(null);

    return (
        <>
            <Box mb={4}>
                <Typography level="h3" sx={{ mb: 2 }}>
                    CGE Results
                </Typography>
                <Select value={selectedView} onChange={(_, value) => value && setSelectedView(value)}>
                    <Option value="Total Household Income">Total Household Income</Option>
                    <Option value="Domestic Supply">Domestic Supply</Option>
                    <Option value="Employment">Employment</Option>
                </Select>
            </Box>

            <Grid container spacing={4}>
                <Grid xs={12} md={6}>
                    <Typography level="h4" sx={{ mb: 2 }}>
                        {selectedView} Chart
                    </Typography>
                    {selectedView === "Total Household Income" && (
                        <CGEBarChart
                            data={cgeHouseholdIncomeContent}
                            xAxisLegend="Million of $"
                            yAxisLegend="Household Groups"
                            title="Total Household Income"
                            height="25em"
                        />
                    )}
                    {selectedView === "Domestic Supply" && (
                        <CGEBarChart
                            data={cgeDomesticSupplyContent}
                            xAxisLegend="Million of $"
                            yAxisLegend="Sectors"
                            title="Domestic Supply"
                            height="25em"
                        />
                    )}
                    {selectedView === "Employment" && (
                        <CGEBarChart
                            data={cgeEmploymentContent}
                            title="Employment"
                            height="25em"
                            xAxisLegend="# of workers"
                            yAxisLegend="Sectors"
                        />
                    )}
                </Grid>

                <Grid xs={12} md={6}>
                    <Typography level="h4" sx={{ mb: 2 }}>
                        {selectedView} Table
                    </Typography>
                    {selectedView === "Total Household Income" && (
                        <CGEResultsTable resultsJson={cgeHouseholdIncomeContent} />
                    )}
                    {selectedView === "Domestic Supply" && <CGEResultsTable resultsJson={cgeDomesticSupplyContent} />}
                    {selectedView === "Employment" && <CGEResultsTable resultsJson={cgeEmploymentContent} />}
                </Grid>
            </Grid>
        </>
    );
};
