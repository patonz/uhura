/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.uhura = (function() {

    /**
     * Namespace uhura.
     * @exports uhura
     * @namespace
     */
    var uhura = {};

    uhura.Message = (function() {

        /**
         * Properties of a Message.
         * @memberof uhura
         * @interface IMessage
         * @property {string} text Message text
         */

        /**
         * Constructs a new Message.
         * @memberof uhura
         * @classdesc Represents a Message.
         * @implements IMessage
         * @constructor
         * @param {uhura.IMessage=} [properties] Properties to set
         */
        function Message(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Message text.
         * @member {string} text
         * @memberof uhura.Message
         * @instance
         */
        Message.prototype.text = "";

        /**
         * Creates a new Message instance using the specified properties.
         * @function create
         * @memberof uhura.Message
         * @static
         * @param {uhura.IMessage=} [properties] Properties to set
         * @returns {uhura.Message} Message instance
         */
        Message.create = function create(properties) {
            return new Message(properties);
        };

        /**
         * Encodes the specified Message message. Does not implicitly {@link uhura.Message.verify|verify} messages.
         * @function encode
         * @memberof uhura.Message
         * @static
         * @param {uhura.IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
            return writer;
        };

        /**
         * Encodes the specified Message message, length delimited. Does not implicitly {@link uhura.Message.verify|verify} messages.
         * @function encodeDelimited
         * @memberof uhura.Message
         * @static
         * @param {uhura.IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Message message from the specified reader or buffer.
         * @function decode
         * @memberof uhura.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {uhura.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.uhura.Message();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.text = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("text"))
                throw $util.ProtocolError("missing required 'text'", { instance: message });
            return message;
        };

        /**
         * Decodes a Message message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof uhura.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {uhura.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Message message.
         * @function verify
         * @memberof uhura.Message
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Message.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.text))
                return "text: string expected";
            return null;
        };

        /**
         * Creates a Message message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof uhura.Message
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {uhura.Message} Message
         */
        Message.fromObject = function fromObject(object) {
            if (object instanceof $root.uhura.Message)
                return object;
            var message = new $root.uhura.Message();
            if (object.text != null)
                message.text = String(object.text);
            return message;
        };

        /**
         * Creates a plain object from a Message message. Also converts values to other types if specified.
         * @function toObject
         * @memberof uhura.Message
         * @static
         * @param {uhura.Message} message Message
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Message.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.text = "";
            if (message.text != null && message.hasOwnProperty("text"))
                object.text = message.text;
            return object;
        };

        /**
         * Converts this Message to JSON.
         * @function toJSON
         * @memberof uhura.Message
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Message.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Message
         * @function getTypeUrl
         * @memberof uhura.Message
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Message.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/uhura.Message";
        };

        return Message;
    })();

    uhura.Node = (function() {

        /**
         * Properties of a Node.
         * @memberof uhura
         * @interface INode
         * @property {string} id Node id
         * @property {string|null} [adapterId] Node adapterId
         */

        /**
         * Constructs a new Node.
         * @memberof uhura
         * @classdesc Represents a Node.
         * @implements INode
         * @constructor
         * @param {uhura.INode=} [properties] Properties to set
         */
        function Node(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Node id.
         * @member {string} id
         * @memberof uhura.Node
         * @instance
         */
        Node.prototype.id = "";

        /**
         * Node adapterId.
         * @member {string} adapterId
         * @memberof uhura.Node
         * @instance
         */
        Node.prototype.adapterId = "";

        /**
         * Creates a new Node instance using the specified properties.
         * @function create
         * @memberof uhura.Node
         * @static
         * @param {uhura.INode=} [properties] Properties to set
         * @returns {uhura.Node} Node instance
         */
        Node.create = function create(properties) {
            return new Node(properties);
        };

        /**
         * Encodes the specified Node message. Does not implicitly {@link uhura.Node.verify|verify} messages.
         * @function encode
         * @memberof uhura.Node
         * @static
         * @param {uhura.INode} message Node message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Node.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.adapterId != null && Object.hasOwnProperty.call(message, "adapterId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.adapterId);
            return writer;
        };

        /**
         * Encodes the specified Node message, length delimited. Does not implicitly {@link uhura.Node.verify|verify} messages.
         * @function encodeDelimited
         * @memberof uhura.Node
         * @static
         * @param {uhura.INode} message Node message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Node.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Node message from the specified reader or buffer.
         * @function decode
         * @memberof uhura.Node
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {uhura.Node} Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Node.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.uhura.Node();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.adapterId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            return message;
        };

        /**
         * Decodes a Node message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof uhura.Node
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {uhura.Node} Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Node.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Node message.
         * @function verify
         * @memberof uhura.Node
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Node.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.id))
                return "id: string expected";
            if (message.adapterId != null && message.hasOwnProperty("adapterId"))
                if (!$util.isString(message.adapterId))
                    return "adapterId: string expected";
            return null;
        };

        /**
         * Creates a Node message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof uhura.Node
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {uhura.Node} Node
         */
        Node.fromObject = function fromObject(object) {
            if (object instanceof $root.uhura.Node)
                return object;
            var message = new $root.uhura.Node();
            if (object.id != null)
                message.id = String(object.id);
            if (object.adapterId != null)
                message.adapterId = String(object.adapterId);
            return message;
        };

        /**
         * Creates a plain object from a Node message. Also converts values to other types if specified.
         * @function toObject
         * @memberof uhura.Node
         * @static
         * @param {uhura.Node} message Node
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Node.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.adapterId = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.adapterId != null && message.hasOwnProperty("adapterId"))
                object.adapterId = message.adapterId;
            return object;
        };

        /**
         * Converts this Node to JSON.
         * @function toJSON
         * @memberof uhura.Node
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Node.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Node
         * @function getTypeUrl
         * @memberof uhura.Node
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Node.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/uhura.Node";
        };

        return Node;
    })();

    uhura.SendMessageRequest = (function() {

        /**
         * Properties of a SendMessageRequest.
         * @memberof uhura
         * @interface ISendMessageRequest
         * @property {uhura.IMessage|null} [message] SendMessageRequest message
         * @property {number|null} [priority] SendMessageRequest priority
         * @property {uhura.INode|null} [sender] SendMessageRequest sender
         * @property {Array.<uhura.INode>|null} [receivers] SendMessageRequest receivers
         */

        /**
         * Constructs a new SendMessageRequest.
         * @memberof uhura
         * @classdesc Represents a SendMessageRequest.
         * @implements ISendMessageRequest
         * @constructor
         * @param {uhura.ISendMessageRequest=} [properties] Properties to set
         */
        function SendMessageRequest(properties) {
            this.receivers = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SendMessageRequest message.
         * @member {uhura.IMessage|null|undefined} message
         * @memberof uhura.SendMessageRequest
         * @instance
         */
        SendMessageRequest.prototype.message = null;

        /**
         * SendMessageRequest priority.
         * @member {number} priority
         * @memberof uhura.SendMessageRequest
         * @instance
         */
        SendMessageRequest.prototype.priority = 0;

        /**
         * SendMessageRequest sender.
         * @member {uhura.INode|null|undefined} sender
         * @memberof uhura.SendMessageRequest
         * @instance
         */
        SendMessageRequest.prototype.sender = null;

        /**
         * SendMessageRequest receivers.
         * @member {Array.<uhura.INode>} receivers
         * @memberof uhura.SendMessageRequest
         * @instance
         */
        SendMessageRequest.prototype.receivers = $util.emptyArray;

        /**
         * Creates a new SendMessageRequest instance using the specified properties.
         * @function create
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {uhura.ISendMessageRequest=} [properties] Properties to set
         * @returns {uhura.SendMessageRequest} SendMessageRequest instance
         */
        SendMessageRequest.create = function create(properties) {
            return new SendMessageRequest(properties);
        };

        /**
         * Encodes the specified SendMessageRequest message. Does not implicitly {@link uhura.SendMessageRequest.verify|verify} messages.
         * @function encode
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {uhura.ISendMessageRequest} message SendMessageRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SendMessageRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                $root.uhura.Message.encode(message.message, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.priority != null && Object.hasOwnProperty.call(message, "priority"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.priority);
            if (message.sender != null && Object.hasOwnProperty.call(message, "sender"))
                $root.uhura.Node.encode(message.sender, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.receivers != null && message.receivers.length)
                for (var i = 0; i < message.receivers.length; ++i)
                    $root.uhura.Node.encode(message.receivers[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified SendMessageRequest message, length delimited. Does not implicitly {@link uhura.SendMessageRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {uhura.ISendMessageRequest} message SendMessageRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SendMessageRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SendMessageRequest message from the specified reader or buffer.
         * @function decode
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {uhura.SendMessageRequest} SendMessageRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SendMessageRequest.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.uhura.SendMessageRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.message = $root.uhura.Message.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.priority = reader.int32();
                        break;
                    }
                case 3: {
                        message.sender = $root.uhura.Node.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        if (!(message.receivers && message.receivers.length))
                            message.receivers = [];
                        message.receivers.push($root.uhura.Node.decode(reader, reader.uint32()));
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
         * Decodes a SendMessageRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {uhura.SendMessageRequest} SendMessageRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SendMessageRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SendMessageRequest message.
         * @function verify
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SendMessageRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.message != null && message.hasOwnProperty("message")) {
                var error = $root.uhura.Message.verify(message.message);
                if (error)
                    return "message." + error;
            }
            if (message.priority != null && message.hasOwnProperty("priority"))
                if (!$util.isInteger(message.priority))
                    return "priority: integer expected";
            if (message.sender != null && message.hasOwnProperty("sender")) {
                var error = $root.uhura.Node.verify(message.sender);
                if (error)
                    return "sender." + error;
            }
            if (message.receivers != null && message.hasOwnProperty("receivers")) {
                if (!Array.isArray(message.receivers))
                    return "receivers: array expected";
                for (var i = 0; i < message.receivers.length; ++i) {
                    var error = $root.uhura.Node.verify(message.receivers[i]);
                    if (error)
                        return "receivers." + error;
                }
            }
            return null;
        };

        /**
         * Creates a SendMessageRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {uhura.SendMessageRequest} SendMessageRequest
         */
        SendMessageRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.uhura.SendMessageRequest)
                return object;
            var message = new $root.uhura.SendMessageRequest();
            if (object.message != null) {
                if (typeof object.message !== "object")
                    throw TypeError(".uhura.SendMessageRequest.message: object expected");
                message.message = $root.uhura.Message.fromObject(object.message);
            }
            if (object.priority != null)
                message.priority = object.priority | 0;
            if (object.sender != null) {
                if (typeof object.sender !== "object")
                    throw TypeError(".uhura.SendMessageRequest.sender: object expected");
                message.sender = $root.uhura.Node.fromObject(object.sender);
            }
            if (object.receivers) {
                if (!Array.isArray(object.receivers))
                    throw TypeError(".uhura.SendMessageRequest.receivers: array expected");
                message.receivers = [];
                for (var i = 0; i < object.receivers.length; ++i) {
                    if (typeof object.receivers[i] !== "object")
                        throw TypeError(".uhura.SendMessageRequest.receivers: object expected");
                    message.receivers[i] = $root.uhura.Node.fromObject(object.receivers[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a SendMessageRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {uhura.SendMessageRequest} message SendMessageRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SendMessageRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.receivers = [];
            if (options.defaults) {
                object.message = null;
                object.priority = 0;
                object.sender = null;
            }
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = $root.uhura.Message.toObject(message.message, options);
            if (message.priority != null && message.hasOwnProperty("priority"))
                object.priority = message.priority;
            if (message.sender != null && message.hasOwnProperty("sender"))
                object.sender = $root.uhura.Node.toObject(message.sender, options);
            if (message.receivers && message.receivers.length) {
                object.receivers = [];
                for (var j = 0; j < message.receivers.length; ++j)
                    object.receivers[j] = $root.uhura.Node.toObject(message.receivers[j], options);
            }
            return object;
        };

        /**
         * Converts this SendMessageRequest to JSON.
         * @function toJSON
         * @memberof uhura.SendMessageRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SendMessageRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SendMessageRequest
         * @function getTypeUrl
         * @memberof uhura.SendMessageRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SendMessageRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/uhura.SendMessageRequest";
        };

        return SendMessageRequest;
    })();

    return uhura;
})();

module.exports = $root;
