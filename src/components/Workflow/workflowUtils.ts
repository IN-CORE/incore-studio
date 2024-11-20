import type { Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import type {
    AnalysisNode,
    AppNode,
    AnalysisOutputNode,
    AnalysisInputNode,
    NewAnalysisNode,
    SummaryNode
} from "./nodes";
import { v4 as uuidv4 } from "uuid";

export const readNodesAndEdgesFromWorkflowFile = (
    workflowFile: DatawolfWorkflowFile,
    dependencyGraph: DependencyGraph | null
): ReactFlowWorkflow => {
    let nodes: AppNode[] = [];
    let edges: Edge[] = [];

    let sourceNodeLookup: { [key: string]: string } = {};
    let targetNodeLookup: { [key: string]: string[] } = {};
    let mappingUUIDSet: Set<string> = new Set();
    if (workflowFile.steps.length > 0) {
        workflowFile.steps.forEach((step) => {
            // First create analysis node
            nodes.push({
                id: step.id,
                type: "analysis",
                position: { x: 0, y: 0 },
                data: {
                    label: dependencyGraph !== null ? dependencyGraph[step.title].pretty_name : step.title,
                    name: step.title,
                    stepData: step
                }
            });

            // Then create input nodes and add their corresponding edges to the analysis node
            // for Dataset inputs or chained inputs
            step.tool.inputs.forEach((input) => {
                const newId = uuidv4();
                nodes.push({
                    // id: input.id,
                    id: newId,
                    type: "analysis-input",
                    position: { x: 0, y: 0 },
                    data: {
                        label: input.title,
                        inputData: input,
                        type: "dataset",
                        stepID: step.id,
                        analysisName: step.title
                    }
                });
                edges.push({
                    id: `${newId}->${step.id}`,
                    source: newId,
                    target: step.id,
                    type: "default",
                    style: { stroke: "#000000" },
                    markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                });

                mappingUUIDSet.add(step.inputs[input.dataId]);
                if (targetNodeLookup[step.inputs[input.dataId]] === undefined) {
                    targetNodeLookup[step.inputs[input.dataId]] = [newId];
                } else {
                    targetNodeLookup[step.inputs[input.dataId]].push(newId);
                }
            });

            // Now add hazard node and its edge to the analysis node if hazard_type or hazard_id is present in tool parameters
            if (step.tool.parameters.some((param) => param.title === "hazard_type" || param.title === "hazard_id")) {
                nodes.push({
                    id: `${step.id}_hazard`,
                    type: "analysis-input",
                    position: { x: 0, y: 0 },
                    data: {
                        label: "Hazard",
                        inputData: { id: `${step.id}_hazard`, title: "Hazard", dataId: "hazard" },
                        type: "hazard",
                        stepID: step.id,
                        analysisName: step.title
                    }
                });
                edges.push({
                    id: `${step.id}_hazard->${step.id}`,
                    source: `${step.id}_hazard`,
                    target: step.id,
                    type: "default",
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
                        inputData: {
                            id: `${step.id}_dfr3_mapping_set`,
                            title: "DFR3 Mapping Set",
                            dataId: "dfr3_mapping"
                        },
                        type: "dfr3_mapping",
                        stepID: step.id,
                        analysisName: step.title
                    }
                });
                edges.push({
                    id: `${step.id}_dfr3_mapping_set->${step.id}`,
                    source: `${step.id}_dfr3_mapping_set`,
                    target: step.id,
                    type: "default",
                    style: { stroke: "#000000" },
                    markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                });
            }

            // Finally create output nodes and add their corresponding edges to the analysis node
            step.tool.outputs.forEach((output) => {
                if (output.title !== "stdout") {
                    const newId = uuidv4();
                    nodes.push({
                        id: newId,
                        type: "analysis-output",
                        position: { x: 0, y: 0 },
                        data: {
                            label: output.title,
                            outputData: output,
                            stepID: step.id,
                            analysisName: step.title
                        }
                    });
                    edges.push({
                        id: `${step.id}->${newId}`,
                        source: step.id,
                        target: newId,
                        type: "default",
                        style: { stroke: "#000000" },
                        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                    });

                    mappingUUIDSet.add(step.outputs[output.dataId]);
                    sourceNodeLookup[step.outputs[output.dataId]] = newId;
                }
            });
        });

        // Add edges for chained inputs
        Array.from(mappingUUIDSet).forEach((mappingUUID) => {
            if (targetNodeLookup[mappingUUID] !== undefined && sourceNodeLookup[mappingUUID] !== undefined) {
                targetNodeLookup[mappingUUID].forEach((targetNodeId) => {
                    edges.push({
                        id: `${sourceNodeLookup[mappingUUID]}->${targetNodeId}`,
                        source: sourceNodeLookup[mappingUUID],
                        target: targetNodeId,
                        type: "deletableEdge",
                        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                    });
                });
            }
        });

        return { nodes, edges };
    }
    console.info("No steps found in the workflow file. Proceeding with empty nodes and edges.");
    return { nodes, edges };
};

