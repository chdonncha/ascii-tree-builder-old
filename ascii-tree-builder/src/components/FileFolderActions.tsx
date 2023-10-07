import React from 'react';
import { Button } from '@mui/material';

interface FileFolderActionsProps {
  rows: { content: string; isSelected: boolean; type: 'file' | 'folder' }[];
  setRows: React.Dispatch<React.SetStateAction<{ content: string; isSelected: boolean; type: 'file' | 'folder' }[]>>;
  selectedRow: number;
  addToUndoStack: (rows: any) => void;
}
export const FileFolderActions: React.FC<FileFolderActionsProps> = ({ rows, setRows, selectedRow, addToUndoStack }) => {
  const addFile = () => {
    addToUndoStack(rows);
    const newFileName = prompt('Enter the new file name:');
    if (newFileName) {
      const newRows = [...rows];
      if (selectedRow >= 0) {
        // Get the indentation of the selected row.
        const match = rows[selectedRow]?.content.match(/^ */);
        const indentation = match ? match[0].length : 0;

        let positionToInsert = selectedRow + 1;

        // Insert the new file right after the selected row.
        newRows.splice(positionToInsert, 0, {
          content: ' '.repeat(indentation) + newFileName,
          isSelected: false,
          type: 'file',
        });
      } else {
        // Add to the bottom of the hierarchy
        newRows.push({ content: newFileName, isSelected: false, type: 'file' });
      }
      setRows(newRows);
    }
  };

  const addFolder = () => {
    addToUndoStack(rows);
    let newFolderName = prompt('Enter the new folder name:');
    if (newFolderName) {
      newFolderName = newFolderName.trim().replace(/\/+$/, '') + '/';

      const newRows = [...rows];
      if (selectedRow >= 0) {
        // Get the indentation of the selected row.
        const match = rows[selectedRow]?.content.match(/^ */);
        const indentation = match ? match[0].length : 0;

        let positionToInsert = selectedRow + 1;

        // Insert the new folder right after the selected row.
        newRows.splice(positionToInsert, 0, {
          content: ' '.repeat(indentation) + newFolderName,
          isSelected: false,
          type: 'folder',
        });
      } else {
        // Add to the bottom of the hierarchy
        newRows.push({ content: newFolderName, isSelected: false, type: 'folder' });
      }
      setRows(newRows);
    }
  };

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
