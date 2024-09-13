import type { Edge, EdgeTypes } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";

export const initialEdges = [
    {
        id: "input1->analysis1",
        source: "inpt1",
        target: "analysis1",
        type: "step",
        style: { stroke: "#000000" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
    },
    {
        id: "input2->analysis1",
        source: "inpt2",
        target: "analysis1",
        type: "step",
        style: { stroke: "#000000" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
    },
    {
        id: "input3->analysis1",
        source: "inpt3",
        target: "analysis1",
        type: "step",
        style: { stroke: "#000000" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
    },
    {
        id: "analysis1->output1",
        source: "analysis1",
        target: "output1",
        type: "step",
        style: { stroke: "#000000" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
    },
    {
        id: "analysis1->output2",
        source: "analysis1",
        target: "output2",
        type: "step",
        style: { stroke: "#000000" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
    }
] satisfies Edge[];

export const edgeTypes = {
    // Add your custom edge types here!
} satisfies EdgeTypes;
