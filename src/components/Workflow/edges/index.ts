import type { EdgeTypes } from "@xyflow/react";

import DeletableEdge from "./DeletableEdge";

export const edgeTypes = {
    // Add your custom edge types here!
    deletableEdge: DeletableEdge
} satisfies EdgeTypes;
