import React from 'react';

function Header(props) {
  return (
    <h1 className="header">{props.children}</h1>
  );
}

export default Header;
