import { LightningElement, api } from 'lwc';

export default class GenericEnhancedRelatedListFullView extends LightningElement {
    // PUBLIC VARS
    @api recordId;
    @api iconName;
    @api cardTitle;
    @api queryData;
    @api fieldMappings;
    @api manualData;
    @api isManual;
    @api tableColumns;

    // PRIVATE VARS
    decodeUriRecordId;
    decodeUriIconName;
    decodeUriCardTitle;
    decodeUriQueryData;
    decodeUriFieldMappings
    decodeUriManualData;
    decodeUriIsManual;
    decodeUriTableColumns;
    flatPreviewItems = false;

    // INIT
    connectedCallback(){
        this.decodeUriRecordId = this.decodeURIAtob(this.recordId);
        this.decodeUriIconName = this.decodeURIAtob(this.iconName);
        this.decodeUriCardTitle = this.decodeURIAtob(this.cardTitle);
        this.decodeUriQueryData = this.decodeURIAtob(this.queryData);
        this.decodeUriFieldMappings = this.decodeURIAtob(this.fieldMappings);
        this.decodeUriManualData = this.decodeURIAtob(this.manualData);
        this.decodeUriIsManual = this.decodeURIAtob(this.isManual);
        this.decodeUriTableColumns = this.decodeURIAtob(this.tableColumns);
    }

    decodeURIAtob(value){
        // Decode Value
        let decodedValue = decodeURIComponent(atob(value));

        return decodedValue == 'null' ? null : decodedValue;
    }

}