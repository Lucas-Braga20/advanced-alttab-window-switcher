'use strict';

const { Gtk, GLib, GObject } = imports.gi;
// libadwaita is available starting with GNOME Shell 42.
let Adw = null;
try {
  Adw = imports.gi.Adw;
} catch (e) {
}

const ExtensionUtils = imports.misc.extensionUtils;
const Me             = ExtensionUtils.getCurrentExtension();
const Settings       = Me.imports.settings;

let   mscOptions;

// gettext
const _  = Settings._;

const Actions = Settings.Actions;

const actionList = [
    [_('Do Nothing'),                      Actions.NONE],
    [_('Select Next Item'),                Actions.SELECT_ITEM],
    [_('Activate Selected'),               Actions.ACTIVATE],
    [_('Switch Workspace'),                Actions.SWITCH_WS],
    [_('Open New Window'),                 Actions.NEW_WINDOW],
    [_('Show Selected'),                   Actions.SHOW],
    [_('Open Context Menu'),               Actions.MENU],
    [_('Switch Filter Mode'),              Actions.SWITCH_FILTER],
    [_('Toggle Single App Mode'),          Actions.SINGLE_APP],
    [_('Toggle Switcher Mode'),            Actions.SWITCHER_MODE],
    [_('Close/Quit Selected'),             Actions.CLOSE_QUIT],
    [_('Force Quit Selected App'),         Actions.KILL],
    [_('Move Selected to Current WS'),     Actions.MOVE_TO_WS],
    [_('Fullscreen Selected on Empty WS'), Actions.FS_ON_NEW_WS],
    [_('Group by Applications'),           Actions.GROUP_APP],
    [_('Current Monitor First'),           Actions.CURRENT_MON_FIRST],
    [_('Create Window Thumbnail'),         Actions.THUMBNAIL],
    [_('Hide Switcher Popup'),             Actions.HIDE],
    [_('Open Preferences'),                Actions.PREFS],
];

function init() {
    ExtensionUtils.initTranslations(Me.metadata['gettext-domain']);
    mscOptions = new Settings.MscOptions();
}

function fillPreferencesWindow(window) {
    const commonOptionsPage   = getAdwPage(_getCommonOptionList(), {
        title: _('Common'),
        icon_name: 'preferences-system-symbolic',
    });
    const windowOptionsPage   = getAdwPage(_getWindowOptionList(), {
        title: _('Window Switcher'),
        icon_name: 'focus-windows-symbolic',
    });
    const appOptionsPage      = getAdwPage(_getAppOptionList(), {
        title: _('App Switcher'),
        icon_name: 'view-app-grid-symbolic',
    });
    const miscOptionsPage     = getAdwPage(_getMiscOptionList(), {
        title: _('Misc'),
        icon_name: 'preferences-other-symbolic',
    });
    const hotkeysOptionPage   = getAdwPage(_getHotkeysOptionList(), {
        title: _('Hotkeys'),
        icon_name: 'input-keyboard-symbolic',
    });
    window.add(commonOptionsPage);
    window.add(windowOptionsPage);
    window.add(appOptionsPage);
    window.add(miscOptionsPage);
    window.add(hotkeysOptionPage);

    window.set_search_enabled(true);

    return window;
}

function buildPrefsWidget() {
    const prefsWidget = new Gtk.Notebook({
        tab_pos: Gtk.PositionType.TOP,
    });

    const pageProperties = {
        hscrollbar_policy: Gtk.PolicyType.NEVER,
        vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
        vexpand: true,
        hexpand: true,
    };
    const commonOptionsPage   = getLegacyPage(_getCommonOptionList(), pageProperties);
    const windowOptionsPage   = getLegacyPage(_getWindowOptionList(), pageProperties);
    const appOptionsPage      = getLegacyPage(_getAppOptionList(), pageProperties);
    const miscOptionsPage     = getLegacyPage(_getMiscOptionList(), pageProperties);
    const hotkeysOptionPage   = getLegacyPage(_getHotkeysOptionList(), pageProperties);


    prefsWidget.append_page(commonOptionsPage, new Gtk.Label({ label: _('Common') }));
    prefsWidget.append_page(windowOptionsPage, new Gtk.Label({ label: _('Window Switcher') }));
    prefsWidget.append_page(appOptionsPage, new Gtk.Label({ label: _('App Switcher') }));
    prefsWidget.append_page(miscOptionsPage, new Gtk.Label({ label: _('Misc') }))
    prefsWidget.append_page(hotkeysOptionPage, new Gtk.Label({ label: _('Hotkeys') }))

    prefsWidget.connect('realize', _onRealize);
    prefsWidget.show_all && prefsWidget.show_all();

    return prefsWidget;
}

function _onRealize(widget) {
    const window = widget.get_root ? widget.get_root() : widget.get_toplevel();
    const width = 800;
    const height = 700;
    window.set_size_request(width, height);
}

function _getCommonOptionList() {
    // options item format:
    // [text, tooltip, widget, settings-variable, options (f.e. combo list)]
    const opt = _getCommonOpt();

    const optionList = [
        opt.Behavior,
            opt.SuperKeyMode,
            opt.Position,
            opt.DefaultMonitor,
            opt.ShowImediately,
            opt.SearchModeDefault,
            opt.UpDownArrowAction,
            opt.HotkesRequireShift,
            opt.WraparoundSelector,
            opt.HoverSelectsItem,
            opt.DelayShowingSwitcher,
        opt.Appearance,
            opt.OverlayTitle,
            opt.ShowDirectActivation,
            opt.ShowStatus,
            opt.TooltipLabelScale,
            opt.SingleAppPreviewSize,
        opt.MouseControl,
            opt.PrimaryBackground,
            opt.SecondaryBackground,
            opt.MiddleBackground,
            opt.ScrollBackground,
            opt.PrimaryOutside,
            opt.SecondaryOutside,
            opt.MiddleOutside,
            opt.ScrollOutside,
    ];

    return optionList;
}

