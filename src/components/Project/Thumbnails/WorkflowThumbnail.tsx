import React from "react";
import WorkflowIcon from "/public/workflow.png";

export const WorkflowThumbnail = () => {
    return (
        <div
            style={{
                height: 160,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
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
