import React from "react";
import axios from "axios";
import { getHeaders, getOutputDatasetIDsFromWorkflows } from "@app/utils";
import config from "@app/app.config";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@app/store";
import { setCreateExecutionTemplate, setCurrentExecution } from "@app/reducer/executionSlice";
import { addDatasetToProject } from "@app/reducer/projectSlice";

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

const fetchDatasetsFromService = async (datasetIds: string[]): Promise<Dataset[]> => {
    try {
        const requests = datasetIds.map((id) =>
            axios.get<Dataset>(`${config.hostname}/data/api/datasets/${id}`, { headers: getHeaders() })
        );
        const responses = await Promise.all(requests);

        const datasets = responses.map((response) => response.data);
        return datasets;
    } catch (error) {
        console.error("Error fetching datasets: ", error);
        throw new Error("Error fetching datasets");
    }
};

export const useOutputDatasetsSynchronizationPolling = (
    projectWorkflows: Workflow[],
    interval: number,
    projectId: string | undefined
) => {
    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);
    const appDispatch = useAppDispatch();

    const fetchWorkflowFiles = async (wfids: string[]): Promise<DatawolfWorkflowFile[]> => {
        try {
            const requests = wfids.map((wfid) =>
                axios.get<DatawolfWorkflowFile>(`${config.datawolfApi}/workflows/${wfid}`, { headers: getHeaders() })
            );
            const responses = await Promise.all(requests);

            const wfFiles = responses.map((response) => response.data);
            return wfFiles;
        } catch (error) {
            console.error("Error fetching workflow files: ", error);
            throw new Error("Error fetching workflow files");
        }
    };

    React.useEffect(() => {
        if (projectWorkflows.length === 0 || !interval || projectId === undefined) return;

        const fetchAndSync = async () => {
            let wfids = projectWorkflows.map((wf) => wf.id);
            // fetch all workflow files
            try {
                const wfFiles = await fetchWorkflowFiles(wfids);
                const outputDatasetIDs = await getOutputDatasetIDsFromWorkflows(wfFiles);
                const datasetIdsNotInProject = outputDatasetIDs.filter(
                    (id) => !projectDatasets.find((d) => d.id === id)
                );
                if (datasetIdsNotInProject.length > 0) {
                    const newDatasets = await fetchDatasetsFromService(datasetIdsNotInProject);
                    appDispatch(addDatasetToProject({ projectId: projectId, datasets: newDatasets }));
                }
            } catch (error) {
                console.error("Error fetching workflow files: ", error);
            }
        };

        fetchAndSync(); // initial fetch

        const intervalId = setInterval(fetchAndSync, interval);

        // cleanup
        return () => clearInterval(intervalId);
    }, [projectWorkflows, interval]);
};