export const createWorkflowFileFromNodesAndEdges = ({
    nodes,
    edges,
    creator,
    datawolfWorkflowFileID,
    title,
    description,
    created,
    tools
}: {
    nodes: AppNode[];
    edges: Edge[];
    creator: DatawolfCreator | null;
    datawolfWorkflowFileID: string | null;
    title: string;
    description: string;
    created: string;
    tools: DatawolfWorkflowTool[];
}): DatawolfWorkflowFile => {
    if (tools.length === 0 || nodes.length === 0) {
        console.info("No tools or nodes found. Proceeding with empty workflow file.");
        return {
            id: datawolfWorkflowFileID,
            deleted: false,
            title: title,
            description: description,
            created: created,
            creator: creator,
            contributors: [],
            steps: []
        };
    }

    let steps: { [key: string]: DatawolfWorkflowFileStep } = {};
    let contributors: DatawolfCreator[] = [];

    let inputNodeIds = nodes.filter((node) => node.type === "analysis-input").map((node) => node.id);
    let outputNodeIds = nodes.filter((node) => node.type === "analysis-output").map((node) => node.id);

    let analysisNodes: AnalysisNode[] = nodes.filter((node) => node.type === "analysis") as AnalysisNode[];
    let edgesFromOutputToInputNodes: { [key: string]: string[] } = {};

    edges.forEach((edge) => {
        if (
            edgesFromOutputToInputNodes[edge.source] === undefined &&
            outputNodeIds.includes(edge.source) &&
            inputNodeIds.includes(edge.target)
        ) {
            edgesFromOutputToInputNodes[edge.source] = [edge.target];
        } else if (outputNodeIds.includes(edge.source) && inputNodeIds.includes(edge.target)) {
            edgesFromOutputToInputNodes[edge.source].push(edge.target);
        }
    });

    let toolIdToToolMap: { [key: string]: DatawolfWorkflowTool } = {};
    tools.forEach((tool) => {
        toolIdToToolMap[tool.id] = tool;
    });

    analysisNodes.forEach((analysisNode) => {
        let tool =
            toolIdToToolMap[
                analysisNode.data.stepData !== undefined
                    ? analysisNode.data.stepData.tool.id
                    : analysisNode.data.toolID !== undefined
                      ? analysisNode.data.toolID
                      : ""
            ];
        let stepId = analysisNode.id;
        let title = tool.title;
        let date = new Date().toISOString();
        let inputs: { [key: string]: string } = {};
        let outputs: { [key: string]: string } = {};
        let inputsToolData: { [key: string]: string | null } = {};
        let outputsToolData: { [key: string]: string | null } = {};
        let parameters: { [key: string]: string } = {};

        // set parameters ids
        tool.parameters.forEach((param) => {
            parameters[param.parameterId] = uuidv4();
        });

        //set inputstooldata to null
        tool.inputs.forEach((input) => {
            inputsToolData[input.dataId] = null;
            inputs[input.dataId] = uuidv4();
        });

        //set outputstooldata null
        tool.outputs.forEach((output) => {
            outputsToolData[output.dataId] = null;
            outputs[output.dataId] = uuidv4();
        });

        steps[stepId] = {
            id: stepId,
            deleted: false,
            creator: creator,
            title: title,
            createDate: date,
            tool: tool,
            inputs: inputs,
            outputs: outputs,
            inputsToolData: inputsToolData,
            outputsToolData: outputsToolData,
            parameters: parameters
        };
    });

    Object.entries(edgesFromOutputToInputNodes).forEach(([outputNodeId, inputNodeIds]) => {
        let opNode = nodes.find((n) => n.id === outputNodeId) as AnalysisOutputNode;
        let ipNodes = inputNodeIds.map((id) => nodes.find((n) => n.id === id) as AnalysisInputNode);
        let stepID1 = opNode.data.stepID;

        if (stepID1 !== undefined) {
            let commonUUID = uuidv4();
            ipNodes.forEach((ipNode) => {
                if (ipNode.data.type === "dataset") {
                    // @ts-ignore
                    steps[stepID1].outputs[opNode.data.outputData.dataId] = commonUUID;
                    steps[ipNode.data.stepID].inputs[ipNode.data.inputData.dataId] = commonUUID;
                }
            });
        }
    });

    let file: DatawolfWorkflowFile = {
        id: datawolfWorkflowFileID,
        deleted: false,
        title: title,
        description: description,
        created: created,
        creator: creator,
        contributors: contributors,
        steps: Object.values(steps)
    };

    return file;
};