function _getWindowOptionList() {
    const opt = _getWindowsOpt();

    const optionList = [
        opt.Behavior,
            opt.DefaultFilter,
            opt.DefaultSorting,
            opt.DefaultGrouping,
            opt.DistinguishMinimized,
            opt.MinimizedEnd,
            opt.SkipMinimized,
            opt.IncludeModals,
            opt.SearchAllWindows,
            opt.SearchApplications,
        opt.Appearance,
            opt.ShowWindowTitle,
            opt.ShowWorkspaceIndex,
            opt.WindowPreviewSize,
            opt.WindowIconSize,
        opt.MouseControl,
            opt.ScrollItem,
            opt.PrimaryItem,
            opt.SecondaryItem,
            opt.MiddleItem,
    ];

    return optionList;
}

function _getAppOptionList() {
    const opt = _getAppsOpt();

    const optionList = [
        opt.Behavior,
            opt.DefaultFilter,
            opt.DefaultSorting,
            opt.RaiseFirstWinOnly,
            opt.ResultsLimit,
            opt.SearchPrefRunning,
            opt.IncludeFavorites,
        opt.Appearance,
            opt.ShowAppTitle,
            opt.ShowWinCounter,
            opt.AppIconSize,
        opt.MouseControl,
            opt.ScrollItem,
            opt.PrimaryItem,
            opt.SecondaryItem,
            opt.MiddleItem,
    ];

    return optionList;
}

function _getMiscOptionList() {
    const opt = _getMiscOpt();

    const optionList = [
        opt.WorkspaceSwitcher,
            opt.Wraparound,
            opt.IgnoreLast,
            opt.ShowWsPopup,
        opt.Thumbnails,
            opt.ThumbnailScale,
        opt.ExternalTrigger,
            opt.MousePointerPosition,
            opt.AutomaticallyReverseOrder,
            opt.PointerOutTimeout,
            opt.ActivateOnHide
    ];

    return optionList;
}

function getOptionsPage(optionList, pageProperties = {}) {
    if (Adw) {
        return getAdwPage(optionList, pageProperties);
    } else {
        return getLegacyPage(optionList, pageProperties);
    }
}

function getAdwPage(optionList, pageProperties = {}) {
    pageProperties.width_request = 840;
    const page = new Adw.PreferencesPage(pageProperties);
    let group;
    for (let item of optionList) {
        // label can be plain text for Section Title
        // or GtkBox for Option
        const option = item[0];
        const widget = item[1];
        if (!widget) {
            if (group) {
                page.add(group);
            }
            group = new Adw.PreferencesGroup({
                title: option,
                hexpand: true,
                width_request: 700
            });
            continue;
        }

        const row = new Adw.PreferencesRow({
            title: option._title,
        });
        const grid = new Gtk.Grid({
            column_homogeneous: false,
            column_spacing: 20,
            margin_start: 8,
            margin_end: 8,
            margin_top: 8,
            margin_bottom: 8,
            hexpand: true,
        })
        /*for (let i of item) {
            box[box.add ? 'add' : 'append'](i);*/
        grid.attach(option, 0, 0, 1, 1);
        if (widget) {
            grid.attach(widget, 1, 0, 1, 1);
        }
        row.set_child(grid);
        group.add(row);
    }
    page.add(group);
    return page;
}

function getLegacyPage(optionList, pageProperties) {
    const page = new Gtk.ScrolledWindow(pageProperties);
    const mainBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 5,
        homogeneous: false,
        margin_start: 30,
        margin_end: 30,
        margin_top: 12,
        margin_bottom: 12,
    });

    let frame;
    let frameBox;
    for (let item of optionList) {
        // label can be plain text for Section Title
        // or GtkBox for Option
        const option = item[0];
        const widget = item[1];

        if (!widget) {
            const lbl = new Gtk.Label({
                xalign: 0,
            });
            lbl.set_markup(option);
            mainBox[mainBox.add ? 'add' : 'append'](lbl);
            frame = new Gtk.Frame({
                margin_bottom: 16,
            });
            frameBox = new Gtk.ListBox({
                selection_mode: null,
            });
            mainBox[mainBox.add ? 'add' : 'append'](frame);
            frame[frame.add ? 'add' : 'set_child'](frameBox);
            continue;
        }

        const grid = new Gtk.Grid({
            column_homogeneous: false,
            column_spacing: 20,
            margin_start: 8,
            margin_end: 8,
            margin_top: 8,
            margin_bottom: 8,
            hexpand: true,
        })
        /*for (let i of item) {
            box[box.add ? 'add' : 'append'](i);*/
        grid.attach(option, 0, 0, 5, 1);
        if (widget) {
            grid.attach(widget, 5, 0, 2, 1);
        }
        frameBox[frameBox.add ? 'add' : 'append'](grid);
    }
    page[page.add ? 'add' : 'set_child'](mainBox);

    return page;
}

///////////////////////////////////////////////////////////////////

function _newGtkSwitch() {
    let sw = new Gtk.Switch({
        halign: Gtk.Align.END,
        valign: Gtk.Align.CENTER,
        hexpand: true,
    });
    sw._is_switch = true;
    return sw;
}

function _newSpinButton(adjustment) {
    let spinButton = new Gtk.SpinButton({
        halign: Gtk.Align.END,
        valign: Gtk.Align.CENTER,
        hexpand: true,
        vexpand: false,
        xalign: 0.5,
    });
    spinButton.set_adjustment(adjustment);
    spinButton._is_spinbutton = true;
    return spinButton;
}

function _newComboBox() {
    const model = new Gtk.ListStore();
    model.set_column_types([GObject.TYPE_STRING, GObject.TYPE_INT]);
    const comboBox = new Gtk.ComboBox({
        model,
        halign: Gtk.Align.END,
        valign: Gtk.Align.CENTER,
        hexpand: true,
    });
    const renderer = new Gtk.CellRendererText();
    comboBox.pack_start(renderer, true);
    comboBox.add_attribute(renderer, 'text', 0);
    comboBox._is_combo_box = true;
    return comboBox;
}

