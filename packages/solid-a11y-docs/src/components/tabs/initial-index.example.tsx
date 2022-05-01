import { Tab, TabGroup, TabPanel, Tabs } from "solid-a11y";

export default function InitialIndexExample() {
  return (
    // highlight-next-line
    <TabGroup initialIndex={1}>
      <Tabs>
        <Tab>First tab</Tab>
        {/* highlight-next-line */}
        <Tab>Selected on initialization</Tab>
        {/* ... */}
      </Tabs>
      <TabPanel index={0}>The first tab's content.</TabPanel>
      {/* highlight-next-line */}
      <TabPanel index={1}>The second tab will start as visible.</TabPanel>
      {/* ... */}
    </TabGroup>
  );
}
