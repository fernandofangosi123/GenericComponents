public with sharing class GenericEnhancedRelatedListController {
    @AuraEnabled
    public static String getTableData(String query, String sobjectRecordFields, String fieldMappings){
        // Format Field Mappings
        List<String> lstMappings = fieldMappings.split(',');

        // Deserialize Fields
        WrapperFields recordDes = (WrapperFields) JSON.deserialize(sobjectRecordFields, WrapperFields.class);

        // List of Field Mapping values
        List<String> lstMapValues = new List<String>();

        // Iterate over deserialized fields and replace mappings on query
        for(String mapping :lstMappings){
            // Split field name from Object Name
            String fieldName = mapping.split('\\.')[1];

            // Get field Name Value and add to list to be formatted later on query
            String fieldValue = '\'' + recordDes.fields.get(fieldName).value + '\'';

            // Add to list
            lstMapValues.add(fieldValue);
        }

        // Create query
        String queryFmt = String.format(query, lstMapValues);

        // Execute Query
        List<SObject> lstSObject = new DML().doQuery(queryFmt);

        return JSON.serialize(lstSObject);
    }

    public class WrapperFields{
        public Map<String,FieldValues> fields;
    }

    public class FieldValues{
        public String displayValue;
        public String value;
    }
}