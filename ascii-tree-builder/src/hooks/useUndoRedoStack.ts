import { useState } from 'react';

export const useUndoRedoStack = <T>(initialState: T[], setState: React.Dispatch<React.SetStateAction<T[]>>) => {
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const addToUndoStack = (currentState: T[]) => {
    setRedoStack([]); // Clear redo stack when new actions are made
    setUndoStack((prevUndoStack: string[]) => {
      const newStack = [...prevUndoStack, JSON.stringify(currentState)];

      while (newStack.length > 10) {
        newStack.shift();
      }

      return newStack;
    });
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const lastState = redoStack.pop();
      if (lastState) {
        // Before setting the new state, push the current state to the undo stack
        addToUndoStack(initialState);
        setState(JSON.parse(lastState) as T[]);
        setRedoStack([...redoStack]);
      }
    }
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack.pop();
      if (lastState) {
        // Before setting the new state, push the current state to the redo stack
        setRedoStack((prevRedoStack: string[]) => [...prevRedoStack, JSON.stringify(initialState)]);
        setState(JSON.parse(lastState) as T[]);
        setUndoStack([...undoStack]);
      }
    }
  };

  return { addToUndoStack, undo, redo };
};
