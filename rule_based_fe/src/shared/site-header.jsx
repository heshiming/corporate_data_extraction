import { useState, useEffect } from 'react';
import { Button, Icon, IconButton, Tooltip } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { session } from '../shared/session';
import { share_url } from '../shared/utils';


function SiteHeader() {
  const location = useLocation();

  const [ skey, set_skey ] = useState(null);

  useEffect(() => {
    let timer = setTimeout(() => {
      set_skey(session.get());
    }, 100);
    return () => {
      clearTimeout(timer);
    }
  }, []);

  return (<>{ location.pathname == '/' || location.pathname == 'go_session'?'':
    <>
      <div className="site-header"><span style={{ padding: '1rem', color: '#999' }}>OS-C</span><span style={{ padding: '10px 1px', background: 'linear-gradient(45deg, hsla(321, 42%, 48%, 1) 0%, hsla(343, 80%, 65%, 1) 100%)' }}></span><span style={{ padding: '1rem' }}><span className="fancy-title">Rule-based KPI Extraction</span> from PDFs</span>

      <span style={{ fontSize: '0.9rem', color: '#999' }}>session: <strong>{ skey }</strong>
        <Tooltip title="Copy the URL to share your session with someone else">
          <IconButton onClick={ share_url } sx={{ marginLeft: '0.25rem', marginRight: '1rem', fontSize: '1rem' }}><Icon fontSize="inherit" color="primary">share</Icon></IconButton>
        </Tooltip>
      </span>
      </div>
    <div className="site-header-spacer"></div></>
   }</>);
}


export default SiteHeader;
