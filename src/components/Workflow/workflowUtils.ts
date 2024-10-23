import type { Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import type { AppNode } from "./nodes";

export const readNodesAndEdgesFromWorkflowFile = (
    workflowFile: DatawolfWorkflowFile
): { nodes: AppNode[]; edges: Edge[] } => {
    let nodes: AppNode[] = [];
    let edges: Edge[] = [];

    let sourceNodeLookup: { [key: string]: string } = {};
    let targetNodeLookup: { [key: string]: string } = {};
    if (workflowFile.steps.length > 0) {
        workflowFile.steps.forEach((step) => {
            // First create analysis node
            nodes.push({
                id: step.id,
                type: "analysis",
                position: { x: 0, y: 0 },
                data: {
                    label: step.title,
                    stepData: step
                }
            });

            // Then create input nodes and add their corresponding edges to the analysis node
            // for Dataset inputs or chained inputs
            step.tool.inputs.forEach((input) => {
                nodes.push({
                    id: input.id,
                    type: "analysis-input",
                    position: { x: 0, y: 0 },
                    data: {
                        label: input.title,
                        inputData: input,
                        type: "dataset"
                    }
                });
                edges.push({
                    id: `${input.id}->${step.id}`,
                    source: input.id,
                    target: step.id,
                    type: "step",
                    style: { stroke: "#000000" },
                    markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                });

                targetNodeLookup[input.dataId] = input.id;
            });

            // Now add hazard node and its edge to the analysis node if hazard_type or hazard_id is present in tool parameters
            if (step.tool.parameters.some((param) => param.title === "hazard_type" || param.title === "hazard_id")) {
                nodes.push({
                    id: `${step.id}_hazard`,
                    type: "analysis-input",
                    position: { x: 0, y: 0 },
                    data: {
                        label: "Hazard",
                        inputData: { id: `${step.id}_hazard`, title: "Hazard" },
                        type: "hazard"
                    }
                });
                edges.push({
                    id: `${step.id}_hazard->${step.id}`,
                    source: `${step.id}_hazard`,
                    target: step.id,
                    type: "step",
                    style: { stroke: "#000000" },
                    markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                });
            }

            // Now add dfr3 mapping set node and its edge to the analysis node if dfr3_mapping_set is present in tool parameters
            if (step.tool.parameters.some((param) => param.title === "dfr3_mapping_set")) {
                nodes.push({
                    id: `${step.id}_dfr3_mapping_set`,
                    type: "analysis-input",
                    position: { x: 0, y: 0 },
                    data: {
                        label: "DFR3 Mapping Set",
                        inputData: { id: `${step.id}_dfr3_mapping_set`, title: "DFR3 Mapping Set" },
                        type: "dfr3_mapping"
                    }
                });
                edges.push({
                    id: `${step.id}_dfr3_mapping_set->${step.id}`,
                    source: `${step.id}_dfr3_mapping_set`,
                    target: step.id,
                    type: "step",
                    style: { stroke: "#000000" },
                    markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                });
            }

            // Finally create output nodes and add their corresponding edges to the analysis node
            step.tool.outputs.forEach((output) => {
                if (output.title !== "stdout") {
                    nodes.push({
                        id: output.id,
                        type: "analysis-output",
                        position: { x: 0, y: 0 },
                        data: {
                            label: output.title,
                            outputData: output
                        }
                    });
                    edges.push({
                        id: `${step.id}->${output.id}`,
                        source: step.id,
                        target: output.id,
                        type: "step",
                        style: { stroke: "#000000" },
                        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                    });

                    sourceNodeLookup[step.outputs[output.dataId]] = output.id;
                }
            });
        });

        workflowFile.steps.forEach((step) => {
            // Add edges for chained inputs
            Object.entries(step.inputs).forEach(([targetInterId, sourceInterId]) => {
                if (sourceInterId !== null && targetInterId !== null) {
                    edges.push({
                        id: `${sourceNodeLookup[sourceInterId]}->${targetNodeLookup[targetInterId]}`,
                        source: sourceNodeLookup[sourceInterId],
                        target: targetNodeLookup[targetInterId],
                        type: "step",
                        style: { stroke: "#000000" },
                        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                    });
                }
            });
        });

        return { nodes, edges };
    }
    console.error("No steps found in the workflow file.");
    return { nodes, edges };
};
