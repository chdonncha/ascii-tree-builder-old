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
  prefix: string; // The ASCII prefix representation for this item
}

export const TreeItem: React.FC<TreeItemProps> = ({
  row,
  index,
  isRenaming,
  renameValue,
  handleRenameChange,
  submitRename,
  setSelectedRow,
  prefix,
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
