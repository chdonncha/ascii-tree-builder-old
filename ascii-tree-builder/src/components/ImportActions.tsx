import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Row } from './TreeBuilder';

interface ImportActionsProps {
  onImport: (parsedData: Row[]) => void;
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

const determineType = (line: string): 'file' | 'folder' => {
  const trimmed = line.trim();
  return trimmed.endsWith('/') ? 'folder' : 'file';
};

const parseTree = (text: string): TreeNode[] => {
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  const stack: TreeNode[] = [];
  const root: TreeNode[] = [];

  lines.forEach((line) => {
    const depth = line.search(/(└──|├──)/) / 4;
    const name = line.replace(/(├──|└──|│   )/g, '').trim();

    const node: TreeNode = {
      name,
      type: determineType(name),
    };

    while (stack.length > depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    }

    stack.push(node);
  });

  return root;
};

const rowsFromTreeNodes = (nodes: TreeNode[], depth: number = 0): Row[] => {
  let rows: Row[] = [];
  nodes.forEach((node) => {
    const prefixSpaces = '    '.repeat(depth);

    rows.push({
      content: prefixSpaces + node.name,
      isSelected: false,
      type: node.type,
    });

    if (node.children) {
      rows = rows.concat(rowsFromTreeNodes(node.children, depth + 1));
    }
  });
  return rows;
};

export const ImportActions: React.FC<ImportActionsProps> = ({ onImport }) => {
  const [inputValue, setInputValue] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleImport = () => {
    const treeNodes = parseTree(inputValue);
    const parsedRows = rowsFromTreeNodes(treeNodes);
    onImport(parsedRows);
    setInputValue('');
    setDialogOpen(false);
  };

  return (
    <>
      <Button variant="contained" className="button-style" onClick={() => setDialogOpen(true)}>
        Import Tree
      </Button>
      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} aria-labelledby="import-dialog-title">
        <DialogTitle id="import-dialog-title">Import Tree Data</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Paste your tree here"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleImport} color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
