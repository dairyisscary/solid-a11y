import { Tab, TabGroup, TabPanel, Tabs } from "solid-a11y";

export default function VerticalExample() {
  return (
    // highlight-next-line
    <TabGroup orientation="vertical">
      <Tabs class="flex flex-col space-y-2">
        <Tab index={0}>Vertical Tab 1</Tab>
        <Tab index={1}>Vertical Tab 2</Tab>
        {/* ... */}
      </Tabs>
      <TabPanel index={0}>First thing's first.</TabPanel>
      <TabPanel index={1}>And after that...</TabPanel>
      {/* ... */}
    </TabGroup>
  );
}
