import React, { useState, useEffect, useRef } from 'react';
import './TreeBuilder.scss';
import { Button, Snackbar, IconButton } from '@mui/material';
import { useUndoRedoStack } from '../hooks/useUndoRedoStack';
import { useClickOutside } from '../hooks/useClickOutside';
import { FileFolderActions } from './FileFolderActions';
import { MovementActions } from './MovementActions';
import { ImportActions } from './ImportActions';
import { EditActions } from './EditActions';
import { TreeItem } from './TreeItem';
import { SAMPLE_TREE_DATA } from '../utils/sampleTreeData';
import { getIndentation, canNodeIndentFurther, generateAsciiPrefixForNode } from '../utils/treeUtils';

export interface Row {
  content: string;
  isSelected: boolean;
  type: 'file' | 'folder';
}

const TreeBuilder: React.FC = () => {
  const [rows, setRows] = useState<Row[]>(SAMPLE_TREE_DATA);
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const [asciiRepresentation, setAsciiRepresentation] = useState<string[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { addToUndoStack, undo, redo } = useUndoRedoStack(rows, setRows);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    generateAsciiRepresentation();
  }, [rows]);

  useClickOutside(containerRef, () => setSelectedRow(-1));

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

    rows.forEach((row, index) => {
      const prefix = generateAsciiPrefixForNode(index, rows);
      asciiRows.push(prefix + row.content.trim());
    });

    setAsciiRepresentation(asciiRows);
  };

  const handleImportedData = (parsedData: Row[]) => {
    setRows((prevRows) => [...prevRows, ...parsedData]);
  };

  return (
    <div className="container">
      <div className="input-box">
        <div className="button-row">
          <FileFolderActions rows={rows} setRows={setRows} selectedRow={selectedRow} addToUndoStack={addToUndoStack} />
          <ImportActions onImport={handleImportedData} />
        </div>
        <div className="button-row">
          <MovementActions
            rows={rows}
            selectedRow={selectedRow}
            setRows={setRows}
            setSelectedRow={setSelectedRow}
            getIndentation={getIndentation}
            addToUndoStack={addToUndoStack}
            canNodeIndentFurther={(selectedRow) => canNodeIndentFurther(selectedRow, rows)}
          />
        </div>
        <div className="button-row">
          <EditActions
            rows={rows}
            selectedRow={selectedRow}
            setRows={setRows}
            setSelectedRow={setSelectedRow}
            getIndentation={getIndentation}
            addToUndoStack={addToUndoStack}
            setRenameValue={setRenameValue}
            setIsRenaming={setIsRenaming}
            undo={undo}
            redo={redo}
          />
        </div>
        <ul className="input-list">
          {rows.map((row, index) => (
            <TreeItem
              key={index}
              row={row}
              index={index}
              isRenaming={isRenaming}
              renameValue={renameValue}
              handleRenameChange={handleRenameChange}
              submitRename={submitRename}
              prefix={generateAsciiPrefixForNode(index, rows)}
              setSelectedRow={(selectedRowIndex) => {
                if (!isRenaming) {
                  const newRows = rows.map((r, i) => ({
                    ...r,
                    isSelected: i === selectedRowIndex,
                  }));
                  setRows(newRows);
                  setSelectedRow(selectedRowIndex);
                }
              }}
            />
          ))}
        </ul>
      </div>
      <div className="output-box space-left">
        <div className="button-row"></div>
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
