import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { DemoStore } from './demo/store';
import { WebDemoStore } from './web-scenes/store';
import './app.css';
class ErrorBoundary extends Component<{children:ReactNode},{error:boolean}> {
  state={error:false};
  static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<div style={{padding:40,fontFamily:'monospace',color:'#93e4ea',background:'#1e1517',minHeight:'100vh'}}><h1>CONNECTION INTERRUPTED</h1><p>界面载入失败。请刷新重试。 / Reload to reconnect.</p><button onClick={()=>location.reload()}>重新连接 / Reconnect</button></div>:this.props.children;}
}
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><DemoStore><WebDemoStore><HashRouter><App/></HashRouter></WebDemoStore></DemoStore></ErrorBoundary></StrictMode>);
