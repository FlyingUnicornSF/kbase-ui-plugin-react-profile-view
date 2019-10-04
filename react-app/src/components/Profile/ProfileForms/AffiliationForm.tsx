import React, { CSSProperties } from 'react';
import { Form, Input, AutoComplete, Tooltip, Select, Empty, Button } from 'antd';
import { Affiliation, ProfileData, UserName } from '../../../redux/interfaces';
import { institution } from '../../../dataSources';
import { render } from 'enzyme';
import { connectAdvanced } from 'react-redux';

const { Option } = Select;


interface AffiliationValidated {
    title: string;
    organization: string;
    started: string;
    ended: string;
    validatedStatusJobTitle: "" | "error" | "success" | "warning" | "validating" | undefined;
    validatedStatusStartYear: "" | "error" | "success" | "warning" | "validating" | undefined;
    validatedStatusEndYear: "" | "error" | "success" | "warning" | "validating" | undefined;
    helpTextJobTitle: string | undefined;
    helpTextStartYear: string | undefined;
    helpTextEndYear: string | undefined;
};

interface State {
    affiliations: Array<AffiliationValidated>;
    institutionFiltered: Array<string>;
};

interface Props {
    userName: UserName;
    profileData: ProfileData;
    editEnable: boolean;
    affiliations: Array<Affiliation>;
    updateStoreState: (data: any, userName: UserName) => void;
};

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 1 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 23 },
    },
};