function _newGtkEntry() {
    const entry = new Gtk.Entry({
        width_chars: 5,
        max_width_chars: 5,
        halign: Gtk.Align.END,
        valign: Gtk.Align.CENTER,
        hexpand: true,
        xalign: 0.5,
    });
    entry._is_entry = true;
    return entry;
}

// option item
// item[label, widget]

function _optionsItem(text, tooltip, widget, variable, options = []) {
    let item = [];
    let label;
    if (widget) {
        label = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 4,
            halign: Gtk.Align.START,
            valign: Gtk.Align.CENTER,
        });
        const option = new Gtk.Label({
            halign: Gtk.Align.START,
        });
        option.set_text(text);
        label[label.add ? 'add' : 'append'](option);

        if (tooltip) {
            const caption = new Gtk.Label({
                halign: Gtk.Align.START,
                wrap: true,
                /*width_chars: 80,*/
                xalign: 0
            })
            const context = caption.get_style_context();
            context.add_class('dim-label');
            context.add_class('caption');
            caption.set_text(tooltip);
            label[label.add ? 'add' : 'append'](caption);
        }
        label._title = text;
    } else {
        label = text;
    }
    item.push(label);
    item.push(widget);

    if (widget && widget._is_switch) {
        widget.active = mscOptions[variable];
        widget.connect('notify::active', () => {
            mscOptions[variable] = widget.active;
        });
    } else if (widget && widget._is_spinbutton) {
        widget.value = mscOptions[variable];
        widget.timeout_id = null;
        widget.connect('value-changed', () => {
            widget.update();
            if (widget.timeout_id) {
                GLib.Source.remove(widget.timeout_id);
            }

            widget.timeout_id = GLib.timeout_add(
                GLib.PRIORITY_DEFAULT,
                500,
                () => {
                    mscOptions[variable] = widget.value;
                    widget.timeout_id = null;
                    return 0;
                }
            );
        });
    } else if (widget && widget._is_combo_box) {
        let model = widget.get_model();
        for (const [label, value] of options) {
            let iter;
            model.set(iter = model.append(), [0, 1], [label, value]);
            if (value === mscOptions[variable]) {
                widget.set_active_iter(iter);
            }
        }
        widget.connect('changed', () => {
            const [success, iter] = widget.get_active_iter();

            if (!success) return;

            mscOptions[variable] = model.get_value(iter, 1);
        });
    } else if (widget && widget._is_entry) {
        if (variable.startsWith('hotkey')) {
            widget.connect('changed', (entry) => {
                if (entry._doNotEdit) return;

                entry._doNotEdit = true;
                let text = entry.get_text();
                let txt = '';
                for (let i = 0; i < text.length; i++) {
                    //if (/[a-zA-Z0-9]|/.test(text[i])) {
                    let char = text[i].toUpperCase();
                    if (!txt.includes(char)) {
                        txt += char;
                    }
                    //}
                }
                txt = txt.slice(0, 2);
                entry.set_text(txt);
                entry._doNotEdit = false;
                mscOptions[variable] = txt;
            });
            widget.set_text(mscOptions[variable]);
        } else {
            widget.width_chars = 25;
            widget.set_text(variable);
            widget.editable = false;
            widget.can_focus = false;
        }
    }

    return item;
}

/* function _makeSmall(label) {
    return `<small>${label}</small>`;
} */

