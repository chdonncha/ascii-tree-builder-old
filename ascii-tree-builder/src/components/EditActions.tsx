import React from 'react';
import { Button } from '@mui/material';
import { Row } from './TreeBuilder';

type EditActionsProps = {
  rows: Row[];
  selectedRow: number;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  setSelectedRow: (rowIndex: number) => void;
  getIndentation: (content: string) => number;
  addToUndoStack: (rows: Row[]) => void;
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

    const rowToDeleteId = rows[selectedRow].id;

    // Add current state to undo stack before deletion
    addToUndoStack(rows);

    // Recursively collect IDs of row to delete and all its children
    const idsToDelete = new Set<string>();
    const collectIdsToDelete = (rowId: string) => {
      idsToDelete.add(rowId);
      rows.forEach((row) => {
        if (row.parentId === rowId) {
          collectIdsToDelete(row.id);
        }
      });
    };

    collectIdsToDelete(rowToDeleteId);

    // Filter out the rows to delete and update isSelected property
    const newRows = rows.filter((row) => {
      if (idsToDelete.has(row.id)) {
        return false; // Exclude the row from the new array
      }
      // If the row was previously selected, deselect it
      if (row.isSelected) {
        row.isSelected = false;
      }
      return true;
    });

    // Adjust the selected row after deletion
    setSelectedRow(-1); // Deselect any row since the selected row is deleted

    setRows(newRows);
  };

  const startRenaming = () => {
    if (selectedRow >= 0) {
      const newRows = rows.map((row, index) => ({
        ...row,
        isRenaming: index === selectedRow, // Only the selected row should have isRenaming set to true
      }));
      addToUndoStack(newRows); // Save the current state to the undo stack
      setRenameValue(rows[selectedRow].content.trim());
      setIsRenaming(true);
      setRows(newRows); // Update the rows with the new state
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
