import React from "react";

import { Chip, Sheet, Table, Typography } from "@mui/joy";

interface ItemCountTableProps {
    tableHeaders: string[];
    itemRows: { itemName: string; count: number }[];
}

const ItemCountTable: React.FC<ItemCountTableProps> = ({ tableHeaders, itemRows }) => {
    return (
        <Sheet sx={{ maxHeight: 300, overflow: "auto" }}>
            <Table stickyHeader>
                <thead>
                    <tr>
                        {tableHeaders.map((header, index) => (
                            <th key={index} style={{ textAlign: index === 0 ? "left" : "right", padding: "8px" }}>
                                <Typography level="body-md">{header}</Typography>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {itemRows.map((row, index) => (
                        <tr key={index}>
                            <td>
                                <Typography level="body-md">{row.itemName}</Typography>
                            </td>
                            <td style={{ textAlign: "right", padding: "8px" }}>
                                <Chip>
                                    <Typography level="body-md">{row.count}</Typography>
                                </Chip>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Sheet>
    );
};

export default ItemCountTable;
