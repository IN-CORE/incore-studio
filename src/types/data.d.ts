interface DatawolfCreator {
    id: string;
    deleted: boolean;
    email: string;
    firstName: string;
    lastName: string;
}

interface DatawolfIO {
    id: string;
    title: string;
    description: string;
    deleted: boolean;
    dataId: string;
    mimeType: string;
}

interface DatawolfToolParameter {
    id: string;
    title: string;
    description: string;
    deleted: boolean;
    type: string;
    parameterId: string;
    value: string;
    hidden: boolean;
    allowNull: boolean;
    options: [];
}

interface DatawolfWorkflowTool {
    id: string;
    deleted: boolean;
    title: string;
    description: string;
    version?: string;
    previousVersion?: string;
    date: string;
    implementation: string;
    creator: DatawolfCreator;
    contributors: DatawolfCreator[];
    inputs: DatawolfIO[];
    outputs: DatawolfIO[];
    parameters: DatawolfToolParameter[];
    executor: string;
    blobs: [];
}

interface DatawolfWorkflowFileStep {
    id: string;
    deleted: boolean;
    title: string;
    creator: DatawolfCreator;
    createDate: string;
    inputs: {
        [key: string]: string;
    };
    outputs: {
        [key: string]: string;
    };
    inputsToolData: {
        [key: string]: string | null;
    };
    outputsToolData: {
        [key: string]: string | null;
    };
    parameters: {
        [key: string]: string;
    };
    tool: DatawolfWorkflowTool;
}

interface DatawolfWorkflowFile {
    id: string;
    deleted: boolean;
    title: string;
    description: string;
    created: string;
    creator: DatawolfCreator;
    contributors: DatawolfCreator[];
    steps: DatawolfWorkflowFileStep[];
}

interface Hazard {
    id: string;
    type: string;
}

interface Mapping {
    id: string;
    type: string;
}

interface Dataset {
    id: string;
    type: string;
}

interface Workflow {
    id: string;
    type: string;
}

interface ProjectElement {
    id: string;
    type: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
    creator?: string;
    date?: string;
    owner?: string;
    region: string;
    hazards: Hazard[];
    dfr3Mappings: Mapping[];
    datasets: Dataset[];
    workflows: Workflow[];
}

interface ProjectState {
    projects: Project[];
    project: Project | null;
    projectDatasets: ProjectElement[];
    projectHazards: ProjectElement[];
    projectDFR3Mappings: ProjectElement[];
    projectWorkflows: ProjectElement[];
    loading: boolean;
    error: string | null;
}

interface FileDescriptor {
    id: string;
    deleted: boolean;
    filename: string;
    mimeType: string;
    size: number;
    dataURL: string;
    md5sum: string;
}

interface Dataset {
    id: string;
    deleted: boolean;
    title: string;
    description: string;
    date: string;
    creator: string;
    owner: string;
    spaces: string[];
    contributors: string[];
    fileDescriptors?: FileDescriptor[];
    dataType: string;
    storedUrl: string;
    format: string;
    sourceDataset?: string;
    boundingBox?: [number, number, number, number];
    networkDataset?: string | null;
}

interface DataState {
    dataset: Dataset;
    loading: boolean;
    error: string | null;
}
