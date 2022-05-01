import { Tab, TabGroup, TabPanel, Tabs } from "solid-a11y";

export default function ConditionalContentExample() {
  return (
    <TabGroup>
      <Tabs>
        <Tab
          // highlight-next-line
          classList={({ selected }) => ({ active: selected(), inactive: !selected() })}
        >
          {/* highlight-next-line */}
          {({ selected }) => `First tab is ${selected() ? "selected" : "not selected"}`}
        </Tab>
        <Tab>No Conditions on this</Tab>
        {/* ... */}
      </Tabs>
      <TabPanel index={0}>
        {/* highlight-next-line */}
        {() => <div>Super expensive content...</div>}
      </TabPanel>
      <TabPanel index={1}>The second tabs content is rendered once on init.</TabPanel>
      {/* ... */}
    </TabGroup>
  );
}
