import React from "react";
import { Box, Grid } from "@mui/joy";
import { PopDislocationTable } from "@app/components/Visualization/PopDislocationTable";
import { HuaResultsTable } from "@app/components/Visualization/HuaResultsTable";

interface PopDislocationProps {
    totalDislTableContent: {
        household_dislocation_in_total?: any;
        population_dislocation_in_total?: any;
    };
    dislocationByRaceContent: any;
    dislocationByTenureContent: any;
    dislocationByIncomeContent: any;
    dislocationByHousingTypeContent: any;
}

export const PopDislocation: React.FC<PopDislocationProps> = ({
    totalDislTableContent,
    dislocationByRaceContent,
    dislocationByTenureContent,
    dislocationByIncomeContent,
    dislocationByHousingTypeContent
}) => {
    return (
        <Box sx={{ px: 4, py: 5 }}>
            <Grid container spacing={4}>
                <Grid xs={12} md={5}>
                    {totalDislTableContent?.household_dislocation_in_total && (
                        <PopDislocationTable
                            resultsJson={totalDislTableContent.household_dislocation_in_total}
                            headers={["HOUSEHOLD", "% of HOUSEHOLD"]}
                            title="Household Dislocation - in Total"
                        />
                    )}
                    {totalDislTableContent?.population_dislocation_in_total && (
                        <PopDislocationTable
                            resultsJson={totalDislTableContent.population_dislocation_in_total}
                            headers={["POPULATION", "% of POPULATION"]}
                            title="Population Dislocation - in Total"
                        />
                    )}
                </Grid>
                <Grid xs={12} md={7}>
                    {dislocationByIncomeContent &&
                        dislocationByRaceContent &&
                        dislocationByTenureContent &&
                        dislocationByHousingTypeContent && (
                            <HuaResultsTable
                                resultsJson={{
                                    income: dislocationByIncomeContent,
                                    race: dislocationByRaceContent,
                                    tenure: dislocationByTenureContent,
                                    housingType: dislocationByHousingTypeContent
                                }}
                            />
                        )}
                </Grid>
            </Grid>
        </Box>
    );
};
