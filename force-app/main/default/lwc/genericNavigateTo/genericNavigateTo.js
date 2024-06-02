import { LightningElement, api, wire} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class GenericNavigateTo extends NavigationMixin(LightningElement) {
    // PUBLIC VARS
    @api title;
    @api icon;
    @api relatedRecord;
    @api customURL;
    @api recordId;

    // PRIVATE VARS
    objectName;
    redirectValue;
    forceDisableBtn = false;

    // GETTERS
    get getDisableGoBtn(){
        return ((!this.relatedRecord && !this.customURL) || (this.relatedRecord && this.customURL) || (this.relatedRecord && this.forceDisableBtn));
    }

    // WIRES
    @wire(getRecord, { recordId: '$recordId', fields: '$relatedRecord' })
    getRelatedRecordInfo({data,error}){
        try{
            if(data && data.fields){
                this.redirectValue = data.fields[this.relatedRecord.split('.')[1]].value;
                this.objectName = data.fields[this.relatedRecord.split('.')[0]];

                this.forceDisableBtn = (this.redirectValue && RegExp(/^[a-zA-Z0-9]+$/).test(this.redirectValue) && this.redirectValue.length >= 15 && this.redirectValue.length <= 18) ? false : true;
            }else{
                this.forceDisableBtn = true;
            }
        }catch(e){
            this.forceDisableBtn = true;
        }
    }

    // PRIVATE METHODS
    handleNavigateTo(){
        let navigationType = this.relatedRecord ? 'Related Record' : this.customURL ? 'Custom URL' : null;

        if(navigationType && navigationType == 'Related Record'){
            this.navigateTo('standard__recordPage', {
                recordId: this.redirectValue,
                objectApiName: this.objectName,
                actionName: 'view'
            })
        }else{
            this.navigateTo('standard__webPage', {
                url: this.customURL
            });
        }
    }

    navigateTo(type, attributes){
        this[NavigationMixin.Navigate]({
            type: type,
            attributes: attributes
        });
    }

}