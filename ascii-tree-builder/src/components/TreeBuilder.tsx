import React, { useState, useEffect } from 'react';

const TreeBuilder: React.FC = () => {
    const [rows, setRows] = useState<string[]>(['Root']);
    const [selectedRow, setSelectedRow] = useState<number>(-1);
    const [asciiRepresentation, setAsciiRepresentation] = useState<string[]>([]);

    useEffect(() => {
        generateAsciiRepresentation();
    }, [rows]);

    const addFolder = () => {
        const newFolderName = prompt('Enter the new folder name:');
        if (newFolderName) {
            const newRows = [...rows];
            const match = rows[selectedRow]?.match(/^ */);
            const indentation = selectedRow >= 0 && match ? match[0].length + 2 : 0;
            newRows.splice(selectedRow + 1, 0, ' '.repeat(indentation) + newFolderName);
            setRows(newRows);
        }
    };

    const deleteRow = () => {
        const newRows = [...rows];
        newRows.splice(selectedRow, 1);
        setRows(newRows);
        setSelectedRow(-1);
    };

    const generateAsciiRepresentation = () => {
        const asciiRows: string[] = [];

        rows.forEach((row, index) => {
            const match = row.match(/^ */);
            const indentation = match ? match[0].length : 0;

            const nextRowMatch = rows[index + 1]?.match(/^ */);
            const nextRowIndentation = nextRowMatch ? nextRowMatch[0].length : 0;

            const isLast = index === rows.length - 1 || nextRowIndentation <= indentation;
            const isFile = row.trim().startsWith('* ');

            let prefix = ' '.repeat(Math.max(0, indentation - 2));

            if (indentation > 0) {
                prefix += isLast ? '└── ' : '├── ';
            }

            const content = isFile ? row.trim().substring(2) : row.trim(); // remove the '* ' for files
            asciiRows.push(prefix + content);
        });

        setAsciiRepresentation(asciiRows);
    }

    const addFile = () => {
        const newFileName = prompt('Enter the new file name:');
        if (newFileName) {
            const newRows = [...rows];
            const match = rows[selectedRow]?.match(/^ */);
            const indentation = selectedRow >= 0 && match ? match[0].length : 0;
            newRows.splice(selectedRow + 1, 0, ' '.repeat(indentation) + '* ' + newFileName);
            setRows(newRows);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <div>
                <textarea
                    className="textarea-style"
                    rows={10}
                    cols={50}
                    value={rows.join('\n')}
                    readOnly
                    onClick={(e) => {
                        const lineNumber = e.currentTarget.value.substr(0, e.currentTarget.selectionStart).split('\n').length - 1;
                        setSelectedRow(lineNumber);
                    }}
                />
                <br />
                {selectedRow >= 0 && (
                    <div>
                        <button className="button-style" onClick={addFolder}>Add Folder</button>
                        <button className="button-style" onClick={addFile}>Add File</button>  {/* New "Add File" button */}
                        <button className="button-style" onClick={deleteRow}>Delete</button>
                    </div>
                )}
            </div>
            <div>
                <textarea
                    className="textarea-style"
                    style={{ marginLeft: '20px', width: '80%', height: '200px', fontSize: '16px' }}
                    rows={10}
                    cols={50}
                    value={asciiRepresentation.join('\n')}
                    readOnly
                />
            </div>
        </div>
    );
};

export default TreeBuilder;
