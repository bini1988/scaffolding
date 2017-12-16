import React from 'react';
import './sass/style.scss';

function Header(props) {
  return (
    <h1 className="header">{props.children}</h1>
  );
}

export default Header;
