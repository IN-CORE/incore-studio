import React from "react";
import { Box, Container, Typography, Tabs, TabList, TabPanel, Tab } from "@mui/joy";

import Topbar from "./Topbar";
import Project from "../Project";

const Home = (): JSX.Element => {
    return (
        <>
            <Topbar />
            <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
                <Box sx={{ flexShrink: 0 }} mt={5}>
                    <Typography level="h1" textColor="primary.main" fontWeight="md">
                        Welcome to IN-CORE Studio
                    </Typography>
                    <Typography textColor="primary.main" mt={2}>
                        Lorem ipsum dolor sit amet consectetur. Iaculis lorem arcu nunc quisque tristique aliquet ut
                        aliquam arcu. Et est neque volutpat eu gravida convallis id pellentesque mattis. Id bibendum
                        porttitor lectus lacus sodales ultrices id luctus ultrices. Interdum odio lorem aliquet integer
                        morbi purus sit aenean. Rhoncus id viverra accumsan est vel vulputate elementum est id. Ut eget
                        iaculis porta cursus volutpat malesuada habitant etiam.
                    </Typography>
                </Box>
                <Box sx={{ flexShrink: 0 }} mt={5}>
                    <Box>
                        <Typography level="h3" textColor="primary.main" fontWeight="lg">
                            Projects
                        </Typography>
                        {/* placeholders for buttons */}
                    </Box>
                    <Box mt={2}>
                        <Tabs aria-label="Home tabs" defaultValue={0}>
                            <TabList>
                                <Tab>All</Tab>
                                <Tab>Recent</Tab>
                                <Tab>Shared with me</Tab>
                                <Tab>Archived</Tab>
                            </TabList>
                            <TabPanel value={0}>
                                <Project />
                            </TabPanel>
                            <TabPanel value={1}>In Development</TabPanel>
                            <TabPanel value={2}>In Development</TabPanel>
                            <TabPanel value={3}>In Development</TabPanel>
                        </Tabs>
                    </Box>
                    {/* Placeholder for filter boxes */}
                </Box>
            </Container>
        </>
    );
};

export default Home;
