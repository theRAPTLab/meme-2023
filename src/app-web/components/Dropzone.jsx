/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  https://github.com/react-dropzone/react-dropzone

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React, { useMemo, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import request from 'superagent';

/// DEBUG FLAGS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// DROPAREA STYLING //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};
const activeStyle = { borderColor: '#2196f3' };
const acceptStyle = { borderColor: '#00e676' };
const rejectStyle = { borderColor: '#ff1744' };

/// FUNCTION COMPONENTS  //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function StyledDropzone(props) {

  // define onDrop handler
  // fires only if dropzone is successful
  const onDrop = useCallback(files => {
    const req = request.post('/screenshots/upload');
    files.forEach(file => {
      if (DBG) console.log(`uploading file '${file.name}'`);
      req.attach('screenshot', file);
    });
    req.end();
  }, []);

  // define drop failure handler
  const onDropRejected = useCallback(files => {
    if (DBG) console.log('drop only one file, not', files.length);
  }, []);

  // get dropzone props and state via dropzone hook
  // note: event handlers like 'onDrop' must be defined before
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    //
    acceptedFiles
  } = useDropzone({ accept: 'image/*', onDrop, onDropRejected, multiple: false });

  // react memoize hook, which runs at rendertime
  // and returns computed value from function
  // only if the tracked objects change
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive, // tracked objects
    isDragReject
  ]);

  // create a file listing
  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  // render
  return (
    <div className="container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <aside>
          <h4>Files</h4>
          <ul>{files}</ul>
        </aside>
      </div>
    </div>
  );
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { StyledDropzone as Dropzone };
