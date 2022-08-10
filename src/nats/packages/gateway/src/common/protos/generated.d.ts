import * as $protobuf from "protobufjs";
/** Properties of a ProcedureReq. */
export interface IProcedureReq {

    /** ProcedureReq receiverUhuraId */
    receiverUhuraId?: (string|null);

    /** ProcedureReq senderUhuraId */
    senderUhuraId?: (string|null);

    /** ProcedureReq procedure */
    procedure?: (IProcedure|null);

    /** ProcedureReq inputs */
    inputs?: ({ [k: string]: string }|null);
}

/** Represents a ProcedureReq. */
export class ProcedureReq implements IProcedureReq {

    /**
     * Constructs a new ProcedureReq.
     * @param [properties] Properties to set
     */
    constructor(properties?: IProcedureReq);

    /** ProcedureReq receiverUhuraId. */
    public receiverUhuraId: string;

    /** ProcedureReq senderUhuraId. */
    public senderUhuraId: string;

    /** ProcedureReq procedure. */
    public procedure?: (IProcedure|null);

    /** ProcedureReq inputs. */
    public inputs: { [k: string]: string };

    /**
     * Creates a new ProcedureReq instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ProcedureReq instance
     */
    public static create(properties?: IProcedureReq): ProcedureReq;

    /**
     * Encodes the specified ProcedureReq message. Does not implicitly {@link ProcedureReq.verify|verify} messages.
     * @param message ProcedureReq message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IProcedureReq, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ProcedureReq message, length delimited. Does not implicitly {@link ProcedureReq.verify|verify} messages.
     * @param message ProcedureReq message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IProcedureReq, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ProcedureReq message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ProcedureReq
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ProcedureReq;

    /**
     * Decodes a ProcedureReq message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ProcedureReq
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ProcedureReq;

    /**
     * Verifies a ProcedureReq message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ProcedureReq message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ProcedureReq
     */
    public static fromObject(object: { [k: string]: any }): ProcedureReq;

    /**
     * Creates a plain object from a ProcedureReq message. Also converts values to other types if specified.
     * @param message ProcedureReq
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ProcedureReq, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ProcedureReq to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ProcedureReq
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Service. */
export interface IService {

    /** Service id */
    id?: (string|null);

    /** Service name */
    name?: (string|null);

    /** Service description */
    description?: (string|null);

    /** Service nodeId */
    nodeId?: (string|null);

    /** Service modified */
    modified?: (string|null);

    /** Service procedures */
    procedures?: ({ [k: string]: IProcedure }|null);
}

/** Represents a Service. */
export class Service implements IService {

    /**
     * Constructs a new Service.
     * @param [properties] Properties to set
     */
    constructor(properties?: IService);

    /** Service id. */
    public id: string;

    /** Service name. */
    public name: string;

    /** Service description. */
    public description: string;

    /** Service nodeId. */
    public nodeId: string;

    /** Service modified. */
    public modified: string;

    /** Service procedures. */
    public procedures: { [k: string]: IProcedure };

    /**
     * Creates a new Service instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Service instance
     */
    public static create(properties?: IService): Service;

    /**
     * Encodes the specified Service message. Does not implicitly {@link Service.verify|verify} messages.
     * @param message Service message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IService, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Service message, length delimited. Does not implicitly {@link Service.verify|verify} messages.
     * @param message Service message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IService, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Service message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Service
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Service;

    /**
     * Decodes a Service message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Service
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Service;

    /**
     * Verifies a Service message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Service message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Service
     */
    public static fromObject(object: { [k: string]: any }): Service;

    /**
     * Creates a plain object from a Service message. Also converts values to other types if specified.
     * @param message Service
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Service, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Service to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Service
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Procedure. */
export interface IProcedure {

    /** Procedure type */
    type?: (string|null);

    /** Procedure name */
    name?: (string|null);

    /** Procedure description */
    description?: (string|null);

    /** Procedure reply */
    reply?: (boolean|null);

    /** Procedure inputFields */
    inputFields?: ({ [k: string]: string }|null);

    /** Procedure outputFields */
    outputFields?: ({ [k: string]: string }|null);
}

/** Represents a Procedure. */
export class Procedure implements IProcedure {

    /**
     * Constructs a new Procedure.
     * @param [properties] Properties to set
     */
    constructor(properties?: IProcedure);

    /** Procedure type. */
    public type: string;

    /** Procedure name. */
    public name: string;

    /** Procedure description. */
    public description: string;

    /** Procedure reply. */
    public reply: boolean;

    /** Procedure inputFields. */
    public inputFields: { [k: string]: string };

    /** Procedure outputFields. */
    public outputFields: { [k: string]: string };

    /**
     * Creates a new Procedure instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Procedure instance
     */
    public static create(properties?: IProcedure): Procedure;

    /**
     * Encodes the specified Procedure message. Does not implicitly {@link Procedure.verify|verify} messages.
     * @param message Procedure message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IProcedure, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Procedure message, length delimited. Does not implicitly {@link Procedure.verify|verify} messages.
     * @param message Procedure message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IProcedure, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Procedure message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Procedure
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Procedure;

    /**
     * Decodes a Procedure message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Procedure
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Procedure;

    /**
     * Verifies a Procedure message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Procedure message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Procedure
     */
    public static fromObject(object: { [k: string]: any }): Procedure;

    /**
     * Creates a plain object from a Procedure message. Also converts values to other types if specified.
     * @param message Procedure
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Procedure, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Procedure to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Procedure
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a ProcedureRes. */
export interface IProcedureRes {

    /** ProcedureRes procedure */
    procedure?: (IProcedure|null);

    /** ProcedureRes outputs */
    outputs?: ({ [k: string]: string }|null);
}

/** Represents a ProcedureRes. */
export class ProcedureRes implements IProcedureRes {

    /**
     * Constructs a new ProcedureRes.
     * @param [properties] Properties to set
     */
    constructor(properties?: IProcedureRes);

    /** ProcedureRes procedure. */
    public procedure?: (IProcedure|null);

    /** ProcedureRes outputs. */
    public outputs: { [k: string]: string };

    /**
     * Creates a new ProcedureRes instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ProcedureRes instance
     */
    public static create(properties?: IProcedureRes): ProcedureRes;

    /**
     * Encodes the specified ProcedureRes message. Does not implicitly {@link ProcedureRes.verify|verify} messages.
     * @param message ProcedureRes message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IProcedureRes, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ProcedureRes message, length delimited. Does not implicitly {@link ProcedureRes.verify|verify} messages.
     * @param message ProcedureRes message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IProcedureRes, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ProcedureRes message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ProcedureRes
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ProcedureRes;

    /**
     * Decodes a ProcedureRes message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ProcedureRes
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ProcedureRes;

    /**
     * Verifies a ProcedureRes message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ProcedureRes message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ProcedureRes
     */
    public static fromObject(object: { [k: string]: any }): ProcedureRes;

    /**
     * Creates a plain object from a ProcedureRes message. Also converts values to other types if specified.
     * @param message ProcedureRes
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ProcedureRes, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ProcedureRes to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ProcedureRes
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