export const getNodesAndEdgesFromTool = (
    tool: DatawolfWorkflowTool | undefined,
    dependencyGraph: DependencyGraph | null
): { nodes: AppNode[]; edges: Edge[] } => {
    let nodes: AppNode[] = [];
    let edges: Edge[] = [];

    if (tool !== undefined) {
        let stepId = uuidv4();
        // First create analysis node
        nodes.push({
            id: stepId,
            type: "analysis",
            position: { x: 0, y: 0 },
            data: {
                label: dependencyGraph !== null ? dependencyGraph[tool.title].pretty_name : tool.title,
                name: tool.title,
                toolID: tool.id
            }
        });

        // Then create input nodes and add their corresponding edges to the analysis node
        // for Dataset inputs or chained inputs
        tool.inputs.forEach((input) => {
            const newId = uuidv4();
            nodes.push({
                // id: input.id,
                id: newId,
                type: "analysis-input",
                position: { x: 0, y: 0 },
                data: {
                    label: input.title,
                    inputData: input,
                    type: "dataset",
                    stepID: stepId,
                    analysisName: tool.title
                }
            });
            edges.push({
                id: `${newId}->${stepId}`,
                source: newId,
                target: stepId,
                type: "default",
                style: { stroke: "#000000" },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
            });
        });

        // Now add hazard node and its edge to the analysis node if hazard_type or hazard_id is present in tool parameters
        if (tool.parameters.some((param) => param.title === "hazard_type" || param.title === "hazard_id")) {
            nodes.push({
                id: `${stepId}_hazard`,
                type: "analysis-input",
                position: { x: 0, y: 0 },
                data: {
                    label: "Hazard",
                    inputData: { id: `${stepId}_hazard`, title: "Hazard", dataId: "hazard" },
                    type: "hazard",
                    stepID: stepId,
                    analysisName: tool.title
                }
            });
            edges.push({
                id: `${stepId}_hazard->${stepId}`,
                source: `${stepId}_hazard`,
                target: stepId,
                type: "default",
                style: { stroke: "#000000" },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
            });
        }

        // Now add dfr3 mapping set node and its edge to the analysis node if dfr3_mapping_set is present in tool parameters
        if (tool.parameters.some((param) => param.title === "dfr3_mapping_set")) {
            nodes.push({
                id: `${stepId}_dfr3_mapping_set`,
                type: "analysis-input",
                position: { x: 0, y: 0 },
                data: {
                    label: "DFR3 Mapping Set",
                    inputData: {
                        id: `${stepId}_dfr3_mapping_set`,
                        title: "DFR3 Mapping Set",
                        dataId: "dfr3_mapping"
                    },
                    type: "dfr3_mapping",
                    stepID: stepId,
                    analysisName: tool.title
                }
            });
            edges.push({
                id: `${stepId}_dfr3_mapping_set->${stepId}`,
                source: `${stepId}_dfr3_mapping_set`,
                target: stepId,
                type: "default",
                style: { stroke: "#000000" },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
            });
        }

        // Finally create output nodes and add their corresponding edges to the analysis node
        tool.outputs.forEach((output) => {
            if (output.title !== "stdout") {
                const newId = uuidv4();
                nodes.push({
                    id: newId,
                    type: "analysis-output",
                    position: { x: 0, y: 0 },
                    data: {
                        label: output.title,
                        outputData: output,
                        stepID: stepId,
                        analysisName: tool.title
                    }
                });
                edges.push({
                    id: `${stepId}->${newId}`,
                    source: stepId,
                    target: newId,
                    type: "default",
                    style: { stroke: "#000000" },
                    markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                });
            }
        });
    }

    return { nodes, edges };
};

