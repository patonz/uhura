protoc --rust_out=experimental-codegen=enabled,kernel=cpp:. .\SendMessage.proto

protoc --proto_path=. --rust_out=experimental-codegen=enabled,kernel=cpp:. .\SendMessage.proto