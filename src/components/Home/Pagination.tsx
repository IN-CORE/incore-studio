import * as React from "react";
import { Button, ButtonGroup } from "@mui/joy";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface PaginationProps {
    pageNumber: number;
    data: any[];
    dataPerPage: number;
    previous: () => void;
    next: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pageNumber, data, dataPerPage, previous, next }) => {
    return (
        <div style={{ textAlign: "center", margin: "1em" }}>
            <ButtonGroup size="sm">
                <Button disabled={pageNumber === 1} onClick={previous}>
                    <ChevronLeftIcon fontSize="small" />
                </Button>
                <Button disabled>{pageNumber}</Button>
                <Button disabled={data.length < dataPerPage} onClick={next}>
                    <ChevronRightIcon fontSize="small" />
                </Button>
            </ButtonGroup>
        </div>
    );
};
