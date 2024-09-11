import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Box, Typography } from '@mui/joy';
import StorageIcon from '@mui/icons-material/Storage';

import { type AnalysisInputNode } from '@app/components/Workflow/nodes';

export function AnalysisInputNode({ data }: NodeProps<AnalysisInputNode>): JSX.Element {
    return (
        <Box
            sx={{
                height: '55px',
                width: '260px',
                border: '1px solid #E0E0E0',
                borderRadius: '3px',
                padding: '16px 24px 16px 24px',
                gap: '16px',
                backgroundColor: 'white'
            }}
        >
            <Handle type="target" position={Position.Top} />
            <Box display="flex" alignItems="center">
                <StorageIcon sx={{ color: '#007DFF', marginRight: '5px' }} />
                <Typography level="h4" sx={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>
                    {' '}
                    Input {data.label}
                </Typography>
            </Box>
            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
}
