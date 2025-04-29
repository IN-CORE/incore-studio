import React from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Checkbox,
    Chip,
    FormControl,
    FormLabel,
    List,
    ListItem,
    IconButton,
    Input,
    Modal,
    ModalClose,
    Stack,
    Select,
    Option,
    Typography
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Done from "@mui/icons-material/Done";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useShallow } from "zustand/react/shallow";

import { useAppSelector } from "@app/store/hooks";
import Loading from "./Loading";
import { getNodeFromToolV2 } from "@app/components/Workflow/workflowUtils";
import useStore, { type ReactFlowAppState } from "./Workflow/reactFlowStore";

interface AddAnalysisModalProps {
    selectAnalysisModalOpen: boolean;
    setSelectAnalysisModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const selector = (state: ReactFlowAppState) => ({
    addNodes: state.addNodes
});

const AddAnalysisModal = ({ selectAnalysisModalOpen, setSelectAnalysisModalOpen }: AddAnalysisModalProps) => {
    const [selectedAnalysis, setSelectedAnalysis] = React.useState<string>("");
    const [searchAnalysisTerm, setSearchAnalysisTerm] = React.useState<string>("");
    const [availableAnalyses, setAvailableAnalyses] = React.useState<string[]>([]);
    const [groupedAnalyses, setGroupedAnalyses] = React.useState<Record<string, string[]>>({});
    const [selectedTag, setSelectedTag] = React.useState<string>("all");
    const [currentAnalysesList, setCurrentAnalysesList] = React.useState<string[]>([]);
    const [currentAnalysisCount, setCurrentAnalysisCount] = React.useState<number>(0);

    const { addNodes } = useStore(useShallow(selector));
    const dependencyGraph = useAppSelector((state) => state.workflow.dependencyGraph);
    const datawolfTools = useAppSelector((state) => state.workflow.datawolfTools);

    const clearItems = () => {
        setSelectedAnalysis("");
        setSearchAnalysisTerm("");
        setSelectAnalysisModalOpen(false);
    };

    React.useEffect(() => {
        if (datawolfTools.length !== 0 && dependencyGraph !== null) {
            let toolNames = datawolfTools.map((tool) => tool.title).sort();
            toolNames = toolNames
                .filter((tool) => dependencyGraph[tool] !== undefined)
                .filter(
                    (tool) =>
                        dependencyGraph[tool].pretty_name.toLowerCase().search(searchAnalysisTerm.toLowerCase()) !== -1
                );
            // get unique tags for all tools from dependencyGraph
            const tags = new Set<string>();
            for (const tool of toolNames) {
                if (dependencyGraph[tool].tags) {
                    dependencyGraph[tool].tags.forEach((tag: string) => tags.add(tag));
                }
            }
            // sort tags
            const sortedTags = Array.from(tags).sort();
            // group tools by tags
            const groupedTools: Record<string, string[]> = {};
            sortedTags.forEach((tag) => {
                groupedTools[tag] = [];
            });
            toolNames.forEach((tool) => {
                if (dependencyGraph[tool].tags) {
                    dependencyGraph[tool].tags.forEach((tag: string) => groupedTools[tag].push(tool));
                }
            });
            // sort grouped tools
            Object.keys(groupedTools).forEach((tag) => {
                groupedTools[tag].sort((a, b) => {
                    const nameA = dependencyGraph[a].pretty_name.toLowerCase();
                    const nameB = dependencyGraph[b].pretty_name.toLowerCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });
            });
            setGroupedAnalyses(groupedTools);
            setAvailableAnalyses(toolNames);
            setCurrentAnalysesList(selectedTag === "all" ? toolNames : groupedTools[selectedTag]);
            setCurrentAnalysisCount(selectedTag === "all" ? toolNames.length : groupedTools[selectedTag].length);
        }
    }, [datawolfTools, searchAnalysisTerm]);

    return (
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={selectAnalysisModalOpen}
            onClose={() => setSelectAnalysisModalOpen(false)}
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
            <Card
                sx={{
                    width: "75%",
                    maxHeight: "75%",
                    backgroundColor: "white",
                    padding: "24px"
                }}
                size="lg"
            >
                <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                    <TrendingUpRoundedIcon sx={{ color: "#EF6C00", marginRight: "10px" }} />
                    <Typography
                        level="title-lg"
                        sx={{
                            fontWeight: 500,
                            fontSize: "24px",
                            lineHeight: "24px",
                            paragraph: "28px",
                            my: "10px"
                        }}
                    >
                        Select Analysis
                    </Typography>
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                </Box>
                <CardContent>
                    <Stack direction="column" spacing={3}>
                        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                            <FormControl sx={{ width: "50%" }}>
                                <FormLabel sx={{ color: "#172B4D" }}>Filter by Category</FormLabel>
                                <Select
                                    placeholder="Select Category"
                                    value={selectedTag}
                                    onChange={(_, newTag: string | null) => {
                                        setSelectedTag(newTag ?? "all");
                                        if (newTag !== "all" && newTag !== null) {
                                            setCurrentAnalysesList(groupedAnalyses[newTag]);
                                            setCurrentAnalysisCount(groupedAnalyses[newTag].length);
                                        } else {
                                            setCurrentAnalysesList(availableAnalyses);
                                            setCurrentAnalysisCount(availableAnalyses.length);
                                        }
                                    }}
                                    sx={{
                                        "backgroundColor": "white",
                                        "border": "1px solid",
                                        "borderColor": "neutral.300",
                                        "borderRadius": "8px",
                                        "&:hover": {
                                            borderColor: "neutral.500"
                                        },
                                        "&:focus-within": {
                                            borderColor: "primary.500"
                                        }
                                    }}
                                >
                                    <Option value="all">All</Option>
                                    {Object.keys(groupedAnalyses).map((tag) => (
                                        <Option key={tag} value={tag}>
                                            {tag}
                                        </Option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ width: "50%" }}>
                                <FormLabel sx={{ color: "#172B4D" }}>Search by Name</FormLabel>
                                <Input
                                    startDecorator={<SearchRoundedIcon />}
                                    endDecorator={
                                        searchAnalysisTerm.length > 0 ? (
                                            <IconButton variant="plain" onClick={() => setSearchAnalysisTerm("")}>
                                                <CloseRoundedIcon />
                                            </IconButton>
                                        ) : null
                                    }
                                    placeholder="Search Analysis"
                                    value={searchAnalysisTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                            setSearchAnalysisTerm(e.target.value.toLowerCase());
                                        }
                                    }}
                                />
                            </FormControl>
                        </Stack>
                        <Box>
                            <Typography level="body-sm" sx={{ color: "#172B4D", fontWeight: 500 }}>
                                {currentAnalysisCount}{" "}
                                {selectedTag === "Pyincore Utility" ? "Utility Tools" : "Analyses"} found
                            </Typography>
                        </Box>
                        <Box sx={{ height: "400px", overflow: "auto", padding: "10px" }}>
                            <List
                                sx={{
                                    "--List-gap": "8px",
                                    "--ListItem-minHeight": "32px",
                                    "--ListItem-gap": "4px"
                                }}
                            >
                                {dependencyGraph !== null &&
                                    currentAnalysesList.map((analysis) => (
                                        <ListItem key={analysis}>
                                            {analysis === selectedAnalysis && (
                                                <Done
                                                    color="primary"
                                                    sx={{
                                                        ml: -0.5,
                                                        zIndex: 2,
                                                        pointerEvents: "none"
                                                    }}
                                                />
                                            )}
                                            <Checkbox
                                                size="sm"
                                                disableIcon
                                                overlay
                                                label={
                                                    <Stack
                                                        direction="row"
                                                        spacing={2}
                                                        alignItems="center"
                                                        justifyContent="space-between"
                                                    >
                                                        <Typography>{dependencyGraph[analysis].pretty_name}</Typography>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            {dependencyGraph[analysis].tags &&
                                                                dependencyGraph[analysis].tags.map((tag) => (
                                                                    <Chip
                                                                        key={tag}
                                                                        variant="soft"
                                                                        size="sm"
                                                                        color="neutral"
                                                                        sx={{
                                                                            backgroundColor: "#F4F5F7",
                                                                            color: "#172B4D",
                                                                            fontSize: "12px",
                                                                            fontWeight: 500,
                                                                            borderRadius: "8px"
                                                                        }}
                                                                    >
                                                                        {tag}
                                                                    </Chip>
                                                                ))}
                                                        </Stack>
                                                    </Stack>
                                                }
                                                checked={selectedAnalysis === analysis}
                                                variant={selectedAnalysis === analysis ? "soft" : "outlined"}
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                    if (event.target.checked) {
                                                        setSelectedAnalysis(analysis);
                                                    } else {
                                                        setSelectedAnalysis("");
                                                    }
                                                }}
                                                slotProps={{
                                                    action: ({ checked }) => ({
                                                        sx: checked
                                                            ? {
                                                                  border: "1px solid",
                                                                  borderColor: "primary.500"
                                                              }
                                                            : {}
                                                    })
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                            </List>
                            {datawolfTools.length === 0 && <Loading />}
                        </Box>
                    </Stack>
                </CardContent>
                <CardActions>
                    <Button
                        variant="solid"
                        sx={{ backgroundColor: "primary.main" }}
                        startDecorator={<AddRoundedIcon />}
                        onClick={() => {
                            if (selectedAnalysis !== "") {
                                const newNode = getNodeFromToolV2(
                                    datawolfTools.find((tool) => tool.title === selectedAnalysis),
                                    dependencyGraph
                                );
                                if (newNode !== null) {
                                    addNodes([newNode]);
                                }
                                clearItems();
                            }
                        }}
                    >
                        Add
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    );
};

export default AddAnalysisModal;
