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
  isRenaming?: boolean;
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

  useEffect(() => {
    generateAsciiRepresentation();
  }, [rows]);

  useClickOutside(containerRef, () => setSelectedRow(-1));

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRenameValue(e.target.value);
  };

  const submitRename = (e) => {
    if (e && e.key === 'Enter') {
      e.preventDefault();
      if (selectedRow >= 0 && selectedRow < rows.length) {
        const newRows = rows.map((row) => ({ ...row, isRenaming: false })); // Reset isRenaming for all rows
        const newName = renameValue.trim(); // Trim the input value
        const indentation = ' '.repeat(getIndentation(newRows[selectedRow].content));
        newRows[selectedRow] = {
          ...newRows[selectedRow],
          content: `${indentation}${newName}`,
        };
        setRows(newRows);
        setIsRenaming(false);
        setRenameValue(''); // Clear the input after rename
      }
    }
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

  const isChildOfSelectedRow = (rowIndex, selectedRowIndex, rows) => {
    // Return false if no row is selected or the index is not greater than the selected row's index
    if (selectedRowIndex === -1 || rowIndex <= selectedRowIndex) {
      return false;
    }

    // Get the indentation level of the selected row
    const selectedRowIndentation = getIndentation(rows[selectedRowIndex].content);

    // Get the indentation level of the current row
    const rowIndentation = getIndentation(rows[rowIndex].content);

    // The current row is a child if it has greater indentation than the selected row
    // and there is no row in between with the same or lesser indentation
    for (let i = selectedRowIndex + 1; i <= rowIndex; i++) {
      const middleRowIndentation = getIndentation(rows[i].content);
      if (middleRowIndentation <= selectedRowIndentation) {
        return false;
      }
    }
    return rowIndentation > selectedRowIndentation;
  };

  const handleSetSelectedRow = (index) => {
    if (!isRenaming) {
      // Reset selection for all rows
      const updatedRows = rows.map((row, index) => ({ ...row, isSelected: false }));

      // Select the clicked row and its children
      updatedRows[index].isSelected = true;

      const selectedRowIndentation = getIndentation(rows[index].content);
      for (let i = index + 1; i < rows.length; i++) {
        const rowIndentation = getIndentation(rows[i].content);
        if (rowIndentation > selectedRowIndentation) {
          updatedRows[i].isSelected = true;
        } else {
          break;
        }
      }

      setRows(updatedRows);
      setSelectedRow(index);
    }
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
          {rows.map((row, index) => {
            const isSelected = index === selectedRow;
            const isChildSelected = selectedRow >= 0 ? isChildOfSelectedRow(index, selectedRow, rows) : false;

            // Make sure to return the TreeItem component
            return (
              <TreeItem
                key={index}
                row={row}
                index={index}
                isRenaming={isRenaming}
                renameValue={renameValue}
                handleRenameChange={handleRenameChange}
                submitRename={submitRename}
                prefix={generateAsciiPrefixForNode(index, rows)}
                totalItems={rows.length}
                isChildSelected={isChildSelected}
                setSelectedRow={() => handleSetSelectedRow(index)}
              />
            );
          })}
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
