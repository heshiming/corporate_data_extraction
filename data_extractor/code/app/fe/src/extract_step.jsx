import { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { config } from './config';


var statusPos = 0;
var statusResponse = `Running ...\n`;


export default function ExtractStep({ setStep }) {

  const [ refresh, setRefresh ] = useState(0);
  const [ enableNext, setEnableNext ] = useState(false);
  const refBox = useRef();

  function doDownload(e) {
    document.getElementById('downloader_iframe').src = config.endpoint_base + '/download/' + localStorage.getItem(config.storage_key);
  }
  function doBack(e) {
    setStep(0);
  }

  function updateStatus() {
    fetch(config.endpoint_base + '/extract_status/' + localStorage.getItem(config.storage_key) + '/' + statusPos)
      .then(res => res.json())
      .then((result) => {
        if (result.status &&
          result.status == 'ok') {
          statusPos = result.data.pos;
          statusResponse += result.data.content;
          setRefresh(Math.random());
        }
        if (statusResponse.indexOf('---------------END_OF_PROCESSING---------------') < 0)
          setTimeout(updateStatus, 500);
        else
          setEnableNext(true);
      });
  }

  useEffect(() => {
    statusPos = 0;
    statusResponse = `Running ...\n`;
    setTimeout(updateStatus, 100);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (refBox.current)
        refBox.current.scrollTop = refBox.current.scrollHeight;
    });
  }, [ refresh ]);

  return (
    <div>
      <div className="mt-5" style={{ width: '800px', height: '450px' }}>
        <div className="mockup-code text-left text-xs" style={{ position: 'relative', height: '100%' }}>
          <pre ref={ refBox } style={{ position: 'absolute', left: '10px', right: '10px', top: '40px', bottom: '5px', overflow: 'auto', fontSize: '0.85em', lineHeight: '1.1em', scrollBehavior: 'smooth' }}>
{ statusResponse }
          </pre> 
        </div>
      </div>
      <div className="mt-5 h-12">
      { enableNext?(
        <div>
          <button className="btn btn-accent mr-5" onClick={doBack}>Back</button>
          <button className="btn btn-primary" onClick={doDownload}>Download Results</button>
        </div>
        ):(
        <progress className="progress progress-primary w-56"></progress>
        )
      }
      </div>
    </div>
  )
}
