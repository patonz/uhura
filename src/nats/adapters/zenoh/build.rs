use std::env;
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out_dir = env::var("OUT_DIR")?;
    println!("cargo:warning=OUT_DIR = {}", out_dir);


    let proto_root = "../../../common/protos";
    prost_build::compile_protos(&[
        format!("{}/Message.proto", proto_root),
        format!("{}/Adapter.proto", proto_root),
        format!("{}/Node.proto", proto_root),
        format!("{}/SendMessage.proto", proto_root),
    ], &[proto_root])?;
    Ok(())
}