// @flow
import React from 'react'
import layer from '../../get-layer';
// @flow-disable
// @flow-enable
import './login_style.css'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner';

const layerClient = layer.layerClient
const Layer = layer.Layer

type Props = {
  history: any,
  location: any
}

type State = {
  nonce: string | null,
  email: string | null,
  userId: string | null,
  password?: string | null,
  appId: string | null,
  identityProviderUrl?: string,
  cb?: Function,
  waiting: boolean,
  isTrusted: boolean
}

class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    console.log('queryDict on login');
    console.log(layer.queryDict);
    if (!layer.queryDict || !layer.queryDict.app_id) {
      layer.queryDict = {};
      window.location.search.substr(1).split("&").forEach(function (item) { layer.queryDict[item.split("=")[0]] = item.split("=")[1] })
    }
    
    console.log(layer.queryDict);
    this.state = {
      appId: layer.queryDict.app_id,
      identityProviderUrl: layer.queryDict.identity_provider_url + '/authenticate',
      userId: null,
      email: null,
      password: null,
      nonce: null,
      waiting: false,
      isTrusted: false
    }
  }

  componentDidMount() {
    /**
     * Client authentication challenge.
     * Sign in to Layer sample identity provider service.
     */
    if (layerClient) {
      layerClient.on('challenge', e => {
        this.setState({
          nonce: e.nonce,
          cb: e.callback
        })
      }, this)

      const previousPathname = this.props.location.previousLocation ? this.props.location.previousLocation.pathname : null
      layerClient.on('ready', e => {
        if (previousPathname)
          this.props.history.push({
            pathname: previousPathname,
            search: this.props.location.search})
        else
          this.props.history.push({
            pathname: '/conversations',
            search: this.props.location.search})
      }, this);
      if (layerClient.isReady) {
        if (previousPathname)
          this.props.history.push({
            pathname: previousPathname,
            search: this.props.location.search})
        else
          this.props.history.push({
            pathname: '/conversations',
            search: this.props.location.search})
      }


      layerClient.connect()
    }
  }

  componentWillUnmount() {
    layerClient.off(null, null, this);
  }

  getIdentityToken() {
    const {
      email,
      password,
      nonce,
      waiting,
    } = this.state

    if (waiting) return;
    this.setState({ waiting: true });
    Layer.Utils.xhr({
      url: this.state.identityProviderUrl,
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      method: 'POST',
      data: {
        nonce: nonce,
        email: email,
        password: password
      }
    }, (res) => {
      this.setState({ waiting: false });
      if (res.success && res.data.identity_token && this.state.cb) {
        this.state.cb(res.data.identity_token)
      } else {
        alert('Login failed; please check your user id and password');
      }
    });
  }

  setTrustedState = (isTrusted: boolean) => {
    layerClient.isTrustedDevice = isTrusted;
    this.setState({ isTrusted });
  }

  handleKeyDown = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      this.getIdentityToken();
    }
  }

  render() {
    return (<div id="identity">
      <form>
        <img alt="layer" src="http://static.layer.com/logo-only-blue.png" />
        <h1>Layer sample app</h1>
        <div className="login-group">
          <label htmlFor="email">Email</label>
          <input type="text" id="email" onKeyDown={this.handleKeyDown} onChange={e => this.setState({ email: e.target.value })} />
        </div>
        <div className="login-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" onKeyDown={this.handleKeyDown} onChange={e => this.setState({ password: e.target.value })} />
        </div>
        <div className="login-group is-trusted">
          <input type="checkbox" id="trusted" onChange={e => this.setTrustedState(e.target.checked)} checked={layerClient.isTrustedDevice} />
          <label htmlFor="trusted">Is Trusted Device</label>
        </div>
        <button type="button" value="Submit" onClick={() => this.getIdentityToken()}>
          {this.state.waiting ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
          <span>Login</span>
        </button>
      </form>
    </div>)
  }
}

export default Login;
