import React, { useEffect } from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface TreeItemProps {
  row: { content: string; isSelected: boolean; type: 'file' | 'folder' };
  index: number;
  totalItems: number; // Total number of items in the list
  isRenaming: boolean;
  renameValue: string;
  handleRenameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitRename: (e?: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => void;
  setSelectedRow: (index: number) => void;
  prefix: string;
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

  return (
    <li
      key={index}
      contentEditable={false}
      className={row.isSelected ? 'highlighted' : ''}
      onClick={() => {
        if (!isRenaming) {
          setSelectedRow(index);
        }
      }}
    >
      <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{prefix}</span>
      {row.type === 'folder' ? (
        <FolderIcon style={{ verticalAlign: 'middle' }} />
      ) : (
        <InsertDriveFileIcon style={{ verticalAlign: 'middle' }} />
      )}
      {isRenaming && row.isSelected ? (
        <input
          style={{ verticalAlign: 'middle' }}
          value={renameValue}
          onChange={handleRenameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitRename(e);
          }}
          onBlur={submitRename}
          autoFocus
        />
      ) : (
        <span style={{ verticalAlign: 'middle' }}>{row.content.trim()}</span>
      )}
    </li>
  );
};
