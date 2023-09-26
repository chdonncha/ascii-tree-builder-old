import React, { useState, useEffect, useRef } from 'react';
import './TreeBuilder.scss';
import { Button, Snackbar, IconButton } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useUndoStack } from '../hooks/useUndoStack';
import { FileFolderActions } from './FileFolderActions';
import { MovementActions } from './MovementActions';

const TreeBuilder: React.FC = () => {
  const [rows, setRows] = useState<{ content: string; isSelected: boolean; type: 'file' | 'folder' }[]>([
    { content: 'Root/', isSelected: false, type: 'folder' },
    { content: '  Documents/', isSelected: false, type: 'folder' },
    { content: '    Reports/', isSelected: false, type: 'folder' },
    { content: '      Monthly_Report.txt', isSelected: false, type: 'file' },
    { content: '      Annual_Report.txt', isSelected: false, type: 'file' },
    { content: '    Invoices/', isSelected: false, type: 'folder' },
    { content: '  Media/', isSelected: false, type: 'folder' },
    { content: '    Images/', isSelected: false, type: 'folder' },
    { content: '      Profile_Picture.jpg', isSelected: false, type: 'file' },
    { content: '      Banner.jpg', isSelected: false, type: 'file' },
    { content: '    Videos/', isSelected: false, type: 'folder' },
    { content: '      Intro_Video.mp4', isSelected: false, type: 'file' },
    { content: '  Code/', isSelected: false, type: 'folder' },
    { content: '    Laravel/', isSelected: false, type: 'folder' },
    { content: '      web.php', isSelected: false, type: 'file' },
    { content: '      api.php', isSelected: false, type: 'file' },
    { content: '    ReactJS/', isSelected: false, type: 'folder' },
    { content: '      App.tsx', isSelected: false, type: 'file' },
    { content: '      index.tsx', isSelected: false, type: 'file' },
    { content: '  Games/', isSelected: false, type: 'folder' },
    { content: '    Retro/', isSelected: false, type: 'folder' },
    { content: '      Doom', isSelected: false, type: 'file' },
    { content: '      Quake', isSelected: false, type: 'file' },
  ]);

  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const [asciiRepresentation, setAsciiRepresentation] = useState<string[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { addToUndoStack, undo } = useUndoStack(rows, setRows);

  useEffect(() => {
    generateAsciiRepresentation();
  }, [rows]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedRow(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const deleteRow = () => {
    if (selectedRow === -1) return; // If no row is selected, do nothing

    const newRows = [...rows];

    // Identify the children to delete based on indentation
    const currentIndentation = getIndentation(newRows[selectedRow].content);

    let lastIndexToDelete = selectedRow;
    for (let i = selectedRow + 1; i < newRows.length; i++) {
      if (getIndentation(newRows[i].content) > currentIndentation) {
        lastIndexToDelete = i;
      } else {
        break;
      }
    }

    // Delete the selected row and its children
    newRows.splice(selectedRow, lastIndexToDelete - selectedRow + 1);

    // Adjust the selected row after deletion
    let newRowToSelect = -1;

    // If it wasn't the first row, select the previous row
    if (selectedRow > 0) {
      newRowToSelect = selectedRow - 1;
    }
    // If it was the first row and there are still rows available, select the next row
    else if (selectedRow === 0 && newRows.length > 0) {
      newRowToSelect = 0;
    }

    setRows(newRows);
    setSelectedRow(newRowToSelect);
  };

  const getIndentation = (str: string): number => {
    const match = str.match(/^ */);
    return match ? match[0].length : 0;
  };

  const startRenaming = () => {
    if (selectedRow >= 0) {
      addToUndoStack(rows);
      setRenameValue(rows[selectedRow].content.trim());
      setIsRenaming(true);
    }
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRenameValue(e.target.value);
  };

  const submitRename = (e?: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if (e && 'key' in e && e.key !== 'Enter') return;

    if (e) e.preventDefault();

    const newRows = [...rows];
    newRows[selectedRow].content = ' '.repeat(getIndentation(newRows[selectedRow].content)) + renameValue;
    setRows(newRows);
    setIsRenaming(false);
  };

  const copyToClipboard = () => {
    const textToCopy = asciiRepresentation.join('\n');
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setSnackbarOpen(true); // Open the snackbar upon successful copy
      })
      .catch((err) => {
        console.error('Unable to copy text. Error:', err);
      });
  };

  const generateAsciiRepresentation = () => {
    const asciiRows: string[] = [];
    const linkStack: boolean[] = [];

    rows.forEach((row, index) => {
      const indentation = getIndentation(row.content);

      const nextRowMatch = rows[index + 1]?.content.match(/^ */);
      const nextRowIndentation = nextRowMatch ? nextRowMatch[0].length : 0;

      const isLastAtThisLevel = isLastInBranch(index);

      let prefix = '';

      for (let i = 0; i < indentation / 2; i++) {
        prefix += linkStack[i] ? '│   ' : '    ';
      }

      prefix += isLastAtThisLevel ? '└── ' : '├── ';

      linkStack[indentation / 2] = !isLastAtThisLevel;

      if (nextRowIndentation < indentation) {
        for (let j = indentation / 2; j >= nextRowIndentation / 2; j--) {
          linkStack[j] = false;
        }
      }

      asciiRows.push(prefix + row.content.trim());
    });

    setAsciiRepresentation(asciiRows);
  };

  const isLastInBranch = (index: number): boolean => {
    const currentIndentation = getIndentation(rows[index].content);

    for (let i = index + 1; i < rows.length; i++) {
      const nextIndentation = getIndentation(rows[i].content);

      if (nextIndentation === currentIndentation) {
        return false;
      }

      if (nextIndentation < currentIndentation) {
        return true;
      }
    }

    return true;
  };

  const canIndentFurther = (currentIndex: number): boolean => {
    if (currentIndex === 0) return false;
    const currentIndentation = getIndentation(rows[currentIndex].content);
    const prevIndentation = getIndentation(rows[currentIndex - 1].content);
    return currentIndentation <= prevIndentation;
  };

  const clearAllRows = () => {
    setRows([]);
  };

  return (
    <div className="container">
      <div className="input-box">
        <div className="button-row">
          <FileFolderActions rows={rows} setRows={setRows} selectedRow={selectedRow} addToUndoStack={addToUndoStack} />
          <Button variant="contained" className="button-style" disabled={selectedRow < 0} onClick={deleteRow}>
            Delete
          </Button>
        </div>
        <div className="button-row">
          <MovementActions
            rows={rows}
            selectedRow={selectedRow}
            setRows={setRows}
            setSelectedRow={setSelectedRow}
            getIndentation={getIndentation}
            addToUndoStack={addToUndoStack}
            canIndentFurther={canIndentFurther}
          />
          <Button variant="contained" className="button-style" disabled={selectedRow < 0} onClick={startRenaming}>
            Rename
          </Button>
          <Button variant="contained" color="error" className="button-style" onClick={clearAllRows}>
            Clear
          </Button>
          <Button variant="contained" className="button-style" onClick={undo}>
            Undo
          </Button>
        </div>
        <ul className="input-list">
          {rows.map((row, index) => (
            <li
              key={index}
              contentEditable={false}
              className={index === selectedRow ? 'highlighted' : ''}
              onClick={() => {
                if (!isRenaming) {
                  const newRows = rows.map((r, idx) => ({
                    ...r,
                    isSelected: idx === index,
                  }));
                  setRows(newRows);
                  setSelectedRow(index);
                }
              }}
              style={{ marginLeft: `${(row.content.match(/^ */) || [''])[0].length * 10}px` }}
            >
              {row.type === 'folder' ? <FolderIcon /> : <InsertDriveFileIcon />}
              {isRenaming && row.isSelected ? (
                <input
                  value={renameValue}
                  onChange={handleRenameChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename(e);
                  }}
                  onBlur={submitRename}
                  autoFocus
                />
              ) : (
                row.content.trim()
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="output-box space-left">
        <div className="button-row"></div>
        <div className="button-row">
          <Button variant="contained" className="button-style" onClick={copyToClipboard}>
            Copy to Clipboard
          </Button>
        </div>
        <div className="output-list">
          <div className="output-content">{asciiRepresentation.join('\n')}</div>
        </div>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === 'timeout') {
            setSnackbarOpen(false);
          }
        }}
        message="Copied to Clipboard!"
        action={
          <React.Fragment>
            <Button color="primary" size="small" onClick={() => setSnackbarOpen(false)}>
              CLOSE
            </Button>
          </React.Fragment>
        }
      />
    </div>
  );
};

export default TreeBuilder;
