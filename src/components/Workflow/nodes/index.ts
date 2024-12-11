import type { Node, NodeTypes, BuiltInNode } from "@xyflow/react";

import { AnalysisInputNode } from "./AnalysisInputNode";
import { AnalysisOutputNode } from "./AnalysisOutputNode";
import { AnalysisNode } from "./AnalysisNode";
import { NewAnalysisNode } from "./NewAnalysisNode";
import { SummaryNode } from "./SummaryNode";

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
        name: string;
        stepData?: DatawolfWorkflowFileStep;
        toolID?: string;
    },
    "analysis"
>;

export type NewAnalysisNode = Node<
    {
        label: string;
        name: string;
        inputHandles: { id: string; label: string; dataId: string; required: boolean; type: string }[];
        outputHandles: { id: string; label: string; dataId: string; type: string }[];
        stepData?: DatawolfWorkflowFileStep;
        tool?: DatawolfWorkflowTool;
        isExecution?: boolean;
    },
    "new-analysis-node"
>;

export type SummaryNode = Node<
    {
        label: string;
        name: string;
    },
    "workflow-summary"
>;

export const summaryNodeTypes = {
    "workflow-summary": SummaryNode
} satisfies NodeTypes;

export type AppNode = BuiltInNode | AnalysisInputNode | AnalysisOutputNode | AnalysisNode | NewAnalysisNode;

export const nodeTypes = {
    "analysis-input": AnalysisInputNode,
    "analysis-output": AnalysisOutputNode,
    "analysis": AnalysisNode,
    "new-analysis-node": NewAnalysisNode
    // Add any of your custom nodes here!
} satisfies NodeTypes;
