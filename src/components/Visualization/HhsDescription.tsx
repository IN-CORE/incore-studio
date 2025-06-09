import * as React from "react";
import { Box, Typography, Table, Sheet } from "@mui/joy";

interface HhsInfo {
    tableTitle: string;
    rows: Record<string, string>;
}

export const hhsInfo: HhsInfo = {
    tableTitle: "Recovery Stages",
    rows: {
        "Stage 1": "Emergency shelter.",
        "Stage 2":
            "Temporary shelter, which can consist of staying with friends or family, staying at a hotel or motel.",
        "Stage 3":
            "Temporary housing, which can consist of staying with friends or family, staying in a rental unit, staying in a FEMA-funded mobile home.",
        "Stage 4":
            "Permanent housing, which can consist of staying in a rental unit, staying in a mobile home, or staying in a site-built home.",
        "Stage 5":
            "Failure to reach permanent housing, which can occur from languishing in unstable housing or becoming homeless."
    }
};

export const HhsDescription: React.FC = () => {
    return (
        <Box>
            <Box sx={{ marginBottom: 3 }}>
                <Typography level="title-sm" sx={{ color: "primary.700", fontWeight: 500 }}>
                    {hhsInfo.tableTitle}
                </Typography>
                <Sheet variant="outlined" sx={{ mt: 1 }}>
                    <Table size="sm" aria-label="hhs description">
                        <tbody>
                            {Object.entries(hhsInfo.rows).map(([key, value]) => (
                                <tr key={key}>
                                    <td
                                        style={{
                                            textAlign: "center",
                                            border: "1px solid #FFFFFF",
                                            backgroundColor: "#EAEEFF",
                                            width: "30%"
                                        }}
                                    >
                                        {key}
                                    </td>
                                    <td style={{ textAlign: "left", border: "1px solid #FFFFFF", width: "70%" }}>
                                        {value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Sheet>
            </Box>
        </Box>
    );
};
