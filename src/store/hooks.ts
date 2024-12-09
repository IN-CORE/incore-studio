import React from "react";
import axios from "axios";
import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@app/store";
import { setCurrentExecution } from "@app/reducer/executionSlice";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

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
