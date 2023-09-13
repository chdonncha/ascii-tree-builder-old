import React, { useState, useEffect } from 'react';
import './TreeBuilder.scss';

const TreeBuilder: React.FC = () => {
  const [rows, setRows] = useState<{ content: string; isSelected: boolean }[]>([
    { content: 'Root', isSelected: false },
  ]);
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const [asciiRepresentation, setAsciiRepresentation] = useState<string[]>([]);

  useEffect(() => {
    generateAsciiRepresentation();
  }, [rows]);

  const addFolder = () => {
    const newFolderName = prompt('Enter the new folder name:');
    if (newFolderName) {
      const newRows = [...rows];
      const match = rows[selectedRow]?.content.match(/^ */);
      const indentation = selectedRow >= 0 && match ? match[0].length + 2 : 0;
      newRows.splice(selectedRow + 1, 0, { content: ' '.repeat(indentation) + newFolderName, isSelected: false });
      setRows(newRows);
    }
  };

  const addFile = () => {
    const newFileName = prompt('Enter the new file name:');
    if (newFileName) {
      const newRows = [...rows];
      const match = rows[selectedRow]?.content.match(/^ */);
      const indentation = selectedRow >= 0 && match ? match[0].length + 2 : 0; // Incremented by 2 spaces
      let positionToInsert = selectedRow + 1;

      for (let i = selectedRow + 1; i < rows.length; i++) {
        const nextMatch = rows[i].content.match(/^ */);
        const nextIndentation = nextMatch ? nextMatch[0].length : 0;
        if (nextIndentation <= indentation) {
          break;
        }
        positionToInsert = i + 1;
      }

      newRows.splice(positionToInsert, 0, {
        content: ' '.repeat(indentation) + '* ' + newFileName,
        isSelected: false,
      });
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
    const linkStack: boolean[] = []; // to track if a line should be drawn

    rows.forEach((row, index) => {
      const match = row.content.match(/^ */);
      const indentation = match ? match[0].length : 0;

      const nextRowMatch = rows[index + 1]?.content.match(/^ */);
      const nextRowIndentation = nextRowMatch ? nextRowMatch[0].length : 0;

      const isLast = index === rows.length - 1 || nextRowIndentation <= indentation;
      const isFile = row.content.trim().startsWith('* ');

      let prefix = '';

      // Draw the existing lines for levels above
      for (let i = 0; i < indentation / 2; i++) {
        if (i < indentation / 2 - 1) {
          prefix += linkStack[i] ? '│   ' : '    ';
        }
      }

      if (indentation > 0) {
        prefix += isLast ? '└── ' : '├── ';
      }

      // Update the link stack
      linkStack[indentation / 2] = !isLast;
      if (nextRowIndentation < indentation) {
        for (let j = indentation / 2; j >= nextRowIndentation / 2; j--) {
          linkStack[j] = false;
        }
      }

      const content = isFile ? row.content.trim().substring(2) : row.content.trim();
      asciiRows.push(prefix + content);
    });

    setAsciiRepresentation(asciiRows);
  };

  return (
    <div className="container">
      <div className="input-box">
        <div className="button-container">
          <button className={`button-style ${selectedRow < 0 ? 'hidden-button' : ''}`} onClick={addFolder}>
            Add Folder
          </button>
          <button className={`button-style ${selectedRow < 0 ? 'hidden-button' : ''}`} onClick={addFile}>
            Add File
          </button>
          <button className={`button-style ${selectedRow < 0 ? 'hidden-button' : ''}`} onClick={deleteRow}>
            Delete
          </button>
        </div>
        <ul className="row-list">
          {rows.map((row, index) => (
            <li
              key={index}
              contentEditable={false}
              className={row.isSelected ? 'highlighted' : ''}
              onClick={() => {
                const newRows = rows.map((r, idx) => ({
                  ...r,
                  isSelected: idx === index,
                }));
                setRows(newRows);
                setSelectedRow(index);
              }}
              style={{ marginLeft: `${(row.content.match(/^ */) || [''])[0].length * 10}px` }}
            >
              {row.content.trim()}
            </li>
          ))}
        </ul>
      </div>
      <div className="right-panel">
        <pre className="output-box">
          <div className="output-content">{asciiRepresentation.join('\n')}</div>
        </pre>
      </div>
    </div>
  );
};

export default TreeBuilder;
