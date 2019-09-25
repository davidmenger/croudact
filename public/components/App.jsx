/**
 * @author David Menger
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet'
import { Map, TileLayer, Marker } from 'react-leaflet';

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
            create: false,
            lat,
            lon,
            id,
            code,
            token,
            refresh,
            places: []
        };

        this.onMapClick = this.onMapClick.bind(this);
    }

    componentDidMount () {
        const {
            code, lat, lon, id
        } = this.state;

        this._fetchPlaces();

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

    onCreate () {
        this.setState({ create: true });
    }

    onMapClick ({ latlng }) {
        const { token, create } = this.state;

        if (!create) {
            return;
        }

        if (!token) {
            this.setState({ showLogin: true, create: false });
        } else {
            this.setState({ create: false });
        }
        this._setShow(null, latlng.lat, latlng.lng);
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

    _createIcon (place) {
        return new L.Icon({
            iconUrl: `/img/${place.placeType}.png`,

            iconSize: [50, 50], // size of the icon
            iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -25] // point from which the p
        });
    }

    _fetchPlaces () {
        const isLocal = window.location.href.match(/local/);

        const url = isLocal
            ? '/api/places'
            : 'https://croudact-api.flyto.cloud/places';

        fetch(url)
            .then(r => r.json())
            .then(({ data }) => {
                this.setState({ places: data });
            });
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
        const {
            showLogin, token, places, create
        } = this.state;

        return (
            <>
                <div id="map" className={create ? 'cursor-target' : ''}>
                    <Map
                        center={[50.0775048, 14.4119297]}
                        zoom={15}
                        onClick={this.onMapClick}
                    >
                        <TileLayer
                            url="http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
                        />
                        {places.map(place => (
                            <Marker
                                id={place.id}
                                position={[place.lat, place.lon]}
                                icon={this._createIcon(place)}
                                onClick={() => this.onSelect(place.id)}
                            />
                        ))}
                    </Map>
                </div>
                <div id="landing-menu">
                    <button
                        id="create-button"
                        type="button"
                        onClick={() => this.onCreate()}
                        className="button is-primary"
                    >
                        create
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
            </>
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
