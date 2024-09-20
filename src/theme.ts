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
                    main: "#344563"
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
    }
};

// @ts-ignore
export const theme = extendTheme(themeOptions);
