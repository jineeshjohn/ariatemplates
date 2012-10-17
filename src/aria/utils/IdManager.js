/*
 * Copyright 2012 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Handle Id generation
 * @class aria.utils.IdManager
 */
Aria.classDefinition({
    $classpath : 'aria.utils.IdManager',
    $dependencies : ['aria.utils.Array'],

    /**
     * Constructor
     * @param {String} prefix
     */
    $constructor : function (prefix, suffix) {
        /**
         * Map of free ids
         * @protected
         * @type Object
         */
        this._freeIdMap = {};

        /**
         * Counter for ids when none is free
         * @protected
         * @type Number
         */
        this._idCounter = 0;

        /**
         * Prefix for the ids
         * @type String
         */
        this.prefix = prefix || "";

        /**
         * Suffix for the ids
         * @type String
         */
        this.suffix = suffix || "";

        this._idMap = {};

    },
    $destructor : function () {
        this._freeIdMap = null;
    },
    $prototype : {

        /**
         * Create a unique id. Either reuse an existing reusable id or create a new one if none exist.
         */
        getId : function () {
            for (var i in this._freeIdMap) {
                if (!this._freeIdMap.hasOwnProperty(i)) {
                    continue;
                }
                delete this._freeIdMap[i];
                return i;
            }

            var id = this.prefix + this._idCounter;
            this._idCounter++;
            return id;
        },

        /**
         * Return a global id from an id specified in a template. It adds a unique template-specific prefix and
         * concatenates a defined string with a auto generated sequenced number for the id suffix so that there is no
         * name collision between several instances of the same template, or different templates.
         * @param {String} special ids which has plus suffixes
         * @return {String} global id which should not collide with ids from other templates
         */

        $getNewId : function (id) {
            if (id) {
                var idVal = "";
                if (id.indexOf("+") != -1) {
                    id = id.replace("+", "");
                    if (id in this._idMap) {
                        idVal = this._idMap[id] + 1;
                        this._idMap[id] = idVal;
                    } else {
                        idVal = 1;
                        this._idMap[id] = idVal;
                    }
                }
                return [this.prefix, id.replace("+", ""), this.suffix, idVal].join("_");
            } else {
                // Empty Ids will be replaced by underscore
                return [this.prefix, "", this.suffix, this._idCounter++].join("_");
            }

        },

        /**
         * Release an id (register it to be reused).
         * @param {String} id
         */
        releaseId : function (id) {
            if (id) {
                this._freeIdMap[id] = true;
            }
        }
    }
});