export const addNewAnalysisNodesAndEdgesWorkflow = (
    workflowFile: DatawolfWorkflowFile,
    dependencyGraph: DependencyGraph | null
): ReactFlowWorkflow => {
    let nodes: AppNode[] = [];
    let edges: Edge[] = [];

    let sourceNodeLookup: { [key: string]: { analysisId: string; handleId: string } } = {};
    let targetNodeLookup: { [key: string]: { analysisId: string; handleId: string }[] } = {};
    let mappingUUIDSet: Set<string> = new Set();
    if (workflowFile.steps.length > 0) {
        workflowFile.steps.forEach((step) => {
            let inputHandles = step.tool.inputs.map((input) => {
                const newId = uuidv4();
                mappingUUIDSet.add(step.inputs[input.dataId]);
                if (targetNodeLookup[step.inputs[input.dataId]] === undefined) {
                    targetNodeLookup[step.inputs[input.dataId]] = [{ analysisId: step.id, handleId: newId }];
                } else {
                    targetNodeLookup[step.inputs[input.dataId]].push({ analysisId: step.id, handleId: newId });
                }
                return { id: newId, label: input.title, dataId: input.dataId, type: "input" };
            });
            // add Hazard input handle
            if (step.tool.parameters.some((param) => param.title === "hazard_type" || param.title === "hazard_id")) {
                inputHandles.push({ id: `${step.id}_hazard`, label: "Hazard", dataId: "hazard", type: "input" });
            }
            // add DFR3 Mapping Set input handle
            if (step.tool.parameters.some((param) => param.title === "dfr3_mapping_set")) {
                inputHandles.push({
                    id: `${step.id}_dfr3_mapping_set`,
                    label: "DFR3 Mapping Set",
                    dataId: "dfr3_mapping",
                    type: "input"
                });
            }

            let outputHandles: { id: string; label: string; dataId: string; type: string }[] = [];
            step.tool.outputs.forEach((output) => {
                if (output.title !== "stdout") {
                    const newId = uuidv4();
                    mappingUUIDSet.add(step.outputs[output.dataId]);
                    sourceNodeLookup[step.outputs[output.dataId]] = { analysisId: step.id, handleId: newId };
                    outputHandles.push({ id: newId, label: output.title, dataId: output.dataId, type: "output" });
                }
            });

            nodes.push({
                id: step.id,
                type: "new-analysis-node",
                position: { x: 0, y: 0 },
                data: {
                    label: dependencyGraph !== null ? dependencyGraph[step.title].pretty_name : step.title,
                    name: step.title,
                    stepData: step,
                    inputHandles: inputHandles,
                    outputHandles: outputHandles
                }
            });
        });

        // Add edges for chained inputs
        Array.from(mappingUUIDSet).forEach((mappingUUID) => {
            if (targetNodeLookup[mappingUUID] !== undefined && sourceNodeLookup[mappingUUID] !== undefined) {
                targetNodeLookup[mappingUUID].forEach((targetNodeId) => {
                    edges.push({
                        id: `${sourceNodeLookup[mappingUUID].analysisId}_handle_${sourceNodeLookup[mappingUUID].handleId}->${targetNodeId.analysisId}_ handle_${targetNodeId.handleId}`,
                        source: sourceNodeLookup[mappingUUID].analysisId,
                        target: targetNodeId.analysisId,
                        sourceHandle: sourceNodeLookup[mappingUUID].handleId,
                        targetHandle: targetNodeId.handleId,
                        type: "deletableEdge",
                        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                    });
                });
            }
        });

        return { nodes, edges };
    }

    return { nodes, edges };
};

