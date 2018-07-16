// @flow
/**
 * Root level of the React application.
 *
 * For a typical application, this would contain access to a lot of your own UI components, one or more of which might contain Layer XDK Components.
 */
import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Login from './components/Login'
import Messenger from './components/Messenger'

type Props = {}

class App extends React.Component<Props> {
  render() {
    return (<BrowserRouter>
      <Switch>
        <Route exact path='/' component={Login} />
        <Route exact path='/conversations' component={Messenger} />
        <Route path='/conversations/:conversationId' component={Messenger} />
      </Switch>
    </BrowserRouter>)
  }
}

export default App;
