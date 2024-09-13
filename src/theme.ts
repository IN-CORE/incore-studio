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
    }
};

export const theme = extendTheme(themeOptions);
