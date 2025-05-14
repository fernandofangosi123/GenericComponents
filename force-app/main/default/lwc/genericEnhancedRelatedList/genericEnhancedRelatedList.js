import { LightningElement, api, wire } from 'lwc';
import { IsConsoleNavigation, EnclosingTabId, openSubtab, getTabInfo } from 'lightning/platformWorkspaceApi';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord } from 'lightning/uiRecordApi';

import getTableData from '@salesforce/apex/GenericEnhancedRelatedListController.getTableData';

export default class GenericEnhancedRelatedList extends NavigationMixin(LightningElement) {
    // PUBLIC VARIABLES
    @api recordId;
    @api iconName;
    @api cardTitle;
    @api queryData;
    @api fieldMappings;
    @api manualData;
    @api isManual;
    @api tableColumns;
    @api linesToShow;
    @api flatPreviewItems;

    // PRIVATE VARIABLES
    tabInfo;
    parentTabInfo;
    _searchTerm;
    isSorted = false;
    sortedBy;
    sortedDirection;
    filteredData = [];
    tableData = [];
    sobjectRecordFields;

    // GETTERS
    get getTableColumns(){
        return this.validateColumns();
    }

    get getShowFilterResults(){
        return this.linesToShow == null ? true : false;
    }

    get getShowViewAll(){
        return this.flatPreviewItems;
    }

    get getShowSearch(){
        return !this.getShowViewAll;
    }

    get getFieldMappings(){
        return this.fieldMappings.split(',');
    }
    
    // WIRE METHODS
    @wire(IsConsoleNavigation) IsConsoleNavigation;
    @wire(EnclosingTabId) tabId;

    @wire(getRecord, {recordId : "$recordId", fields: "$getFieldMappings"})
    wiredObject({ error, data }){
        if(error){
            console.log('error--> '+JSON.stringify(error));
        } else if(data && data.fields){
            this.sobjectRecordFields = data;

            if(!this.isManual && this.sobjectRecordFields){
                console.log(data);
                console.log(data.fields);

                this.getTableDataFn();
            }
        }
    };

    // INIT
    connectedCallback(){
        // Get Tab Info in case using console navigation
        if(this.IsConsoleNavigation){
            getTabInfo(this.tabId).then((tabInfo) => {
                this.tabInfo = tabInfo;
                if(tabInfo.parentTabId && tabInfo.parentTabId != null){
                    getTabInfo(tabInfo.parentTabId).then((parentTabInfo) => {
                        this.parentTabInfo = parentTabInfo;
                    });
                }
            });
        }
    }

    // PRIVATE METHODS
    handleSearch(event){
        let searchTerm = event.target.value;
        let isChangedNotNull = searchTerm && searchTerm != this._searchTerm ? true : false;
        this.filterData(searchTerm, isChangedNotNull);

        // Set History Variable
        this._searchTerm = searchTerm;
    }

    filterData(searchTerm, isChangeNotNull){
        let data = this.isManual ? JSON.parse(JSON.stringify(this.manualData)) : this.validateData(this.tableData);

        if (searchTerm){
            const regex = new RegExp(searchTerm, 'i');
            this.filteredData = data.filter((record) => {
                return Object.values(record).some((value) => value && regex.test(value.toString()));
            });
        } else {
            this.filteredData = data;
        }

        // Set sort Flag
        this.isSorted = isChangeNotNull;
    }

    handleSortData(event){
        let fieldName = event.detail.fieldName;
        let sortDirection = event.detail.sortDirection;

        // Assign the latest attribute with the sorted column fieldName and sorted direction
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;

        this.sortData(fieldName, sortDirection);
    }

    sortData(field, direction){
        const sortedData = [...this.filteredData];

        let keyValue = (a) => {
            return a[field];
        };

        let isReverse = direction === 'asc' ? 1 : -1;

        sortedData.sort((x,y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';

            return isReverse * ((x > y) - (y > x));
        });

        this.filteredData = sortedData;
    }

    validateColumns(){
        // Deserialize Columns
        let columns = this.tableColumns ? JSON.parse(this.tableColumns) : null;

        // Iterate over each one and adjust link url types
        if(columns){
            columns.forEach((column) => {
                if(this.flatPreviewItems && column.wrapText){
                    column.wrapText = false;
                }
            });
        }

        return columns;
    }

    validateData(data){
        let formatData = [];

        // Iterate over each one and adjust link for url Types
        if(data){
            formatData = data.map((item, index, array) => {
                return { ...item, 'URL':window.location.origin + '/' + item['Id'] };
            });
        }

        return formatData;
    }

    encodeURIBtoa(value){
        return btoa(encodeURIComponent(value));
    }

    handleBtnViewAll(){
        // Call open SubTab/NavigationMixin function
        this.openSubTabFn();
    }

