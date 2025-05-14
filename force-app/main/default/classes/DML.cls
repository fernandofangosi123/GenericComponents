public with sharing class DML {
    public List<Database.SaveResult> doInsert(List<SObject> objList, Boolean allOrNone){
        return Database.insert(objList, allOrNone);
    }
    public List<Database.SaveResult> doUpdate(List<SObject> objList, Boolean allOrNone){
        return Database.update(objList, allOrNone);
    }
    public List<Database.UpsertResult> doUpsert(List<SObject> objList, Schema.SObjectField externalIDField, Boolean allOrNone){
        return Database.upsert(objList, externalIDField, allOrNone);
    }
    public List<Database.DeleteResult> doDelete(List<SObject> objList, Boolean allOrNone){
        return Database.delete(objList, allOrNone);
    }
    public List<SObject> doQuery(String query){
        return Database.query(query);
    }
}