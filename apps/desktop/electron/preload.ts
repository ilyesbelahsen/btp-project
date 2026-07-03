import { contextBridge, ipcRenderer } from "electron";

// Expose a safe, typed API to the renderer via window.electronAPI
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  // Example IPC channel — extend as needed
  send: (channel: string, data?: unknown) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      ...args: unknown[]
    ) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
});
