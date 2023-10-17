import { useState, useEffect } from 'react';
import { Button, Icon, CircularProgress, Tooltip } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { session } from '../shared/session';
import { share_url } from '../shared/utils';
import './welcome.css';


function Welcome() {
  const [ skey, set_skey ] = useState(null);

  useEffect(() => {
    let timer = setTimeout(() => {
      set_skey(session.get());
    }, 1000);
    return () => {
      clearTimeout(timer);
    }
  }, []);

  return (<div className="welcome">
    <div>
      <h1><span style={{ padding: '1rem', color: '#999' }}>OS-C</span><span style={{ padding: '10px 1px', background: 'linear-gradient(45deg, hsla(321, 42%, 48%, 1) 0%, hsla(343, 80%, 65%, 1) 100%)' }}></span><span className="focus-in-expand" style={{ padding: '1rem' }}><span className="fancy-title">Rule-based KPI Extraction</span> from PDFs</span></h1>
      <div className="flip-in-hor-bottom" style={{ animationDelay: '1s' }}>
        <div className="wline"></div>WELCOME<div className="wline"></div>
      </div>
      <div style={{ margin: '2rem' }}>
        { skey ?(<>
          Here is your session key: <strong>{ skey }</strong>
          <Tooltip title="Copy the URL to share your session with someone else">
            <Button variant="outlined" startIcon={<Icon>share</Icon>} sx={{ verticalAlign: 'middle', marginLeft: '1rem' }} onClick={ share_url }>Share</Button>
          </Tooltip>
          <div>
            Session key is stored in your browser to grant you<br/>access to your previous files when you return.
          </div>
        </>):(<>
        <CircularProgress sx={{ verticalAlign: 'middle', marginRight: '1rem' }} size={20} thickness={5} disableShrink /> Preparing your session ...
        </>)}
      </div>
      <NavLink to="/jobs">
        <Button variant="contained" size="large" disabled={ skey?false:true }>
          Start
        </Button>
      </NavLink>
    </div>
  </div>);
}


export default Welcome;
