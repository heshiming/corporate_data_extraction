import { useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { session } from '../shared/session';


function GoSession() {
  const { session_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let timer = setTimeout(() => {
      session.set(session_id);
      navigate('/');
    }, 500);
    return () => {
      clearTimeout(timer);
    }
  }, []);
}


export default GoSession;
