import { useState, useEffect, useCallback } from 'react';
import { Box, Button, CircularProgress, Icon, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { init_dropzone } from './upload';
import { config } from '../shared/config';
import { session } from '../shared/session';
import './jobs.css';


function NewJob() {
  const max_files = 5;
  const [files, set_files] = useState([]);
  const navigate = useNavigate();

  const go_back = function() {
    navigate('/jobs');
  };

  const refresh_files = function() {
    let api_path = '/uploaded/' + session.get();
    axios.get(config.endpoint_base + api_path)
      .then(function (resp) {
        set_files(resp.data.data);
      })
      .catch(function (err) {
        console.log('refresh_files error', err);
      })
  }

  const delete_file = function(e) {
    const filenames = [e.currentTarget.getAttribute('data-filename')];
    let api_path = '/delete_uploaded/' + session.get();
    axios.post(config.endpoint_base + api_path, { filenames: filenames })
      .then(function (resp) {
        refresh_files();
      })
      .catch(function (err) {
        console.log('delete_file error', err);
      })
  }

  const queue_job = function(e) {
    let api_path = '/queue_job/' + session.get();
    axios.post(config.endpoint_base + api_path, { })
      .then(function (resp) {
        go_back();
      })
      .catch(function (err) {
        console.log('queue_job error', err);
      })
  }

  useEffect(() => {
    let timer = setTimeout(refresh_files, 500);
    return () => {
      clearTimeout(timer);
    }
  }, []);

  const files_left = max_files - files.length;
  const dropzone = init_dropzone('path', refresh_files, files_left);

  return (<div className="jobs">

    <div className="page-title">
      <IconButton sx={{ marginRight: '1rem' }} onClick={ go_back }><Icon color="error">arrow_back_ios_new</Icon></IconButton>
      <Icon sx={{ verticalAlign: 'middle', paddingRight: '0.5rem' }}>add</Icon><span style={{ verticalAlign: 'middle', paddingRight: '2rem' }}>New Job</span>
    </div>
    <div className="page-content">
      Upload as many as <strong>5</strong> PDF files, with each file <strong>less than 20MB</strong> in size. {files_left>0?<>Drag and drop files in the box below or <Button variant="outlined" sx={{ marginLeft: '0.5rem'}} onClick={ dropzone.open }>Pick Files to Upload</Button></>:'' }

      <div {...files_left>0?dropzone.getRootProps():{}} style={{ margin: '1rem 0', border: '2px ' + (dropzone.isDragActive?'solid #66aa88' : 'dashed hsla(343, 80%, 65%, 1)'), borderRadius: '0.5rem', backgroundColor: dropzone.isDragActive?'#DDFEED':'' }}>
        <div>

      <List>{
        files.map((file, idx) => (
        <ListItem disablePadding key={ idx }>
          <div style={{ padding: '0.25rem 1rem', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Icon sx={{ marginRight: '0.5rem' }}>description</Icon>
            <ListItemText primary={ file } />
            <IconButton data-filename={ file } onClick={ delete_file }><Icon color="error">delete</Icon></IconButton>
          </div>
        </ListItem>
        ))
      }
      </List>
      {files.length > 0 && files_left > 0?<div style={{ borderBottom: '2px ' + (dropzone.isDragActive?'solid #66aa88' : 'dashed hsla(343, 80%, 65%, 1)')}}></div>:''}

        </div>
        { files_left > 0 ?(
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <input {...dropzone.getInputProps()} />
            {
              dropzone.isDragActive ?
                <p style={{ color: '#66aa88'}}><Icon size="large" sx={{ verticalAlign: 'middle', paddingRight: '1rem' }}>file_upload</Icon><span style={{ verticalAlign: 'middle'}}><strong>Drop</strong> your PDF documents here</span></p> :
                <p style={{ color: 'hsla(343, 80%, 65%, 1)' }}><Icon size="large" sx={{ verticalAlign: 'middle', paddingRight: '1rem' }}>file_upload</Icon><span style={{ verticalAlign: 'middle'}}><strong>Drop</strong> your PDF documents here</span></p>
            }
          </div>
          ):'' }
      </div>

      <Button variant="contained" sx={{ marginTop: '1rem', marginBottom: '1rem' }} onClick={ queue_job }>Queue This Job</Button>
    </div>

  </div>)
}


export default NewJob;
