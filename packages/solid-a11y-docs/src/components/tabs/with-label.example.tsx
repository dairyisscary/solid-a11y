import { Label, Tab, TabGroup, TabPanel, Tabs } from "solid-a11y";

export default function WithLabelExample() {
  return (
    <TabGroup>
      {/* highlight-next-line */}
      <Label>All of Acme's Wacky Offerings</Label>
      <Tabs>
        <Tab index={0}>Bugs Bunny</Tab>
        <Tab index={1}>Daffy Duck</Tab>
        <Tab index={2}>Elmer Fudd</Tab>
        {/* ... */}
      </Tabs>
      <TabPanel index={0}>Bugs Bunny eats carrots.</TabPanel>
      <TabPanel index={1}>Daffy Duck is a crazy character.</TabPanel>
      <TabPanel index={2}>Elmer Fudd hunts the duck.</TabPanel>
      {/* ... */}
    </TabGroup>
  );
}
