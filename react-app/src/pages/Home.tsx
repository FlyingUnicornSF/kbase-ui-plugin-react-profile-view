import React from 'react';
import { Tabs } from 'antd';
import Profile from '../components/Profile';
import Narratives from '../components/Narratives/Narratives';
import TestContainer from '../components/Test/TestContainer';
import SearchUsersContainer from '../components/SearchUsers/SearchUsersContainer';
import { fetchOrgsOfProfileAPI, fetchProfileAPI, fetchNarrativesAPI } from '../util/API';

const TabPane = Tabs.TabPane;
/**
 * Class component that keeps states for all the variables that viewer/child components needs.
 * This can converted into Redux if needed.
 * Parent component App.tsx
 */

// add Narrative_detail if needed. Currently, data in the object is not used - Akiyo.
export interface Narrative_detail {
    creator: string;
}

export interface NarrativeData {
    wsID: string;
    permission: string;
    name: string;
    last_saved: number;
    users: object;
    narrative_detail: Narrative_detail;
}

// org data that
export interface OrgProp {
    name: string;
    url: string;
}

// fetchOrgsOfProfile returns a full group info,
// but only name and id is needed to make OrgProp
export interface Org {
    name: string;
    id: string;
}

export interface Affiliation {
    title: string;
    organization: string;
    started: string;
    ended: string;
}
export interface ProfileData {
    organization: string;
    department: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    affiliations: Array<Affiliation>;
    researchStatement: string;
    jobTitle: string;
    jobTitleOther: string;
    researchInterests: Array<string>;
    fundingSource: string;
    gravatarDefault: string;
    avatarOption: string;
}

export interface UserName {
    name: string;
    userID: string;
}
interface HomeState {
    tabTitle: Array<string>;
    userName: UserName;
    userProfile: ProfileData;
    userProfileLoaded: Boolean;
    narratives: Array<NarrativeData>;
    narrativesLoaded: Boolean;
    sharedNarratives: Array<NarrativeData>;
    sharedNarrativesLoaded: Boolean;
    organizations: Array<OrgProp>;
    organizationsLoaded: Boolean;
    gravatarHash: string;
}

export interface HomeProps {
    token: string;
    authUsername: string;
    username: string | null;
    baseURL: string;
    setTitle: (title: string) => void;
    loadNarratives: (filter: string, token: string, baseURL:String) => void;
    loadNarratives_original: () => Array<NarrativeData>;
}

class Home extends React.Component<HomeProps, HomeState> {
    constructor(props: HomeProps) {
        super(props);
        this.state = {
            tabTitle: ['Profile', 'Narratives', 'Shared narratives', 'Search users'],
            userName: {
                name: '',
                userID: ''
            },
            userProfile: {
                organization: '',
                department: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
                affiliations: [],
                researchStatement: '',
                jobTitle: '',
                jobTitleOther: '',
                researchInterests: [],
                fundingSource: '',
                gravatarDefault: '',
                avatarOption: ''
            },
            userProfileLoaded: false,
            narratives: [],
            narrativesLoaded: false,
            sharedNarratives: [],
            sharedNarrativesLoaded: false,
            organizations: [],
            organizationsLoaded: false,
            gravatarHash: ''
        };
    }

