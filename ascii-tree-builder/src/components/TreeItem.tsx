import React, { useEffect } from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import classNames from 'classnames';

interface TreeItemProps {
  row: {
    id: string;
    parentId: string | null;
    content: string;
    isSelected: boolean;
    isRenaming?: boolean;
    type: 'file' | 'folder';
    level: number;
  };
  index: number;
  totalItems: number; // Total number of items in the list
  isRenaming?: boolean;
  renameValue: string;
  handleRenameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitRename: (e?: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => void;
  setSelectedRow: (index: number) => void;
  prefix: string;
  isChildSelected: boolean;
}

export const TreeItem: React.FC<TreeItemProps> = ({
  row,
  index,
  totalItems,
  isRenaming,
  renameValue,
  handleRenameChange,
  submitRename,
  setSelectedRow,
  prefix,
  isChildSelected,
}) => {
  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (row.isSelected) {
        if (!e.ctrlKey) {
          if (e.key === 'ArrowUp' && index > 0) {
            setSelectedRow(index - 1);
          } else if (e.key === 'ArrowDown' && index < totalItems - 1) {
            setSelectedRow(index + 1);
          }
        }
      }
    };

    document.addEventListener('keydown', handleArrowKeys);

    return () => {
      // Cleanup the event listener
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [row.isSelected, index, setSelectedRow, totalItems]);

  const itemClassName = classNames({
    highlighted: row.isSelected,
    'child-highlighted': isChildSelected,
  });

  const indentation = '  '.repeat(row.level); // Two spaces per level

  return (
    <li key={index} className={itemClassName} onClick={() => setSelectedRow(index)}>
      <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{prefix}</span>
      {row.type === 'folder' ? (
        <FolderIcon style={{ verticalAlign: 'middle' }} />
      ) : (
        <InsertDriveFileIcon style={{ verticalAlign: 'middle' }} />
      )}
      {row.isRenaming ? (
        <input
          style={{ verticalAlign: 'middle' }}
          value={renameValue}
          onChange={handleRenameChange}
          onKeyDown={submitRename}
          onBlur={submitRename}
          autoFocus
        />
      ) : (
        <span style={{ paddingLeft: indentation }}>{row.content}</span>
      )}
    </li>
  );
};
