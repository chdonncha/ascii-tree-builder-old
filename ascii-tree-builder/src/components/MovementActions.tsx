import React from 'react';
import { Button } from '@mui/material';

type MovementActionsProps = {
  rows: Array<{ content: string; isSelected: boolean; type: 'file' | 'folder' }>;
  selectedRow: number;
  setRows: (rows: Array<{ content: string; isSelected: boolean; type: 'file' | 'folder' }>) => void;
  setSelectedRow: (rowIndex: number) => void;
  getIndentation: (content: string) => number;
  addToUndoStack: (rows: Array<{ content: string; isSelected: boolean; type: 'file' | 'folder' }>) => void;
  canNodeIndentFurther: (selectedRow: number) => boolean;
};

export const MovementActions: React.FC<MovementActionsProps> = ({
  rows,
  selectedRow,
  setRows,
  setSelectedRow,
  getIndentation,
  addToUndoStack,
  canNodeIndentFurther,
}) => {
  const moveRowUp = () => {
    if (selectedRow > 0) {
      addToUndoStack(rows);
      const newRows = [...rows];
      const aboveIndentation = getIndentation(newRows[selectedRow - 1].content);
      const currentIndentation = getIndentation(newRows[selectedRow].content);

      // Ensure moved row has the same indentation as the row above
      if (aboveIndentation !== currentIndentation) {
        newRows[selectedRow].content = ' '.repeat(aboveIndentation) + newRows[selectedRow].content.trim();
      }

      const temp = newRows[selectedRow];
      newRows[selectedRow] = newRows[selectedRow - 1];
      newRows[selectedRow - 1] = temp;
      setSelectedRow(selectedRow - 1);
      setRows(newRows);
    }
  };

  const moveRowDown = () => {
    if (selectedRow < rows.length - 1) {
      addToUndoStack(rows);
      const newRows = [...rows];
      const belowIndentation = getIndentation(newRows[selectedRow + 1].content);
      const currentIndentation = getIndentation(newRows[selectedRow].content);

      // Ensure moved row has the same indentation as the row below
      if (belowIndentation !== currentIndentation) {
        newRows[selectedRow].content = ' '.repeat(belowIndentation) + newRows[selectedRow].content.trim();
      }

      const temp = newRows[selectedRow];
      newRows[selectedRow] = newRows[selectedRow + 1];
      newRows[selectedRow + 1] = temp;
      setSelectedRow(selectedRow + 1);
      setRows(newRows);
    }
  };

  const stepRowOut = () => {
    addToUndoStack(rows);
    const newRows = [...rows];
    const currentIndentation = getIndentation(newRows[selectedRow].content);
    if (currentIndentation > 0) {
      newRows[selectedRow].content = ' '.repeat(currentIndentation - 2) + newRows[selectedRow].content.trim();
      setRows(newRows);
    }
  };

  const stepRowIn = () => {
    if (selectedRow > 0) {
      addToUndoStack(rows);
      const newRows = [...rows];
      const currentIndentation = getIndentation(newRows[selectedRow].content);
      const aboveRowIndentation = getIndentation(newRows[selectedRow - 1].content);
      if (currentIndentation <= aboveRowIndentation) {
        newRows[selectedRow].content = ' '.repeat(currentIndentation + 2) + newRows[selectedRow].content.trim();
        setRows(newRows);
      }
    }
  };

  return (
    <>
      <Button variant="contained" className="button-style" disabled={selectedRow < 0} onClick={moveRowUp}>
        ↑
      </Button>
      <Button variant="contained" className="button-style" disabled={selectedRow < 0} onClick={moveRowDown}>
        ↓
      </Button>
      <Button
        variant="contained"
        className="button-style"
        disabled={selectedRow < 0 || (selectedRow === 0 && getIndentation(rows[selectedRow].content) === 0)}
        onClick={stepRowOut}
      >
        ←
      </Button>
      <Button
        variant="contained"
        className="button-style"
        disabled={selectedRow <= 0 || !canNodeIndentFurther(selectedRow)}
        onClick={stepRowIn}
      >
        →
      </Button>
    </>
  );
};
