"use strict";
/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'ssh-tray-extension';

const { GObject, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = ExtensionUtils.getCurrentExtension();
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Functions = Me.imports.functions;

const _ = ExtensionUtils.gettext;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('SSH Tray'));
        const icon = Gio.icon_new_for_string(Me.path + "/ssh-symbolic.svg");
        this.add_child(new St.Icon({
            //icon_name: icon,
            gicon: icon,
            style_class: 'system-status-icon',
        }));
        
        this.configSection = new PopupMenu.PopupMenuSection();
        this.configScrollSection = new PopupMenu.PopupMenuSection();

        let configScrollView = new St.ScrollView({
            style_class: 'ssh-tray-menu-section',
            overlay_scrollbars: true
        });
        configScrollView.add_actor(this.configSection.actor);
        
        this.configScrollSection.actor.add_actor(configScrollView);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addMenuItem(this.configScrollSection);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        Functions.reloadMenuItens(this.menu, this.configSection);
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}


