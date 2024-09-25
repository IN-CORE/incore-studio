import { extendTheme } from "@mui/joy/styles";

export const themeOptions = {
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536
        }
    },
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    light: "#0052CC",
                    main: "#344563",
                    subtle: "#44546F"
                },
                neutral: {
                    info: "#42526E",
                    background: "#EBECF0"
                },
                danger: {
                    main: "#EA580C"
                }
            }
        }
    },
    typography: {
        fontFamily: "Open Sans, sans-serif"
    },
    components: {
        JoyTabs: {
            styleOverrides: {
                root: {
                    backgroundColor: "transparent" // Remove background color for Tabs
                },
                indicator: {
                    backgroundColor: "var(--joy-palette-primary-light)" // Underline color for selected tab
                }
            }
        },
        JoyTab: {
            styleOverrides: {
                root: {
                    "color": "var(--joy-palette-primary-subtle)", // Text color for non-selected tab
                    "backgroundColor": "transparent", // Remove background color for each Tab
                    "&.Mui-selected": {
                        color: "var(--joy-palette-primary-light)", // Text color for selected tab
                        backgroundColor: "transparent" // Ensure selected Tab has no background color
                    }
                }
            }
        },
        JoyCard: {
            styleOverrides: {
                root: {
                    backgroundColor: "transparent"
                }
            }
        }
    }
};

// @ts-ignore
export const theme = extendTheme(themeOptions);
