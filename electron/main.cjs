const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;

let mainWindow = null;
let backendProcess = null;

const FRONTEND_DEV_URL = "http://localhost:5173";
const BACKEND_PORT = process.env.PORT || "3001";
const BACKEND_FOLDER_NAME = "carfex-backend";

function getBackendRoot() {
  if (isDev) {
    return path.resolve(__dirname, "..", "..", BACKEND_FOLDER_NAME);
  }

  return path.join(process.resourcesPath, "backend");
}

function findBackendEntry(backendRoot) {
  const candidates = [
    path.join(backendRoot, "src", "server.js"),
    path.join(backendRoot, "server.js"),
    path.join(backendRoot, "src", "index.js"),
    path.join(backendRoot, "index.js"),
    path.join(backendRoot, "app.js"),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return null;
}

function startBackend() {
  const backendRoot = getBackendRoot();
  const backendEntry = findBackendEntry(backendRoot);

  if (!backendEntry) {
    dialog.showErrorBox(
      "Erro no backend",
      `Backend não encontrado.\n\nCaminho:\n${backendRoot}`
    );
    return false;
  }

  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    PORT: BACKEND_PORT,
  };

  backendProcess = spawn(process.execPath, [backendEntry], {
    cwd: backendRoot,
    env,
    stdio: "inherit",
    windowsHide: false,
  });

  backendProcess.on("error", (err) => {
    dialog.showErrorBox("Erro backend", err.message);
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend encerrado com código ${code}`);
    backendProcess = null;
  });

  return true;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    backgroundColor: "#020617",
    autoHideMenuBar: true,
    title: "CARFEX",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL("https://carfex-frontend.onrender.com");
  } else {
    mainWindow.loadURL("https://carfex-frontend.onrender.com");
  }
}

app.whenReady().then(() => {
  const ok = startBackend();

  if (!ok) return;

  setTimeout(createWindow, 1500);
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});

app.on("before-quit", () => {
  if (backendProcess) backendProcess.kill();
});