"use strict";

const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const pathSSH = GLib.get_home_dir() + "/.ssh";
const pathConfig = pathSSH + "/config";
const pathKnownHosts = pathSSH + "/known_hosts";

const hasSSH = !!GLib.find_program_in_path("ssh");
const hasConfig = !!GLib.file_test(pathConfig, GLib.FileTest.IS_REGULAR);
const hasKnownHosts = !!GLib.file_test(
  pathKnownHosts,
  GLib.FileTest.IS_REGULAR
);

function _getConfig() {
  if (!hasConfig) {
    return [];
  }
  const content = String(GLib.file_get_contents(pathConfig)[1])
    .replace(/[\r]/g, "")
    .split("\n");
  return content
    .map((line) => line.replace(/[\t ]+/, " ").replace(/(^ +| +$)/, ""))
    .filter((line) => line.match(/^Host [^*]/))
    .map((line) => line.replace(/^Host /, ""));
}

function _getKnownHosts() {
  if (!hasKnownHosts) {
    return [];
  }
  const content = String(GLib.file_get_contents(pathKnownHosts)[1])
    .replace(/[\r]/g, "")
    .split("\n");
  return content
    .map((line) => line.replace(/[\t ]+/, " ").replace(/(^ +| +$)/, ""))
    .filter((line) => line.match(/^[a-zA-Z0-9_.-]+ .+/))
    .map((line) => line.replace(/([^ ]+) .+/, "$1"));
}

async function execCommand(argv) {
  try {
    let proc = new Gio.Subprocess({
      argv: argv,
      flags: Gio.SubprocessFlags.STDOUT_PIPE,
    });
    proc.init(null);
    return new Promise((resolve, reject) => {
      proc.communicate_utf8_async(null, null, (proc, res) => {
        let ok, stdout, stderr;
        try {
          [ok, stdout, stderr] = proc.communicate_utf8_finish(res);
          ok ? resolve(stdout) : reject(stderr);
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (e) {
    logError(e);
    throw e;
  }
}

async function runSSH(host) {
  if (host.trim().length == 0) return;
  const cmd = ["gnome-terminal", "--", "ssh", host];
  execCommand(cmd);
}

function onClick(menu, host) {
  runSSH(host);
  menu.close();
}

function addItem(menu, section, host, action) {
  let item = new PopupMenu.PopupMenuItem(_(host));
  item.connect("activate", () => {
    action(menu, host);
  });
  section.addMenuItem(item);
}

function addItens(menu, section, hosts) {
  hosts.forEach((host) => {
    addItem(menu, section, host, onClick);
  });
}

function reloadMenuItens(menu, section) {
  const config = _getConfig();
  const knownHosts = _getKnownHosts();
  section.removeAll();
  if (config.length + knownHosts.length === 0) {
    addItem(menu, section, "No host found.", () => {
      onClick(menu, "");
    });
    return;
  }
  addItens(menu, section, config.sort());
  if (config.length > 0)
    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
  addItens(menu, section, knownHosts.sort());
}
