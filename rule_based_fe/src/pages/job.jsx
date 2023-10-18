import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Icon, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { NavLink, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { config } from '../shared/config';
import { session } from '../shared/session';
import './jobs.css';


const status_icon_small = {
  'finished': <Icon color="success" sx={{ verticalAlign: 'middle', paddingRight: '0.5rem' }}>check_circle_outline</Icon>,
  'in progress': <CircularProgress sx={{ verticalAlign:'middle', marginRight: '0.5rem' }} size={18} thickness={5} disableShrink />,
  'queued': <Icon sx={{ verticalAlign: 'middle', paddingRight: '0.5rem' }}>queue</Icon>
}

var timer_refresh_job = null;

function Job() {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const [ job, set_job ] = useState({});
  const [ canceldlgopen, set_canceldlgopen ] = useState(false);
  const [ logdlgopen, set_logdlg_open] = useState(false);
  const [ log, set_log ] = useState('');

  const go_back = function() {
    navigate('/jobs');
  };

  const open_cancel_dlg = function() {
    set_canceldlgopen(true);
  }
  const close_cancel_dlg = function() {
    set_canceldlgopen(false);
  }

  const open_log_dlg = function() {
    get_logs();
    set_logdlg_open(true);
  }
  const close_log_dlg = function() {
    set_logdlg_open(false);
  }

  const get_logs = function() {
    let api_path = '/job_logs/' + session.get() + '/' + job_id;
    axios.get(config.endpoint_base + api_path)
      .then(function (resp) {
        set_log(resp.data.data);
      })
      .catch(function (err) {
        console.log('get_logs error', err);
      })
  }

  const refresh_job = function() {
    clearTimeout(timer_refresh_job);
    let api_path = '/job/' + session.get() + '/' + job_id;
    axios.get(config.endpoint_base + api_path)
      .then(function (resp) {
        set_job(resp.data.data);
        timer_refresh_job = setTimeout(refresh_job, 15000);
      })
      .catch(function (err) {
        console.log('refresh_job error', err);
      })
  }

  const cancel_job = function() {
    close_cancel_dlg();
    let api_path = '/cancel_job/' + session.get() + '/' + job_id;
    axios.post(config.endpoint_base + api_path, {})
      .then(function (resp) {
        go_back();
      })
      .catch(function (err) {
        console.log('cancel_job error', err);
      })
  }

  const download_results = function() {
    document.getElementById('downloader_iframe').src = config.endpoint_base + '/download_job/' + session.get() + '/' + job_id;
  }

  useEffect(() => {
    timer_refresh_job = setTimeout(refresh_job, 250);
    return () => {
      clearTimeout(timer_refresh_job);
    }
  }, []);

  return (<div className="jobs">

    <div className="page-title">
      <IconButton sx={{ marginRight: '1rem' }} onClick={ go_back }><Icon color="error">arrow_back_ios_new</Icon></IconButton>

      { status_icon_small[job.status] }
      <span style={{ verticalAlign: 'middle', paddingRight: '2rem' }}>{
        'Job ' + (new Date(job.created_at)).toLocaleString() + ' - ' + (job.files?job.files.length:'') + ' Documents'
      } - {
        <span style={{ textTransform: 'capitalize' }}>{ job.status }</span>} - { (new Date(job.updated_at)).toLocaleString() }</span>

      {job.status == 'queued' || job.status == 'finished'?
      <Button variant="contained" color="error" onClick={ open_cancel_dlg }>{job.status=='queued'?'Cancel':'Delete'}</Button>:
      ''}
      
    </div>
    <div className="page-content">{
      job.files?job.files.map((file, idx) => (
        <div key={idx} style={{ margin: '0.25rem 0 1.5rem 0' }}>
          <div>
            <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon sx={{ verticalAlign: 'middle', paddingRight: '0.75rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>{ file }</span><span style={{ paddingLeft: '1rem' }}>{}</span><span style={{ paddingLeft: '1rem' }}>{}</span></span>
          </div>
        </div>
      )):''
    }

      <div style={{ margin: '2rem 0 1rem 0' }}>
      {
        job.has_results?<Button variant="contained" onClick={ download_results }>Download Results</Button>:<Button variant="contained" disabled>No Results Available</Button>
      }

        <Button variant="outlined" onClick={ open_log_dlg } sx={{ marginLeft: '2rem' }}>View Logs</Button>
      </div>
    </div>


      <Dialog
        open={canceldlgopen}
        onClose={close_cancel_dlg}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {job.status=='queued'?'Cancel':'Delete'} This Job
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {job.status=='queued'?'Canceling':'Deleting'} a job will remove all associated files from the server.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={ cancel_job } color="error">{job.status=='queued'?'Cancel':'Delete'} it</Button>
          <Button onClick={close_cancel_dlg} autoFocus>
            Keep the Job
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth={true}
        maxWidth="xl"
        open={logdlgopen}
        onClose={close_log_dlg}
      >
        <DialogTitle>Job Logs</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <pre style={{ fontSize: '0.7rem' }}>{
              log
            }
            </pre>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <span style={{ paddingRight: '2rem', color: '#999' }}>* Log is not being updated in realtime.</span>
          <Button onClick={close_log_dlg}>Close</Button>
        </DialogActions>
      </Dialog>


  </div>);

}


export default Job;
