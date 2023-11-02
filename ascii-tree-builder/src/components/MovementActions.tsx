import React, { useEffect } from 'react';
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
      const currentIndentation = getIndentation(newRows[selectedRow].content);
      const aboveIndentation = getIndentation(newRows[selectedRow - 1].content);

      // Detecting all children of the moving row
      let childrenToMove = [];
      let nextRow = selectedRow + 1;
      while (nextRow < newRows.length && getIndentation(newRows[nextRow].content) > currentIndentation) {
        childrenToMove.push(newRows[nextRow]);
        nextRow++;
      }

      // Set the newIndentation to be the same as aboveIndentation,
      const newIndentation = aboveIndentation;

      // Creating an array of the rows to be moved (current row and its children)
      const movingRows = [
        {
          ...newRows[selectedRow],
          content: ' '.repeat(newIndentation) + newRows[selectedRow].content.trim(),
        },
        ...childrenToMove.map((row) => ({
          ...row,
          content: ' '.repeat(getIndentation(row.content) + (newIndentation - currentIndentation)) + row.content.trim(),
        })),
      ];

      // Removing the moving rows from the original array
      newRows.splice(selectedRow, childrenToMove.length + 1);

      // Inserting the rows at the new position
      newRows.splice(selectedRow - 1, 0, ...movingRows);

      setSelectedRow(selectedRow - 1);
      setRows(newRows);
    }
  };

  const moveRowDown = () => {
    if (selectedRow < rows.length - 1) {
      addToUndoStack(rows);
      const newRows = [...rows];
      const currentIndentation = getIndentation(newRows[selectedRow].content);

      // Detecting all children of the moving row
      let childrenToMove: any[] = [];
      let nextRow = selectedRow + 1;
      while (nextRow < newRows.length && getIndentation(newRows[nextRow].content) > currentIndentation) {
        childrenToMove.push(newRows[nextRow]);
        nextRow++;
      }

      // Removing the selected row and its children from the array
      const movingBlock: any[] = [newRows[selectedRow], ...childrenToMove];
      newRows.splice(selectedRow, childrenToMove.length + 1);

      // Determine where to insert the block
      let insertionIndex = selectedRow + 1;
      while (insertionIndex < newRows.length && getIndentation(newRows[insertionIndex].content) > currentIndentation) {
        insertionIndex++;
      }

      // Insert the moving block at the new position
      newRows.splice(insertionIndex, 0, ...movingBlock);

      // Adjust the indentation of the moved block if it's not at the root level
      if (insertionIndex > 0 && getIndentation(newRows[insertionIndex - 1].content) === currentIndentation) {
        const adjustIndentation = (content: string, amount: number) => ' '.repeat(getIndentation(content) + amount) + content.trim();
        movingBlock[0].content = adjustIndentation(movingBlock[0].content, 2); // Increase by 2 spaces
        for (let i = 1; i < movingBlock.length; i++) {
          movingBlock[i].content = adjustIndentation(movingBlock[i].content, 2); // Increase by 2 spaces for children too
        }
      }

      // Update the selectedRow index to reflect the new position of the moved row
      setSelectedRow(insertionIndex);
      setRows(newRows);
    }
  };

  const stepRowOut = () => {
    addToUndoStack(rows);
    const newRows = [...rows];
    const currentIndentation = getIndentation(newRows[selectedRow].content);

    // Make sure we're not trying to unindent a top-level item
    if (currentIndentation > 0) {
      // Find all children of the current row that should move along with it
      const childrenToMove = [];
      let currentChildIndex = selectedRow + 1;
      while (
        currentChildIndex < newRows.length &&
        getIndentation(newRows[currentChildIndex].content) > currentIndentation
      ) {
        childrenToMove.push(currentChildIndex);
        currentChildIndex++;
      }

      // Update the indentation of the parent node
      newRows[selectedRow].content = ' '.repeat(currentIndentation - 2) + newRows[selectedRow].content.trim();

      // Update the indentation of the children nodes, if any exist
      for (let childIndex of childrenToMove) {
        newRows[childIndex].content =
          ' '.repeat(getIndentation(newRows[childIndex].content) - 2) + newRows[childIndex].content.trim();
      }

      // Check if the next item exists and is a file
      if (selectedRow + 1 < newRows.length && newRows[selectedRow + 1].type === 'file') {
        // Check if it has equal or greater indentation (would become a child)
        if (getIndentation(newRows[selectedRow + 1].content) >= currentIndentation) {
          // Adjust the indentation to be a sibling instead of a child
          newRows[selectedRow + 1].content =
            ' '.repeat(currentIndentation - 2) + newRows[selectedRow + 1].content.trim();
        }
      }

      setRows(newRows);
    }
  };

  const stepRowIn = () => {
    if (canNodeIndentFurther(selectedRow)) {
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

  const handleKeyPress = (e: KeyboardEvent) => {
    if (selectedRow < 0) return;

    const isCtrlPressed = e.ctrlKey;

    switch (e.key) {
      case 'ArrowUp':
        if (isCtrlPressed) {
          moveRowUp();
        }
        break;
      case 'ArrowDown':
        if (isCtrlPressed) {
          moveRowDown();
        }
        break;
      case 'ArrowLeft':
        stepRowOut();
        break;
      case 'ArrowRight':
        if (canNodeIndentFurther(selectedRow)) {
          stepRowIn();
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedRow, moveRowUp, moveRowDown, stepRowOut, stepRowIn]);

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
