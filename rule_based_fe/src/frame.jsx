import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SiteHeader from './shared/site-header';
import Welcome from './pages/welcome';
import Jobs from './pages/jobs';
import Job from './pages/job';
import NewJob from './pages/new_job';
import System from './pages/system';
import GoSession from './pages/go_session';


function Frame() {
  return (
    <Router>
      <div>
        <SiteHeader />
        <div className="site-content">
          <Routes>
            <Route index element={ <Welcome /> } />
            <Route path="/jobs" element={ <Jobs/> } />
            <Route path="/new_job" element={ <NewJob/> } />
            <Route path="/job/:job_id" element={ <Job/> } />
            <Route path="/system" element={ <System/> } />
            <Route path="/go_session/:session_id" element={ <GoSession/> } />
          </Routes>
        </div>
        <Toaster toastOptions={{ style: { backgroundImage: 'linear-gradient(#fcfcfc, #eee)', border: '1px solid white' } }}/>
      </div>
    </Router>
  );
}

export default Frame;
