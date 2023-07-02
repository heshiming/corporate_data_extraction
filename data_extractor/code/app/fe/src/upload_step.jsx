import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { customAlphabet } from 'nanoid'
import { config } from './config';


var uploadFiles = [];
var uploadToastId = null;
var uploading = false;


function doUpload(setRefresh) {
  if (uploading)
    return;

  if (uploadFiles.length > 0) {
    uploading = true;
    var file = uploadFiles[0];
    uploadFiles = uploadFiles.slice(1);

    let xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function(e) {
      var percent = Math.round(100 * e.loaded / e.total);
      toast.loading(<Uploader name={ file.name } left={ uploadFiles.length } percent={ percent } />, {
        id: uploadToastId
      });
    };
    xhr.upload.onerror = function() {
      uploading = false;
    };
    xhr.onload = function() {
      setTimeout(() => {
        uploading = false;
        doUpload(setRefresh);
        setRefresh(Math.random());
      });
    };
    xhr.open('POST', config.endpoint_base + '/upload/' + localStorage.getItem(config.storage_key));
    var form = new FormData();
    form.append('file', file);
    xhr.send(form);

    if (uploadToastId) {
      toast.loading(<Uploader name={ file.name } left={ uploadFiles.length } percent={ 0 } />, {
        id: uploadToastId
      });
    } else {
      uploadToastId = toast.loading(<Uploader name={ file.name } left={ uploadFiles.length } percent={ 0 } />, {
        position: 'bottom-right'
      });
    }
  }
  else if (uploadToastId) {
    toast.success(<Uploader/>, {
      id: uploadToastId
    });
    setRefresh(Math.random());
    uploadToastId = null;
  }
}


function Uploader({ name, left, percent }) {
  if (!name)
    return (
      <div>
        <div>All files uploaded.</div>
      </div>
    )

  return (
    <div>
      <div className="text-left"><strong>Uploading</strong> {name} { left > 0 ? (<strong>{left} left</strong>):(null) } ...</div>
      <progress className="progress progress-primary w-56" value={ percent } max="100"></progress>
    </div>
  )
}


export default function UploadStep({ setStep }) {

  const [ filelist, setFilelist ] = useState([]);
  const [ refresh, setRefresh ] = useState(0);

  // initialize session
  if (!localStorage.getItem(config.storage_key))
    localStorage.setItem(config.storage_key, customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 15)());

  useEffect(() => {
    fetch(config.endpoint_base + '/files/' + localStorage.getItem(config.storage_key))
      .then(res => res.json())
      .then((result) => {
        if (result.status &&
          result.status == 'ok')
          setFilelist(result.data);
      });
  }, [ refresh ]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    onDrop: acceptedFiles => {
      if (acceptedFiles.length === 0) {
        toast.error(<span>Only files with <span className="font-bold">.pdf</span> extension are accepted.</span>, {
          duration: 5000,
          position: 'bottom-right'
        })
        return;
      }
      uploadFiles = uploadFiles.concat(acceptedFiles);
      doUpload(setRefresh);
    }
  })

  function doNext(e) {
    fetch(config.endpoint_base + '/extract/' + localStorage.getItem(config.storage_key))
      .then(res => res.json())
      .then((result) => {
        if (result.status &&
          result.status == 'ok') {
        }
      });
    setStep(1);
  }
  function doStartOver(e) {
    localStorage.setItem(config.storage_key, customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 15)());
    setRefresh(Math.random());
  }

  return (
    <div>
      <div className={`mt-5 w-full border-2 rounded-lg px-4 py-2 ${isDragActive?'border-secondary bg-secondary/25':'border-white bg-slate-100'}`} {...getRootProps()} style={{ minWidth: '600px', height: '350px' }}>
        <input {...getInputProps()} />
        { filelist.map((name, idx) => (
          <div key={ idx } className="text-left"><i className="fa-regular fa-file mr-1"></i> { name }</div>
        )) }
        <div className="text-center w-full mt-5 text-slate-600">Drag and drop PDF files here, or click to upload.</div>
      </div>
      <div className="mt-5">
        <button className="btn btn-accent mr-5" onClick={doStartOver}>Start Over</button>
        <button className="btn btn-primary" onClick={doNext}>Next</button>
      </div>
      <div style={{ color: 'white' }}>session: { localStorage.getItem(config.storage_key) }</div>
    </div>
  )
}