import { Tab, TabGroup, TabPanel, Tabs } from "solid-a11y";
import { createSignal } from "solid-js";

export default function ControlledExample() {
  // highlight-next-line
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  return (
    // highlight-next-line
    <TabGroup selectedIndex={selectedIndex()} onChange={setSelectedIndex}>
      <Tabs>
        <Tab>First tab</Tab>
        <Tab>Second tab</Tab>
        {/* ... */}
      </Tabs>
      <TabPanel index={0}>The first tab's content.</TabPanel>
      <TabPanel index={1}>The second tab's content.</TabPanel>
      {/* ... */}
    </TabGroup>
  );
}
