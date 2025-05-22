import React from "react";
import { Box, Typography } from "@mui/joy";
import { CGE } from "@app/components/Visualization/CGE";
// import { HHS } from "@app/components/Visualization/HHS";
import { PopDislocation } from "@app/components/Visualization/PopDislocation";

// JSON imports
import domesticSupply from "@app/components/Visualization/mocks/joplin_cge_outputs_cge_domestic_supply.json";
import employment from "@app/components/Visualization/mocks/joplin_cge_outputs_cge_employment.json";
import householdIncome from "@app/components/Visualization/mocks/joplin_cge_outputs_cge_total_household_income.json";
import byRace from "@app/components/Visualization/mocks/HUA_dislocation_by_race.json";
import byTenure from "@app/components/Visualization/mocks/HUA_dislocation_by_tenure.json";
import byIncome from "@app/components/Visualization/mocks/HUA_dislocation_by_income.json";
import byHousingType from "@app/components/Visualization/mocks/HUA_dislocation_by_housing_type.json";
import totalDisl from "@app/components/Visualization/mocks/HUA_total_dislocation.json";

const MockVisualization: React.FC = () => {
    return (
        <Box sx={{ px: 4, py: 4 }}>
            <Typography level="h2" sx={{ mb: 3 }}>
                Mock Visualizations
            </Typography>

            <Box sx={{ mb: 6 }}>
                <CGE
                    cgeDomesticSupplyContent={domesticSupply}
                    cgeEmploymentContent={employment}
                    cgeHouseholdIncomeContent={householdIncome}
                />
            </Box>

            {/* TODO include HHS */}
            {/* <Box sx={{ mb: 6 }}> */}
            {/*    <HHS HHSBarChartContent={hhsContent} /> */}
            {/* </Box> */}

            <Box>
                <PopDislocation
                    totalDislTableContent={totalDisl}
                    dislocationByRaceContent={byRace}
                    dislocationByTenureContent={byTenure}
                    dislocationByIncomeContent={byIncome}
                    dislocationByHousingTypeContent={byHousingType}
                />
            </Box>
        </Box>
    );
};

export default MockVisualization;
