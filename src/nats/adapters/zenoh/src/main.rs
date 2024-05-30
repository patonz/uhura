mod proto;

use dotenv::dotenv;
use futures::stream::StreamExt;
use log::{debug, error, info, warn};
use once_cell::sync::Lazy;
use prost::Message as ProstMessage;
use proto::uhura::{Adapter, SendMessageRequest};
use std::env;
use std::sync::Arc;
use std::sync::Mutex;
use tokio::signal;
use zenoh::buffers::ZBuf;

use zenoh::prelude::config;
use zenoh::prelude::r#async::*;

static GLOBAL_ADAPTER: Lazy<Mutex<Option<Arc<Adapter>>>> = Lazy::new(|| Mutex::new(None));

#[tokio::main]
async fn main() -> Result<(), async_nats::Error> {

    // Use println! to confirm logger initialization
    dotenv().ok();

    let nats_url = env::var("NATS_URL").unwrap_or_else(|_| "localhost:4222".to_string());
    let core_id = env::var("ID").unwrap_or_else(|_| "AlphaCore".to_string());
    let _log_level = env::var("RUST_LOG").unwrap_or_else(|_| "debug".to_string());

    
    env_logger::init();
    info!("Logger initialized");


    let adapter = Adapter {
        id: String::new(),
        name: format!("{}_adapter", core_id),
        r#type: "zenoh".into(),
        link_status: String::new(),
    };

    // Serialize the Adapter object
    let mut buf = Vec::new();
    adapter.encode(&mut buf).expect("Failed to encode adapter");

    // Connect to the local NATS server
    let client = Arc::new(async_nats::connect(&nats_url).await?);

    println!("Connected to NATS server"); // Use println! for debugging

    /*zenoh session connection */
    let session = Arc::new(zenoh::open(config::default()).res().await.unwrap());

    println!("Connected to ZENOH server");

    let response = client
        .request(format!("{}.registerAdapter", core_id), buf.into())
        .await?;
    let replied_adapter = Arc::new(Adapter::decode(&response.payload[..])?);
    debug!("Global Adapter: {:?}", replied_adapter); // Use println! for debugging

    {
        let mut global_adapter = GLOBAL_ADAPTER.lock().unwrap();
        *global_adapter = Some(Arc::clone(&replied_adapter));
    }

    let adapter_id = replied_adapter.id.clone();
    let send_message_topic = format!("{}.{}.sendMessage", core_id, adapter_id);

    let _client_clone = Arc::clone(&client);
    let mut sub_send_message = client.subscribe(send_message_topic.clone()).await?;
    debug!("Listening on: {}", send_message_topic); // Use println! for debugging

    let session_clone = session.clone();
    tokio::spawn(async move {
        while let Some(m) = sub_send_message.next().await {
            let payload_vec: Vec<u8> = m.payload.to_vec();
            if let Err(e) = session_clone
                .put("adaptersNetwork", Value::from(ZBuf::from(payload_vec)))
                .res()
                .await
            {
                error!("Failed to publish to adaptersNetwork: {:?}", e);
            }
            info!("Received Uhura Message from Core, sending on adaptersNetwork");
        }
        warn!("Subscription closed: {}", send_message_topic);
    });

    /* for debugging reason, keep nats connector ready */
    let sub_adapters_network = session
        .declare_subscriber("adaptersNetwork")
        .res()
        .await
        .unwrap();
    debug!("Listening on: adaptersNetwork");

    let client_clone = Arc::clone(&client);
    let core_id_clone = core_id.clone();

    tokio::spawn(async move {
        while let Ok(m) = sub_adapters_network.recv_async().await {
            // Convert the Zenoh payload to Vec<u8>
            let payload_vec: Vec<u8> = m.payload.contiguous().to_vec();

            // Decode the payload as a SendMessageRequest
            match SendMessageRequest::decode(&payload_vec[..]) {
                Ok(data_obj) => {
                    if data_obj
                        .sender
                        .as_ref()
                        .map_or(true, |sender| sender.id != core_id_clone)
                    {
                        info!("Received from network: {:?}", data_obj);

                        // Publish the message data to NATS
                        if let Err(e) = client_clone
                            .publish(
                                format!("{}.receivedMessageAdapter", core_id_clone),
                                payload_vec.clone().into(),
                            )
                            .await
                        {
                            error!("Failed to publish to receivedMessageAdapter: {:?}", e);
                        }
                    }
                }
                Err(e) => error!("Failed to decode SendMessageRequest: {:?}", e),
            }
        }
        warn!("Subscription closed: adaptersNetwork");
    });

    signal::ctrl_c().await.expect("Failed to listen for ctrl_c");
    println!("Terminating...");
    Ok(())
}
