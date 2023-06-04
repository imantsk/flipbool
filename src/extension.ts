import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.flipBool', () => {
        const { activeTextEditor } = vscode.window;
        if (!activeTextEditor) {
            return;
        }

        const { document, selection } = activeTextEditor;
        const { languageId } = document;

        if (languageId === 'yaml' || languageId === 'json') {
            const currentPosition = selection.active;
            const line = document.lineAt(currentPosition.line);
            const currentLineText = line.text;
            const positionCharacter = currentPosition.character;

            // Find the word under or right after the cursor
            const wordRange = document.getWordRangeAtPosition(currentPosition);
            if (!wordRange) {
                return;
            }

            const word = document.getText(wordRange);
            const isAtEndOfWord = wordRange.end.character === positionCharacter;

            // Check if the word is a boolean or number
            if ((word === 'true' || word === 'false') && isAtEndOfWord) {
                const flippedValue = word === 'true' ? 'false' : 'true';
                activeTextEditor.edit(editBuilder => {
                    editBuilder.replace(wordRange, flippedValue);
                });
                vscode.window.showInformationMessage(`Flipped boolean value to ${flippedValue}`);
            } else if (/^\d+(\.\d+)?$/.test(word) && isAtEndOfWord) {
                const numericValue = parseFloat(word);
                const bumpedValue = currentPosition.isAfterOrEqual(activeTextEditor.selection.active)
                    ? numericValue + 1
                    : numericValue - 1;
                activeTextEditor.edit(editBuilder => {
                    editBuilder.replace(wordRange, bumpedValue.toString());
                });
                vscode.window.showInformationMessage(`Bumped numeric value to ${bumpedValue}`);
            }
        }
    });

    vscode.commands.registerCommand('extension.flipBoolUp', () => {
        vscode.commands.executeCommand('extension.flipBool');
        vscode.commands.executeCommand('cursorUp');
    });

    vscode.commands.registerCommand('extension.flipBoolDown', () => {
        vscode.commands.executeCommand('extension.flipBool');
        vscode.commands.executeCommand('cursorDown');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
