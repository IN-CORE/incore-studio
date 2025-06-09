import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { getHeaders, getOutputDatasetIDsFromWorkflows } from "@app/utils";
import config from "@app/app.config";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@app/store";
import { setCreateExecutionTemplate, setCurrentExecution } from "@app/reducer/executionSlice";
import { addDatasetToProject } from "@app/reducer/projectSlice";
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

const fetchDatasetsFromService = async (datasetIds: string[]): Promise<Dataset[]> => {
    try {
        const requests = datasetIds.map((id) =>
            axios.get<Dataset>(`${config.dataService}/${id}`, { headers: getHeaders() })
        );
        const responses = await Promise.all(requests);

        const datasets = responses.map((response) => response.data);
        return datasets;
    } catch (error) {
        console.error("Error fetching datasets: ", error);
        throw new Error("Error fetching datasets");
    }
};

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

export const useOutputDatasetsSynchronizationPolling = (
    projectWorkflows: Workflow[],
    interval: number,
    projectId: string | undefined
) => {
    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);
    const appDispatch = useAppDispatch();

    React.useEffect(() => {
        if (projectWorkflows.length === 0 || !interval || projectId === undefined) return;

        const fetchAndSync = async () => {
            const wfids = projectWorkflows.map((wf) => wf.id);
            // fetch all workflow files
            try {
                const wfFiles = await fetchWorkflowFiles(wfids);
                const outputDatasetIDs = await getOutputDatasetIDsFromWorkflows(wfFiles);
                let datasetIdsNotInProject = outputDatasetIDs.filter((id) => !projectDatasets.find((d) => d.id === id));
                // filter out ids with "-"
                datasetIdsNotInProject = datasetIdsNotInProject.filter((id) => !id.includes("-"));
                if (datasetIdsNotInProject.length > 0) {
                    const newDatasets = await fetchDatasetsFromService(datasetIdsNotInProject);
                    appDispatch(addDatasetToProject({ projectId, datasets: newDatasets }));
                }
            } catch (error) {
                console.error("Error fetching Dataset files: ", error);
            }
        };

        fetchAndSync(); // initial fetch

        const intervalId = setInterval(fetchAndSync, interval);

        // cleanup
        return () => clearInterval(intervalId);
    }, [projectWorkflows, interval]);
};

export const useUserUsageStats = () => {
    const [usageStats, setUsageStats] = React.useState<UserSpaceUsage>({
        hazards: {
            entities: {
                text: "",
                value: 0
            },
            disk: {
                text: "",
                value: 0
            }
        },
        datasets: {
            entities: {
                text: "",
                value: 0
            },
            disk: {
                text: "",
                value: 0
            }
        },
        dfr3: {
            entities: {
                text: "",
                value: 0
            }
        }
    });

    const getSimplifiedVal = (val: number) => {
        return parseFloat(Math.round(val).toFixed(2));
    };

    const getValue = (current: number, total: number) => {
        return total !== 0 ? getSimplifiedVal((current * 100) / total) : 0;
    };

    React.useEffect(() => {
        const fetchUsageStats = async () => {
            try {
                const uris = [`${config.spaceApi}/usage`, `${config.spaceApi}/allocations`];
                const requests = uris.map((uri) => axios.get<SpaceUsageResponse>(uri, { headers: getHeaders() }));
                const responses = await Promise.all(requests);

                const usage = responses[0].data;
                const allocations = responses[1].data;

                const usageValue = {
                    hazards: {
                        entities: {
                            text: `${usage.total_number_of_hazards ?? 0}\n/\n${
                                allocations.total_number_of_hazards ?? 0
                            }`,
                            value: getValue(
                                usage.total_number_of_hazards ?? 0,
                                allocations.total_number_of_hazards ?? 0
                            )
                        },
                        disk: {
                            text: `${usage.total_file_size_of_hazard_datasets}\n of\n ${allocations.total_file_size_of_hazard_datasets}`,
                            value: getValue(
                                usage.total_file_size_of_hazard_datasets_byte ?? 0,
                                allocations.total_file_size_of_hazard_datasets_byte ?? 0
                            )
                        }
                    },
                    datasets: {
                        entities: {
                            text: `${usage.total_number_of_datasets ?? 0}\n/\n${
                                allocations.total_number_of_datasets ?? 0
                            }`,
                            value: getValue(
                                usage.total_number_of_datasets ?? 0,
                                allocations.total_number_of_datasets ?? 0
                            )
                        },
                        disk: {
                            text: `${usage.total_file_size_of_datasets}\n of\n ${allocations.total_file_size_of_datasets}`,
                            value: getValue(
                                usage.total_file_size_of_datasets_byte ?? 0,
                                allocations.total_file_size_of_datasets_byte ?? 0
                            )
                        }
                    },
                    dfr3: {
                        entities: {
                            text: `${usage.total_number_of_dfr3 ?? 0}\n/\n${allocations.total_number_of_dfr3 ?? 0}`,
                            value: getValue(usage.total_number_of_dfr3 ?? 0, allocations.total_number_of_dfr3 ?? 0)
                        }
                    }
                };

                setUsageStats(usageValue);
            } catch (error) {
                console.error("Error fetching user usage stats: ", error);
            }
        };
        fetchUsageStats();
    }, []);

    return usageStats;
};

