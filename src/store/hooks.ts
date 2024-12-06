import React from "react";
import axios from "axios";
import { getHeaders } from "@app/utils";
import config from "@app/app.config";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@app/store";
import { setCreateExecutionTemplate } from "@app/reducer/executionSlice";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useExecutionTemplate = (
    wfId: string | undefined | null
): [ExecutionCreate | null, boolean, string | null] => {
    const dispatch = useAppDispatch();
    const createExecution = useAppSelector((state) => state.execution.createExecution);
    const [state, setState] = React.useState<{ loading: boolean; error: string | null }>({
        loading: true,
        error: null
    });

    React.useEffect(() => {
        if (wfId && wfId !== createExecution.workflowId) {
            axios
                .get(`${config.datawolfApi}/executions/${wfId}/template`, { headers: getHeaders() })
                .then((response) => {
                    dispatch(
                        setCreateExecutionTemplate({
                            deleted: false,
                            title: "",
                            description: "",
                            workflowId: response.data.workflowId,
                            creatorId: "",
                            parameters: response.data.parameters,
                            datasets: response.data.datasets
                        })
                    );
                    setState({ loading: false, error: null });
                })
                .catch((error) => {
                    setState({ loading: false, error: error.message });
                });
        }
    }, [wfId]);

    return [createExecution, state.loading, state.error];
};
