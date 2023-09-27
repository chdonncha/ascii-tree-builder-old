// TreeItem.tsx

import React from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface TreeItemProps {
  row: { content: string; isSelected: boolean; type: 'file' | 'folder' };
  index: number;
  isRenaming: boolean;
  renameValue: string;
  handleRenameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitRename: (e?: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => void;
  setSelectedRow: (index: number) => void;
}

export const TreeItem: React.FC<TreeItemProps> = ({
  row,
  index,
  isRenaming,
  renameValue,
  handleRenameChange,
  submitRename,
  setSelectedRow,
}) => {
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
      style={{ marginLeft: `${(row.content.match(/^ */) || [''])[0].length * 10}px` }}
    >
      {row.type === 'folder' ? <FolderIcon /> : <InsertDriveFileIcon />}
      {isRenaming && row.isSelected ? (
        <input
          value={renameValue}
          onChange={handleRenameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitRename(e);
          }}
          onBlur={submitRename}
          autoFocus
        />
      ) : (
        row.content.trim()
      )}
    </li>
  );
};