export const useHazardStats = (projectHazards: Hazard[]) => {
    const [hazardStats, setHazardStats] = React.useState<{ model: number; dataset: number }>({ model: 0, dataset: 0 });
    const [hazardCounts, setHazardCounts] = React.useState<
        {
            label: string;
            value: number;
        }[]
    >([]);

    React.useEffect(() => {
        let modelCount = 0;
        let datasetCount = 0;
        let earthquakeCount = 0;
        let hurricaneCount = 0;
        let tornadoCount = 0;
        let floodCount = 0;
        let tsunamiCount = 0;
        let hurricaneWFCount = 0;
        const fetchStats = async () => {
            for (const hazard of projectHazards) {
                if (hazard.type === "earthquake") {
                    earthquakeCount++;
                    try {
                        const response = await axios.get(`${config.earthquakeApi}/${hazard.id}`, {
                            headers: getHeaders()
                        });
                        if (response.data) {
                            if (response.data.eqType === "dataset") {
                                datasetCount += 1;
                            } else {
                                modelCount++;
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching earthquake data: ", error);
                    }
                } else if (hazard.type === "tornado") {
                    tornadoCount++;
                    try {
                        const response = await axios.get(`${config.tornadoApi}/${hazard.id}`, {
                            headers: getHeaders()
                        });
                        if (response.data) {
                            if (response.data.tornadoType === "dataset") {
                                datasetCount += 1;
                            } else {
                                modelCount++;
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching tornado data: ", error);
                    }
                } else if (hazard.type === "hurricane") {
                    hurricaneCount++;
                    datasetCount += 1;
                } else if (hazard.type === "flood") {
                    floodCount++;
                    datasetCount += 1;
                } else if (hazard.type === "tsunami") {
                    tsunamiCount++;
                    datasetCount += 1;
                } else if (hazard.type === "hurricaneWindfield") {
                    hurricaneWFCount++;
                    datasetCount += 1;
                }
            }
            setHazardStats({ model: modelCount, dataset: datasetCount });
            setHazardCounts(
                [
                    { label: "Earthquake", value: earthquakeCount },
                    { label: "Hurricane", value: hurricaneCount },
                    { label: "Tornado", value: tornadoCount },
                    { label: "Flood", value: floodCount },
                    { label: "Tsunami", value: tsunamiCount },
                    { label: "Hurricane Windfield", value: hurricaneWFCount }
                ].sort((a, b) => b.value - a.value)
            );
        };
        if (projectHazards.length > 0) {
            fetchStats();
        }
    }, [projectHazards]);

    return { hazardStats, hazardCounts };
};

export const useWorkflowAndExecutionCount = (projectWorkflows: Workflow[]) => {
    const [workflowCount, setWorkflowCount] = React.useState<number>(0);
    const [executionCount, setExecutionCount] = React.useState<number>(0);

    React.useEffect(() => {
        setWorkflowCount(projectWorkflows.length);
        const wfIds = projectWorkflows.map((wf) => wf.id);
        const fetchExecutionCount = async () => {
            try {
                const requests = wfIds.map((id) =>
                    axios.get<DatawolfExecutionFile[]>(`${config.datawolfApi}/workflows/${id}/executions`, {
                        headers: getHeaders()
                    })
                );
                const responses = await Promise.all(requests);
                let execCount = responses.reduce((acc, response) => {
                    const dataLength = Array.isArray(response.data) ? response.data.length : 0;
                    return acc + dataLength;
                }, 0);
                setExecutionCount(execCount);
            } catch (error) {
                console.error("Error fetching execution count: ", error);
            }
        };
        fetchExecutionCount();
    }, [projectWorkflows]);

    return { workflowCount, executionCount };
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

export function useElementSize<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });
        observer.observe(ref.current);
        // eslint-disable-next-line consistent-return
        return () => observer.disconnect();
    }, []);

    return [ref, size] as const;
}
