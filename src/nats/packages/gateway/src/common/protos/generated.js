/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.ProcedureReq = (function() {

    /**
     * Properties of a ProcedureReq.
     * @exports IProcedureReq
     * @interface IProcedureReq
     * @property {string|null} [receiverUhuraId] ProcedureReq receiverUhuraId
     * @property {string|null} [senderUhuraId] ProcedureReq senderUhuraId
     * @property {IProcedure|null} [procedure] ProcedureReq procedure
     * @property {Object.<string,string>|null} [inputs] ProcedureReq inputs
     */

    /**
     * Constructs a new ProcedureReq.
     * @exports ProcedureReq
     * @classdesc Represents a ProcedureReq.
     * @implements IProcedureReq
     * @constructor
     * @param {IProcedureReq=} [properties] Properties to set
     */
    function ProcedureReq(properties) {
        this.inputs = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ProcedureReq receiverUhuraId.
     * @member {string} receiverUhuraId
     * @memberof ProcedureReq
     * @instance
     */
    ProcedureReq.prototype.receiverUhuraId = "";

    /**
     * ProcedureReq senderUhuraId.
     * @member {string} senderUhuraId
     * @memberof ProcedureReq
     * @instance
     */
    ProcedureReq.prototype.senderUhuraId = "";

    /**
     * ProcedureReq procedure.
     * @member {IProcedure|null|undefined} procedure
     * @memberof ProcedureReq
     * @instance
     */
    ProcedureReq.prototype.procedure = null;

    /**
     * ProcedureReq inputs.
     * @member {Object.<string,string>} inputs
     * @memberof ProcedureReq
     * @instance
     */
    ProcedureReq.prototype.inputs = $util.emptyObject;

    /**
     * Creates a new ProcedureReq instance using the specified properties.
     * @function create
     * @memberof ProcedureReq
     * @static
     * @param {IProcedureReq=} [properties] Properties to set
     * @returns {ProcedureReq} ProcedureReq instance
     */
    ProcedureReq.create = function create(properties) {
        return new ProcedureReq(properties);
    };

    /**
     * Encodes the specified ProcedureReq message. Does not implicitly {@link ProcedureReq.verify|verify} messages.
     * @function encode
     * @memberof ProcedureReq
     * @static
     * @param {IProcedureReq} message ProcedureReq message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ProcedureReq.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.receiverUhuraId != null && Object.hasOwnProperty.call(message, "receiverUhuraId"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.receiverUhuraId);
        if (message.senderUhuraId != null && Object.hasOwnProperty.call(message, "senderUhuraId"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.senderUhuraId);
        if (message.procedure != null && Object.hasOwnProperty.call(message, "procedure"))
            $root.Procedure.encode(message.procedure, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.inputs != null && Object.hasOwnProperty.call(message, "inputs"))
            for (var keys = Object.keys(message.inputs), i = 0; i < keys.length; ++i)
                writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.inputs[keys[i]]).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ProcedureReq message, length delimited. Does not implicitly {@link ProcedureReq.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ProcedureReq
     * @static
     * @param {IProcedureReq} message ProcedureReq message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ProcedureReq.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ProcedureReq message from the specified reader or buffer.
     * @function decode
     * @memberof ProcedureReq
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ProcedureReq} ProcedureReq
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ProcedureReq.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ProcedureReq(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.receiverUhuraId = reader.string();
                    break;
                }
            case 2: {
                    message.senderUhuraId = reader.string();
                    break;
                }
            case 3: {
                    message.procedure = $root.Procedure.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    if (message.inputs === $util.emptyObject)
                        message.inputs = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = "";
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = reader.string();
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.inputs[key] = value;
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ProcedureReq message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ProcedureReq
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ProcedureReq} ProcedureReq
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ProcedureReq.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ProcedureReq message.
     * @function verify
     * @memberof ProcedureReq
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ProcedureReq.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.receiverUhuraId != null && message.hasOwnProperty("receiverUhuraId"))
            if (!$util.isString(message.receiverUhuraId))
                return "receiverUhuraId: string expected";
        if (message.senderUhuraId != null && message.hasOwnProperty("senderUhuraId"))
            if (!$util.isString(message.senderUhuraId))
                return "senderUhuraId: string expected";
        if (message.procedure != null && message.hasOwnProperty("procedure")) {
            var error = $root.Procedure.verify(message.procedure);
            if (error)
                return "procedure." + error;
        }
        if (message.inputs != null && message.hasOwnProperty("inputs")) {
            if (!$util.isObject(message.inputs))
                return "inputs: object expected";
            var key = Object.keys(message.inputs);
            for (var i = 0; i < key.length; ++i)
                if (!$util.isString(message.inputs[key[i]]))
                    return "inputs: string{k:string} expected";
        }
        return null;
    };

    /**
     * Creates a ProcedureReq message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ProcedureReq
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ProcedureReq} ProcedureReq
     */
    ProcedureReq.fromObject = function fromObject(object) {
        if (object instanceof $root.ProcedureReq)
            return object;
        var message = new $root.ProcedureReq();
        if (object.receiverUhuraId != null)
            message.receiverUhuraId = String(object.receiverUhuraId);
        if (object.senderUhuraId != null)
            message.senderUhuraId = String(object.senderUhuraId);
        if (object.procedure != null) {
            if (typeof object.procedure !== "object")
                throw TypeError(".ProcedureReq.procedure: object expected");
            message.procedure = $root.Procedure.fromObject(object.procedure);
        }
        if (object.inputs) {
            if (typeof object.inputs !== "object")
                throw TypeError(".ProcedureReq.inputs: object expected");
            message.inputs = {};
            for (var keys = Object.keys(object.inputs), i = 0; i < keys.length; ++i)
                message.inputs[keys[i]] = String(object.inputs[keys[i]]);
        }
        return message;
    };

    /**
     * Creates a plain object from a ProcedureReq message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ProcedureReq
     * @static
     * @param {ProcedureReq} message ProcedureReq
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ProcedureReq.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.inputs = {};
        if (options.defaults) {
            object.receiverUhuraId = "";
            object.senderUhuraId = "";
            object.procedure = null;
        }
        if (message.receiverUhuraId != null && message.hasOwnProperty("receiverUhuraId"))
            object.receiverUhuraId = message.receiverUhuraId;
        if (message.senderUhuraId != null && message.hasOwnProperty("senderUhuraId"))
            object.senderUhuraId = message.senderUhuraId;
        if (message.procedure != null && message.hasOwnProperty("procedure"))
            object.procedure = $root.Procedure.toObject(message.procedure, options);
        var keys2;
        if (message.inputs && (keys2 = Object.keys(message.inputs)).length) {
            object.inputs = {};
            for (var j = 0; j < keys2.length; ++j)
                object.inputs[keys2[j]] = message.inputs[keys2[j]];
        }
        return object;
    };

    /**
     * Converts this ProcedureReq to JSON.
     * @function toJSON
     * @memberof ProcedureReq
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ProcedureReq.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ProcedureReq
     * @function getTypeUrl
     * @memberof ProcedureReq
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ProcedureReq.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ProcedureReq";
    };

    return ProcedureReq;
})();

$root.Service = (function() {

    /**
     * Properties of a Service.
     * @exports IService
     * @interface IService
     * @property {string|null} [id] Service id
     * @property {string|null} [name] Service name
     * @property {string|null} [description] Service description
     * @property {string|null} [nodeId] Service nodeId
     * @property {string|null} [modified] Service modified
     * @property {Object.<string,IProcedure>|null} [procedures] Service procedures
     */

    /**
     * Constructs a new Service.
     * @exports Service
     * @classdesc Represents a Service.
     * @implements IService
     * @constructor
     * @param {IService=} [properties] Properties to set
     */
    function Service(properties) {
        this.procedures = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Service id.
     * @member {string} id
     * @memberof Service
     * @instance
     */
    Service.prototype.id = "";

    /**
     * Service name.
     * @member {string} name
     * @memberof Service
     * @instance
     */
    Service.prototype.name = "";

    /**
     * Service description.
     * @member {string} description
     * @memberof Service
     * @instance
     */
    Service.prototype.description = "";

    /**
     * Service nodeId.
     * @member {string} nodeId
     * @memberof Service
     * @instance
     */
    Service.prototype.nodeId = "";

    /**
     * Service modified.
     * @member {string} modified
     * @memberof Service
     * @instance
     */
    Service.prototype.modified = "";

    /**
     * Service procedures.
     * @member {Object.<string,IProcedure>} procedures
     * @memberof Service
     * @instance
     */
    Service.prototype.procedures = $util.emptyObject;

    /**
     * Creates a new Service instance using the specified properties.
     * @function create
     * @memberof Service
     * @static
     * @param {IService=} [properties] Properties to set
     * @returns {Service} Service instance
     */
    Service.create = function create(properties) {
        return new Service(properties);
    };

    /**
     * Encodes the specified Service message. Does not implicitly {@link Service.verify|verify} messages.
     * @function encode
     * @memberof Service
     * @static
     * @param {IService} message Service message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Service.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
        if (message.description != null && Object.hasOwnProperty.call(message, "description"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
        if (message.nodeId != null && Object.hasOwnProperty.call(message, "nodeId"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.nodeId);
        if (message.modified != null && Object.hasOwnProperty.call(message, "modified"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.modified);
        if (message.procedures != null && Object.hasOwnProperty.call(message, "procedures"))
            for (var keys = Object.keys(message.procedures), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 6, wireType 2 =*/50).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.Procedure.encode(message.procedures[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        return writer;
    };

    /**
     * Encodes the specified Service message, length delimited. Does not implicitly {@link Service.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Service
     * @static
     * @param {IService} message Service message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Service.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Service message from the specified reader or buffer.
     * @function decode
     * @memberof Service
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Service} Service
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Service.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Service(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.id = reader.string();
                    break;
                }
            case 2: {
                    message.name = reader.string();
                    break;
                }
            case 3: {
                    message.description = reader.string();
                    break;
                }
            case 4: {
                    message.nodeId = reader.string();
                    break;
                }
            case 5: {
                    message.modified = reader.string();
                    break;
                }
            case 6: {
                    if (message.procedures === $util.emptyObject)
                        message.procedures = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = null;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = $root.Procedure.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.procedures[key] = value;
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Service message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Service
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Service} Service
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Service.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Service message.
     * @function verify
     * @memberof Service
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Service.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.description != null && message.hasOwnProperty("description"))
            if (!$util.isString(message.description))
                return "description: string expected";
        if (message.nodeId != null && message.hasOwnProperty("nodeId"))
            if (!$util.isString(message.nodeId))
                return "nodeId: string expected";
        if (message.modified != null && message.hasOwnProperty("modified"))
            if (!$util.isString(message.modified))
                return "modified: string expected";
        if (message.procedures != null && message.hasOwnProperty("procedures")) {
            if (!$util.isObject(message.procedures))
                return "procedures: object expected";
            var key = Object.keys(message.procedures);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.Procedure.verify(message.procedures[key[i]]);
                if (error)
                    return "procedures." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Service message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Service
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Service} Service
     */
    Service.fromObject = function fromObject(object) {
        if (object instanceof $root.Service)
            return object;
        var message = new $root.Service();
        if (object.id != null)
            message.id = String(object.id);
        if (object.name != null)
            message.name = String(object.name);
        if (object.description != null)
            message.description = String(object.description);
        if (object.nodeId != null)
            message.nodeId = String(object.nodeId);
        if (object.modified != null)
            message.modified = String(object.modified);
        if (object.procedures) {
            if (typeof object.procedures !== "object")
                throw TypeError(".Service.procedures: object expected");
            message.procedures = {};
            for (var keys = Object.keys(object.procedures), i = 0; i < keys.length; ++i) {
                if (typeof object.procedures[keys[i]] !== "object")
                    throw TypeError(".Service.procedures: object expected");
                message.procedures[keys[i]] = $root.Procedure.fromObject(object.procedures[keys[i]]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Service message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Service
     * @static
     * @param {Service} message Service
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Service.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.procedures = {};
        if (options.defaults) {
            object.id = "";
            object.name = "";
            object.description = "";
            object.nodeId = "";
            object.modified = "";
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.description != null && message.hasOwnProperty("description"))
            object.description = message.description;
        if (message.nodeId != null && message.hasOwnProperty("nodeId"))
            object.nodeId = message.nodeId;
        if (message.modified != null && message.hasOwnProperty("modified"))
            object.modified = message.modified;
        var keys2;
        if (message.procedures && (keys2 = Object.keys(message.procedures)).length) {
            object.procedures = {};
            for (var j = 0; j < keys2.length; ++j)
                object.procedures[keys2[j]] = $root.Procedure.toObject(message.procedures[keys2[j]], options);
        }
        return object;
    };

    /**
     * Converts this Service to JSON.
     * @function toJSON
     * @memberof Service
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Service.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Service
     * @function getTypeUrl
     * @memberof Service
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Service.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Service";
    };

    return Service;
})();

$root.Procedure = (function() {

    /**
     * Properties of a Procedure.
     * @exports IProcedure
     * @interface IProcedure
     * @property {string|null} [type] Procedure type
     * @property {string|null} [name] Procedure name
     * @property {string|null} [description] Procedure description
     * @property {boolean|null} [reply] Procedure reply
     * @property {Object.<string,string>|null} [inputFields] Procedure inputFields
     * @property {Object.<string,string>|null} [outputFields] Procedure outputFields
     */

    /**
     * Constructs a new Procedure.
     * @exports Procedure
     * @classdesc Represents a Procedure.
     * @implements IProcedure
     * @constructor
     * @param {IProcedure=} [properties] Properties to set
     */
    function Procedure(properties) {
        this.inputFields = {};
        this.outputFields = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Procedure type.
     * @member {string} type
     * @memberof Procedure
     * @instance
     */
    Procedure.prototype.type = "";

    /**
     * Procedure name.
     * @member {string} name
     * @memberof Procedure
     * @instance
     */
    Procedure.prototype.name = "";

    /**
     * Procedure description.
     * @member {string} description
     * @memberof Procedure
     * @instance
     */
    Procedure.prototype.description = "";

    /**
     * Procedure reply.
     * @member {boolean} reply
     * @memberof Procedure
     * @instance
     */
    Procedure.prototype.reply = false;

    /**
     * Procedure inputFields.
     * @member {Object.<string,string>} inputFields
     * @memberof Procedure
     * @instance
     */
    Procedure.prototype.inputFields = $util.emptyObject;

    /**
     * Procedure outputFields.
     * @member {Object.<string,string>} outputFields
     * @memberof Procedure
     * @instance
     */
    Procedure.prototype.outputFields = $util.emptyObject;

    /**
     * Creates a new Procedure instance using the specified properties.
     * @function create
     * @memberof Procedure
     * @static
     * @param {IProcedure=} [properties] Properties to set
     * @returns {Procedure} Procedure instance
     */
    Procedure.create = function create(properties) {
        return new Procedure(properties);
    };

    /**
     * Encodes the specified Procedure message. Does not implicitly {@link Procedure.verify|verify} messages.
     * @function encode
     * @memberof Procedure
     * @static
     * @param {IProcedure} message Procedure message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Procedure.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.type);
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
        if (message.description != null && Object.hasOwnProperty.call(message, "description"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
        if (message.reply != null && Object.hasOwnProperty.call(message, "reply"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.reply);
        if (message.inputFields != null && Object.hasOwnProperty.call(message, "inputFields"))
            for (var keys = Object.keys(message.inputFields), i = 0; i < keys.length; ++i)
                writer.uint32(/* id 5, wireType 2 =*/42).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.inputFields[keys[i]]).ldelim();
        if (message.outputFields != null && Object.hasOwnProperty.call(message, "outputFields"))
            for (var keys = Object.keys(message.outputFields), i = 0; i < keys.length; ++i)
                writer.uint32(/* id 6, wireType 2 =*/50).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.outputFields[keys[i]]).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Procedure message, length delimited. Does not implicitly {@link Procedure.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Procedure
     * @static
     * @param {IProcedure} message Procedure message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Procedure.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Procedure message from the specified reader or buffer.
     * @function decode
     * @memberof Procedure
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Procedure} Procedure
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Procedure.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Procedure(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.type = reader.string();
                    break;
                }
            case 2: {
                    message.name = reader.string();
                    break;
                }
            case 3: {
                    message.description = reader.string();
                    break;
                }
            case 4: {
                    message.reply = reader.bool();
                    break;
                }
            case 5: {
                    if (message.inputFields === $util.emptyObject)
                        message.inputFields = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = "";
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = reader.string();
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.inputFields[key] = value;
                    break;
                }
            case 6: {
                    if (message.outputFields === $util.emptyObject)
                        message.outputFields = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = "";
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = reader.string();
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.outputFields[key] = value;
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Procedure message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Procedure
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Procedure} Procedure
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Procedure.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Procedure message.
     * @function verify
     * @memberof Procedure
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Procedure.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.type != null && message.hasOwnProperty("type"))
            if (!$util.isString(message.type))
                return "type: string expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.description != null && message.hasOwnProperty("description"))
            if (!$util.isString(message.description))
                return "description: string expected";
        if (message.reply != null && message.hasOwnProperty("reply"))
            if (typeof message.reply !== "boolean")
                return "reply: boolean expected";
        if (message.inputFields != null && message.hasOwnProperty("inputFields")) {
            if (!$util.isObject(message.inputFields))
                return "inputFields: object expected";
            var key = Object.keys(message.inputFields);
            for (var i = 0; i < key.length; ++i)
                if (!$util.isString(message.inputFields[key[i]]))
                    return "inputFields: string{k:string} expected";
        }
        if (message.outputFields != null && message.hasOwnProperty("outputFields")) {
            if (!$util.isObject(message.outputFields))
                return "outputFields: object expected";
            var key = Object.keys(message.outputFields);
            for (var i = 0; i < key.length; ++i)
                if (!$util.isString(message.outputFields[key[i]]))
                    return "outputFields: string{k:string} expected";
        }
        return null;
    };

    /**
     * Creates a Procedure message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Procedure
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Procedure} Procedure
     */
    Procedure.fromObject = function fromObject(object) {
        if (object instanceof $root.Procedure)
            return object;
        var message = new $root.Procedure();
        if (object.type != null)
            message.type = String(object.type);
        if (object.name != null)
            message.name = String(object.name);
        if (object.description != null)
            message.description = String(object.description);
        if (object.reply != null)
            message.reply = Boolean(object.reply);
        if (object.inputFields) {
            if (typeof object.inputFields !== "object")
                throw TypeError(".Procedure.inputFields: object expected");
            message.inputFields = {};
            for (var keys = Object.keys(object.inputFields), i = 0; i < keys.length; ++i)
                message.inputFields[keys[i]] = String(object.inputFields[keys[i]]);
        }
        if (object.outputFields) {
            if (typeof object.outputFields !== "object")
                throw TypeError(".Procedure.outputFields: object expected");
            message.outputFields = {};
            for (var keys = Object.keys(object.outputFields), i = 0; i < keys.length; ++i)
                message.outputFields[keys[i]] = String(object.outputFields[keys[i]]);
        }
        return message;
    };

    /**
     * Creates a plain object from a Procedure message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Procedure
     * @static
     * @param {Procedure} message Procedure
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Procedure.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults) {
            object.inputFields = {};
            object.outputFields = {};
        }
        if (options.defaults) {
            object.type = "";
            object.name = "";
            object.description = "";
            object.reply = false;
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = message.type;
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.description != null && message.hasOwnProperty("description"))
            object.description = message.description;
        if (message.reply != null && message.hasOwnProperty("reply"))
            object.reply = message.reply;
        var keys2;
        if (message.inputFields && (keys2 = Object.keys(message.inputFields)).length) {
            object.inputFields = {};
            for (var j = 0; j < keys2.length; ++j)
                object.inputFields[keys2[j]] = message.inputFields[keys2[j]];
        }
        if (message.outputFields && (keys2 = Object.keys(message.outputFields)).length) {
            object.outputFields = {};
            for (var j = 0; j < keys2.length; ++j)
                object.outputFields[keys2[j]] = message.outputFields[keys2[j]];
        }
        return object;
    };

    /**
     * Converts this Procedure to JSON.
     * @function toJSON
     * @memberof Procedure
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Procedure.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Procedure
     * @function getTypeUrl
     * @memberof Procedure
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Procedure.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Procedure";
    };

    return Procedure;
})();

$root.ProcedureRes = (function() {

    /**
     * Properties of a ProcedureRes.
     * @exports IProcedureRes
     * @interface IProcedureRes
     * @property {IProcedure|null} [procedure] ProcedureRes procedure
     * @property {Object.<string,string>|null} [outputs] ProcedureRes outputs
     */

    /**
     * Constructs a new ProcedureRes.
     * @exports ProcedureRes
     * @classdesc Represents a ProcedureRes.
     * @implements IProcedureRes
     * @constructor
     * @param {IProcedureRes=} [properties] Properties to set
     */
    function ProcedureRes(properties) {
        this.outputs = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ProcedureRes procedure.
     * @member {IProcedure|null|undefined} procedure
     * @memberof ProcedureRes
     * @instance
     */
    ProcedureRes.prototype.procedure = null;

    /**
     * ProcedureRes outputs.
     * @member {Object.<string,string>} outputs
     * @memberof ProcedureRes
     * @instance
     */
    ProcedureRes.prototype.outputs = $util.emptyObject;

    /**
     * Creates a new ProcedureRes instance using the specified properties.
     * @function create
     * @memberof ProcedureRes
     * @static
     * @param {IProcedureRes=} [properties] Properties to set
     * @returns {ProcedureRes} ProcedureRes instance
     */
    ProcedureRes.create = function create(properties) {
        return new ProcedureRes(properties);
    };

    /**
     * Encodes the specified ProcedureRes message. Does not implicitly {@link ProcedureRes.verify|verify} messages.
     * @function encode
     * @memberof ProcedureRes
     * @static
     * @param {IProcedureRes} message ProcedureRes message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ProcedureRes.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.procedure != null && Object.hasOwnProperty.call(message, "procedure"))
            $root.Procedure.encode(message.procedure, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.outputs != null && Object.hasOwnProperty.call(message, "outputs"))
            for (var keys = Object.keys(message.outputs), i = 0; i < keys.length; ++i)
                writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.outputs[keys[i]]).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ProcedureRes message, length delimited. Does not implicitly {@link ProcedureRes.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ProcedureRes
     * @static
     * @param {IProcedureRes} message ProcedureRes message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ProcedureRes.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ProcedureRes message from the specified reader or buffer.
     * @function decode
     * @memberof ProcedureRes
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ProcedureRes} ProcedureRes
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ProcedureRes.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ProcedureRes(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.procedure = $root.Procedure.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    if (message.outputs === $util.emptyObject)
                        message.outputs = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = "";
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = reader.string();
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.outputs[key] = value;
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ProcedureRes message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ProcedureRes
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ProcedureRes} ProcedureRes
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ProcedureRes.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ProcedureRes message.
     * @function verify
     * @memberof ProcedureRes
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ProcedureRes.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.procedure != null && message.hasOwnProperty("procedure")) {
            var error = $root.Procedure.verify(message.procedure);
            if (error)
                return "procedure." + error;
        }
        if (message.outputs != null && message.hasOwnProperty("outputs")) {
            if (!$util.isObject(message.outputs))
                return "outputs: object expected";
            var key = Object.keys(message.outputs);
            for (var i = 0; i < key.length; ++i)
                if (!$util.isString(message.outputs[key[i]]))
                    return "outputs: string{k:string} expected";
        }
        return null;
    };

    /**
     * Creates a ProcedureRes message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ProcedureRes
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ProcedureRes} ProcedureRes
     */
    ProcedureRes.fromObject = function fromObject(object) {
        if (object instanceof $root.ProcedureRes)
            return object;
        var message = new $root.ProcedureRes();
        if (object.procedure != null) {
            if (typeof object.procedure !== "object")
                throw TypeError(".ProcedureRes.procedure: object expected");
            message.procedure = $root.Procedure.fromObject(object.procedure);
        }
        if (object.outputs) {
            if (typeof object.outputs !== "object")
                throw TypeError(".ProcedureRes.outputs: object expected");
            message.outputs = {};
            for (var keys = Object.keys(object.outputs), i = 0; i < keys.length; ++i)
                message.outputs[keys[i]] = String(object.outputs[keys[i]]);
        }
        return message;
    };

    /**
     * Creates a plain object from a ProcedureRes message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ProcedureRes
     * @static
     * @param {ProcedureRes} message ProcedureRes
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ProcedureRes.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.outputs = {};
        if (options.defaults)
            object.procedure = null;
        if (message.procedure != null && message.hasOwnProperty("procedure"))
            object.procedure = $root.Procedure.toObject(message.procedure, options);
        var keys2;
        if (message.outputs && (keys2 = Object.keys(message.outputs)).length) {
            object.outputs = {};
            for (var j = 0; j < keys2.length; ++j)
                object.outputs[keys2[j]] = message.outputs[keys2[j]];
        }
        return object;
    };

    /**
     * Converts this ProcedureRes to JSON.
     * @function toJSON
     * @memberof ProcedureRes
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ProcedureRes.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ProcedureRes
     * @function getTypeUrl
     * @memberof ProcedureRes
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ProcedureRes.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ProcedureRes";
    };

    return ProcedureRes;
})();

module.exports = $root;
