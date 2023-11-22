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

    if (selectedRow + totalItemsToMove >= rows.length) return;

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
    const itemsToMove = [itemToMove];
    const startIndex = rows.indexOf(itemToMove);
    const endOfList = rows.length;

    const addChildren = (parentId, level) => {
      for (let i = startIndex + 1; i < endOfList; i++) {
        if (rows[i].parentId === parentId) {
          itemsToMove.push(rows[i]);
          addChildren(rows[i].id, level + 1);
        }
      }
    };

    addChildren(itemToMove.id, itemToMove.level);

    return itemsToMove;
  };

  const changeIndentation = (delta) => {
    if (selectedRow < 0) return;

    addToUndoStack(rows);
    const newRows = [...rows];
    const row = newRows[selectedRow];

    if ((delta > 0 && !canNodeIndentFurther(selectedRow)) || (delta < 0 && row.level === 0)) return;

    addToUndoStack(rows);

    let newLevel = row.level + delta;

    // This check depends on the new level and should remain separate
    if (delta > 0) {
      const aboveRow = newRows[selectedRow - 1];
      if (aboveRow && newLevel > aboveRow.level + 1) {
        newLevel = aboveRow.level + 1;
      }
    }

    // Update the level of the selected row and its children
    row.level = newLevel;
    applyLevelToChildren(row.id, newLevel);

    setRows(newRows);
  };

  const applyLevelToChildren = (parentId, level) => {
    const startIndex = rows.findIndex(r => r.id === parentId);
    if (startIndex === -1) return;

    for (let i = startIndex + 1; i < rows.length && rows[i].parentId === parentId; i++) {
      rows[i].level = level + 1;
      applyLevelToChildren(rows[i].id, level + 1); // Recurse for children
    }
  };

  const stepRowOut = () => {
    changeIndentation(-1); // Decrease level
  };

  const stepRowIn = () => {
    changeIndentation(1); // Increase level
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
          disabled={selectedRow < 0 || rows[selectedRow].level === 0}
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
