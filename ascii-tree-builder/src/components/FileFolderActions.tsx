import React from 'react';
import { Button } from '@mui/material';
import { Row } from './TreeBuilder';

interface FileFolderActionsProps {
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  selectedRow: number;
  addToUndoStack: (rows: any) => void;
}

export const FileFolderActions: React.FC<FileFolderActionsProps> = ({ rows, setRows, selectedRow, addToUndoStack }) => {
  function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  const addItem = (type: 'file' | 'folder') => {
    addToUndoStack(rows);
    let newItemName = prompt(`Enter the new ${type} name:`);
    if (newItemName) {
      if (type === 'folder') {
        newItemName = newItemName.trim().replace(/\/+$/, '') + '/';
      }
      let newRows = [...rows];
      let newId = generateUniqueId();
      let parentId = null;
      let level = 0;
      let insertionIndex = selectedRow + 1; // Default to insert after the selected row

      if (selectedRow >= 0) {
        parentId = rows[selectedRow].id;
        level = rows[selectedRow].level + 1; // Increment to make it a child
        // Find the correct insertion index
        for (let i = selectedRow + 1; i < rows.length; i++) {
          if (rows[i].level <= rows[selectedRow].level) {
            break;
          }
          insertionIndex++;
        }
      }

      newRows.splice(insertionIndex, 0, {
        id: newId,
        parentId: parentId,
        level: level,
        content: newItemName,
        isSelected: false,
        type: type,
      });

      setRows(newRows);
    }
  };

  return (
    <>
      <Button variant="contained" className="button-style" onClick={() => addItem('folder')}>
        Add Folder
      </Button>
      <Button variant="contained" className="button-style" onClick={() => addItem('file')}>
        Add File
      </Button>
    </>
  );
};
