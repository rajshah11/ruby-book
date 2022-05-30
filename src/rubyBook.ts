import * as vscode from 'vscode';
import { RubyKernel } from './rubyKernel';

export class RubyBook implements vscode.Disposable {

	private rubyKernel: RubyKernel;
	private _hasStarted: Boolean;

	constructor() {
		this.rubyKernel = new RubyKernel();
		this._hasStarted = false;
	}

	async dispose() {
		this.rubyKernel.stop();
	}

	public async restartKernel() {
		await vscode.commands.executeCommand('notebook.clearAllCellsOutputs');
		await this.rubyKernel.restart();
	}

	public async startKernel() {
		await this.rubyKernel.start();
		this._hasStarted = true;
	}

	public hasStarted() : Boolean{
		return this._hasStarted;
	}

	public eval(cell: vscode.NotebookCell, cancellationToken: vscode.CancellationToken): Promise<[boolean, string, string]> {
		return this.rubyKernel.eval(cell, cancellationToken);
	}

	public postEval() {
		this.rubyKernel.clearBuffers();
	}
}