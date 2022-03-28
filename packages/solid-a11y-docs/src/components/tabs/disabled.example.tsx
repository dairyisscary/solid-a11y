import { Tab, TabGroup, TabPanel, Tabs } from "solid-a11y";

export default function DisabledTabExample() {
  return (
    <TabGroup>
      <Tabs>
        <Tab index={0}>Enabled Tab 1</Tab>
        {/* highlight-next-line */}
        <Tab index={1} disabled>
          Disabled Tab
        </Tab>
        <Tab index={2}>Enabled Tab 2</Tab>
        {/* ... */}
      </Tabs>
      <TabPanel index={0}>First tab's content.</TabPanel>
      <TabPanel index={1}>Second tab's content.</TabPanel>
      <TabPanel index={2}>Third tab's content.</TabPanel>
      {/* ... */}
    </TabGroup>
  );
}
