import type { Edge, EdgeTypes } from '@xyflow/react';

export const initialEdges = [
    { id: 'input1->analysis1', source: 'inpt1', target: 'analysis1', type: 'step' },
    { id: 'input2->analysis1', source: 'inpt2', target: 'analysis1', type: 'step' },
    { id: 'input3->analysis1', source: 'inpt3', target: 'analysis1', type: 'step' },
    { id: 'analysis1->output1', source: 'analysis1', target: 'output1', type: 'step' },
    { id: 'analysis1->output2', source: 'analysis1', target: 'output2', type: 'step' }
] satisfies Edge[];

export const edgeTypes = {
    // Add your custom edge types here!
} satisfies EdgeTypes;
