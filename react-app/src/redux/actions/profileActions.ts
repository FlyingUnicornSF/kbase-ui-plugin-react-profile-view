import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { sendTitle } from '@kbase/ui-lib';
import { fetchProfileAPI, updateProfileAPI } from '../../util/API';
import { StoreState, UserProfileService, ProfileView,  ProfileData} from "../interfaces";
import { fetchProfile, loadProfile, fetchErrorProfile } from './actionCreators';
import { profileFetchStatuses } from '../fetchStatuses';

/**
 * fetch user profile
 *  @param {string} id  profile ID
 */
export function getProfile(profileID:string) {
    console.log('in getProfile')
    return async function (dispatch:ThunkDispatch<StoreState, void, AnyAction>, getState:() => StoreState ) {
        // set the life cycle state to "fetching"
        dispatch(fetchProfile())
        
        const rootStore = getState();
        if(rootStore.auth.userAuthorization !== null) {
            const token = rootStore.auth.userAuthorization.token;
            const baseURL = rootStore.app.config.baseUrl;
            console.log('getProfile baseURL', baseURL)
            let payload:ProfileView;
            let response:UserProfileService  | Array<string> = await fetchProfileAPI(profileID, token, baseURL);
            console.log('getProfile', response);
            let profileEdit:boolean;
            
            if (typeof response !== 'undefined' && !Array.isArray(response)) {
                if (response.user.username !== rootStore.auth.userAuthorization.username) {
                    dispatch(sendTitle('User Profile for ' + response.user.realname));
                    profileEdit = false;
                } else {
                    profileEdit = true;
                }
                console.log('profileEdit',profileEdit)
                // shape response to profile before dispatch 
                payload = {
                    userName: {
                        userID: response.user.username,
                        name: response.user.realname
                    },
                    editEnable: profileEdit,
                    profileData: response.profile.userdata,
                    gravatarHash: response.profile.synced.gravatarHash,
                    profileFetchStatus: profileFetchStatuses.SUCCESS
                }
                dispatch(loadProfile(payload));
            } else if (Array.isArray(response)){
                //  set "profileIsFetching" to "error"
                dispatch(fetchErrorProfile());
            }
        } else {
            console.log('auth is null ', rootStore.auth.userAuthorization)
        }
    }
}


/**
 * set the spinner with fetchProfile action,
 * then call updateProfileAPI.
 * when the repose is good, update the profile with getProfile 
 * @param profileID 
 * @param userdata 
 */

export function updateProfile(profileID:string, userdata:ProfileData) {
    console.log('in updateProfile')
    return async function (dispatch:ThunkDispatch<StoreState, void, AnyAction>, getState:() => StoreState ) {
        dispatch(fetchProfile())
        const rootStore = getState();
        if(rootStore.auth.userAuthorization !== null) {
            const token = rootStore.auth.userAuthorization.token;
            let baseURL = rootStore.app.config.baseUrl;
            let response = await updateProfileAPI(token, baseURL, userdata);
            console.log("update response", response)
            if(response === 200) {
                dispatch(getProfile(profileID))
            } else {
                dispatch(fetchErrorProfile());
            }
        }

    }
}