/* https://stackoverflow.com/a/6248722/108574 */
const gen_key = function() {
  // I generate the UID from two parts here 
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

const set_key = function(key) {
  localStorage.setItem('session_key', key);
}

const set_temp_key = function(key) {
  sessionStorage.setItem('session_key', key);
}

const get_key = function() {
  var key = sessionStorage.getItem('session_key');
  if (key)
    return key;
  var key = localStorage.getItem('session_key');
  if (!key)
    key = gen_key();
  set_key(key);
  return key;
}

export const session = {
  get: get_key,
  set: set_key,
  set_temp: set_temp_key
};
