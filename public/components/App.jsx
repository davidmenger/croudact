/**
 * @author David Menger
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class App extends Component {

    constructor (props) {
        super(props);

        const query = window.location.search
            .replace(/^\?/, '')
            .split('&')
            .reduce((o, str) => {
                const [key, val] = str.split('=');
                return Object.assign(o, {
                    [decodeURIComponent(key)]: decodeURIComponent(val)
                });
            }, {});

        const {
            code
        } = query;

        const token = window.localStorage.getItem('token');
        const refresh = window.localStorage.getItem('refresh');
        const lat = window.localStorage.getItem('lat');
        const lon = window.localStorage.getItem('lon');
        const id = window.localStorage.getItem('id');

        this.state = {
            showLogin: false,
            lat,
            lon,
            id,
            code,
            token,
            refresh
        };
    }

    componentDidMount () {
        const {
            code, lat, lon, id
        } = this.state;

        if (code) {
            const body = new URLSearchParams();


            const redirectUri = window.location.href.replace(/\?.+$/, '');

            body.set('grant_type', 'authorization_code');
            body.set('client_secret', 'af1a010b-2a96-43e8-8b64-1384190993d3');
            body.set('code', code);
            body.set('redirect_uri', redirectUri);
            body.set('client_id', 'c1ea98f3-9920-4531-ae58-02848694cfe1');
            body.set('access_type', 'offline');

            fetch('https://webapi.developers.erstegroup.com/api/csas/sandbox/v1/sandbox-idp/token', {
                method: 'POST',
                body
            })
                .then(r => r.json())
                .then((i) => {
                    const { access_token: token, refresh_token: refresh } = i;
                    this._setToken(token, refresh);
                    window.history.pushState({}, document.title, redirectUri);
                })
                .catch((e) => {
                    console.error(e);
                });
        } else if (id || lat || lon) {
            this._showWidget();
        }
    }

    componentDidUpdate (prevProps, { id: prevId, lat: prevLat, token: prevToken }) {
        const {
            id, lat, token
        } = this.state;

        if (!token || (!id && !lat)) {
            this._hideWidget();
        } else if (id && (!prevId || !prevToken)) {
            this._showWidget();
        } else if (lat && (!prevLat || !prevToken)) {
            this._showWidget();
        }
    }

    onSelect (id = '1') {
        const { token } = this.state;

        if (!token) {
            this.setState({ showLogin: true });
        }
        this._setShow(id);
    }

    onCreate (lat = 1, lon = 1) {
        const { token } = this.state;

        if (!token) {
            this.setState({ showLogin: true });
        }
        this._setShow(null, lat, lon);
    }

    onSignOut () {
        this._setToken();
    }

    _setShow (id, lat = null, lon = null) {
        if (id) {
            this.setState({ id, lat: null, lon: null });
            window.localStorage.setItem('id', id);
            window.localStorage.removeItem('lat');
            window.localStorage.removeItem('lon');
        } else if (lat && lon) {
            this.setState({ id: null, lat, lon });
            window.localStorage.setItem('lat', lat);
            window.localStorage.setItem('lon', lon);
            window.localStorage.removeItem('id');
        } else {
            this.setState({ id: null, lat: null, lon: null });
            window.localStorage.removeItem('lat');
            window.localStorage.removeItem('lon');
            window.localStorage.removeItem('id');
        }
    }

    _setToken (token = null, refresh = null) {
        this.setState({ token, refresh });
        if (!token) {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('refresh');
        } else {
            window.localStorage.setItem('token', token);
            window.localStorage.setItem('refresh', refresh);
        }
    }

    _hideWidget () {
        const wc = document.querySelector('.chatcontainer');
        wc.style.display = 'none';
    }

    _showWidget () {
        const wc = document.querySelector('.chatcontainer');
        wc.style.display = 'block';

        const {
            id, lat, lon, token, refresh
        } = this.state;

        if (id) {
            window.directLine.postBack('contribution/introduction', { id, token, refresh });
        } else {
            window.directLine.postBack('start', {
                lat, lon, token, refresh
            });
        }
    }

    renderLogin () {
        const redirectUri = window.location.href.replace(/\?.+$/, '');

        return (
            <div>
                <a
                    className="button is-primary"
                    href={`https://webapi.developers.erstegroup.com/api/csas/sandbox/v1/sandbox-idp/auth?redirect_uri=${encodeURIComponent(redirectUri)}&client_id=c1ea98f3-9920-4531-ae58-02848694cfe1&response_type=code&code=csas-auth&access_type=offline`}
                >
                    login
                </a>
            </div>
        );
    }

    render () {
        const { showLogin, token } = this.state;

        return (
            <div id="landing-menu">
                <button
                    id="create-button"
                    type="button"
                    onClick={() => this.onCreate()}
                    className="button is-primary"
                >
                    create
                </button>
                <button
                    type="button"
                    onClick={() => this.onSelect()}
                    className="button is-primary"
                >
                    select
                </button>
                {token && (
                    <button
                        type="button"
                        onClick={() => this.onSignOut()}
                        className="button is-primary"
                    >
                        sign out
                    </button>
                )}
                {showLogin && this.renderLogin()}
            </div>
        );
    }

}

App.propTypes = {
    t: PropTypes.func
};

App.defaultProps = {
    t: w => w
};

export default App;
