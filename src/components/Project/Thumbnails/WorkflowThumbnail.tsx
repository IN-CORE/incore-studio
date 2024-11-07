import React from "react";
import WorkflowIcon from "@app/public/workflow.png";

export const WorkflowThumbnail = () => {
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: 160,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20
            }}
        >
            <img
                src={WorkflowIcon}
                alt="workflow"
                style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
            />
        </div>
    );
};
