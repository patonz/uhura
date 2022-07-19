import IpseshAdapter from "../../../lib/adapters/ipsesh/adapter.js";

let ipseshAdapter = new IpseshAdapter({
  interface: "eth0",
  port: 4445,
  hostName: "LeoHost",
  cadence: 3000,
  brodcastIp: "172.27.143.255",
  framesForLink: 10,
});
