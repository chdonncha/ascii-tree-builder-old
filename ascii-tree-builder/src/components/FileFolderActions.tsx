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
  const addFile = () => {
    addToUndoStack(rows);
    const newFileName = prompt('Enter the new file name:');
    if (newFileName) {
      const newRows = [...rows];
      let newId = generateUniqueId();
      let parentId = null;
      let level = 0;

      if (selectedRow >= 0) {
        parentId = rows[selectedRow].id;
        level = rows[selectedRow].level;
      }

      // Insert the new file
      newRows.push({
        id: newId,
        parentId: parentId,
        level: level + 1, // increment level by one if it's a child
        content: newFileName,
        isSelected: false,
        type: 'file',
      });

      setRows(newRows);
    }
  };

  const addFolder = () => {
    addToUndoStack(rows);
    let newFolderName = prompt('Enter the new folder name:');
    if (newFolderName) {
      newFolderName = newFolderName.trim().replace(/\/+$/, '') + '/';
      const newRows = [...rows];
      let newId = generateUniqueId();
      let parentId = null;
      let level = 0;

      if (selectedRow >= 0) {
        parentId = rows[selectedRow].id;
        level = rows[selectedRow].level;
      }

      newRows.push({
        id: newId,
        parentId: parentId,
        level: level,
        content: newFolderName,
        isSelected: false,
        type: 'folder',
      });

      setRows(newRows);
    }
  };

  function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  return (
    <>
      <Button variant="contained" className="button-style" onClick={addFolder}>
        Add Folder
      </Button>
      <Button variant="contained" className="button-style" onClick={addFile}>
        Add File
      </Button>
    </>
  );
};