class AffiliationForm extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state={
            affiliations: [],
            institutionFiltered: [],
        };

        this.affiliations = this.affiliations.bind(this);
        this.validateInput = this.validateInput.bind(this);
        this.saveLocalState=this.saveLocalState.bind(this);
        this.addAffiliation=this.addAffiliation.bind(this);
        this.deleteAffiliation=this.deleteAffiliation.bind(this);
        this.affiliationJobTitleOnChange=this.affiliationJobTitleOnChange.bind(this);
        this.affiliationStartOnChange=this.affiliationStartOnChange.bind(this);
        this.affiliationEndOnChange=this.affiliationEndOnChange.bind(this);
        this.affiliationOnSave=this.affiliationOnSave.bind(this);
        this.institutionOnSearch=this.institutionOnSearch.bind(this);
        this.showEditButtons=this.showEditButtons.bind(this);
        this.tooltipVisibility=this.tooltipVisibility.bind(this);
    };

    componentDidMount(){
        console.log("in affiliation form", this.props)
        let newAffiliations:Array<AffiliationValidated> = [];
        for ( let i = 0; i < this.props.affiliations.length; i+=1 ) {
            let obj = {
                title: this.props.affiliations[i]['title'],
                organization: this.props.affiliations[i]['organization'],
                started: this.props.affiliations[i]['started'],
                ended: this.props.affiliations[i]['ended'],
                validatedStatusJobTitle: undefined,
                validatedStatusStartYear: undefined,
                validatedStatusEndYear: undefined,
                helpTextJobTitle: undefined,
                helpTextStartYear: undefined,
                helpTextEndYear: undefined,
            }
            newAffiliations.push(obj)
        }
        this.setState({ affiliations: newAffiliations });
    };
    
    // if you're going ot use prevProps, prevState
    // you need to put all these three for typescript to be happy.
    // componentDidUpdate(prevState:State, prevProps:Props, snapshot: any){

    // };
    /** 
    * Validate value against 
    *  - max and min length
    *  - if it's required field
    *  - type 
    * and set state per validation result.
    * @param inputValue 
    */
   validateInput(inputValue: string, index: number, property:string, helperTextProp: string, type: string, max: number, min?: number) {

        // it has to be set to "any" in order to use generic property name    
        let affiliationArray: any = this.state.affiliations;
        // console.log(parseInt(inputValue, 10))
        // When type is number, then check if it's a number first
        if (type === "number" && isNaN(parseInt(inputValue, 10))) {
            affiliationArray[index][property] = "error";
            affiliationArray[index][helperTextProp] = 'Expecting numbers';
            this.setState({ affiliations: affiliationArray });
            return;
        }

        // check against min and max length
        if (typeof min === 'undefined') min = 2;
        if (inputValue.length <= max && inputValue.length >= min) {
            affiliationArray[index][property] = 'success';
            affiliationArray[index][helperTextProp] = undefined;
            this.setState({ affiliations: affiliationArray });

        } else if (inputValue.length < min) {
            affiliationArray[index][property] = 'error';
            affiliationArray[index][helperTextProp] = 'input must be at least ' + min + ' characters' 
            this.setState({ affiliations: affiliationArray });
            
        } else if (inputValue.length > max) {
            // this shouldn't happen since input field max length is set
            affiliationArray[index][property] = 'error';
            affiliationArray[index][helperTextProp] = 'input must be less than ' + max+ ' characters';
            this.setState({ affiliations: affiliationArray });                
        };
    };

     /**
     * Save/update input value to state
     * @param event 
     */
    saveLocalState(value: string, index:number, property:string) {
        let affiliations = this.state.affiliations;
        affiliations[index]['title'] = value.trim();
        this.setState({ affiliations: affiliations })
    };

    addAffiliation(event: any) {
        let newAffiliation = [{
            title: '',
            organization: '',
            started: '',
            ended: '',
            validatedStatusJobTitle: undefined,
            validatedStatusStartYear: undefined,
            validatedStatusEndYear: undefined,
            helpTextJobTitle: undefined,
            helpTextStartYear: undefined,
            helpTextEndYear: undefined,

        }];
        this.setState({ affiliations: this.state.affiliations.concat(newAffiliation) });
    };

    deleteAffiliation(index: number) {
        let arr = this.state.affiliations;
        arr.splice(index, 1);
        this.setState({ affiliations: arr });
    };

    affiliationJobTitleOnChange(event:any, index:number) {
        let value = event.target.value;
        this.saveLocalState(value, index, 'title');
        this.validateInput(value, index, 'validatedStatusJobTitle', 'helpTextJobTitle', 'string', 50);
    };

    affiliationStartOnChange(event: any, index: number) {
        let value = event.target.value;
        this.saveLocalState(value, index, 'started');
        this.validateInput(value, index, 'validatedStatusStartYear', 'helpTextStartYear', 'number', 4, 4);
    };

    affiliationEndOnChange(event: any, index: number) {
        let value = event.target.value;
        if( value < this.state.affiliations[index]['started']){
            let affiliationArray= this.state.affiliations;
            affiliationArray[index]['ended'] = 'error';
            affiliationArray[index]['helpTextEndYear'] = 'must be larger than start year';
            this.setState({ affiliations: affiliationArray });
            return;
        }
        this.saveLocalState(value, index, 'ended');
        this.validateInput(value, index, 'validatedStatusEndYear', 'helpTextEndYear', 'number', 4, 4);
    };

    affiliationOnSave() {
        console.log(this.state)
        let profileData = this.props.profileData;
        for ( let i=0; i < profileData.affiliations.length; i += 1) {
            // don't update store state if any of the field is in invalid state
            if(this.state.affiliations[i]['validatedStatusJobTitle'] === 'error' || 
                this.state.affiliations[i]['validatedStatusStartYear'] === 'error' || 
                this.state.affiliations[i]['validatedStatusEndYear'] == 'error') {
                    return;
            };

            for (let [ key, value ] of Object.entries(profileData.affiliations[i])) {
                let foo:any = this.state.affiliations[i]

                console.log(foo[key], i)
            }
        }
        // if(profileData.affiliations !== this.state.affiliations){
        //     profileData.affiliations = this.state.affiliations;
        //     this.props.updateStoreState(profileData, this.props.userName);
        // }
    };

    institutionOnSearch(event: any) {
        if (event.length > 2) {
            let arr = [];
            arr = institution.filter(item =>
                item.toLowerCase().includes(event.toLowerCase())
            )
            if (arr.length <= 30) {
                this.setState({ institutionFiltered: arr })
            };
        };
    };

    // show/hide edit/save buttons
    showEditButtons() {
        if(this.props.editEnable === true) {
            return 'unset';
        } else {
            return 'none';
        };
    };

        /**
     * if profile is auth user's profile, then edit is enabled, then make tool tips visible
     */
    tooltipVisibility(): CSSProperties {
        if (this.props.editEnable === false) {
            return { visibility: 'hidden' };
        } else {
            return { visibility: 'visible' };
        };
        // return { visibility: 'hidden' };
    };

    // populate affiliations and handles case that affiliations list prop is empty
    affiliations() {
        console.log("in affiliation function", this.state)
        if (Array.isArray(this.state.affiliations)) {
            return (
                <div id='affiliations'>
                    {this.state.affiliations.map((position, index) => (
                        <form key={index} className='affiliations' name={index.toString(10)} autoComplete="on">
                            <Form.Item {...formItemLayout} 
                                className="profile-input-form" 
                                required
                                label=' ' 
                                hasFeedback 
                                help={this.state.affiliations[index]['helpTextJobTitle']} 
                                validateStatus={this.state.affiliations[index]['validatedStatusJobTitle']}
                            ><Input
                                readOnly={!this.props.editEnable}
                                style={{ width: '20%', display: 'inline' }}
                                autoComplete='organization-title'
                                type='text'
                                className='clear-disabled'
                                maxLength={50}
                                defaultValue={position.title}
                                placeholder={'Job title'}
                                onChange={(event) => { this.affiliationJobTitleOnChange(event, index) }}
                        
                            /></Form.Item>
                            <AutoComplete
                                className='clear-disabled'
                                style={{ width: '50%' }}
                                allowClear
                                disabled={!this.props.editEnable}
                                placeholder='Organization'
                                onSelect={(item) => { this.saveLocalState(item as string, index, 'organization') }}
                                onSearch={this.institutionOnSearch}
                                filterOption={(inputValue, option) => {

                                    if (typeof option.props.children === 'string') {
                                        let item = option.props.children;
                                        return item.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                    } else {
                                        return false
                                    }

                                }}
                                defaultValue={position.organization}
                            >
                                {this.state.institutionFiltered.map((item, index) => {
                                    return (
                                        <Option className='clear-disabled' key={index} value={item} >
                                            {item}
                                        </Option>
                                    );
                                })}
                            </AutoComplete>
                            <Tooltip overlayStyle={this.tooltipVisibility()} title='Enter 4 digits start year and end year'>
                            <Form.Item {...formItemLayout} 
                                className="profile-input-form" 
                                required
                                label=' ' 
                                hasFeedback 
                                help={this.state.affiliations[index]['helpTextStartYear']} 
                                validateStatus={this.state.affiliations[index]['validatedStatusStartYear']}
                            ><Input
                                readOnly={!this.props.editEnable}
                                style={{ width: '100px', display: 'inline' }}
                                onChange={(item) => { this.affiliationStartOnChange(item, index) }}
                                type='number' 
                                maxLength={4}
                                className='clear-disabled'
                                placeholder='Start'
                                defaultValue={position.started}
                            /></Form.Item>
                            <Form.Item {...formItemLayout} 
                                className="profile-input-form" 
                                required
                                label=' ' 
                                hasFeedback 
                                help={this.state.affiliations[index]['helpTextEndYear']} 
                                validateStatus={this.state.affiliations[index]['validatedStatusEndYear']}
                            ><Input
                                readOnly={!this.props.editEnable}
                                style={{ width: '100px', display: 'inline' }}
                                onChange={(item) => { this.affiliationEndOnChange(item, index) }}
                                type='number' 
                                maxLength={4}
                                className='clear-disabled'
                                placeholder='End'
                                defaultValue={position.ended}
                            /></Form.Item>
                            </Tooltip>
                            <Button  style={{ margin: '10px', display: this.showEditButtons() }} type="primary" onClick={() => this.deleteAffiliation(index)}>
                                delete
                            </Button>
                        </form>
                    ))}
                    <Button style={{ margin: '10px', display: this.showEditButtons() }} key="add" type="primary" onClick={this.addAffiliation.bind(this)}>
                        add
                    </Button>
                    <Button style={{ margin: '10px', display: this.showEditButtons() }} key="submit" type="primary" onClick={this.affiliationOnSave.bind(this)}>
                        save
                    </Button>
                </div>
            )
        } else {
                return (
                    <div><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
                );
        };
    };
    render(){
        return this.affiliations();
    };

} ;


export default AffiliationForm