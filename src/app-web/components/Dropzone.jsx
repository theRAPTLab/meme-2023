/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  React Dropzone - https://github.com/react-dropzone/react-dropzone
  To see in action, go to /#/test-screencap

  This uses a React 16.8.0+ feature called "Hooks" with "Functional Components",
  which is just a function that accepts props and returns JSX. Instead of
  maintaining state (e.g. this.setState) and lifecycle methods (e.g.
  componentDidMount) inside a "Class Component", function objects are defined
  and passed to one of the React hook interfaces. The hooks in use here are:

  useCallback - Used to match handlers that are passed eponymous keys.
                See the use of onDrop and onDropRejected, which are
                registered by react-dropzone using the callback hook.
  useMemo     - Used to calculate "memoized" values only when they change.
                They monitor a set of objects for change and fire the
                calculation function only when they do.

  Otherwise, this is very similar to a React.Component in structure.
  The functional component is StyledDropzone(props), which is essentially
  a render function returning JSX and used as any other function. See
  TestScreencap.jsx for it in use.

  In addition to react-dropzone, the AJAX library 'superagent' is used
  to fire asynchronize POST to the server

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React, { useMemo, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import request from 'superagent';
import SESSION from '../../system/common-session';
import UR from '../../system/ursys';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const SSHOT_URL = SESSION.ScreenshotURL();
const UPLOAD_URL = SESSION.ScreenshotPostURL()

/// DEBUG FLAGS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;

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

/// FUNCTION HELPERS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ upload a file as picked by dropzone OR a data URL sent from the extension
/*/
function PromiseUploadFile(fileOrBlob) {
  const req = request.post(UPLOAD_URL);
  const nameOverride = (fileOrBlob instanceof Blob) ? 'screenshot.jpg' : undefined;
  let href;
  return req.attach('screenshot', fileOrBlob, nameOverride)
    .then(res => {
      const data = JSON.parse(res.text);
      if (!data) return { error: 'no data' };
      href = `${SSHOT_URL}/${data.filename}`;
      if (DBG) {
        console.log('file saved at...opening window', href);
        // window.open(href);
      }
      return { href };
    }); // req.attach().then()
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ helper asynchronous function returning the uploaded HREF on server
/*/
async function m_UploadFile(file) {
  const { href, error } = await PromiseUploadFile(file);
  return { href, error };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ EXAMPLE subscribe to response to capture extension. This implementation
    receives the canvas dataURL from the screencapture plugin.
    To invoke programmatically, use UR.TriggerExtension('REQ_CAPTURE',{});
/*/
UR.Subscribe('MEME_EXT_RES_CAPTURE', data => {
  const { dataURI } = data;
  // clever trick to convert base64-encoded data from extension
  fetch(dataURI)
    .then(res => res.blob())
    .then(blob => {
      blob.name = 'screencapture.jpg';
      blob.lastModifiedDate = new Date();
      m_UploadFile(blob)
        .then(m => {
          if (m.error) { console.warn(m.error); return; }
          if (DBG) console.log('blob uploaded', m.href);
          UR.Publish('SCREEN_CAPTURED', { href: m.href });
        });
    });
});


/// FUNCTION COMPONENTS  //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function StyledDropzone(props) {

  /*/
    define onDrop handler
    fires only if dropzone is successful
  /*/
  const onDrop = useCallback(files => {
    let href, error;
    if (files.length !== 1) return;
    const file = files[0];

    m_UploadFile(file)
      .then(m => {
        if (DBG) console.log('drop upload results', m);
        if (m.error) {
          console.error(error);
          return;
        }
        if (typeof props.onDrop === 'function') props.onDrop(m.href);
      });
    // req.attach.then
  }, []);

  // define drop failure handler
  const onDropRejected = useCallback(files => {
    if (DBG) console.log('drop only one file, not', files.length);
  }, []);  // get dropzone props and state via dropzone hook
  // note: event handlers like 'onDrop' must be defined before this is called
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
        <p>Drag 'n' drop screenshot here, or click to select file</p>
        <aside>
          <ul>{files}</ul>
        </aside>
      </div>
    </div>
  );
}

/// DEBUG /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { StyledDropzone as Dropzone };
