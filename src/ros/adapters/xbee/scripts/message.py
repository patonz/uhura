class Message:
    
# type id_message id_device timestamp
    type = 'default'
    id = 0
    source_id = 0
    source_timestamp = 0
    payload = bytearray(0)




    def __init__(self, type, id, source_id, source_timestamp, payload):
        self.type = type
        self.id = id
        self.source_id = source_id
        self.source_timestamp
        self.payload = payload


    def header_to_string(self):
        return '%s %s %s %s' % (self.type, self.id, self.source_id, self.source_timestamp)


    def payload_to_string(self):
        if isinstance(self.payload, bytearray):
            return self.payload.decode(errors='replace').rstrip('\x00')
        else:
            return '%s' % self.payload

    

