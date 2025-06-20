import React from "react";

type Props = {
    size?: number;
};

export function ArrowForward({ size = 16 }: Props) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M6.00031 5.41669L8.58698 8.00336L6.00031 10.59C5.74031 10.85 5.74031 11.27 6.00031 11.53C6.26031 11.79 6.68031 11.79 6.94031 11.53L10.0003 8.47002C10.2603 8.21002 10.2603 7.79002 10.0003 7.53002L6.94031 4.47002C6.68031 4.21002 6.26031 4.21002 6.00031 4.47002C5.74698 4.73002 5.74031 5.15669 6.00031 5.41669Z"
                fill="black"
            />
        </svg>
    );
}
