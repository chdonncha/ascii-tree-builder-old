import React, { useState, useEffect, useRef } from 'react';
import './TreeBuilder.scss';
import { Button, Snackbar, IconButton } from '@mui/material';
import { useUndoRedoStack } from '../hooks/useUndoRedoStack';
import { FileFolderActions } from './FileFolderActions';
import { MovementActions } from './MovementActions';
import { ImportActions } from './ImportActions';
import { EditActions } from './EditActions';
import { TreeItem } from './TreeItem';
import { SAMPLE_TREE_DATA } from '../utils/sampleTreeData';

export interface Row {
  content: string;
  isSelected: boolean;
  type: 'file' | 'folder';
}

const TreeBuilder: React.FC = () => {
  const [rows, setRows] = useState<Row[]>(SAMPLE_TREE_DATA);
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const [asciiRepresentation, setAsciiRepresentation] = useState<string[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { addToUndoStack, undo, redo } = useUndoRedoStack(rows, setRows);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    generateAsciiRepresentation();
  }, [rows]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedRow(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIndentation = (str: string): number => {
    const match = str.match(/^ */);
    return match ? match[0].length : 0;
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRenameValue(e.target.value);
  };

  const submitRename = (e?: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if (e && 'key' in e && e.key !== 'Enter') return;

    if (e) e.preventDefault();

    const newRows = [...rows];
    newRows[selectedRow].content = ' '.repeat(getIndentation(newRows[selectedRow].content)) + renameValue;
    setRows(newRows);
    setIsRenaming(false);
  };

  const copyToClipboard = () => {
    const textToCopy = asciiRepresentation.join('\n');
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setSnackbarOpen(true); // Open the snackbar upon successful copy
      })
      .catch((err) => {
        console.error('Unable to copy text. Error:', err);
      });
  };

  const generateAsciiRepresentation = () => {
    const asciiRows: string[] = [];
    const linkStack: boolean[] = [];

    rows.forEach((row, index) => {
      const indentation = getIndentation(row.content);

      const nextRowMatch = rows[index + 1]?.content.match(/^ */);
      const nextRowIndentation = nextRowMatch ? nextRowMatch[0].length : 0;

      const isLastAtThisLevel = isLastInBranch(index);

      let prefix = '';

      for (let i = 0; i < indentation / 2; i++) {
        prefix += linkStack[i] ? '│   ' : '    ';
      }

      prefix += isLastAtThisLevel ? '└── ' : '├── ';

      linkStack[indentation / 2] = !isLastAtThisLevel;

      if (nextRowIndentation < indentation) {
        for (let j = indentation / 2; j >= nextRowIndentation / 2; j--) {
          linkStack[j] = false;
        }
      }

      asciiRows.push(prefix + row.content.trim());
    });

    setAsciiRepresentation(asciiRows);
  };

  const isLastInBranch = (index: number): boolean => {
    const currentIndentation = getIndentation(rows[index].content);

    for (let i = index + 1; i < rows.length; i++) {
      const nextIndentation = getIndentation(rows[i].content);

      if (nextIndentation === currentIndentation) {
        return false;
      }

      if (nextIndentation < currentIndentation) {
        return true;
      }
    }

    return true;
  };

  const canIndentFurther = (currentIndex: number): boolean => {
    if (currentIndex === 0) return false;
    const currentIndentation = getIndentation(rows[currentIndex].content);
    const prevIndentation = getIndentation(rows[currentIndex - 1].content);
    return currentIndentation <= prevIndentation;
  };

  const handleImportedData = (parsedData: Row[]) => {
    setRows((prevRows) => [...prevRows, ...parsedData]);
  };

  const generatePrefix = (index: number): string => {
    const currentIndentation = getIndentation(rows[index].content);

    // Handle root node
    if (index === 0) {
      return '';
    }

    const isLastAtThisLevel = isLastInBranch(index);
    let prefix = '';

    for (let i = 0; i < currentIndentation / 2; i++) {
      prefix += '│   ';
    }

    prefix += isLastAtThisLevel ? '└── ' : '├── ';

    return prefix;
  };

  return (
    <div className="container">
      <div className="input-box">
        <div className="button-row">
          <FileFolderActions rows={rows} setRows={setRows} selectedRow={selectedRow} addToUndoStack={addToUndoStack} />
          <ImportActions onImport={handleImportedData} />
        </div>
        <div className="button-row">
          <MovementActions
            rows={rows}
            selectedRow={selectedRow}
            setRows={setRows}
            setSelectedRow={setSelectedRow}
            getIndentation={getIndentation}
            addToUndoStack={addToUndoStack}
            canIndentFurther={canIndentFurther}
          />
        </div>
        <div className="button-row">
          <EditActions
            rows={rows}
            selectedRow={selectedRow}
            setRows={setRows}
            setSelectedRow={setSelectedRow}
            getIndentation={getIndentation}
            addToUndoStack={addToUndoStack}
            setRenameValue={setRenameValue}
            setIsRenaming={setIsRenaming}
            undo={undo}
            redo={redo}
          />
        </div>
        <ul className="input-list">
          {rows.map((row, index) => (
            <TreeItem
              key={index}
              row={row}
              index={index}
              isRenaming={isRenaming}
              renameValue={renameValue}
              handleRenameChange={handleRenameChange}
              submitRename={submitRename}
              prefix={generatePrefix(index)}
              setSelectedRow={(selectedRowIndex) => {
                if (!isRenaming) {
                  const newRows = rows.map((r, i) => ({
                    ...r,
                    isSelected: i === selectedRowIndex,
                  }));
                  setRows(newRows);
                  setSelectedRow(selectedRowIndex);
                }
              }}
            />
          ))}
        </ul>
      </div>
      <div className="output-box space-left">
        <div className="button-row"></div>
        <div className="button-row"></div>
        <div className="button-row">
          <Button variant="contained" className="button-style" onClick={copyToClipboard}>
            Copy to Clipboard
          </Button>
        </div>
        <div className="output-list">
          <div className="output-content">{asciiRepresentation.join('\n')}</div>
        </div>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === 'timeout') {
            setSnackbarOpen(false);
          }
        }}
        message="Copied to Clipboard!"
        action={
          <React.Fragment>
            <Button color="primary" size="small" onClick={() => setSnackbarOpen(false)}>
              CLOSE
            </Button>
          </React.Fragment>
        }
      />
    </div>
  );
};

export default TreeBuilder;
