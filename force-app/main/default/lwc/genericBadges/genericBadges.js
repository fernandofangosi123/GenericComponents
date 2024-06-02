import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { getPicklistValuesByRecordType } from "lightning/uiObjectInfoApi";

export default class GenericBadges extends LightningElement {
    // PUBLIC VARS
    @api fieldName;
    @api iconName;
    @api recordId;

    // PRIVATE VARS
    arrBadges = [];
    objectName;
    rtId;

    // WIRES
    @wire(getRecord, { recordId: '$recordId', fields: '$fieldName' })
    getRecordInfo({data,error}){
        try{
            if(data && data.fields){
                console.log(data);

                this.objectName = data['apiName'];
                this.rtId = data['recordTypeId'];

                let badgeValues = data.fields[this.fieldName.split('.')[1]].value;

                console.log(badgeValues);
                console.log(this.objectName);
                console.log(this.rtId);

                if(badgeValues){
                    this.arrBadges = badgeValues.split(';');
                }

                // this.forceDisableBtn = (this.redirectValue && RegExp(/^[a-zA-Z0-9]+$/).test(this.redirectValue) && this.redirectValue.length >= 15 && this.redirectValue.length <= 18) ? false : true;
            }else{
                // this.forceDisableBtn = true;
            }
        }catch(e){
            // this.forceDisableBtn = true;
        }
    }

    // @wire(getPicklistValuesByRecordType, { objectApiName: '$objectName', recordTypeId: "$rtId" })
    // getFieldValues({data,error}){
    //     try{
    //         console.log('getPicklistValuesByRecordType'+data);
    //         // if(data && data.fields){
    //         //     console.log(data);

    //         //     this.badgeValues = data.fields[this.relatedRecord.split('.')[1]].value;
    //         //     this.objectName = data.fields[this.relatedRecord.split('.')[0]];
    //         //     this.rtId = data['recordTypeId'];

    //         //     // if(this.badgeValues && this.badgeValues.includes(';')){
                    
    //         //     // }

    //         //     // this.forceDisableBtn = (this.redirectValue && RegExp(/^[a-zA-Z0-9]+$/).test(this.redirectValue) && this.redirectValue.length >= 15 && this.redirectValue.length <= 18) ? false : true;
    //         // }else{
    //         //     // this.forceDisableBtn = true;
    //         // }
    //     }catch(e){
    //         console.log(e);
    //     }
    // }

    // PRIVATE METHODS
    teste(){
        console.log('testeclick');
    }
}