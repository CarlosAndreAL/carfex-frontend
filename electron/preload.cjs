const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("carfexDesktop", {
  versao: "1.0.0",
});