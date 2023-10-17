import { useState } from 'react';
import { Box, Button, CircularProgress, Icon, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { NavLink, useNavigate, useLocation, useParams } from 'react-router-dom';
import './jobs.css';


function Job() {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const [ canceldlgopen, set_canceldlgopen ] = useState(false);

  const go_back = function() {
    navigate('/jobs');
  };

  const open_cancel_dlg = function() {
    set_canceldlgopen(true);
  }
  const close_cancel_dlg = function() {
    set_canceldlgopen(false);
  }

  return (<div className="jobs">

    <div className="page-title">
      <IconButton sx={{ marginRight: '1rem' }} onClick={ go_back }><Icon color="error">arrow_back_ios_new</Icon></IconButton>

      <Icon sx={{ verticalAlign: 'middle', paddingRight: '0.5rem' }}>check_circle_outline</Icon><span style={{ verticalAlign: 'middle', paddingRight: '2rem' }}>Job 9:43 PM, Oct 15, 2023 - 5 Documents ({ job_id }) - Finished - 9:43 PM, Oct 15, 2023</span>

      <Button variant="contained" color="error" onClick={ open_cancel_dlg }>Cancel</Button>
    </div>
    <div className="page-content">
      <div style={{ margin: '0.25rem 0 1.5rem 0' }}>
        <div>
          <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon sx={{ verticalAlign: 'middle', paddingRight: '0.75rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span><span style={{ paddingLeft: '1rem' }}>20MB</span><span style={{ paddingLeft: '1rem' }}>August 23, 2020</span></span>
        </div>
        <div style={{ marginLeft: '2.25rem', marginTop: '0.75rem' }}>
          <span className="tag"><span className="tag-bg-1">Status</span><span>Finished</span></span>
          <span className="tag"><span className="tag-bg-2">KPIs Extracted</span><span>2</span></span>
        </div>
      </div>
      <div style={{ margin: '0.25rem 0 1.5rem 0' }}>
        <div>
          <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon sx={{ verticalAlign: 'middle', paddingRight: '0.75rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span><span style={{ paddingLeft: '1rem' }}>20MB</span><span style={{ paddingLeft: '1rem' }}>August 23, 2020</span></span>
        </div>
        <div style={{ marginLeft: '2.25rem', marginTop: '0.75rem' }}>
          <span className="tag"><span className="tag-bg-1">Status</span><span>Finished</span></span>
          <span className="tag"><span className="tag-bg-2">KPIs Extracted</span><span>2</span></span>
        </div>
      </div>
      <div style={{ margin: '0.25rem 0 1.5rem 0' }}>
        <div>
          <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon sx={{ verticalAlign: 'middle', paddingRight: '0.75rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span><span style={{ paddingLeft: '1rem' }}>20MB</span><span style={{ paddingLeft: '1rem' }}>August 23, 2020</span></span>
        </div>
        <div style={{ marginLeft: '2.25rem', marginTop: '0.75rem' }}>
          <span className="tag"><span className="tag-bg-1">Status</span><span>Finished</span></span>
          <span className="tag"><span className="tag-bg-2">KPIs Extracted</span><span>2</span></span>
        </div>
      </div>

      <div style={{ margin: '2rem 0 1rem 0' }}>
        <Button variant="contained">Download Results</Button>
      </div>
    </div>


      <Dialog
        open={canceldlgopen}
        onClose={close_cancel_dlg}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Cancel This Job
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Canceling a job will remove all associated files from the server. You will lose your queue spot.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close_cancel_dlg} color="error">Cancel it</Button>
          <Button onClick={close_cancel_dlg} autoFocus>
            Keep the Job
          </Button>
        </DialogActions>
      </Dialog>


  </div>);

}


export default Job;
