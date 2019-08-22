import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { NarrativeData, StoreState } from '../../redux/interfaces';
import { loadNarratives} from '../../redux/actions/index';
import { Form, Button } from 'antd';


interface DispatchProps {
    onSubmitDispatch: (filter:string) => void;
}


interface StateProps {
    narrativeList: Array<NarrativeData>;
}

// props has to be combination os state and dispatch
type Props = StateProps & DispatchProps 

// this state comes from redux state 
// mapStateToProps is making that redux state into 
// this component's props
function mapStateToProps (state:StoreState):StateProps { 
    /**
     * take narrative out of the state and return as props
     */
    let narrativeList = state.narrativeDataArray 
    return { narrativeList };
};

function mapDispatchToProps(dispatch: Dispatch):DispatchProps {
    return {
        onSubmitDispatch: () =>  dispatch(loadNarratives('public', 'amarukawa') as any), // cuz I can't figure it out. 
    }
}

// View Component itself 
function TestContainer (props: Props) {
    console.log('testcontainer',props, props.narrativeList)
    // submit button is not aware of dispatch. 
    // It just calls onSumbit function. 
    function onSubmit(event:React.FormEvent<HTMLFormElement>){
        event.preventDefault()
        props.onSubmitDispatch('public')
    }

    let narrativeList = mapStateToProps;
    // MapThatList(mapStateToProps);
    return (
        // <ul>{ MapThatList(narrativeList) }</ul>
        <div>pow- <Form onSubmit={onSubmit}><Form.Item><Button htmlType="submit" >push this</Button> </Form.Item></Form>
        pow- <Form onSubmit={onSubmit}><Form.Item><Button htmlType="submit" >push that</Button> </Form.Item></Form></div>
    )
}

export default connect<StateProps, DispatchProps, {}, StoreState>(mapStateToProps, mapDispatchToProps)(TestContainer);