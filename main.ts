import { App, Setting, Editor, Notice, Plugin, PluginSettingTab, type EditorPosition } from 'obsidian';

// Replacement maps

// NOTE: I don't think this is a good way of writing maps but al least it's more readable and compact

const acuteChars = new Map<string, string>([
	['a', 'á'], ['A', 'Á'],
	['e', 'é'], ['E', 'É'],
	['i', 'í'], ['I', 'Í'],
	['o', 'ó'], ['O', 'Ó'],
	['u', 'ú'], ['U', 'Ú'],
	['y', 'ý'], ['Y', 'Ý'],
])

const graveChars = new Map<string, string>([
	['a', 'à'], ['A', 'À'],
	['e', 'è'], ['E', 'È'],
	['i', 'ì'], ['I', 'Ì'],
	['o', 'ò'], ['O', 'Ò'],
	['u', 'ù'], ['U', 'Ù'],
])

const circumflexChars = new Map<string, string>([
	['a', 'â'], ['A', 'Â'],
	['e', 'ê'], ['E', 'Ê'],
	['i', 'î'], ['I', 'Î'],
	['o', 'ô'], ['O', 'Ô'],
	['u', 'û'], ['U', 'Û'],
])

const umlautChars = new Map<string, string>([
	['a', 'ä'], ['A', 'Ä'],
	['e', 'ë'], ['E', 'Ë'],
	['i', 'ï'], ['I', 'Ï'],
	['o', 'ö'], ['O', 'Ö'],
	['u', 'ü'], ['U', 'Ü'],
	['y', 'ÿ'], ['Y', 'Ÿ'],
])

const tildeChars = new Map<string, string>([
	['a', 'ã'], ['A', 'Ã'],
	['n', 'ñ'], ['N', 'Ñ'],
	['o', 'õ'], ['O', 'Õ'],
])

// Settings interface and defaults

interface Settings {
	notifyAboutReplacements: boolean;
	notifyAboutErrors: boolean;
}

const DEFAULT_SETTINGS: Settings = {
	notifyAboutReplacements: false,
	notifyAboutErrors: true,
}

// Logging and character replacement functions

function logResult(string: string, notify: boolean = false) {
	if (notify) {
		new Notice(string);
	};
	console.log(string);
}

function replaceCharacter(editor: Editor, chars: Map<string, string>, message: string, settings: Settings) {

	// Getting the range of a single character to replace
	const fromPos: EditorPosition = {
		line: editor.getCursor().line, ch: editor.getCursor().ch - 1
	};
	const toPos: EditorPosition = {
		line: editor.getCursor().line, ch: editor.getCursor().ch
	};

	const effectiveLetter = editor.getRange(fromPos, toPos) // Character to be replaced
	const replacementLetter = chars.get(effectiveLetter)    // Character to replace with

	let notify: boolean; // Whether to notify the user

	// If a replacement is found, replace the character
	if (replacementLetter) {
		editor.replaceRange(replacementLetter, fromPos, toPos);
		notify = settings.notifyAboutReplacements;
	} else {
		message = "No replacement found";
		notify = settings.notifyAboutErrors;
	}

	logResult(message, notify); // Logging and (optionally) notifying the user
}

// Actual plugin class

export default class AccentHotkeys extends Plugin {
	settings: Settings;

	async onload() {

		// Load settings
		await this.loadSettings();

		// Register acute accent insert command
		this.addCommand({
			id: 'insert-acute',
			name: 'Insert acute',
			hotkeys: [{ modifiers: ['Mod'], key: '`' }],
			editorCallback: (editor: Editor) => {
				replaceCharacter(editor, acuteChars, "Inserted acute accent", this.settings);
			}
		});

		// Register acute grave insert command
		this.addCommand({
			id: 'insert-grave',
			name: 'Insert grave',
			hotkeys: [{ modifiers: ['Mod'], key: "'" }],
			editorCallback: (editor: Editor) => {
				replaceCharacter(editor, graveChars, "Inserted grave accent", this.settings);
			}
		});

		// Register circumflex insert command
		this.addCommand({
			id: 'insert-circumflex',
			name: 'Insert circumflex',
			hotkeys: [{ modifiers: ['Mod', 'Shift'], key: '^' }],
			editorCallback: (editor: Editor) => {
				replaceCharacter(editor, circumflexChars, "Inserted circumflex", this.settings);
			}
		});

		// Register umlaut insert command
		this.addCommand({
			id: 'insert-umlaut',
			name: 'Insert umlaut',
			hotkeys: [{ modifiers: ['Mod', 'Shift'], key: ':' }],
			editorCallback: (editor: Editor) => {
				replaceCharacter(editor, umlautChars, "Inserted umlaut", this.settings);
			}
		});

		// Register tilde insert command
		this.addCommand({
			id: 'insert-tilde',
			name: 'Insert tilde',
			hotkeys: [{ modifiers: ['Mod', 'Shift'], key: '~' }],
			editorCallback: (editor: Editor) => {
				replaceCharacter(editor, tildeChars, "Inserted tilde", this.settings);
			}
		});

		// Add a settings tab
		this.addSettingTab(new SettingsTab(this.app, this));

	}

	// Loading setting on launch
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// Saving settings from settings tab
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Settings tab class

class SettingsTab extends PluginSettingTab {
	plugin: AccentHotkeys;

	constructor(app: App, plugin: AccentHotkeys) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// Replacement notification toggle
		new Setting(containerEl)
			.setName('Replacement notification')
			.setDesc('Show a notification each time a character is replaced with an accented one')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.notifyAboutReplacements)
				.onChange(async (value) => {
					this.plugin.settings.notifyAboutReplacements = value;
					await this.plugin.saveSettings();
				}));

		// Error notification toggle
		new Setting(containerEl)
			.setName('Unsuitable character notification')
			.setDesc("Show a notification when a character can't be replaced with an accented one")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.notifyAboutErrors)
				.onChange(async (value) => {
					this.plugin.settings.notifyAboutErrors = value;
					await this.plugin.saveSettings();
				}));
	}
}