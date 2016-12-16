"use strict";
/// <reference path="../typings/index.d.ts" />
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var alphaDataBase = (function () {
    function alphaDataBase(location) {
        this.internal_location = location;
        this.internal_schemes = [];
        this.loadDB();
    }
    alphaDataBase.prototype.loadDB = function () {
        var this_reference = this;
        var dir = path.dirname(this_reference.internal_location);
        mkdirp.sync(dir);
        if (fs.existsSync(this_reference.internal_location))
            this.internal_obj = JSON.parse(fs.readFileSync(this_reference.internal_location, "utf-8"));
        else
            this.internal_obj = {};
        if (fs.existsSync(path.join(dir, "schemes.sch"))) {
            this.internal_schemes = JSON.parse(fs.readFileSync(path.join(dir, "schemes.sch"), "utf-8"));
        }
        else
            this.internal_schemes = {};
    };
    alphaDataBase.prototype.makeTable = function (name) {
        if (!this.tableExists(name))
            this.internal_obj[name] = [];
        else {
            throw Error("Table already exists.");
        }
        return this;
    };
    alphaDataBase.prototype.deleteTable = function (name) {
        if (!this.tableExists(name))
            throw Error("Table does not exist");
        delete this.internal_obj[name];
        return this;
    };
    alphaDataBase.prototype.initTables = function (tables) {
        var _this = this;
        var this_ = this;
        tables.forEach(function (tableData) {
            var table;
            if (typeof tableData === "object") {
                table = tableData.name;
                if (tableData.scheme !== undefined) {
                    this_.internal_schemes[tableData.name] = tableData.scheme;
                }
            }
            else if (typeof tableData === "string") {
                table = tableData;
            }
            else {
                throw new Error("Unrecognized table init format.");
            }
            if (!_this.tableExists(table)) {
                _this.makeTable(table);
            }
        });
        return this;
    };
    alphaDataBase.prototype.tableExists = function (name) {
        var this_reference = this;
        return (Object.keys(this_reference.internal_obj).indexOf(name) > -1);
    };
    alphaDataBase.prototype.select = function (input) {
        var this_reference = this;
        if (typeof input === "string") {
            var temp_obj = {};
            temp_obj[input] = _.range(0, this_reference.internal_obj[input].length);
            this.internal_selected_items = temp_obj;
        }
        else if (typeof input === "function") {
            var keys = Object.keys(this_reference.internal_obj);
            var passing_tables = keys.filter(input);
            var temp_obj_1 = {};
            passing_tables.forEach(function (table_name) {
                temp_obj_1[table_name] = _.range(0, this_reference.internal_obj[table_name].length);
                this_reference.internal_selected_items = temp_obj_1;
            });
        }
        return this;
    };
    alphaDataBase.prototype.where = function (input) {
        var this_reference = this;
        var keys = Object.keys(this_reference.internal_selected_items);
        keys.forEach(function (key) {
            var passing_items = [];
            this_reference.internal_selected_items[key].forEach(function (index) {
                var condition = input(this_reference.internal_obj[key][index]);
                if (condition) {
                    passing_items.push(index);
                }
            });
            this_reference.internal_selected_items[key] = passing_items;
        });
        return this;
    };
    alphaDataBase.prototype.getSelected = function (fields) {
        var this_reference = this;
        var keys = Object.keys(this_reference.internal_selected_items);
        var obj_to_return = [];
        keys.forEach(function (key) {
            this_reference.internal_selected_items[key].forEach(function (val) {
                if (fields !== undefined && fields.length > 0 && Array.isArray(fields)) {
                    var obj_with_selected_1 = {};
                    fields.forEach(function (field) {
                        obj_with_selected_1[field] = this_reference.internal_obj[key][val][field];
                    });
                    obj_to_return.push(obj_with_selected_1);
                }
                else
                    obj_to_return.push(this_reference.internal_obj[key][val]);
            });
        });
        return obj_to_return;
    };
    alphaDataBase.prototype.insert = function (input) {
        var this_reference = this;
        var keys = Object.keys(this_reference.internal_selected_items);
        keys.forEach(function (key) {
            var valid = true;
            if (this_reference.internal_schemes[key] !== undefined) {
                var scheme_keys = Object.keys(this_reference.internal_schemes[key]);
                scheme_keys.forEach(function (scheme_key) {
                    if (typeof this_reference.internal_schemes[key][scheme_key] === "string") {
                        if (typeof input[scheme_key] !== this_reference.internal_schemes[key][scheme_key]) {
                            throw new Error("While inserting to " + key + ", type of " + scheme_key + " (" + typeof input[scheme_key] + ") did not match the scheme type, which was " + this_reference.internal_schemes[key][scheme_key]);
                        }
                    }
                    else if (typeof this_reference.internal_schemes[key][scheme_key] === "function") {
                        if (!this_reference.internal_schemes[key][scheme_key](input[scheme_key])) {
                            throw new Error("While inserting to " + key + ", Function for " + scheme_key + " did not return true.");
                        }
                    }
                });
            }
            if (valid) {
                this_reference.internal_obj[key].push(input);
            }
        });
        return this;
    };
    alphaDataBase.prototype.edit = function (func) {
        var this_reference = this;
        var keys = Object.keys(this_reference.internal_selected_items);
        keys.forEach(function (key) {
            this_reference.internal_obj[key].forEach(func);
        });
        return this;
    };
    alphaDataBase.prototype.write = function () {
        var this_reference = this;
        var dir = path.dirname(this_reference.internal_location);
        fs.writeFileSync(this_reference.internal_location, JSON.stringify(this_reference.internal_obj));
        fs.writeFileSync(path.join(dir, "schemes.sch"), JSON.stringify(this_reference.internal_schemes));
    };
    alphaDataBase.prototype.deleteItem = function () {
        var this_reference = this;
        var keys = Object.keys(this_reference.internal_selected_items);
        keys.forEach(function (key) {
            for (var a = this_reference.internal_obj[key].length; a > 0; a--) {
                if (this_reference.internal_selected_items[key].indexOf(a - 1) > -1) {
                    this_reference.internal_obj[key].splice(a - 1, 1);
                }
            }
        });
        return this;
    };
    return alphaDataBase;
}());
module.exports = alphaDataBase;
//# sourceMappingURL=alphadata.js.map