import React from 'react';

import Orgs from './Orgs';
import Spinner from '../Spinner';
import ErrorMessage from '../ErrorMessage';

export default function WhichComponent(props:any) {
    console.log('whichcomponent', props)
    let foo = props
    switch(foo.orgsFetchStatus){
        case 'none':
            return <Spinner />;
            break;

        case 'fetching':
                return <Spinner />;
                break;

        case 'success':
            return <Orgs orgList={props.orgList} />;
            break;

        case 'error':
            return <ErrorMessage />;
            break;

        default: 
            return ( <div>hello</div>);
            break;

    }
     
}