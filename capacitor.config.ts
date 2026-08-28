import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.sociobot.hearingmodenotes",
  appName: "Hearing Mode Notes",
  webDir: "dist",
  backgroundColor: "#F4EEDC",
  android: {
    backgroundColor: "#F4EEDC",
    allowMixedContent: false
  }
};

export default config;
