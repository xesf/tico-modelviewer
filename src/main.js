import React from 'react';
import ReactDOM from 'react-dom';

import Ticker from './ui/utils/Ticker.ts';
import Editor from './ui/Editor';
import Popup from './ui/Popup';
import {loadParams} from './params.ts';
import {loadGameMetaData, loadModelsMetaData} from './ui/editor/DebugData';
import {CrashHandler} from './crash_reporting';

class Root extends React.Component {
    constructor(props) {
        super(props);
        const params = loadParams();
        this.state = {
            params,
        };
        this.onHashChange = this.onHashChange.bind(this);
        if (params.editor) {
            loadGameMetaData();
            loadModelsMetaData();
        }
    }

    componentWillMount() {
        window.addEventListener('hashchange', this.onHashChange);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
    }

    onHashChange() {
        this.setState({ params: loadParams() });
    }

    render() {
        return <div>
            <Editor params={this.state.params} ticker={this.props.ticker} />
            <Popup/>
        </div>;
    }
}

window.onload = () => {
    init();
    document.body.removeChild(document.getElementById('preload'));
};

window.onerror = (message, file, line, column, data) => {
    const stack = (data && data.stack) || undefined;
    init({message, file, line, column, stack, data});
};

window.addEventListener('unhandledrejection', (event) => {
    init(event.reason);
});

function init(error) {
    const ticker = new Ticker();
    const Renderer = () => (error
        ? <CrashHandler error={error}/>
        : <Root ticker={ticker}/>);
    ReactDOM.render(<Renderer/>, document.getElementById('root'));
}
