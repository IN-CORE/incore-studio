import React from "react";
import { Box, Typography } from "@mui/joy";

// JSON imports
import cgeDomesticSupplyContent from "@app/components/Visualization/mocks/joplin_cge_outputs_cge_domestic_supply.json";
import cgeEmploymentContent from "@app/components/Visualization/mocks/joplin_cge_outputs_cge_employment.json";
import cgeHouseholdIncomeContent from "@app/components/Visualization/mocks/joplin_cge_outputs_cge_total_household_income.json";
import dislocationByRaceContent from "@app/components/Visualization/mocks/HUA_dislocation_by_race.json";
import dislocationByTenureContent from "@app/components/Visualization/mocks/HUA_dislocation_by_tenure.json";
import dislocationByIncomeContent from "@app/components/Visualization/mocks/HUA_dislocation_by_income.json";
import dislocationByHousingTypeContent from "@app/components/Visualization/mocks/HUA_dislocation_by_housing_type.json";
import totalDislTableContent from "@app/components/Visualization/mocks/HUA_total_dislocation.json";
import HHSBarChartContent from "@app/components/Visualization/mocks/HHS_stage_count.json";

import { PopDislocationTable } from "@app/components/Visualization/PopDislocationTable";
import { HuaResultsTable } from "@app/components/Visualization/HuaResultsTable";
import { CGEBarChart } from "@app/components/Visualization/CGEBarChart";
import { CGEResultsTable } from "@app/components/Visualization/CGEResultsTable";
import { HHS } from "@app/components/Visualization/HHS";

const MockVisualization: React.FC = () => {
    return (
        <Box sx={{ px: 20, py: 10 }}>
            <Typography level="h2" sx={{ mb: 3 }}>
                Mock Visualizations
            </Typography>

            {/* /!* TODO include HHS *!/ */}
            <HHS HHSBarChartContent={HHSBarChartContent} />

            {/* Population Dislocation */}
            <PopDislocationTable
                resultsJson={totalDislTableContent.household_dislocation_in_total}
                headers={["HOUSEHOLD", "% of HOUSEHOLD"]}
                title="Household Dislocation - in Total"
            />

            <PopDislocationTable
                resultsJson={totalDislTableContent.population_dislocation_in_total}
                headers={["POPULATION", "% of POPULATION"]}
                title="Population Dislocation - in Total"
            />

            <HuaResultsTable
                resultsJson={{
                    income: dislocationByIncomeContent,
                    race: dislocationByRaceContent,
                    tenure: dislocationByTenureContent,
                    housingType: dislocationByHousingTypeContent
                }}
            />

            {/* CGE Bar Charts */}
            <CGEBarChart
                data={cgeHouseholdIncomeContent}
                xAxisLegend="Million of $"
                yAxisLegend="Household Groups"
                title="Total Household Income"
                height="25em"
            />
            <CGEBarChart
                data={cgeDomesticSupplyContent}
                xAxisLegend="Million of $"
                yAxisLegend="Sectors"
                title="Domestic Supply"
                height="25em"
            />
            <CGEBarChart
                data={cgeEmploymentContent}
                title="Employment"
                height="25em"
                xAxisLegend="# of workers"
                yAxisLegend="Sectors"
            />

            {/* CGE Results Tables */}
            <CGEResultsTable resultsJson={cgeHouseholdIncomeContent} />
            <CGEResultsTable resultsJson={cgeDomesticSupplyContent} />
            <CGEResultsTable resultsJson={cgeEmploymentContent} />
        </Box>
    );
};

export default MockVisualization;
