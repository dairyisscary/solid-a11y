const JsdomEnv = require("jest-environment-jsdom");

module.exports = class SolidA11yJestEnv extends JsdomEnv {
  exportConditions() {
    return ["browser"];
  }
};
