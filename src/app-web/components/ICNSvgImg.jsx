/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

SVGImg

A convenient component for inserting SVGs directly into the /src/app-web/static
folder directly as images.  This is a workaround for the fact that SVGs are not
loaded with our current webpack configuration.

  <SVGImg src="icon.svg" alt="icon" />

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import React from 'react';

function SVGImg({ src, alt }) {
  return <img src={`/static/${src}`} alt={alt} />;
}

export default SVGImg;
