/* Copyright 2021 GdH <https://github.com/G-dH>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

const Main                   = imports.ui.main;
const ExtensionUtils         = imports.misc.extensionUtils;
const Me                     = ExtensionUtils.getCurrentExtension();
const WindowSwitcherPopup    = Me.imports.windowSwitcherPopup;
const Settings               = Me.imports.settings;
const AltTab                 = imports.ui.altTab;
let enabled                  = false;

let _origAltTabWSP;

function init() {
    ExtensionUtils.initTranslations(Me.metadata['gettext-domain']);
}

function enable() {
    let fullDisable = _extensionEnabled();
    if (enabled) {
        _resumeThumbnailsIfExist();
    } else {

    }
    _origAltTabWSP = AltTab.WindowSwitcherPopup;
    AltTab.WindowSwitcherPopup = WindowSwitcherPopup.WindowSwitcherPopup;
    enabled = true;
}

function disable() {
    if (_extensionEnabled()) {
        _removeThumbnails(false);
    } else {
        _removeThumbnails();
        AltTab.WindowSwitcherPopup = _origAltTabWSP;
        _origAltTabWSP = null;
        if (global.stage.windowThumbnails)
            global.stage.windowThumbnails = undefined;
        enabled = false;
    }
}

function _resumeThumbnailsIfExist() {
    if (global.stage.windowThumbnails)
        global.stage.windowThumbnails.forEach(
            (t) => { if (t) t.show(); }
        );
}

function _removeThumbnails(full = true) {
    if (full) {
        if (global.stage.windowThumbnails) {
            global.stage.windowThumbnails.forEach(
                (t) => { if (t) t.destroy(); }
            );
            global.stage.windowThumbnails = undefined;
        }
    } else {
        if (global.stage.windowThumbnails) {
            global.stage.windowThumbnails.forEach(
                    (t) => { if (t) t.hide(); }
                );
        }
    }
}

function _extensionEnabled() {
        const shellSettings = Settings.getSettings(
                            'org.gnome.shell',
                            '/org/gnome/shell/');
        let enabled = shellSettings.get_strv('enabled-extensions');
        enabled = enabled.indexOf(Me.metadata.uuid) > -1;
        let disabled = shellSettings.get_strv('disabled-extensions');
        disabled = disabled.indexOf(Me.metadata.uuid) > -1;
        let disableUser = shellSettings.get_boolean('disable-user-extensions');

        if(enabled && !disabled && !disableUser)
            return true;
        return false;
    }