export const createWorkflowFileFromNodesAndEdgesV2 = ({
    nodes,
    edges,
    creator,
    datawolfWorkflowFileID,
    title,
    description,
    created,
    tools
}: {
    nodes: AppNode[];
    edges: Edge[];
    creator: DatawolfCreator | null;
    datawolfWorkflowFileID: string | null;
    title: string;
    description: string;
    created: string;
    tools: DatawolfWorkflowTool[];
}): DatawolfWorkflowFile => {
    if (tools.length === 0 || nodes.length === 0) {
        console.info("No tools or nodes found. Proceeding with empty workflow file.");
        return {
            id: datawolfWorkflowFileID,
            deleted: false,
            title: title,
            description: description,
            created: created,
            creator: creator,
            contributors: [],
            steps: []
        };
    }

    let steps: { [key: string]: DatawolfWorkflowFileStep } = {};
    let contributors: DatawolfCreator[] = [];
    let edgesFromOutputToInputHandles: {
        [key: string]: {
            [key: string]: {
                toAnalysisId: string;
                toHandleDataId: string;
            }[];
        };
    } = {};

    let dataIdReverseLookup: { [key: string]: { [key: string]: string } } = {};
    nodes.forEach((node) => {
        (node as NewAnalysisNode).data.inputHandles.forEach((handle) => {
            if (dataIdReverseLookup[node.id] === undefined) {
                dataIdReverseLookup[node.id] = { [handle.id]: handle.dataId };
            } else {
                dataIdReverseLookup[node.id][handle.id] = handle.dataId;
            }
        });
        (node as NewAnalysisNode).data.outputHandles.forEach((handle) => {
            if (dataIdReverseLookup[node.id] === undefined) {
                dataIdReverseLookup[node.id] = { [handle.id]: handle.dataId };
            } else {
                dataIdReverseLookup[node.id][handle.id] = handle.dataId;
            }
        });
    });

    edges.forEach((edge) => {
        // @ts-ignore
        if (edgesFromOutputToInputHandles[edge.source] === undefined) {
            edgesFromOutputToInputHandles[edge.source] = {
                // @ts-ignore
                [dataIdReverseLookup[edge.source][edge.sourceHandle]]: [
                    {
                        toAnalysisId: edge.target,
                        // @ts-ignore
                        toHandleDataId: dataIdReverseLookup[edge.target][edge.targetHandle]
                    }
                ]
            };
        } else if (
            // @ts-ignore
            edgesFromOutputToInputHandles[edge.source][dataIdReverseLookup[edge.source][edge.sourceHandle]] ===
            undefined
        ) {
            // @ts-ignore
            edgesFromOutputToInputHandles[edge.source][dataIdReverseLookup[edge.source][edge.sourceHandle]] = [
                {
                    toAnalysisId: edge.target,
                    // @ts-ignore
                    toHandleDataId: dataIdReverseLookup[edge.target][edge.targetHandle]
                }
            ];
        } else {
            // @ts-ignore
            edgesFromOutputToInputHandles[edge.source][dataIdReverseLookup[edge.source][edge.sourceHandle]].push({
                toAnalysisId: edge.target,
                // @ts-ignore
                toHandleDataId: dataIdReverseLookup[edge.target][edge.targetHandle]
            });
        }
    });

    nodes.forEach((node) => {
        let tool: DatawolfWorkflowTool = ((node as NewAnalysisNode).data.stepData?.tool ??
            (node as NewAnalysisNode).data.tool) as DatawolfWorkflowTool;
        let stepId = node.id;
        let title = tool?.title;
        let date = new Date().toISOString();
        let inputs: { [key: string]: string } = {};
        let outputs: { [key: string]: string } = {};
        let inputsToolData: { [key: string]: string | null } = {};
        let outputsToolData: { [key: string]: string | null } = {};
        let parameters: { [key: string]: string } = {};

        // set parameters ids
        tool?.parameters.forEach((param) => {
            parameters[param.parameterId] = uuidv4();
        });

        //set inputstooldata to null
        tool?.inputs.forEach((input) => {
            inputsToolData[input.dataId] = null;
            inputs[input.dataId] = uuidv4();
        });

        //set outputstooldata null
        tool?.outputs.forEach((output) => {
            outputsToolData[output.dataId] = null;
            outputs[output.dataId] = uuidv4();
        });

        steps[stepId] = {
            id: stepId,
            deleted: false,
            creator: creator,
            title: title ?? "",
            createDate: date,
            tool: tool,
            inputs: inputs,
            outputs: outputs,
            inputsToolData: inputsToolData,
            outputsToolData: outputsToolData,
            parameters: parameters
        };
    });

    Object.entries(edgesFromOutputToInputHandles).forEach(([fromStepId, toSteps]) => {
        Object.entries(toSteps).forEach(([fromDataId, toSteps]) => {
            let commonUUID = uuidv4();
            toSteps.forEach((toStep) => {
                steps[fromStepId].outputs[fromDataId] = commonUUID;
                steps[toStep.toAnalysisId].inputs[toStep.toHandleDataId] = commonUUID;
            });
        });
    });

    let file: DatawolfWorkflowFile = {
        id: datawolfWorkflowFileID,
        deleted: false,
        title: title,
        description: description,
        created: created,
        creator: creator,
        contributors: contributors,
        steps: Object.values(steps)
    };

    return file;
};

