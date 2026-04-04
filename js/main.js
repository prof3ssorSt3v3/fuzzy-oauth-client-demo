document.addEventListener('DOMContentLoaded', init);
let localURL, remoteURL;
// const APIURL = `http://localhost:4000`;
const APIURL = `https://fuzzy-oauth-server-demo.vercel.app/`;

function init() {
  //listen for button click
  localURL = `${location.origin}/private.html`; //where we want the API to redirect to after authentication
  remoteURL = `${APIURL}/api/auth/login`; //the API endpoint for logging in
  let page = document.body.id;
  switch (page) {
    case 'login':
      document.querySelector('.btn').addEventListener('click', attemptLogin);
      break;
    case 'main':
      //look for the token in the querystring
      const url = new URL(location.href);
      const params = url.searchParams;
      const token = params.get('token');
      //check in sessionStorage/cookie
      // let cookie = document.cookie;
      let ssToken = sessionStorage.getItem('token');

      if (token) {
        // document.cookie = `token=${token}; SameSite=lax`;
        console.log(token);
        //optionally we can save it in sessionStorage
        sessionStorage.setItem('token', token);
        //just a string so no need for JSON.stringify
        //Do we want to change the URL to remove the token?
      } else {
        //check for existing token
        // let part = cookie.split(';').find((part) => part.startsWith('token'));
        // let c = part ? part.split('=')[0] : null;
        let t = ssToken ? ssToken : null;
        if (!t) {
          //redirect user to home/login page
          location.assign('/');
          return;
        }
      }
      url.search = '';
      history.replaceState(null, null, url);
      document.querySelector('.btn').addEventListener('click', logout);
      attemptFetch();
      break;
    case 'failure':
      break;
    default:
  }
}

function logout(ev) {
  //get rid of the token in cookie/sessionStorage
  sessionStorage.removeItem('token');
  // document.cookie = 'token=; max-age=0';
  //redirect to home/login page
  location.assign('/');
}

function attemptLogin(ev) {
  //the url for feedback from the login process
  //this is a local one in the /public folder
  //be sure to encode it
  const returnURL = encodeURIComponent(localURL);
  //the server side URL to initiate login
  const url = `${remoteURL}?redirect_url=${returnURL}`;
  location.assign(url);
}

function attemptFetch() {
  //call /api/auth/private via fetch with Authorization header
  let url = new URL(`${APIURL}/api/auth/private`);
  let token = sessionStorage.getItem('token');
  if (!token) {
    logout();
  }
  let req = new Request(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  fetch(req)
    .then((resp) => {
      if (!resp.ok) throw new Error(`Unable to fetch results. ${resp.status}`);
      return resp.json();
    })
    .then((data) => {
      document.querySelector('.content').innerHTML = `
        <pre>${JSON.stringify(data, '\t', 2)}</pre>
      `;
    })
    .catch((err) => {
      console.warn(err.message);
    });
}
