/**
 * 
 * NOT IN USE
 * 
 */

import React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';

import { UserName, ProfileData, StoreState, ProfileView } from '../../redux/interfaces';
import {  updateProfile } from '../../redux/actions';
import whichcomponent from './WhichComponent';

import { profileFetchStatuses } from '../../redux/fetchStatuses';

interface PropsWithProfileData {
    userName: UserName;
    editEnable: Boolean;
    profileData: ProfileData;
    gravatarHash: string;
    profileFetchStatus: string;
};
interface PropsWithoutProfileData {
    profileFetchStatus: string;
};

type Props = PropsWithoutProfileData | PropsWithProfileData;

interface DispatchProps {
    updateProfile: (profileData: ProfileData, userName:UserName) => void;
};


interface OwnProps {};
function mapStateToProps(state: StoreState): Props {
    // console.log('profile state container', state)
    // token can be null
    let userAuthToken;
    if( state.auth.userAuthorization !== null ) {
        userAuthToken = state.auth.userAuthorization.token
    } else {
        userAuthToken = '';
    }
    switch(state.profileView.profileFetchStatus) {
        case profileFetchStatuses.NONE:
        case profileFetchStatuses.FETCHING:
            return {
                    profileFetchStatus: state.profileView.profileFetchStatus
                }
                break;

        case profileFetchStatuses.ERROR:
            return {
                    profileFetchStatus: state.profileView.profileFetchStatus
                }
                break;

        case profileFetchStatuses.SUCCESS:
            // typescript isn't good at switch case yet... 
            let profileData = state.profileView as ProfileView;
            return {
                userName: profileData.userName,
                editEnable: false,
                profileData: profileData.profileData,
                gravatarHash: profileData.gravatarHash,
                profileFetchStatus: profileData.profileFetchStatus
            }
            break;

        default:
            // if you don't return Props type, it will complain. 
            // but if you try to return state.profileView.profileFetchStatus
            // its type is "never" 
            // hacky way to fix that. 
            return {
                profileFetchStatus: profileFetchStatuses.NONE
            }
            break;    
    }

};


function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
    return {
        updateProfile: (profileData: ProfileData, userName:UserName) => {
            return dispatch(updateProfile(profileData, userName) as any);
        }
    };
};

export default connect<Props, DispatchProps, OwnProps, StoreState>(
    mapStateToProps, 
    mapDispatchToProps
)(whichcomponent);
