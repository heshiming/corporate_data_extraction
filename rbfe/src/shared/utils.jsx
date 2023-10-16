import toast from 'react-hot-toast';
import { session } from './session';


function share_url() {
  const key = session.get();
  const url = window.location.protocol + '//' + window.location.host + '/#/go_session/' + key;
  toast.success(<span>Copied <strong>{url}</strong> to clipboard.</span>);
  navigator.clipboard.writeText(url);
}


export {
  share_url
}
