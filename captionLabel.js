/**
 * AATWS - Advanced Alt-Tab Window Switcher
 * CaptionLabel
 *
 * @author     GdH <G-dH@github.com>
 * @copyright  2021-2022
 * @license    GPL-3.0
 */

'use strict';

const { GObject, St, Clutter } = imports.gi;

const Main            = imports.ui.main;

const ExtensionUtils  = imports.misc.extensionUtils;
const Me              = ExtensionUtils.getCurrentExtension();
const Settings        = Me.imports.settings;

const shellVersion    = parseFloat(imports.misc.config.PACKAGE_VERSION);


var CaptionLabel = GObject.registerClass(
    class CaptionLabel extends St.BoxLayout {
        _init(params, options) {
            const SEARCH = params.name === 'search-label';
            this._options = options;
            this._xPosition = params.xPosition;
            this._yOffset = params.yOffset;
            this._parent = params.parent;
            this._monitorIndex = params.monitorIndex;
    
            super._init({
                style_class: this._options.colorStyle.CAPTION_LABEL,
                vertical: !SEARCH, // horizontal orientation for search label, vertical for title caption
                style: `font-size: ${params.fontSize}em;` // border-radius: 12px; padding: 6px; background-color: rgba(0, 0, 0, ${bgOpacity});`,
            });
    
            this._label = new St.Label({
                name: params.name,
                text: params.text,
                reactive: false,
                y_align: Clutter.ActorAlign.CENTER
            });
    
            if (SEARCH) {
                this.addSearchIcon();
                this._label.add_style_class_name('search-label');
            }
    
            this.add_child(this._label);
            if (params.description)
                this.addDetails(params.description);
    
            this._addToChrome();
            this.setPosition();
        }
    
        _addToChrome() {
            Main.layoutManager.addChrome(this);
            this.get_parent().set_child_above_sibling(this, null);
        }
    
        setPosition() {
            const xPos = this._xPosition;
            const parent = this._parent;
            const yOffset = this._yOffset;
    
            const geometry = global.display.get_monitor_geometry(this._monitorIndex);
            const margin = 8;
    
            this.width = Math.min(this.width, geometry.width);
    
            // win/app titles should be always placed centered to the switcher popup
            let captionCenter = xPos ? xPos : parent.allocation.x1 + parent.width / 2;
    
            // the +/-1 px compensates padding
            let x = Math.floor(Math.max(Math.min(captionCenter - (this.width / 2), geometry.x + geometry.width - this.width - 1), geometry.x + 1));
            let y = parent.allocation.y1 - this.height - yOffset - margin;
    
            if (y < geometry.y)
                y = parent.allocation.y2 + yOffset + margin;
    
            [this.x, this.y] = [x, y];
        }
    
        setText(text) {
            this._label.text = text;
        }
    
        addDetails(details) {
            if (!this._descriptionLabel) {
                this._descriptionLabel = new St.Label({
                    style_class: 'title-description',
                    style: `font-size: 0.7em;` // font size is relative to parent style
                });
            }
    
            this._descriptionLabel.text = details;
            this.add_child(this._descriptionLabel);
        }
    
        addSearchIcon() {
            const icon = new St.Icon({
                icon_name: 'edit-find-symbolic',
                style_class: `search-icon`
            });
            this.add_child(icon);
        }
    
        _destroy() {
            Main.layoutManager.removeChrome(this);
            super.destroy();
        }
    });