import { Position } from "@xyflow/react";
import type { Edge } from "@xyflow/react";
import Dagre from "@dagrejs/dagre";

export const getLayoutedElements = <T extends { id: string; measured?: { width?: number; height?: number } }>(
    nodes: T[],
    edges: Edge[]
): { nodes: T[]; edges: Edge[] } => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    let direction = "LR";
    let isHorizontal = direction === "LR";
    g.setGraph({ rankdir: direction, nodesep: 100, ranksep: 300 });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0
        })
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: { x, y }
            };
        }),
        edges
    };
};
