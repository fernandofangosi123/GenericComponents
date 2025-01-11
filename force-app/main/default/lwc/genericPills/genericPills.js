import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from "lightning/uiRecordApi";
import { getPicklistValuesByRecordType } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GenericPills extends LightningElement {
    // PUBLIC VARS
    @api fieldName;
    @api objName;
    @api iconName;
    @api cardTitle;
    @api recordId;

    // PRIVATE VARS
    _unselectedPills = [];
    _selectedPills = [];
    unselectedPills = [];
    selectedPills = [];
    recordTypeId;
    showFooter = false;
    loadOnce = false;
    
    // GETTERS
    get getFieldName(){
        return this.objName + '.' + this.fieldName;
    }

    // WIRES
    @wire(getRecord, { recordId: '$recordId', fields: '$getFieldName' })
    getRecordInfo(response){
        let data = response && response.data;

        if(data){
            this.recordTypeId = data['recordTypeId'];

            if(data['fields'][this.fieldName]){
                let itemsValue = data['fields'][this.fieldName]?.value?.split(';');
                let itemsDisplayValue = data['fields'][this.fieldName]?.displayValue?.split(';');

                for(let i = 0; i < itemsValue?.length; i++){
                    this.selectedPills.push({
                        label: itemsDisplayValue[i],
                        value: itemsValue[i]
                    });
                }
            }
        }
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: '$objName', recordTypeId: "$recordTypeId" })
    getFieldValues({data,error}){
        if(data){
            let allValues = data.picklistFieldValues[this.fieldName].values;

            this.unselectedPills = allValues.filter(item => {
                return this.selectedPills.findIndex(selectedItem => {
                    return selectedItem.value === item.value;
                }) === -1;
            });
        }
    }

    // PRIVATE METHODS
    saveInitialState(){
        if(!this.loadOnce && (this.selectedPills.length > 0 || this.unselectedPills.length > 0)){
            // Transform data in order to avoid reactive variables
            this._unselectedPills = JSON.stringify(this.unselectedPills);
            this._selectedPills = JSON.stringify(this.selectedPills);
            
            this.loadOnce = true;
        }
    }

    handlerAddItem(event){
        // Show Footer
        this.showFooter = true;

        // Save Initial State
        this.saveInitialState();

        // Find selected pill
        let pill = this.unselectedPills.find(item => {
            return item.label === event.target.dataset.name;
        });
        
        // Add unselected pill to selected pills array
        this.selectedPills.push(pill);

        // Remove selected pill from unselected pills array
        this.unselectedPills = this.unselectedPills.filter(item => {
            return item.label !== event.target.dataset.name;
        });
    }

    handlerRemItem(event){
        // Show Footer
        this.showFooter = true;

        // Save Initial State
        this.saveInitialState();

        // Find selected pill
        let pill = this.selectedPills.find(item => {
            return item.label === event.target.dataset.name;
        });
        
        // Add selected pill to unselected pills array
        this.unselectedPills.push(pill);

        // Remove selected pill from selected pills array
        this.selectedPills = this.selectedPills.filter(item => {
            return item.label !== event.target.dataset.name;
        });
    }

    handleSave(){
        // Hide Footer
        this.showFooter = false;
        
        // Get selected values
        let selFieldValues = '';
        this.selectedPills.forEach(item => {
            selFieldValues = selFieldValues + item.value + ';';
        });

        // Create Update Record Object
        let fieldName = this.fieldName;
        let fieldValue = selFieldValues;
        let fieldID = this.recordId;

        let fields = {};
        fields[fieldName] = fieldValue;
        fields['Id'] = fieldID;

        const recordInput = { 
            fields : fields
        };

        // Update Record
        updateRecord(recordInput)
        .then((result) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    variant: 'success',
                    mode: 'dismissable',
                    message: 'Updated successfully!',
                    }),
            );
        })
        .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    variant: 'Error',
                    mode: 'dismissable',
                    message: 'Error on update - '+JSON.stringify(error),
                    }),
            );
        });
    }

    handleCancel(){
        // Hide Footer
        this.showFooter = false;

        // Recover previous State
        this.selectedPills = JSON.parse(this._selectedPills);
        this.unselectedPills = JSON.parse(this._unselectedPills);
    }
}