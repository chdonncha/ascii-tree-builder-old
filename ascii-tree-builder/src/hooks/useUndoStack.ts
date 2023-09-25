import React, { useState } from 'react';

export const useUndoStack = <T>(initialState: T[], setState: React.Dispatch<React.SetStateAction<T[]>>) => {
  const [undoStack, setUndoStack] = useState<string[]>([]);

  const addToUndoStack = (currentState: T[]) => {
    setUndoStack((prevUndoStack) => {
      const newStack = [...prevUndoStack, JSON.stringify(currentState)];

      while (newStack.length > 10) {
        newStack.shift();
      }

      return newStack;
    });
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack.pop();
      if (lastState) {
        setState(JSON.parse(lastState) as T[]);
        setUndoStack([...undoStack]);
      }
    }
  };

  return { addToUndoStack, undo };
};
