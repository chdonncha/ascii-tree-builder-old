import React from 'react';
import { Button } from '@mui/material';

type EditActionsProps = {
  rows: Array<{ content: string; isSelected: boolean; type: 'file' | 'folder' }>;
  selectedRow: number;
  setRows: (rows: Array<{ content: string; isSelected: boolean; type: 'file' | 'folder' }>) => void;
  setSelectedRow: (rowIndex: number) => void;
  getIndentation: (content: string) => number;
  addToUndoStack: (rows: Array<{ content: string; isSelected: boolean; type: 'file' | 'folder' }>) => void;
  setRenameValue: (value: string) => void;
  setIsRenaming: (isRenaming: boolean) => void;
  undo: () => void;
  redo: () => void;
};

export const EditActions: React.FC<EditActionsProps> = ({
  rows,
  selectedRow,
  setRows,
  setSelectedRow,
  getIndentation,
  addToUndoStack,
  setRenameValue,
  setIsRenaming,
  undo,
  redo,
}) => {
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

  const startRenaming = () => {
    if (selectedRow >= 0) {
      addToUndoStack(rows);
      setRenameValue(rows[selectedRow].content.trim());
      setIsRenaming(true);
    }
  };

  const clearAllRows = () => {
    setRows([]);
  };

  return (
    <>
      <Button variant="contained" className="button-style" disabled={selectedRow < 0} onClick={deleteRow}>
        Delete
      </Button>
      <Button variant="contained" className="button-style" disabled={selectedRow < 0} onClick={startRenaming}>
        Rename
      </Button>
      <Button variant="contained" color="error" className="button-style" onClick={clearAllRows}>
        Clear
      </Button>
      <Button variant="contained" className="button-style" onClick={undo}>
        Undo
      </Button>
      <Button variant="contained" className="button-style" onClick={redo}>
        Redo
      </Button>
    </>
  );
};
