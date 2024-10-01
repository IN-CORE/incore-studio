import type { Node, NodeTypes, BuiltInNode } from "@xyflow/react";

import { AnalysisInputNode } from "./AnalysisInputNode";
import { AnalysisOutputNode } from "./AnalysisOutputNode";
import { AnalysisNode } from "./AnalysisNode";
import { NewAnalysisNode } from "./NewAnalysisNode";

export type AnalysisInputNode = Node<
    {
        label: string;
        inputData: DatawolfIO | { id: string; title: string; dataId: string };
        stepID: string;
        type: "dataset" | "hazard" | "dfr3_mapping";
        analysisName: string;
    },
    "analysis-input"
>;

export type AnalysisOutputNode = Node<
    {
        label: string;
        outputData: DatawolfIO;
        stepID: string;
        analysisName: string;
    },
    "analysis-output"
>;

export type AnalysisNode = Node<
    {
        label: string;
        stepData?: DatawolfWorkflowFileStep;
        toolID?: string;
    },
    "analysis"
>;

export type NewAnalysisNode = Node<
    {
        label: string;
        name: string;
        inputHandles: { id: string; label: string; dataId: string; type: string }[];
        outputHandles: { id: string; label: string; dataId: string; type: string }[];
        stepData?: DatawolfWorkflowFileStep;
        tool?: DatawolfWorkflowTool;
    },
    "new-analysis-node"
>;

export const nodeTypes = {
    "analysis-input": AnalysisInputNode,
    "analysis-output": AnalysisOutputNode,
    "analysis": AnalysisNode,
    "new-analysis-node": NewAnalysisNode
    // Add any of your custom nodes here!
} satisfies NodeTypes;
