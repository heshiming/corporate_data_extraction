import { useState, useCallback } from 'react';
import { Box, Button, CircularProgress, Icon, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { init_dropzone } from './upload';
import './jobs.css';


function NewJob() {
  const [files, set_files] = useState([]);
  const navigate = useNavigate();

  const upload_refresh = function () {
    console.log('upload_refresh');
  };

  const go_back = function() {
    navigate('/jobs');
  };

  const dropzone = init_dropzone('path', upload_refresh);

  return (<div className="jobs">

    <div className="page-title">
      <IconButton sx={{ marginRight: '1rem' }} onClick={ go_back }><Icon color="error">arrow_back_ios_new</Icon></IconButton>
      <Icon sx={{ verticalAlign: 'middle', paddingRight: '0.5rem' }}>add</Icon><span style={{ verticalAlign: 'middle', paddingRight: '2rem' }}>New Job</span>
    </div>
    <div className="page-content">
      Upload as many as <strong>5</strong> PDF files, with each file <strong>less than 20MB</strong> in size. Drag and drop files in the box below or <Button variant="outlined" sx={{ marginLeft: '0.5rem'}} onClick={ dropzone.open }>Pick Files to Upload</Button>

      <div {...dropzone.getRootProps()} style={{ margin: '1rem 0', border: '2px ' + (dropzone.isDragActive?'solid #66aa88' : 'dashed hsla(343, 80%, 65%, 1)'), borderRadius: '0.5rem', backgroundColor: dropzone.isDragActive?'#DDFEED':'' }}>
        <div>

      <List>
        <ListItem disablePadding>
          <div style={{ padding: '0.25rem 1rem', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Icon sx={{ marginRight: '0.5rem' }}>description</Icon>
            <ListItemText primary="2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf" />
            <IconButton><Icon color="error">delete</Icon></IconButton>
          </div>
        </ListItem>
        <ListItem disablePadding>
          <div style={{ padding: '0.25rem 1rem', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Icon sx={{ marginRight: '0.5rem' }}>description</Icon>
            <ListItemText primary="2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf" />
            <IconButton><Icon color="error">delete</Icon></IconButton>
          </div>
        </ListItem>
      </List>
      <div style={{ borderBottom: '2px ' + (dropzone.isDragActive?'solid #66aa88' : 'dashed hsla(343, 80%, 65%, 1)')}}></div>

        </div>
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <input {...dropzone.getInputProps()} />
          {
            dropzone.isDragActive ?
              <p style={{ color: '#66aa88'}}><Icon size="large" sx={{ verticalAlign: 'middle', paddingRight: '1rem' }}>file_upload</Icon><span style={{ verticalAlign: 'middle'}}><strong>Drop</strong> your PDF documents here</span></p> :
              <p style={{ color: 'hsla(343, 80%, 65%, 1)' }}><Icon size="large" sx={{ verticalAlign: 'middle', paddingRight: '1rem' }}>file_upload</Icon><span style={{ verticalAlign: 'middle'}}><strong>Drop</strong> your PDF documents here</span></p>
          }
        </div>
      </div>

      <NavLink to="/jobs">
        <Button variant="contained" sx={{ marginTop: '1rem', marginBottom: '1rem' }}>Queue This Job</Button>
      </NavLink>
    </div>

  </div>)
}


export default NewJob;