    openSubTabFn(){
        // Base64 enconde variables
        let recordId = this.recordId ? this.encodeURIBtoa(this.recordId) : this.encodeURIBtoa(null);
        let iconName = this.iconName ? this.encodeURIBtoa(this.iconName) : this.encodeURIBtoa(null);
        let cardTitle = this.cardTitle ? this.encodeURIBtoa(this.cardTitle) : this.encodeURIBtoa(null);
        let tableColumns = this.tableColumns ? this.encodeURIBtoa(this.tableColumns) : this.encodeURIBtoa(null);
        let queryData = this.queryData ? this.encodeURIBtoa(this.queryData) : this.encodeURIBtoa(null);
        let manualData = this.manualData ? this.encodeURIBtoa(this.manualData) : this.encodeURIBtoa(null);
        let isManual = this.isManual ? this.encodeURIBtoa(this.isManual) : this.encodeURIBtoa(null);

        // Component Definition to Navigate through Workspace API
        var compDefinition = {
            componentDef: 'c:genericEnhancedRelatedListFullView',
            attributes: {
                recordId: recordId,
                iconName: iconName,
                cardTitle: cardTitle,
                tableColumns: tableColumns,
                queryData: queryData,
                manualData: manualData,
                isManual: isManual
            }
        };

        // Base64 encode the compDefinition JS object
        let encodedCompDef = btoa(JSON.stringify(compDefinition));

        if(this.IsConsoleNavigation){

            // Check if it is not alredy in a subTab
            if(!this.tabInfo.isSubtab){
                openSubtab(this.tabId, { url: '/one/one.app#' + encodedCompDef, focus: true, icon: this.iconName, label: this.cardTitle })
                    .then((result) => {
                        // console.log(result);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                openSubtab(this.parentTabInfo.tabId, { url: '/one/one.app#' + encodedCompDef, focus: true, icon: this.iconName, label: this.cardTitle })
                    .then((result) => {
                        // console.log(result);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        } else {
            // Navigate to Full View Component
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/one/one.app#' + encodedCompDef
                }
            });
        }
    }

    getTableDataFn(){
        getTableData({ query: this.queryData, sobjectRecordFields: JSON.stringify(this.sobjectRecordFields), fieldMappings: this.fieldMappings })
            .then((result) => {
                // Formt Data Table Data
                this.formatTableData(JSON.parse(result));
            })
            .catch((error) => {
                console.log(error);
            });
    }

    formatTableData(result){
        let queryFields = this.queryData.substring(7, this.queryData.lastIndexOf('FROM'));
        let splittedFields = queryFields.split(',');
        let resArr;

        // Iterate ver results and create a Array to be used later on the Generic Datatable
        resArr = result.map((item) => {
            let tempArr;

            splittedFields.forEach(fieldItem => {
                let trimmedField = fieldItem.trim();
                let relCount = trimmedField.split('.').length;

                // If the entered field is from the object itself
                if(relCount == 1){
                    try {
                        tempArr = { ...tempArr, [trimmedField]: item[trimmedField] };
                    } catch {
                        tempArr = tempArr;
                    }
                }
                // If the entered field has one level of relationship
                else if(relCount == 2){
                    let field = trimmedField.split('.')[0];
                    let fieldRel1 = trimmedField.split('.')[1];

                    try {
                        tempArr = { ...tempArr, [trimmedField]: item[field][fieldRel1] };
                    } catch {
                        tempArr = tempArr;
                    }
                }
                // If the entered field has two level of relationship
                else if(relCount == 2){
                    let field = trimmedField.split('.')[0];
                    let fieldRel1 = trimmedField.split('.')[1];

                    try {
                        tempArr = { ...tempArr, [trimmedField]: item[field][fieldRel1] };
                    } catch {
                        tempArr = tempArr;
                    }
                }
                // If the entered field has Three level of relationship
                else if(relCount == 3){
                    let field = trimmedField.split('.')[0];
                    let fieldRel1 = trimmedField.split('.')[1];
                    let fieldRel2 = trimmedField.split('.')[2];

                    try {
                        tempArr = { ...tempArr, [trimmedField]: item[field][fieldRel1][fieldRel2] };
                    } catch {
                        tempArr = tempArr;
                    }
                }
                // If the entered field has Four level of relationship
                else if(relCount == 4){
                    let field = trimmedField.split('.')[0];
                    let fieldRel1 = trimmedField.split('.')[1];
                    let fieldRel2 = trimmedField.split('.')[2];
                    let fieldRel3 = trimmedField.split('.')[3];

                    try {
                        tempArr = { ...tempArr, [trimmedField]: item[field][fieldRel1][fieldRel2][fieldRel3] };
                    } catch {
                        tempArr = tempArr;
                    }
                }
            });
            
            return tempArr;
        });


        // Filter records based on component view
        if(this.linesToShow){
            this.tableData = resArr.slice(0, this.linesToShow);
        } else {
            this.tableData = resArr;
        }

        // Set value on Filtered Data
        this.filteredData = this.validateData(this.tableData);
    }    

}