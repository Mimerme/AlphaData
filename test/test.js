"use strict"
const assert = require("chai").assert;
const database = require("../compiled/alphadata.js").default;
const path = require("path");
const fs = require("fs");

let location = path.join(__dirname,"db","data");

const db = new database(location);

describe("Tables",()=>{
  it("creates tables",()=>{
    db.initTables(["Test1","Test2","Test3"])
      assert.equal(db.tableExists("Test1"),true); 
      assert.equal(db.tableExists("Test2"),true);  
      assert.equal(db.tableExists("Test3"),true);  
  })
  it("deletes tables",()=>{
    db.deleteTable("Test3")
    assert.equal(db.tableExists("Test3"),false);
  })
})
describe("Items",()=>{
  it("inserts items",()=>{
    for(let a = 1;a<=2;a++){
      for(let b = 1;b<=a*3;b++){
        db.select(`Test${a}`).insert({table:a,id:b});
      }
    }
    for(let a = 1;a<=2;a++){
      assert.equal(db.select(`Test${a}`).getSelected().length,a*3);
    }
  })
  it("deletes items",()=>{
    db.select("Test1").deleteItem();
    db.select("Test2").where((obj)=>{
      return(obj.id%2===0);
    }).deleteItem();
    assert.equal(db.select("Test1").getSelected().length,0);
    assert.equal(db.select("Test2").getSelected().length,3);
  })
  it("edits items",()=>{
    db.select("Test2").edit((obj)=>{
      obj.id = -1;
    });
    assert.equal(db.where((obj)=>obj.id === -1).getSelected().length,3);
  })
  it("gets items",()=>{
    db.initTables(["ItemGet","ItemGet2"]);
    for(let a = 0;a<10;a++){
      db.select("ItemGet").insert({id:a,num:Math.random()*a});
      db.select("ItemGet2").insert({table:"ItemGet2"})
    }
    assert.equal(db.select(()=>true).where((obj)=>{
      return(obj.id%2 === 0)
    }).getSelected().length,5);
    assert.equal(db.select("ItemGet2").getSelected().length,10);
    assert.equal(db.select((table)=>{
      return(table.indexOf("ItemGet")!=-1);
    }).getSelected().length,20);
  })
  db.write();
});
describe("Writing",()=>{
  it("writes to file",()=>{
    assert.equal(fs.existsSync(location),true);
    fs.unlinkSync(location);  
  })
})