    componentDidMount() {
        console.log('home page props', this.props, this.props.loadNarratives)
        let username;
        if (this.props.username) {
            username = this.props.username;
            this.props.setTitle('User Profile for ' + username);
        } else {
            username = this.props.authUsername;
            this.props.setTitle('Your User Profile');
        }
        /**
         * fetch user profile
         *  @param {string} id  profile ID
         */
        fetchProfileAPI(username, this.props.token, this.props.baseURL).then((response) => {
            if (typeof response !== 'undefined') {
                if (this.props.username) {
                    this.props.setTitle('User Profile for ' + response.user.realname);
                }
                this.setState({
                    userName: {
                        name: response.user.realname,
                        userID: response.user.username
                    },
                    gravatarHash: response.profile.synced.gravatarHash,
                    userProfile: response.profile.userdata,
                    userProfileLoaded: true
                });
            } else {
                // something went wrong during fetching.
                this.setState({
                    userName: {
                        name: 'Something went wrong. Please check console for error messages..',
                        userID: ''
                    }
                });
            }
        });

        /**
         * fetch orgs that user blongs to the profile
         *  @param {string} id  profile ID
         */
        fetchOrgsOfProfileAPI(username, this.props.token, this.props.baseURL).then((response: Array<Org>) => {
            let orgArr: Array<OrgProp> = [];
            if (typeof response !== 'undefined') {
                response.forEach((org) => {
                    orgArr.push({ name: org.name, url: this.props.baseURL + '/#org/' + org.id });
                });
                this.setState({
                    organizations: orgArr,
                    organizationsLoaded: true
                });
            } else {
                // something went wrong during fetching.
                this.setState({
                    organizations: [
                        { name: 'Something went wrong. Please check console for error messages.', url: '' }
                    ],
                    organizationsLoaded: true
                });
            }
        });

        /**
         * Returns narratives that shows in Narrative table.
         *
         *
         * Below logic determines which set of narratives needs to be fetched.
         * if the viewing profile userid is not the logged in user,
         * then fetch all of shared and public narrative and filter with the viewing profile userid.
         */
        let profileID = this.props.username; // profile to be viewed 
        //this.props.loadNarratives()
        if (typeof this.props.username === 'undefined'|| typeof this.props.authUsername === 'undefined') {
            // if there is no logged in user in run time config (redux app state)
            // returns an empty narrative list
            this.setState({
                narratives: [
                    {
                        wsID: '',
                        permission: '',
                        name: 'Something went wrong. Please check console for error messages.',
                        last_saved: 1,
                        users: {},
                        narrative_detail: { creator: '' }
                    }
                ],
                narrativesLoaded: true
            });
            return;
        } else {            
            // when logged in user is viewing his/her profile
            // fetch both "mine" and "shared" profile
            if (this.props.username === this.props.authUsername) {
                fetchNarrativesAPI('mine', this.props.token, this.props.baseURL).then(
                    (response: Array<NarrativeData>) => {
                        if (typeof response !== 'undefined') {
                            console.log('response fetchNarrativesAPI', response)
                            this.setState({
                                narratives: response,
                                narrativesLoaded: true
                            });
                        } else {
                            // fetch failed
                            this.setState({
                                narratives: [
                                    {
                                        wsID: '',
                                        permission: '',
                                        name: 'Something went wrong. Please check console for error messages.',
                                        last_saved: 0,
                                        users: {},
                                        narrative_detail: { creator: '' }
                                    }
                                ],
                                narrativesLoaded: true
                            });
                        }
                    }
                );
                fetchNarrativesAPI('shared', this.props.token, this.props.baseURL).then(
                    (response: Array<NarrativeData>) => {
                        if (typeof response !== 'undefined') {
                            this.setState({
                                sharedNarratives: response,
                                sharedNarrativesLoaded: true
                            });
                        } else {
                            // something went wrong during fetching.
                            this.setState({
                                sharedNarratives: [
                                    {
                                        wsID: '',
                                        permission: '',
                                        name: 'Something went wrong. Please check console for error messages.',
                                        last_saved: 0,
                                        users: {},
                                        narrative_detail: { creator: '' }
                                    }
                                ],
                                sharedNarrativesLoaded: true
                            });
                        }
                    }
                );
            } else {
                // when logged in user is not viewing other user's profile
                // fetch both "public" and "shared" profile and fileter response with profileID
                let publicNarratives = fetchNarrativesAPI('public', this.props.token, this.props.baseURL).then(
                    (response: Array<NarrativeData>) => {
                        if (typeof response === 'undefined') {
                            // fetch failed.
                            this.setState({
                                narratives: [
                                    {
                                        wsID: '',
                                        permission: '',
                                        name: 'Something went wrong. Please check console for error messages.',
                                        last_saved: 0,
                                        users: {},
                                        narrative_detail: { creator: '' }
                                    }
                                ],
                                narrativesLoaded: true
                            });
                            return;
                        }
                        return response;
                    }
                );
                let sharedNarratives = fetchNarrativesAPI('shared', this.props.token, this.props.baseURL).then(
                    (response: Array<NarrativeData>) => {
                        return response;
                    }
                );
                Promise.all([publicNarratives, sharedNarratives]).then((values) => {
                    let sharedNarrativeList = [];
                    if (typeof values[1] !== 'undefined') {
                        for (let i = 0; i < values[1].length; i++) {
                            let narrative = values[1][i];
                            if (narrative.narrative_detail.creator !== profileID) {
                                for (let user in narrative.users) {
                                    if (user === profileID) {
                                        sharedNarrativeList.push(narrative);
                                    }
                                }
                            }
                        }
                    }

                    let narrativeList = [];
                    if (typeof values[0] !== 'undefined') {
                        let allNarratives = values[0].concat(values[1]);
                        for (let i = 0; i < allNarratives.length; i += 1) {
                            if (allNarratives[i]['narrative_detail']['creator'] === profileID) {
                                narrativeList.push(allNarratives[i]);
                            }
                        }
                    }
                    this.setState({
                        narratives: narrativeList,
                        narrativesLoaded: true,
                        sharedNarratives: sharedNarrativeList,
                        sharedNarrativesLoaded: true
                    });
                });
            }
        }
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        // This privents from infinate component loading loop.
        if (this.state === prevState) {
            return;
        }
    }
    //TODO:AKIYO  EXPLAIN!!! 
    searchOnATab = <div className="search-on-a-tab">Search other users <SearchUsersContainer /></div>
    
    render() {
        return (
            <div>
            <Tabs type="line" defaultActiveKey="1">
                <TabPane tab="Profile" key="1">
                    <Profile
                        userName={this.state.userName}
                        userProfile={this.state.userProfile}
                        orgs={this.state.organizations}
                        gravatarHash={this.state.gravatarHash}
                        profileloaded={this.state.userProfileLoaded}
                        orgsloaded={this.state.organizationsLoaded}
                        token={this.props.token}
                    />
                </TabPane>
                <TabPane tab="Narratives" key="3">
                    <Narratives
                        narratives={this.state.narratives}
                        narrativesloaded={this.state.narrativesLoaded}
                    />
                </TabPane>
                {/* <TabPane tab="Search other users" key="6">
                    <SearchUsersContainer />
                </TabPane> */}
                <TabPane tab="Testing" key="6">
                    <TestContainer />
                </TabPane>
                {/* TODO:AKIYO  EXPLAIN!!!  */}
                <TabPane disabled tab={this.searchOnATab} key="8"></TabPane>
            </Tabs>
            </div>
        );
    }
}

export default Home;
