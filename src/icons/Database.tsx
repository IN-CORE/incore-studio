import React from "react";

type Props = {
    size?: number;
};

export function DatabaseIcon({ size = 16 }: Props) {
    return (
        <svg width={size} height={size} viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12.125 3.125C12.125 4.16053 9.6066 5 6.5 5C3.3934 5 0.875 4.16053 0.875 3.125M12.125 3.125C12.125 2.08947 9.6066 1.25 6.5 1.25C3.3934 1.25 0.875 2.08947 0.875 3.125M12.125 3.125V11.875C12.125 12.9125 9.625 13.75 6.5 13.75C3.375 13.75 0.875 12.9125 0.875 11.875V3.125M12.125 7.5C12.125 8.5375 9.625 9.375 6.5 9.375C3.375 9.375 0.875 8.5375 0.875 7.5"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
