import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from '@mui/material';
import { Row } from './TreeBuilder';
import { styled } from '@mui/system';

interface ImportActionsProps {
  onImport: (parsedData: Row[]) => void;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

const CustomDialog = styled(Dialog)({
  '.MuiPaper-root': {
    width: '70%',
    maxHeight: '90vh',
  },
});

const determineType = (line: string): 'file' | 'folder' => {
  const trimmed = line.trim();
  return trimmed.endsWith('/') ? 'folder' : 'file';
};

const parseTree = (text: string): TreeNode[] => {
  try {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) {
      throw new Error('No valid tree structure found.');
    }

    const stack: TreeNode[] = [];
    const root: TreeNode[] = [];

    lines.forEach((line) => {
      const depth = line.search(/(└──|├──)/) / 4;
      if (depth < 0) {
        throw new Error('Invalid tree structure line found.');
      }

      const name = line.replace(/(├──|└──|│   )/g, '').trim();

      const node: TreeNode = {
        id: generateUniqueId(),
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
  } catch (error) {
    throw error;
  }
};

function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

const rowsFromTreeNodes = (nodes: TreeNode[], depth: number = 0, parentId: string | null = null): Row[] => {
  let rows: Row[] = [];
  nodes.forEach((node) => {
    rows.push({
      id: generateUniqueId(),
      parentId: parentId,
      level: depth,
      content: node.name.trim(),
      isSelected: false,
      isRenaming: false,
      type: node.type as 'file' | 'folder',
    });

    if (node.children) {
      rows = rows.concat(rowsFromTreeNodes(node.children, depth + 1, node.id));
    }
  });
  return rows;
};

export const ImportActions: React.FC<ImportActionsProps> = ({ onImport }) => {
  const [inputValue, setInputValue] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleImport = () => {
    try {
      const treeNodes = parseTree(inputValue);
      const parsedRows = rowsFromTreeNodes(treeNodes);
      onImport(parsedRows);
    } catch (error) {
      console.error('Error parsing tree data:', error);
      setSnackbarMessage('Failed to import data: Invalid format or file type.');
      setSnackbarOpen(true);
    }

    setInputValue('');
    setDialogOpen(false);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
      <>
        <Button variant="contained" className="button-style" onClick={() => setDialogOpen(true)}>
          Import Tree
        </Button>
        <CustomDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} aria-labelledby="import-dialog-title">
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
                rows={20}
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
        </CustomDialog>
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message={snackbarMessage}
            action={
              <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
                Close
              </Button>
            }
        />
      </>
  );
};
