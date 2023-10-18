import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Icon, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { config } from '../shared/config';
import { session } from '../shared/session';
import './jobs.css';


const status_list_class = { 'in progress': 'active_job', 'finished': 'done_job' };
const status_color = { 'in progress': '#ddd', 'finished': '#66aa88', 'queued': '#999' };
const status_icon = {
  'finished': <Icon fontSize="large" color="success">check_circle_outline</Icon>,
  'in progress': <CircularProgress sx={{ color: 'white' }} size={30} thickness={5} disableShrink />,
  'queued': <Icon fontSize="large">queue</Icon>
}


function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '0.75em' }}>
          {`${Math.round(props.value)}`}<span style={{ fontSize: '0.75em' }}>%</span>
        </span>
      </Box>
    </Box>
  );
}


function Jobs() {
  const navigate = useNavigate();
  const [ working, set_working ] = useState(true);
  const [ jobs, set_jobs ] = useState([]);

  const go_job = function(e) {
    navigate('/job/' + e.currentTarget.getAttribute('data-job-id'));
  }

  var timer_refresh = null;
  const refresh_jobs = function() {
    clearTimeout(timer_refresh);
    let api_path = '/jobs/' + session.get();
    axios.get(config.endpoint_base + api_path)
      .then(function (resp) {
        set_jobs(resp.data.data);
        timer_refresh = setTimeout(refresh_jobs, 15000);
        set_working(false);
      })
      .catch(function (err) {
        console.log('refresh_jobs error', err);
      })
  }

  const show_time_left = function(time, count) {
    var finish = (new Date(time)).valueOf() + 60000 * 8 * count;
    var now = (new Date()).valueOf();
    var min_left = (finish - now) / 60000;
    if (min_left < 2)
      return 'Finishing soon';
    else
      return Math.round(min_left) + ' minutes left';
  }

  useEffect(() => {
    let timer = setTimeout(refresh_jobs, 500);
    return () => {
      clearTimeout(timer);
    }
  }, []);

  return (<div className="jobs">

    <div className="page-title">
      <Icon sx={{ verticalAlign: 'middle', paddingRight: '0.5rem' }}>list</Icon><span style={{ verticalAlign: 'middle', paddingRight: '2rem' }}>Your Extraction Jobs</span>
      <NavLink to="/new_job">
        <Button variant="contained">Create New</Button>
      </NavLink>
    </div>

    {
      working?<div style={{ verticalAlign: 'middle', textAlign: 'center', padding: '5rem' }}>Loading jobs ...</div>:''
    }

    {
      !working && jobs.length == 0?<div style={{ verticalAlign: 'middle', textAlign: 'center', padding: '5rem' }}>Job list is empty</div>:
      <List>{
        jobs.map((job, idx) => (
          <ListItem key={idx} disablePadding className={ status_list_class[job['status']] }>
            <ListItemButton onClick={ go_job } data-job-id={ job.id }>
              <ListItemIcon>{ status_icon[job['status']] }
              </ListItemIcon>
              <ListItemText primary={ 'Job ' + (new Date(job.created_at)).toLocaleString() + ' - ' + job.files.length + ' Documents' } secondaryTypographyProps={{ fontSize: '0.8rem', color: status_color[job['status']] }} secondary={<>{
                job.files.map((file, idx_) => (<span key={idx_} style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>{ file }</span></span>))
              }</>}/>
              <span style={{ textAlign: 'center', padding: '0.25rem' }}>
                <span style={{ textTransform: 'capitalize', background: job.status=='in progress'?'hsla(343, 80%, 65%, 1)':'', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', lineHeight: 1.5 }}>{ job.status }</span><br/>
                <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{ (new Date(job.updated_at)).toLocaleString() }</span>
                {
                  job.launched?<span style={{ fontSize: '0.8rem' }}><br/>{ show_time_left(job.launched, job.files.length) }</span>:''
                }
              </span>
            </ListItemButton>
          </ListItem>
        ))
      }</List>
    }


    {/*
      <nav>
        <List className="done_job">
          <ListItem disablePadding>
            <ListItemButton onClick={ go_job } data-job-id="job-id-0">
              <ListItemIcon>
                <Icon fontSize="large" color="success">check_circle_outline</Icon>
              </ListItemIcon>
              <ListItemText primary="Job 9:43 PM, Oct 15, 2023 - 5 Documents" secondaryTypographyProps={{ fontSize: '0.8rem', color: '#66aa88' }} secondary={<>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                </>}/>
              <span style={{ textAlign: 'center' }}>
                Finished<br/>
                <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>9:43 PM, Oct 15, 2023</span>
              </span>
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
      <Divider />
      <nav>
        <List className="active_job">
          <ListItem disablePadding>
            <ListItemButton onClick={ go_job } data-job-id="job-id-1">
              <div style={{ minWidth: '56px' }}>
                <CircularProgressWithLabel value={ 90 } size="2.25rem" thickness={4} sx={{ color: 'white' }}/>
              </div>
              <ListItemText primary="Job 9:43 PM, Oct 15, 2023 - 5 Documents" secondaryTypographyProps={{ fontSize: '0.8rem', color: '#ddd' }} secondary={<>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                </>}/>
              <span style={{ textAlign: 'center' }}>
                <span style={{ background: 'hsla(343, 80%, 65%, 1)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>In Progress</span><br/>
                <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Started on 9:43 PM, Oct 15, 2023</span>
              </span>
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
      <Divider />
      <nav>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={ go_job } data-job-id="job-id-2">
              <ListItemIcon>
                <Icon fontSize="large">queue</Icon>
              </ListItemIcon>
              <ListItemText primary="Job 9:43 PM, Oct 15, 2023 - 5 Documents" secondaryTypographyProps={{ fontSize: '0.8rem', color: '#999' }} secondary={<>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '1.25rem' }}><Icon fontSize="small" sx={{ verticalAlign: 'middle', paddingRight: '0.25rem' }}>description</Icon><span style={{ verticalAlign:'middle'}}>2021-tesla-impact-report.1,2,13,14,35,36,67,68,121,122,123.pdf</span></span>
                </>}/>
              <span style={{ textAlign: 'center' }}>
                Queued<br/>
                <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>9:43 PM, Oct 15, 2023</span>
              </span>
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    */}

  </div>)
}


export default Jobs;
