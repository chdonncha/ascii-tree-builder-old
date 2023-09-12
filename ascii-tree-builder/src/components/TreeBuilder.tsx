import React, { useState } from 'react';

const TreeBuilder: React.FC = () => {
    const [rows, setRows] = useState<string[]>(['Root']);
    const [selectedRow, setSelectedRow] = useState<number>(-1);

    const addFolder = () => {
        const newFolderName = prompt('Enter the new folder name:');
        if (newFolderName) {
            const newRows = [...rows];
            const match = rows[selectedRow].match(/^ */);
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

    return (
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
                    <button className="button-style" onClick={deleteRow}>Delete</button>
                </div>
            )}
        </div>
    );
};

export default TreeBuilder;
