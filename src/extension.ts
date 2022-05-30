import * as vscode from 'vscode';
import * as rubyBookCommands from './rubyBookCommands';
import * as rubyBookController from './rubyBookController';
import * as rubyBookSerializer from './rubyBookSerializer';
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ruby-book" is now active!');

	rubyBookCommands.activate(context);
	rubyBookSerializer.activate(context);
	rubyBookController.activate(context);
}

export function deactivate() {}
