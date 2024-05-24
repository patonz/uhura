mod proto;

use async_nats::Client;
use dotenv::dotenv;
use futures::stream::StreamExt;
use log::{error, info, warn, debug};
use once_cell::sync::Lazy;
use prost::Message as ProstMessage;
use proto::uhura::{Adapter, SendMessageRequest};
use std::env;
use std::sync::Arc;
use std::sync::Mutex;
use tokio::time::{sleep, Duration};
use tokio::signal;

static GLOBAL_ADAPTER: Lazy<Mutex<Option<Arc<Adapter>>>> = Lazy::new(|| Mutex::new(None));

#[tokio::main]
async fn main() -> Result<(), async_nats::Error> {
    dotenv().ok();
    env_logger::init();

    // Use println! to confirm logger initialization
    info!("Logger initialized");

    let nats_url = env::var("NATS_URL").unwrap_or_else(|_| "localhost:4222".to_string());
    let core_id = env::var("ID").unwrap_or_else(|_| "AlphaCore".to_string());
    let log_level = env::var("RUST_LOG").unwrap_or_else(|_| "debug".to_string());

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

    let client_clone = Arc::clone(&client);
    let mut sub_send_message = client.subscribe(send_message_topic.clone()).await?;
    debug!("Listening on: {}", send_message_topic); // Use println! for debugging

    tokio::spawn(async move {
        while let Some(m) = sub_send_message.next().await {
            if let Err(e) = client_clone
                .publish("adaptersNetwork", m.payload.clone())
                .await
            {
                error!("Failed to publish to adaptersNetwork: {:?}", e);
            }
            info!("Received Uhura Message from Core, sending on adaptersNetwork");
        }
        warn!("Subscription closed: {}", send_message_topic);
    });

    let mut sub_adapters_network = client.subscribe("adaptersNetwork").await?;
    debug!("Listening on: adaptersNetwork"); // Use println! for debugging
    let client_clone = Arc::clone(&client);

    tokio::spawn(async move {
        while let Some(m) = sub_adapters_network.next().await {
            match SendMessageRequest::decode(&m.payload[..]) {
                Ok(data_obj) => {
                    if data_obj
                        .sender
                        .as_ref()
                        .map_or(true, |sender| sender.id != core_id)
                    {
                        info!("Received from network: {:?}", data_obj);
                        if let Err(e) = client_clone
                            .publish(
                                format!("{}.receivedMessageAdapter", core_id),
                                m.payload.clone(),
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
