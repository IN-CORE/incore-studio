import React from "react";
import axios from "axios";
import { getHeaders } from "@app/utils";
import config from "@app/app.config";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@app/store";
import { setCreateExecutionTemplate, setCurrentExecution } from "@app/reducer/executionSlice";
import { saveWorkflow } from "@app/reducer/workflowSlice";

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

export const useExecutionPolling = (executionId: string | null, interval: number) => {
    const appDispatch = useAppDispatch();

    React.useEffect(() => {
        if (!executionId || !interval) return;

        const fetchExecution = async () => {
            try {
                const response = await axios.get<DatawolfExecutionFile>(
                    `${config.datawolfApi}/executions/${executionId}`,
                    { headers: getHeaders() }
                );

                appDispatch(setCurrentExecution(response.data));
            } catch (error) {
                console.error("Error fetching execution: ", error);
            }
        };

        fetchExecution(); // initial fetch

        const intervalId = setInterval(fetchExecution, interval);

        // cleanup
        return () => clearInterval(intervalId);
    }, [executionId, interval, appDispatch]);
};

export const useWorkflowAutoSave = (workflow: DatawolfWorkflowFile, workflowID: string | null, interval: number) => {
    const appDispatch = useAppDispatch();

    React.useEffect(() => {
        if (workflowID === null || !interval) return;

        const autoSaveWorkflow = () => {
            appDispatch(saveWorkflow({ workflowID, workflow }));
        };

        const intervalId = setInterval(autoSaveWorkflow, interval);

        // cleanup
        return () => clearInterval(intervalId);
    }, [workflow, workflowID, interval, appDispatch]);
};