export const getNodeFromToolV2 = (
    tool: DatawolfWorkflowTool | undefined,
    dependencyGraph: DependencyGraph | null
): NewAnalysisNode | null => {
    if (tool !== undefined) {
        let stepId = uuidv4();
        let inputHandles = tool.inputs.map((input) => {
            return { id: uuidv4(), label: input.title, dataId: input.dataId, type: "input" };
        });
        // add Hazard input handle
        if (tool.parameters.some((param) => param.title === "hazard_type" || param.title === "hazard_id")) {
            inputHandles.push({ id: `${stepId}_hazard`, label: "Hazard", dataId: "hazard", type: "input" });
        }
        // add DFR3 Mapping Set input handle
        if (tool.parameters.some((param) => param.title === "dfr3_mapping_set")) {
            inputHandles.push({
                id: `${stepId}_dfr3_mapping_set`,
                label: "DFR3 Mapping Set",
                dataId: "dfr3_mapping",
                type: "input"
            });
        }

        let outputHandles: { id: string; label: string; dataId: string; type: string }[] = [];
        tool.outputs.forEach((output) => {
            if (output.title !== "stdout") {
                outputHandles.push({ id: uuidv4(), label: output.title, dataId: output.dataId, type: "output" });
            }
        });

        return {
            id: stepId,
            type: "new-analysis-node",
            position: { x: 0, y: 0 },
            data: {
                label: dependencyGraph !== null ? dependencyGraph[tool.title].pretty_name : tool.title,
                name: tool.title,
                tool: tool,
                inputHandles: inputHandles,
                outputHandles: outputHandles
            }
        };
    }

    return null;
};

export const getWorkflowSummary = (reactFlowNodesAndEdges: ReactFlowWorkflow): ReactFlowWorkflow => {
    let nodes: SummaryNode[] = [];
    let edges: Edge[] = [];

    reactFlowNodesAndEdges.nodes.forEach((node) => {
        nodes.push({
            id: node.id,
            type: "workflow-summary",
            position: { x: 0, y: 0 },
            data: {
                label: node.data.label,
                name: node.data.name
            }
        });
    });

    let edgeSet = new Set<string>();
    reactFlowNodesAndEdges.edges.forEach((edge) => {
        if (!edgeSet.has(`${edge.source}->${edge.target}`)) {
            edges.push({
                id: `${edge.source}->${edge.target}`,
                source: edge.source,
                target: edge.target,
                type: "default",
                style: { stroke: "#000000" },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
            });
            edgeSet.add(`${edge.source}->${edge.target}`);
        }
    });

    return { nodes, edges };
};
