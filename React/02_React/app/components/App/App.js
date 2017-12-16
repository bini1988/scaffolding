import React from 'react';
import { Header } from 'components';
import './sass/style.scss';

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <Header>React base config v2</Header>
      </div>
    );
  }
}

export default App;
