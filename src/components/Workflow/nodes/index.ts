import type { Node, NodeTypes, BuiltInNode } from "@xyflow/react";

import { AnalysisInputNode } from "./AnalysisInputNode";
import { AnalysisOutputNode } from "./AnalysisOutputNode";
import { AnalysisNode } from "./AnalysisNode";
// import exampleWorkflow from './example_workflow.json';

export type AnalysisInputNode = Node<
    {
        label?: string;
    },
    "analysis-input"
>;

export type AnalysisOutputNode = Node<
    {
        label?: string;
    },
    "analysis-output"
>;

export type AnalysisNode = Node<
    {
        label?: string;
    },
    "analysis"
>;

export type AppNode = BuiltInNode | AnalysisInputNode | AnalysisOutputNode | AnalysisNode;

const position = { x: 0, y: 0 };

export const initialNodes: AppNode[] = [
    { id: "inpt1", type: "analysis-input", position: position, data: { label: "Bridge Dataset" } },
    { id: "inpt2", type: "analysis-input", position: position, data: { label: "Hazard Type" } },
    { id: "inpt3", type: "analysis-input", position: position, data: { label: "DFR3 Mapping Set" } },
    { id: "analysis1", type: "analysis", position: position, data: { label: "Bridge Damage" } },
    { id: "output1", type: "analysis-output", position: position, data: { label: "Type 1" } },
    { id: "output2", type: "analysis-output", position: position, data: { label: "Type 2" } }
];

export const nodeTypes = {
    "analysis-input": AnalysisInputNode,
    "analysis-output": AnalysisOutputNode,
    "analysis": AnalysisNode
    // Add any of your custom nodes here!
} satisfies NodeTypes;
