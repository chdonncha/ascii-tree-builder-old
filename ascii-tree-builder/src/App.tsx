import React from 'react';
import './App.scss';
import TreeBuilder from './components/TreeBuilder';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h3>ASCII Tree Builder</h3>
      </header>
      <div className="instructions-container">
        <strong>Instructions:</strong>
        <ul>
          <li>
            <strong>Manipulating Structure:</strong> Use the arrow buttons (↑, ↓, ←, →) to adjust the position and
            indentation of your selected tree item.
          </li>
          <li>
            <strong>Editing:</strong> Click 'Delete' to remove an item and its children, 'Rename' to modify its name, or
            'Clear' to reset the entire tree.
          </li>
          <li>
            <strong>Undo/Redo:</strong> Made a mistake? Utilise the 'Undo' and 'Redo' buttons to navigate your recent
            changes.
          </li>
          <li>
            <strong>ASCII Format:</strong> Once satisfied, view and copy your tree in ASCII format for documentation or
            future reference.
          </li>
          <li>
            <strong>Importing:</strong> To continue working on a structure, paste the copied ASCII text into the Import
            Tree section.
          </li>
        </ul>
      </div>
      <div className="instructions-container">
        <strong>Hotkeys:</strong>
        <ul>
          <li>
            <strong>Navigation:</strong> Use the ↑/↓ arrow keys to navigate through the items.
          </li>
          <li>
            <strong>Move Items:</strong> Hold 'Ctrl' and use the ↑/↓ arrow keys to move items up or down.
          </li>
        </ul>
      </div>
      <div className="tree-container">
        <TreeBuilder />
      </div>
    </div>
  );
}

export default App;
