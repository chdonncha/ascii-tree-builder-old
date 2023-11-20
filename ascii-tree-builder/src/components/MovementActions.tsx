import React, { useEffect } from 'react';
import { Button } from '@mui/material';
import { isLastInBranch } from '../utils/treeUtils';
import { Row } from './TreeBuilder';

type MovementActionsProps = {
  rows: Row[];
  selectedRow: number;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  setSelectedRow: (rowIndex: number) => void;
  getIndentation: (content: string) => number;
  addToUndoStack: (rows: Row[]) => void;
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
    if (selectedRow <= 0) return; // Can't move up the first row

    addToUndoStack(rows);

    const newRows = [...rows];
    const itemToMove = newRows[selectedRow];
    const itemsToMove = getItemsToMove(itemToMove, newRows); // Item and its children

    // Calculate the new position (immediately above the previous row)
    const newPosition = selectedRow - 1;

    // Remove items from the current position
    newRows.splice(selectedRow, itemsToMove.length);

    // Insert them at the new position
    newRows.splice(newPosition, 0, ...itemsToMove);

    setRows(newRows);
    setSelectedRow(newPosition);
  };

  const moveRowDown = () => {
    if (selectedRow >= rows.length - 1) return;

    addToUndoStack(rows);
    let newRows = [...rows];

    const itemsToMove = getItemsToMove(newRows[selectedRow], newRows); // Item and its children
    const totalItemsToMove = itemsToMove.length;

    // Check if we're not at the end of the list
    if (selectedRow + totalItemsToMove >= rows.length) {
      return; // Can't move down if there's no room
    }

    // Determine the insert position which is just one position down from the current position
    const insertPosition = selectedRow + 1;

    // Remove items from the current position
    const itemsRemoved = newRows.splice(selectedRow, totalItemsToMove);

    // Insert them at the next position down
    newRows.splice(insertPosition, 0, ...itemsRemoved);

    setRows(newRows);
    setSelectedRow(insertPosition);
  };

  const getItemsToMove = (itemToMove, rows) => {
    // This function finds the item and all of its direct children.
    const itemsToMove = [itemToMove];
    const startIndex = rows.indexOf(itemToMove);
    const endOfList = rows.length;

    // Use a recursive function to add children.
    const addChildren = (parentId, level) => {
      for (let i = startIndex + 1; i < endOfList; i++) {
        if (rows[i].parentId === parentId) {
          itemsToMove.push(rows[i]);
          addChildren(rows[i].id, level + 1); // Add children of this child
        }
      }
    };

    // Start the recursive search for children with the level of the item being moved.
    addChildren(itemToMove.id, itemToMove.level);

    return itemsToMove;
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
