import * as React from "react";
import LinearProgress from "@mui/joy/LinearProgress";
import Typography from "@mui/joy/Typography";
import { getStatusColor } from "@app/utils";

interface ProgressProps {
    status: string;
}

export const Progress = (props: ProgressProps): JSX.Element => {
    const { status } = props;
    return (
        <LinearProgress
            variant="outlined"
            color={getStatusColor(status)}
            size="sm"
            thickness={24}
            sx={{
                "--LinearProgress-radius": "20px",
                "--LinearProgress-thickness": "24px"
            }}
        >
            <Typography level="body-xs" textColor="common.white" sx={{ fontWeight: "xl", mixBlendMode: "difference" }}>
                {`${status}...` ?? "PENDING..."}
            </Typography>
        </LinearProgress>
    );
};
