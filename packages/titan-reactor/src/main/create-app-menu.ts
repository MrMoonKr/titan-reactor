import { Menu, shell } from "electron";
import { showOpenMapDialog, showOpenReplayDialog } from "./register-ipc-handlers/dialogs";
import getUserDataPath from "./get-user-data-path";
import path from "path";

const settingsPath = path.join(getUserDataPath(), "settings.json");
export const logFilePath = path.join(getUserDataPath(), "logs", "app");

export default (onOpenPluginManager: () => void) => {

  const template = [
    {
      label: "&File",
      submenu: [
        { type: "separator" },
        {
          label: "Open &Map",
          click: function () {
            showOpenMapDialog();
          },
        },
        {
          label: "Open &Replay",
          click: function () {
            showOpenReplayDialog();
          },
        },
        { type: "separator" },
        {
          label: "&Preferences (settings.json)",
          click: function () {
            shell.showItemInFolder(settingsPath)
          },
        },
        { type: "separator" },
        { role: "quit" }
      ],
    },
    {
      label: "&View",
      submenu: [
        { role: "reload" },
        {
          label: "&Settings \& Plugin Manager",
          click: function () {
            onOpenPluginManager();
          },
        },
        { type: "separator" },
        {
          label: "View &Log File(s)",
          click: function () {
            shell.showItemInFolder(logFilePath);
          },
        },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "&DarkMatter",
      // role: "help",
      submenu: [
        {
          label: "Github",
          click: async () => {
            await shell.openExternal("https://github.com/imbateam-gg/titan-reactor");
          },
        },
        {
          label: "Discord",
          click: async () => {
            await shell.openExternal("http://discord.imbateam.gg");
          },
        },
        {
          label: "Patreon",
          click: async () => {
            await shell.openExternal("http://discord.imbateam.gg");
          },
        },
        {
          label: "Merchandise",
          click: async () => {
            await shell.openExternal("http://discord.imbateam.gg");
          },
        },
        {
          label: "Bittip",
          click: async () => {
            await shell.openExternal("http://discord.imbateam.gg");
          },
        }
      ],
    },
  ];

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}