import React from 'react';
import logo from './logo.svg';
import './App.scss';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex' }}>
          <input type="text" placeholder="Enter some text" className="main-text-box" style={{ marginRight: '50px' }}  />
          <input type="text" placeholder="Enter some text" className="main-text-box" />
        </div>
      </header>
    </div>
  );
}

export default App;
