import React from "react";

interface FileObject {
    name: string;
    type: string;
    size: number;
    data: string;
}

interface FileUploadWidgetProps {
    value?: FileObject[]; // value can be undefined
    onChange: (files: FileObject[]) => void;
}

export const CustomFileUploadWidget: React.FC<FileUploadWidgetProps> = ({ value = [], onChange }) => {
    // Ensure value is an array (prevents undefined errors)
    const filesArray = Array.isArray(value) ? value : [];

    // Handle file selection and convert to Base64
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const convertedFiles = await Promise.all(
                Array.from(files).map(async (file) => ({
                    name: file?.name,
                    type: file?.type,
                    size: file?.size,
                    data: await convertFileToBase64(file) // Convert to Base64
                }))
            );
            onChange([...filesArray, ...convertedFiles]); // Append new files to existing ones
        }
    };

    // Convert file to Base64 Data URL
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Convert file to Base64
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
    };

    return (
        <div>
            <input type="file" multiple onChange={handleFileChange} />
            {filesArray.length > 0 && (
                <ul>
                    {filesArray.map((file, index) => (
                        <li key={index}>
                            {file.name} ({file.type}, {file.size} bytes)
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
