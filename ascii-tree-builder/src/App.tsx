import React from 'react';
import logo from './logo.svg';
import './App.scss';
import TreeBuilder from './components/TreeBuilder';

function App() {
  return (
    <div className="App">
      <header className="App-header">
          <div>
              <h1>ASCII Tree Builder</h1>
              <TreeBuilder />
          </div>
      </header>
    </div>
  );
}

export default App;