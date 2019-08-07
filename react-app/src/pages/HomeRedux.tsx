import { connect } from 'react-redux';

import Home from './Home';

import { StoreState } from '../redux/store';
import { Action, Dispatch } from 'redux';
import { sendTitle } from '@kbase/ui-lib';
import { loadNarratives, loadNarratives_original } from '../redux/actions/index';
import { NarrativeData } from './Home';
import { string } from 'prop-types';

interface OwnProps {}

interface StateProps {
    token: string;
    authUsername: string;
    username: string | null;
    baseURL: string;
}

interface DispatchProps {
    setTitle: (title: string) => void;
    loadNarratives: (filter: string, token: string, baseURL:String) => void;
    loadNarratives_original: () => Array<NarrativeData>;
}

// TODO this should be part of the view definition
interface UserProfileViewParams {
    username?: string;
}

function mapStateToProps(state: StoreState, ownProps: OwnProps): StateProps {
    const {
        auth: { userAuthorization },
        app: {
            config: { baseUrl },
            runtime: {
                navigation: { params: rawParams }
            }
        }
    } = state;
    if (!userAuthorization) {
        throw new Error('This plugin only operates with authentication; no KBase token in store');
    }
    const params = (rawParams as unknown) as UserProfileViewParams;
    return {
        token: userAuthorization.token,
        authUsername: userAuthorization.username,
        username: params.username || null,
        baseURL: baseUrl
    };
}

function mapDispatchToProps(dispatch: Dispatch<Action>, ownProps: OwnProps): DispatchProps {
    return {
        // action creator loadNarratives is passed as props to the home page.
        loadNarratives: (filter: string, token: string, baseURL:String) => {
            return dispatch(loadNarratives(filter, token, baseURL) as any);
        },
        setTitle: (title: string) => {
            return dispatch(sendTitle(title) as any);
        },
        loadNarratives_original: () => {
            return dispatch(loadNarratives_original() as any);
        }
    };
}

// function HomeRedux(mapStateToProps:AppState) {
//     return (
//         <Home userData={mapStateToProps.auth.userAuthorization} baseURL={mapStateToProps.app.config.baseUrl}/>
//     )
// }

export default connect<StateProps, DispatchProps, OwnProps, StoreState>(
    mapStateToProps,
    mapDispatchToProps
)(Home);
