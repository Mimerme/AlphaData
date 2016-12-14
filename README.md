# A simple database for use in desktop applications



## Init database
```
const database = require("./lib/alphadata/alphadata.js").default;
const path = require("path");
let db = new database(path.join(__dirname,"data","mainfile.db"));
```
Pass the entire file path to the file you want to store your database in. Include file extension.
## Init tables
```
db.initTables(["testing","testing2","whatface","lol"]);
```

## Select tables
```
db.select("testing");
db.select((tableName)=>{
    return(tableName.indexOf("testing") === -1);
}
```
You can pass a string to select a specifc table, or pass a function to select multiple tables.
## Delete tables
```
db.deleteTable("testing2").write();
```

## Insert to database
```
db.select("testing").insert({id:Math.random(),num:Math.random()});
```
Remember to `db.write()` after performing any changes to the db, or your internal changes will be lost.

## Get from database
```
db.select("testing").where((obj)=>{
    return(obj.num > 0.5)
}).getSelected();
db.select("testing").getSelected(["id"]);
```
Alphadata queries are user defined functions that are passed to the database. The objects in every selected table are passed to the function one at a time, and if the function returns false, the object is unselected. 

If not passed anything,`getSelected()` will return every object property. If passed an array containing properties, only the properties in the array will be returned.

## Edit an object
```
db.select(()=>true).where((obj)=>{
    return(obj.name > 0.5);
}).edit((obj)=>{
    obj.num = -1
}).write()
```
The function passed to the edit method should perform the changes on the object directly

## Remove an object
```
db.select(()=>true).where((obj)=>{
    return(obj.num < 0.5); 
}).removeItem().write()
```
RemoveItem will remove all currently selected object from the database