function _makeTitle(label) {
    return `<b>${label}</b>`;
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

function _getCommonOpt() {
    const optDict = {};

    optDict.Behavior = _optionsItem(
            _makeTitle(_('Behavior')),
    );

    optDict.SuperKeyMode = _optionsItem(
            _('Super Key Mode'),
            _('Allows to open App switcher or Window switcher by pressing and releasing the Super key. Default mode doesn\'t change system behavior.'),
            _newComboBox(),
            'superKeyMode',
               [[_('Default'),          1],
                [_('App Switcher'),     2],
                [_('Window Switcher'),  3]]
    );

    optDict.Position = _optionsItem(
            _('Placement'),
            _('Where the switcher pop-up should appear on the screen.'),
            _newComboBox(),
            'switcherPopupPosition',
               [[_('Top'),    1],
                [_('Center'), 2],
                [_('Bottom'), 3]]
    );

    optDict.DefaultMonitor = _optionsItem(
            _('Default Monitor'),
            _('Monitor on which the switcher pop-up should appear. The Current one is where the mouse pointer is currently located.'),
            _newComboBox(),
            'switcherPopupMonitor',
               [[_('Current Monitor'), 1],
                [_('Primary Monitor'), 2]]
    );

    optDict.ShowImediately = _optionsItem(
            _('Show Selected Window'),
            _("Allows to see selected window in its original size immediately as the item is selected in the switcher. Preview shows a clone of the window, second option raises the original window and switches to its workspace."),
            _newComboBox(),
            'switcherPopupPreviewSelected',
            [[_('Disable'), 1],
             [_('Show Preview'), 2],
             [_('Show Window'), 3]]
    );

    optDict.SearchModeDefault = _optionsItem(
            _('Search Mode as Default'),
            _('Type to search immediately after the switcher pop-up shows up. Hotkeys then can be used while holding down the Shift key.'),
            _newGtkSwitch(),
            'switcherPopupStartSearch'
    );

    optDict.UpDownArrowAction = _optionsItem(
        _('Up/Down Keys Action'),
        _('Choose what Up/Down arrow keys should do.'),
        _newComboBox(),
        'switcherPopupUpDownAction',
           [[_('Nothing'), 1],
            [_('Switch Workspace'), 2],
            [_('Toggle Single App Mode'), 3],
            [_('Switcher Mode/Single App Mode'), 4]]
);

    optDict.HotkesRequireShift = _optionsItem(
            _('Action Hotkeys Require Shift'),
            _('A-Z action hotkeys, except for navigation and filter switching, will require you to hold down the Shift key.'),
            _newGtkSwitch(),
            'switcherPopupShiftHotkeys'
    );

    optDict.WraparoundSelector = _optionsItem(
            _('Wraparound Selector'),
            _('Whether the selection should continue from the last item to the first one and vice versa.'),
            _newGtkSwitch(),
            'switcherPopupWrap'
    );

    optDict.HoverSelectsItem = _optionsItem(
            _('Hover Selects Item'),
            _('Whether hovering the mouse pointer over a switcher item selects the item.'),
            _newGtkSwitch(),
            'switcherPopupHoverSelect'
    );

    optDict.Content = _optionsItem(
            _makeTitle(_('Content')),
    );

    optDict.OverlayTitle = _optionsItem(
            _('Show Tooltip Title'),
            _('The whole title of selected item will be displayed as a tooltip label above (or below if needed) the item.'),
            _newGtkSwitch(),
            'switcherPopupOverlayTitle'
    );

    let tooltipScaleAdjustment = new Gtk.Adjustment({
        upper: 300,
        lower: 50,
        step_increment: 5,
        page_increment: 5,
    });

    optDict.TooltipLabelScale = _optionsItem(
            _('Tooltip Label Scale (%)'),
            _('Change font size for tooltip label.'),
            _newSpinButton(tooltipScaleAdjustment),
            'switcherPopupTooltipLabelScale'
    );

    optDict.ShowDirectActivation = _optionsItem(
            _('Show Hotkeys F1-F12 for Direct Activation'),
            _('The hotkeys will work independently on this option.'),
            _newGtkSwitch(),
            'switcherPopupHotKeys'
    );

    optDict.ShowStatus = _optionsItem(
            _('Show Status'),
            _('Whether the label indicating filter, grouping and sorting modes should be displayed at the bottom left of the pop-up.'),
            _newGtkSwitch(),
            'switcherPopupStatus'
    );

    optDict.Appearance = _optionsItem(
            _makeTitle(_('Appearance')),
    );

    /*actionList.splice(6,1);
    actionList.splice(1,1);*/

    let singlePrevSizeAdjustment = new Gtk.Adjustment({
        upper: 512,
        lower: 16,
        step_increment: 8,
        page_increment: 32,
    });

    optDict.SingleAppPreviewSize = _optionsItem(
            _('Single App Preview Size (px)'),
            null,
            _newSpinButton(singlePrevSizeAdjustment),
            'singleAppPreviewSize'
    );

    let popupTimeoutAdjustment = new Gtk.Adjustment({
        upper: 400,
        lower: 10,
        step_increment: 10,
        page_increment: 100,
    });

    optDict.DelayShowingSwitcher = _optionsItem(
            _('Delay Showing Switcher (ms)'),
            _("Delay showing the pop-up so that fast Alt+Tab users aren't disturbed by the pop-up briefly flashing."),
            _newSpinButton(popupTimeoutAdjustment),
            'switcherPopupTimeout'
    );

    optDict.MouseControl = _optionsItem(
            _makeTitle(_('Mouse control')),
    );

    optDict.PrimaryBackground = _optionsItem(
            _('Primary Click on switcher Background'),
            _('Action to be triggered by a click of the primary (usualy left) mouse button on the switcher pop-up background'),
            _newComboBox(),
            'switcherPopupPrimClickIn',
            actionList
    );

    optDict.SecondaryBackground = _optionsItem(
            _('Secondary Click on switcher Background'),
            _('Action to be triggered by a click of the secondary (usualy right) mouse button on the switcher pop-up background'),
            _newComboBox(),
            'switcherPopupSecClickIn',
            actionList
    );

    optDict.MiddleBackground = _optionsItem(
            _('Middle Click on switcher Background'),
            _('Action to be triggered by a click of the middle mouse button on the switcher pop-up background'),
            _newComboBox(),
            'switcherPopupMidClickIn',
            actionList
    );

    optDict.ScrollBackground = _optionsItem(
            _('Scroll over switcher Background'),
            _('Action to be triggered by scrolling over the switcher pop-up, but not over the switcher item'),
            _newComboBox(),
            'switcherPopupScrollIn',
            actionList
    );

    optDict.PrimaryOutside = _optionsItem(
            _('Primary Click Outside switcher'),
            _('Action to be triggered by a click of the primary (usualy left) mouse button outside the switcher pop-up'),
            _newComboBox(),
            'switcherPopupPrimClickOut',
            actionList
    );

    optDict.SecondaryOutside = _optionsItem(
            _('Secondary Click Outside switcher'),
            _('Action to be triggered by a click of the secondary (usualy right) mouse button outside the switcher pop-up'),
            _newComboBox(),
            'switcherPopupSecClickOut',
            actionList
    );

    optDict.MiddleOutside = _optionsItem(
            _('Middle Click Outside switcher'),
            _('Action to be triggered by a click of the middle mouse button outside the switcher pop-up'),
            _newComboBox(),
            'switcherPopupMidClickOut',
            actionList
    );

    optDict.ScrollOutside = _optionsItem(
            _('Scroll Outside switcher'),
            _('Action to be triggered by scrolling outside of the switcher pop-up'),
            _newComboBox(),
            'switcherPopupScrollOut',
            actionList
    );

    return optDict;
}
// ////////////////////////////////////////////////

function _getWindowsOpt() {
    // options item format:
    // [text, tooltip, widget, settings-variable, options for combo]

    const optDict = {};

    optDict.Behavior =_optionsItem(
            _makeTitle(_('Behavior')),
    );

    optDict.DefaultFilter =_optionsItem(
            _('Default Filter'),
            _('Which windows should appear in the list. Filter can also be changed on the fly using a hotkey.'),
            _newComboBox(),
            'winSwitcherPopupFilter',
            [   [_('All'),               1],
                [_('Current Workspace'), 2],
                [_('Current Monitor'),   3]]
    );

    optDict.DefaultSorting =_optionsItem(
            _('Default Sorting'),
            _('What key should be used to sort the window list.'),
            _newComboBox(),
            'winSwitcherPopupSorting',
            [
                [_('Most Recently Used'),     1],
                [_('Stable Sequence'),        2],
                [_('Stable - Current First'), 3],
            ]
    );

    optDict.DefaultGrouping =_optionsItem(
            _('Default Grouping'),
            _('Group windows in the list by selected key.'),
            _newComboBox(),
            'winSwitcherPopupOrder',
            [   [_('None'),                  1],
                [_('Current Monitor First'), 2],
                [_('Applications'),          3],
                [_('Workspaces'),            4],
            ]
    );

    optDict.DistinguishMinimized =_optionsItem(
            _('Distinguish Minimized Windows'),
            _('The front icon of minimized windows will be faded.'),
            _newGtkSwitch(),
            'winMarkMinimized'
    );

    optDict.MinimizedEnd =_optionsItem(
            _('Minimized Windows at the End'),
            _('Moves minimized windows to the end of the list, which is the default AltTab behavior in GNOME Shell.'),
            _newGtkSwitch(),
            'winMinimizedToEnd'
    );

    optDict.SkipMinimized =_optionsItem(
            _('Skip Minimized Windows'),
            _('This option actually affects App switcher too.'),
            _newGtkSwitch(),
            'winSkipMinimized'
    );

    optDict.IncludeModals =_optionsItem(
        _('Include Modal Windows'),
        _('Modal windows, such as dialogs, are usually attached to their parent windows and cannot be focused separately. The default behavior of the window switcher is to ignore modal windows and list only their parents.'),
        _newGtkSwitch(),
        'winIncludeModals'
    );

    optDict.SearchAllWindows =_optionsItem(
            _('Search All Windows'),
            _('Automaticaly switch filter mode (if possible) when no search results for the currently selected filter mode.'),
            _newGtkSwitch(),
            'winSwitcherPopupSearchAll'
    );

    optDict.SearchApplications =_optionsItem(
            _('Search Applications'),
            _('Search installed applications to launch new when no window matches the entered pattern.'),
            _newGtkSwitch(),
            'winSwitcherPopupSearchApps'
    );

    optDict.Content =_optionsItem(
            _makeTitle(_('Content')),
    );

    optDict.ShowWindowTitle =_optionsItem(
            _('Show Window Titles'),
            _('Whether window titles should be displayed under each window item in the list.'),
            _newComboBox(),
            'winSwitcherPopupTitles',
               [[_('Enabled'), 1],
                [_('Disabled'), 2],
                [_('Single App Mode only'), 3]],
    );

    optDict.ShowWorkspaceIndex =_optionsItem(
            _('Show Workspace Index'),
            _('Place a label with corresponding workspace index over each window thumbnail.'),
            _newGtkSwitch(),
            'winSwitcherPopupWsIndexes'
    );

    optDict.Appearance =_optionsItem(
            _makeTitle(_('Appearance')),
    );

    const popupSizeAdjustment = new Gtk.Adjustment({
        upper: 512,
        lower: 16,
        step_increment: 8,
        page_increment: 32,
    });

    optDict.WindowPreviewSize =_optionsItem(
            _('Window Preview Size (px)'),
            null,
            _newSpinButton(popupSizeAdjustment),
            'winSwitcherPopupPreviewSize'
    );

    let popupIconSizeAdjustment = new Gtk.Adjustment({
        upper: 512,
        lower: 16,
        step_increment: 8,
        page_increment: 32,
    });

    optDict.WindowIconSize =_optionsItem(
            _('Window Icon Size (px)'),
            null,
            _newSpinButton(popupIconSizeAdjustment),
            'winSwitcherPopupIconSize'
    );

    optDict.MouseControl =_optionsItem(
            _makeTitle(_('Mouse control')),
    );

    optDict.ScrollItem =_optionsItem(
            _('Scroll Over Item'),
            _('Action to be triggered by scrolling over any switcher item (window icon)'),
            _newComboBox(),
            'winSwitcherPopupScrollItem',
            actionList
    );

    let winActionList = [...actionList];
    /*winActionList.splice(6,1);
    winActionList.splice(1,1);*/
    optDict.PrimaryItem =_optionsItem(
            _('Primary Click on Item'),
            _('Action to be triggered by a click of the primary (usualy left) mouse button on any switcher item (window icon)'),
            _newComboBox(),
            'winSwitcherPopupPrimClickItem',
            winActionList
    );

    optDict.SecondaryItem =_optionsItem(
            _('Secondary Click on Item'),
            _('Action to be triggered by a click of the secondary (usualy right) mouse button on any switcher item (window icon)'),
            _newComboBox(),
            'winSwitcherPopupSecClickItem',
            winActionList
    );

    optDict.MiddleItem =_optionsItem(
            _('Middle Click on Item'),
            _('Action to be triggered by a click of the middle mouse button on any switcher item (window icon)'),
            _newComboBox(),
            'winSwitcherPopupMidClickItem',
            winActionList
    );

    return optDict;
}
// //////////////////////////////////////////////////////////////////////

function _getAppsOpt() {
    // options item format:
    // [text, tooltip, widget, settings-variable, options for combo]

    const optDict = {};

    optDict.Behavior = _optionsItem(
            _makeTitle(_('Behavior')),
    );

    optDict.DefaultFilter = _optionsItem(
            _('Default Filter'),
            _('Which applications should appear in the list. Filter can also be changed on the fly using a hotkey.'),
            _newComboBox(),
            'appSwitcherPopupFilter',
            [
                [_('All'),               1],
                [_('Current Workspace'), 2],
                [_('Current Monitor'),   3],
            ]
    );

    optDict.DefaultSorting = _optionsItem(
            _('Default Sorting'),
            _('What key should be used to sort the app list.'),
            _newComboBox(),
            'appSwitcherPopupSorting',
            [
                [_('Most Recently Used'), 1],
                [_('Stable Sequence'),    2],
            ]
    );

    optDict.RaiseFirstWinOnly =_optionsItem(
            _('Raise First Window Only'),
            _('If you activate a running app, only its most recently used window will be raised, instead of raising all app windows above windows of all other apps.'),
            _newGtkSwitch(),
            'appSwitcherPopupRaiseFirstOnly'
    );

    optDict.SearchPrefRunning =_optionsItem(
        _('Prioritize Running Apps'),
        _('Whether the search engine should prioritize running applications.'),
        _newGtkSwitch(),
        'appSwitcherPopupSearchPrefRunning'
);

    let popupAppLimitAdjustment = new Gtk.Adjustment({
        upper: 30,
        lower: 5,
        step_increment: 1,
        page_increment: 1,
    });

    optDict.ResultsLimit = _optionsItem(
            _('Max Number of Search Results'),
            _('Maximum number of results that the search provider can return.'),
            _newSpinButton(popupAppLimitAdjustment),
            'appSwitcherPopupResultsLimit'
    );

    optDict.Content =_optionsItem(
            _makeTitle(_('Content')),
    );

    optDict.ShowAppTitle =_optionsItem(
            _('Show App Names'),
            _('Name of the application will be displayed under each app icon in the list.'),
            _newGtkSwitch(),
            'appSwitcherPopupTitles'
    );

    optDict.IncludeFavorites = _optionsItem(
            _('Include Favorite Apps'),
            _('List Dash favorite apps even when not runnig so you can use the switcher as a app launcher.'),
            _newGtkSwitch(),
            'appSwitcherPopupFavoriteApps'
    );

    optDict.ShowWinCounter =_optionsItem(
            _('Show Window Counter'),
            _('Replaces the default dot indicating running applications by the number of open windows.'),
            _newGtkSwitch(),
            'appSwitcherPopupWinCounter'
       );

    optDict.Appearance = _optionsItem(
            _makeTitle(_('Appearance')),
    );

    let appActionList = [...actionList];

    let popupAppIconSizeAdjustment = new Gtk.Adjustment({
        upper: 512,
        lower: 16,
        step_increment: 8,
        page_increment: 32,
    });

    optDict.AppIconSize = _optionsItem(
            _('App Icon Size (px)'),
            null,
            _newSpinButton(popupAppIconSizeAdjustment),
            'appSwitcherPopupIconSize'
    );

    optDict.MouseControl = _optionsItem(
            _makeTitle(_('Mouse control')),
    );

    optDict.ScrollItem = _optionsItem(
            _('Scroll Over Item'),
            _('Action to be triggered by scrolling over any switcher item (window icon)'),
            _newComboBox(),
            'appSwitcherPopupScrollItem',
            appActionList
    );

    // appActionList.splice(6,1);
    // appActionList.splice(1,1);
    optDict.PrimaryItem = _optionsItem(
            _('Primary Click on Item'),
            _('Action to be triggered by a click of the primary (usualy left) mouse button on any switcher item (app icon)'),
            _newComboBox(),
            'appSwitcherPopupPrimClickItem',
            appActionList
    );

    optDict.SecondaryItem = _optionsItem(
            _('Secondary Click on Item'),
            _('Action to be triggered by a click of the secondary (usualy right) mouse button on any switcher item (app icon)'),
            _newComboBox(),
            'appSwitcherPopupSecClickItem',
            appActionList
    );

    optDict.MiddleItem = _optionsItem(
            _('Middle Click on Item'),
            _('Action to be triggered by a click of the middle mouse button on any switcher item (app icon)'),
            _newComboBox(),
            'appSwitcherPopupMidClickItem',
            appActionList
    );

    return optDict;
}

////////////////////////////////////////////////////////////////////////////////////////////////

function _getMiscOpt() {
    const optDict = {};

    optDict.WorkspaceSwitcher = _optionsItem(
            _makeTitle(_('Workspace Switcher')),
    );

    optDict.Wraparound = _optionsItem(
            _('Wraparound'),
            _('Whether the switcher should continue from the last workspace to the first one and vice versa.'),
            _newGtkSwitch(),
            'wsSwitchWrap'
    );

    optDict.IgnoreLast = _optionsItem(
            _('Ignore Last (empty) Workspace'),
            _("If dynamic workspaces are enabled (default for GNOME), there is always one empty workspace at the end of the list. The switcher can ignore this workspace like it's not there."),
            _newGtkSwitch(),
            'wsSwitchIgnoreLast'
    );

    optDict.ShowWsPopup = _optionsItem(
            _('Show Workspace Pop-up'),
            _('While switching a workspace'),
            _newGtkSwitch(),
            'wsSwitchPopup'
    );

    optDict.Thumbnails = _optionsItem(
            _makeTitle(_('DND Window Thumbnails')),
            null,
            null
    );

    let tmbScaleAdjustment = new Gtk.Adjustment({
            lower: 5,
            upper: 50,
            step_increment: 1,
            page_increment: 10,
        }
    );

    optDict.ThumbnailScale = _optionsItem(
            _('Thumbnail Height Scale (%)'),
            _('Height of the thumbnail relative to the screen height'),
            _newSpinButton(tmbScaleAdjustment),
            'winThumbnailScale'
    );

    optDict.ExternalTrigger = _optionsItem(
            _makeTitle(_('Options for External Trigger')),
    );

    optDict.MousePointerPosition = _optionsItem(
            _('Pop-up at Mouse Pointer Position (if triggered by mouse)'),
            _('If variable KEYBOARD_TRIGGERED is set to false, then this option is reflected.'),
            _newGtkSwitch(),
            'switcherPopupPointer'
    );

    optDict.AutomaticallyReverseOrder = _optionsItem(
            _('Automatically Reverse List Order'),
            _('List switcher items from right to left if this helps the mouse pointer be closer to the first item.'),
            _newGtkSwitch(),
            'switcherPopupReverseAuto'
    );

    let popupPointerTimeoutAdjustment = new Gtk.Adjustment({
        upper: 60000,
        lower: 100,
        step_increment: 100,
        page_increment: 1000,
    });

    optDict.PointerOutTimeout = _optionsItem(
            _('Pointer Out Timeout (ms)'),
            _('If the switcher is activated by the mouse, the pop-up closes after this period of inactivity if the mouse pointer is outside the pop-up.'),
            _newSpinButton(popupPointerTimeoutAdjustment),
            'switcherPopupPointerTimeout'
    );

    optDict.ActivateOnHide = _optionsItem(
            _('Activate Selected Item on Hide'),
            _('When you move mouse pointer outside the switcher pop-up and "Pointer out timeout" expires, selected item will be activated before pop-up hides.'),
            _newGtkSwitch(),
            'switcherPopupActivateOnHide'
    );

    return optDict;
}

function _getHotkeysOptionList() {
    let optionList = [];
    // options item format:
    // [text, tooltip, widget, settings-variable, options for combo]

    optionList.push(_optionsItem(
            _makeTitle(_('Hotkeys configuration (you can set up to 2 characters for each action)')),
            "You can enter up to two hotkeys for each action, the second one is primarily dedicated to include non [a-zA-Z] keys with Shift pressed.\n\
Delete hotkey to disable the action.\n\
All hotkeys work directly or with Shift key pressed, if it's set in Preferences or if the Search mode is turned on."
        )
    );

    optionList.push(_optionsItem(
            _('Switch Filter mode'),
            _('Switches the window filter mode - ALL / WS / MONITOR (the Monitor mode is skipped if single monitor is used or if the secondary monitor is empty).'),
            _newGtkEntry(),
            'hotkeySwitchFilter'
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Search Mode On/Off'),
            _("You can enter multiple patterns separated by a space and in arbitrary order to search windows and apps by window titles, app names, app generic names, comment, categories, keywords, and app executables, so you can find most of editor apps by typing an 'edit', games by typing 'game' and so on."),
            _newGtkEntry(),
            'hotkeySearch'
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Sort by Workspace'),
            _('Toggles sorting by workspace, when Filter Mode is set to ALL.'),
            _newGtkEntry(),
            'hotkeyGroupWs'
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Show Only Windows of Selected App'),
            _('Toggles Single App mode - list only the windows of the selected application.'),
            _newGtkEntry(),
            'hotkeySingleApp'
        )
    );

    optionList.push(_optionsItem(
            _('Close Window / Quit Application'),
            _('Closes the selected window or quits application, depending on the current Switcher Mode.'),
            _newGtkEntry(),
            'hotkeyCloseQuit'
        )
    );

    optionList.push(_optionsItem(
            _('Close All Windows of Selected App'),
            _('Closes all windows in the list that belong to the same application as the selected window/application.'),
            _newGtkEntry(),
            'hotkeyCloseAllApp'
        )
    );

    optionList.push(_optionsItem(
            _('Open New Window'),
            _('Opens a new window of the selected application if the apllication supports it. You can also use default shortcut Ctrl+Enter'),
            _newGtkEntry(),
            'hotkeyNewWin'
        )
    );

    optionList.push(_optionsItem(
            _('Move Window/App to Current Workspace/Monitor'),
            _('Moves the selected window or windows of selected application to the current workspace and monitor.\
The current monitor is the one where the switcher pop-up is located, or where the mouse pointer is currently located if the switcher was triggered by a mouse from the Custom Hot Corners - Extended extension.'),
            _newGtkEntry(),
            'hotkeyMoveWinToMonitor'
        )
    );

    optionList.push(_optionsItem(
            _('Toggle "Always on Top"'),
            _("Toggles window 'Always on Top'. Also switches to the window workspace and rise the window.\
This state is indicated by the front icon on top instead of the bottom.\
If you press the 'A' key twice, it's actually equivalent to the one press of hotkey for 'Show selected window'"),
            _newGtkEntry(),
            'hotkeyAbove'
        )
    );

    optionList.push(_optionsItem(
            _('Toggle "Always on Visible Workspace"'),
            _(''),
            _newGtkEntry(),
            'hotkeySticky'
        )
    );

    optionList.push(_optionsItem(
            _('Fullscreen on New Workspace'),
            _('Moves the selected window to the new empty workspace next to its current workspace and switches the window to the fullscreen mode.\
Next use of this hotkey on the same window moves the window back to its original workspace (if exists) and turns off the fullscreen mode.'),
            _newGtkEntry(),
            'hotkeyFsOnNewWs'
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Maximize on Current Workspce/Monitor'),
            _('Toggles full maximization of the selected window on the current workspace and monitor.\
The current monitor is the one where the switcher pop-up is located, or where the mouse pointer is currently located if the switcher was triggered by a mouse from the Custom Hot Corners - Extended extension.'),
            _newGtkEntry(),
            'hotkeyMaximize'
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Switcher Mode (Win/App)'),
            _('Toggles between Windows and Applications modes'),
            _newGtkEntry(),
            'hotkeySwitcherMode'
        )
    );

    optionList.push(_optionsItem(
            _('Create Window Thumbnail'),
            _('Creates a thumbnail preview of the selected window and places it at the bottom right of the current monitor. \
You can move the thumbnail anywhere on the screen using a mouse drag & drop and you can make as many thumbnails as you want.\n\
To remove lastly created thumbnail, use this hotkey while pressing Ctrl key.\n\
To remove all created thumbnails, use this hotkey while pressing Shift and Ctrl keys.\n\
Thumbnail controls:\n\
    Double click:    \t\tactivates the source window\n\
    Primary click:   \t\ttoggles scroll wheel function (resize / source)\n\
    Secondary click: \t\tremoves the thumbnail\n\
    Middle click:    \t\tcloses the source window\n\
    Scroll wheel:    \t\tresizes or changes the source window\n\
    Ctrl + Scroll wheel: \tchange source window or resize\n\
    Shift + Scroll wheel: \tadjust opacity\n\
    Ctrl + Primary click: \tToggles thumbnail between a window preview and app icon'),
            _newGtkEntry(),
            'hotkeyThumbnail'
        )
    );

    optionList.push(_optionsItem(
            _('Open Preferences'),
            _('Opens AATWS preferences window.'),
            _newGtkEntry(),
            'hotkeyPrefs'
        )
    );

    optionList.push(_optionsItem(
            _('Left'),
            _('Has the same functionality as arrow Left. Selects previous item, if Search mode is off.'),
            _newGtkEntry(),
            'hotkeyLeft'
        )
    );

    optionList.push(_optionsItem(
            _('Down'),
            _('Has the same functionality as arrow Down. Switches to next workspace, if Search mode is off.'),
            _newGtkEntry(),
            'hotkeyDown'
        )
    );

    optionList.push(_optionsItem(
            _('Up'),
            _('Has the same functionality as arrow Up. Switches to previous workspace, if Search mode is off.'),
            _newGtkEntry(),
            'hotkeyUp'
        )
    );

    optionList.push(_optionsItem(
            _('Right'),
            _('Has the same functionality as arrow Right. Slects next item, if Search mode is off.'),
            _newGtkEntry(),
            'hotkeyRight'
        )
    );

    // Fixed Hotkeys ///////////////////////////////////////////////
    // instead of settings variables include strings with predefined hotkeys
    optionList.push(_optionsItem(
            _makeTitle(_('Fixed Hotkeys')),
            '',
            null,
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Switcher Mode'),
            _('Switch between Apps and Windows Modes.'),
            _newGtkEntry(),
            _('Ctrl + `/~, Ctrl + Super')
        )
    );

    optionList.push(_optionsItem(
            _('Select Previous/Next Item'),
            '',
            _newGtkEntry(),
            _('Left/Right Arrow Keys')
        )
    );

    optionList.push(_optionsItem(
            _('Switch to Previous/Next Workspace'),
            '',
            _newGtkEntry(),
            _('Up/Down Arrow Keys')
        )
    );

    optionList.push(_optionsItem(
            _('Window Mode: Iterate over Aplications'),
            _('Switcher is in the Window mode: first press of the hotkey sorts windows by applications, each subsequent key press selects first window of the next app. Shift key changes direction.'),
            _newGtkEntry(),
            _('`/~ (key above Tab)')
        )
    );

    optionList.push(_optionsItem(
            _('App Mode: Switch to Single App Switcher'),
            _('Switcher is in the App mode: first press of the hotkey switches to Single App mode, each subsequent key press selects next window and Tab key switches back to the App view.'),
            _newGtkEntry(),
            _('`/~ (key above Tab)')
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Search Mode On/Off'),
            _("See the customizable hotkey above for details."),
            _newGtkEntry(),
            _('Insert')
        )
    );

    optionList.push(_optionsItem(
            _('Clear Search Entry'),
            _('Clears typed pattern when the switcher is in Search mode.'),
            _newGtkEntry(),
            _('Del')
        )
    );

    optionList.push(_optionsItem(
            _('Force Quit'),
            _('Sends kill -9 signal to the selected aplication or application of selected window.'),
            _newGtkEntry(),
            _('Ctrl + Del')
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Preview Selected Window'),
            _('Toggles preview of selected window On/Off.'),
            _newGtkEntry(),
            _('Space, NumKey 0')
        )
    );

    optionList.push(_optionsItem(
            _('Move Switcher to Adjacent Monitor'),
            '',
            _newGtkEntry(),
            _('Ctrl + Left/Right/Up/Down')
        )
    );

    optionList.push(_optionsItem(
            _('Move Switcher to Next Monitor'),
            _('Order is given by the Shell'),
            _newGtkEntry(),
            _('Ctrl + Tab')
        )
    );

    optionList.push(_optionsItem(
            _('Move Window/App to Current Workspace/Monitor'),
            _('Moves the selected window or windows of selected application to the current workspace and monitor.'),
            _newGtkEntry(),
            _('Ctrl + Down')
        )
    );

    optionList.push(_optionsItem(
            _('Move Window/App to New Workspace'),
            _('Moves the selected window or windows of selected application to the newly created workspace in front of or behind the current workspace.'),
            _newGtkEntry(),
            _('Ctrl + Shift + Up/Down')
        )
    );

    optionList.push(_optionsItem(
            _('Reorder Current Workspace'),
            _('Move the current workspace by one position left or right (up or down on GNOME < 40)'),
            _newGtkEntry(),
            _('Ctrl + PageUp/PageDown')
        )
    );

    optionList.push(_optionsItem(
            _('Reorder Favorite App'),
            _('In App Mode with Favorites Apps enabled you can change the possition of selected Favorite app. This change is system-wide.\n\
If apps are ordered by MRU, first pres of the hotkey reorders apps by Favorites'),
            _newGtkEntry(),
            _('Ctrl+Shift + Left/Right')
        )
    );

    optionList.push(_optionsItem(
            _('Toggle Activities Overview'),
            _('Closes the switcher and toggles Activities Overview.'),
            _newGtkEntry(),
            _('Shift + Super')
        )
    );

    optionList.push(_optionsItem(
            _('Toggle App Grid Overview'),
            _('Closes the switcher and toggles App Grid Overview.'),
            _newGtkEntry(),
            _('Ctrl + Shift + Super')
        )
    );

    return optionList;
}
