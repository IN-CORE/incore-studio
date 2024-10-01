import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { Edge, OnNodesChange, OnEdgesChange } from "@xyflow/react";

import { AppNode } from "@app/components/Workflow/nodes";

export type ReactFlowAppState = {
    nodes: AppNode[];
    edges: Edge[];
    onNodesChange: OnNodesChange<AppNode>;
    onEdgesChange: OnEdgesChange;
    setNodes: (nodes: AppNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: AppNode) => void;
    addEdge: (edge: Edge) => void;
    addNodes: (nodes: AppNode[]) => void;
    addEdges: (edges: Edge[]) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<ReactFlowAppState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes)
        });
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        });
    },
    setNodes: (nodes) => {
        set({ nodes });
    },
    setEdges: (edges) => {
        set({ edges });
    },
    addNode: (node) =>
        set((state) => ({
            nodes: [...state.nodes, node]
        })),
    addEdge: (edge) =>
        set((state) => ({
            edges: [...state.edges, edge]
        })),
    addNodes: (nodes) =>
        set((state) => ({
            nodes: [...state.nodes, ...nodes]
        })),
    addEdges: (edges) =>
        set((state) => ({
            edges: [...state.edges, ...edges]
        }))
}));

export default useStore;
