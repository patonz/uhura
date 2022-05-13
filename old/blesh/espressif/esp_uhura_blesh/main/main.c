/* main.c - Application main entry point */

/*
 * Copyright (c) 2018 Espressif Systems (Shanghai) PTE LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

#include <stdio.h>
#include <string.h>

#include "esp_log.h"
#include "nvs_flash.h"

#include "esp_ble_mesh_defs.h"
#include "esp_ble_mesh_common_api.h"
#include "esp_ble_mesh_provisioning_api.h"
#include "esp_ble_mesh_networking_api.h"
#include "esp_ble_mesh_config_model_api.h"
#include "esp_ble_mesh_sensor_model_api.h"
#include "esp_ble_mesh_generic_model_api.h"
#include "esp_bt.h"

#include "ble_mesh_example_init.h"
#include "board.h"

#define TAG "BLESH"

#define CID_ESP             0x02E5

#define MSG_SEND_TTL        3
#define MSG_SEND_REL        false
#define MSG_TIMEOUT         0
#define MSG_ROLE            ROLE_NODE

#define COMP_DATA_PAGE_0    0x00

#define APP_KEY_IDX         0x0000
#define APP_KEY_OCTET       0x12

#define COMP_DATA_1_OCTET(msg, offset)      (msg[offset])
#define COMP_DATA_2_OCTET(msg, offset)      (msg[offset + 1] << 8 | msg[offset])

static uint8_t dev_uuid[ESP_BLE_MESH_OCTET16_LEN];
static uint16_t server_address = 0xFFFF;
//static uint16_t server_address = 0x0005;
static uint16_t sensor_prop_id;

static struct esp_ble_mesh_key {
	uint16_t net_idx;
	uint16_t app_idx;
	uint8_t app_key[ESP_BLE_MESH_OCTET16_LEN];
} prov_key;

struct message_return {
    uint8_t  id;
    int8_t  rssi;
} __attribute__((packed));

static esp_ble_mesh_cfg_srv_t config_server = { .relay =
ESP_BLE_MESH_RELAY_ENABLED, .beacon = ESP_BLE_MESH_BEACON_ENABLED,
#if defined(CONFIG_BLE_MESH_FRIEND)
    .friend_state = ESP_BLE_MESH_FRIEND_ENABLED,
#else
		.friend_state = ESP_BLE_MESH_FRIEND_NOT_SUPPORTED,
#endif
#if defined(CONFIG_BLE_MESH_GATT_PROXY_SERVER)
		.gatt_proxy = ESP_BLE_MESH_GATT_PROXY_ENABLED,
#else
    .gatt_proxy = ESP_BLE_MESH_GATT_PROXY_NOT_SUPPORTED,
#endif
		.default_ttl = 7,
		/* 3 transmissions with 20ms interval */
		.net_transmit = ESP_BLE_MESH_TRANSMIT(0, 20), .relay_retransmit = ESP_BLE_MESH_TRANSMIT(0, 20), };

static uint8_t message_buff[128];
NET_BUF_SIMPLE_DEFINE_STATIC(message_data, 128);
//static esp_ble_mesh_client_t config_client;
static esp_ble_mesh_client_t sensor_client;
ESP_BLE_MESH_MODEL_PUB_DEFINE(sensor_cli_pub, 2 + 1, ROLE_NODE);

static esp_ble_mesh_client_t level_client;
ESP_BLE_MESH_MODEL_PUB_DEFINE(level_cli_pub, 2 + 1, ROLE_NODE);

static esp_ble_mesh_model_t root_models[] = {
ESP_BLE_MESH_MODEL_CFG_SRV(&config_server),
ESP_BLE_MESH_MODEL_SENSOR_CLI(&sensor_cli_pub, &sensor_client),
ESP_BLE_MESH_MODEL_GEN_LEVEL_CLI(&level_cli_pub, &level_client), };

static esp_ble_mesh_elem_t elements[] = {
ESP_BLE_MESH_ELEMENT(0, root_models, ESP_BLE_MESH_MODEL_NONE), };

static esp_ble_mesh_comp_t composition =
		{ .cid = CID_ESP, .elements = elements, .element_count = ARRAY_SIZE(elements), };

static esp_ble_mesh_prov_t provision = { .uuid = dev_uuid,
#if 0
    .output_size = 4,
    .output_actions = ESP_BLE_MESH_DISPLAY_NUMBER,
    .input_actions = ESP_BLE_MESH_PUSH,
    .input_size = 4,
#else
		.output_size = 0, .output_actions = 0,
#endif
		};

static void example_ble_mesh_set_msg_common(esp_ble_mesh_client_common_param_t *common, esp_ble_mesh_model_t *model,
		uint32_t opcode, uint8_t ttl, uint16_t addr) {

	ESP_LOGI("COMMON", "opcode 0x%04x", opcode);
	ESP_LOGI("COMMON", "model_id 0x%04x", sensor_client.model->model_id);
	ESP_LOGI("COMMON", "store.net_idx 0x%04x", prov_key.net_idx);
	ESP_LOGI("COMMON", "store.app_idx 0x%04x", prov_key.app_idx);
	ESP_LOGI("COMMON", "addr 0x%04x", server_address);
	ESP_LOGI("COMMON", "ttl %d", ttl);
	common->opcode = opcode;
	common->model = model;
	common->ctx.net_idx = prov_key.net_idx;
	common->ctx.app_idx = prov_key.app_idx;
	common->ctx.addr = server_address;
	//common->ctx.send_ttl = MSG_SEND_TTL;
	common->ctx.send_ttl = ttl;
	common->ctx.send_rel = MSG_SEND_REL;
	common->msg_timeout = MSG_TIMEOUT;
	common->msg_role = MSG_ROLE;

}

static void prov_complete(uint16_t node_index, uint16_t primary_addr, uint8_t element_num, uint16_t net_idx) {
	ESP_LOGI(TAG, "net_idx: 0x%04x, addr: 0x%04x", node_index, primary_addr);
	ESP_LOGI(TAG, "flags: 0x%02x, iv_index: 0x%08x", element_num, net_idx);
	prov_key.net_idx = net_idx;
}

static void example_ble_mesh_provisioning_cb(esp_ble_mesh_prov_cb_event_t event, esp_ble_mesh_prov_cb_param_t *param) {
	switch (event) {
	case ESP_BLE_MESH_PROV_REGISTER_COMP_EVT:
		ESP_LOGI(TAG, "ESP_BLE_MESH_PROV_REGISTER_COMP_EVT, err_code %d", param->prov_register_comp.err_code);
		//mesh_example_info_restore(); /* Restore proper mesh example info */
		break;
	case ESP_BLE_MESH_NODE_PROV_ENABLE_COMP_EVT:
		ESP_LOGI(TAG, "ESP_BLE_MESH_NODE_PROV_ENABLE_COMP_EVT, err_code %d", param->node_prov_enable_comp.err_code);
		break;
	case ESP_BLE_MESH_NODE_PROV_LINK_OPEN_EVT:
		ESP_LOGI(TAG, "ESP_BLE_MESH_NODE_PROV_LINK_OPEN_EVT, bearer %s",
				param->node_prov_link_open.bearer == ESP_BLE_MESH_PROV_ADV ? "PB-ADV" : "PB-GATT");
		break;
	case ESP_BLE_MESH_NODE_PROV_LINK_CLOSE_EVT:
		ESP_LOGI(TAG, "ESP_BLE_MESH_NODE_PROV_LINK_CLOSE_EVT, bearer %s",
				param->node_prov_link_close.bearer == ESP_BLE_MESH_PROV_ADV ? "PB-ADV" : "PB-GATT");
		break;
	case ESP_BLE_MESH_NODE_PROV_COMPLETE_EVT:
		ESP_LOGI(TAG, "ESP_BLE_MESH_NODE_PROV_COMPLETE_EVT");
		prov_complete(param->node_prov_complete.net_idx, param->node_prov_complete.addr,
				param->node_prov_complete.flags, param->node_prov_complete.iv_index);
		break;
	case ESP_BLE_MESH_NODE_PROV_RESET_EVT:
		break;
	case ESP_BLE_MESH_NODE_SET_UNPROV_DEV_NAME_COMP_EVT:
		ESP_LOGI(TAG, "ESP_BLE_MESH_NODE_SET_UNPROV_DEV_NAME_COMP_EVT, err_code %d",
				param->node_set_unprov_dev_name_comp.err_code);
		break;
	default:
		break;
	}
}

void example_ble_mesh_send_sensor_message(uint16_t addr,uint32_t opcode, uint32_t ttl, uint32_t id) {
	static bool isGet = true;
	static esp_ble_mesh_sensor_client_get_state_t get = { 0 };
	static esp_ble_mesh_generic_client_set_state_t set = { 0 };
	static esp_ble_mesh_client_common_param_t common = { 0 };
	static esp_err_t err = ESP_OK;

	/*node = esp_ble_mesh_provisioner_get_node_with_addr(server_address);
	 if (node == NULL) {
	 ESP_LOGE(TAG, "Node 0x%04x not exists", server_address);
	 return;
	 }*/

	example_ble_mesh_set_msg_common(&common, sensor_client.model, opcode, ttl, addr);

	switch (opcode) {
	case ESP_BLE_MESH_MODEL_OP_SENSOR_CADENCE_GET:
		get.cadence_get.property_id = sensor_prop_id;

		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTINGS_GET:
		get.settings_get.sensor_property_id = sensor_prop_id;
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_SERIES_GET:
		get.series_get.property_id = sensor_prop_id;
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTING_SET_UNACK:
		/*set.setting_set.sensor_setting_property_id = sensor_prop_id;
		 set.setting_set.sensor_property_id = sensor_prop_id;

		 //len = dalla seriale come arg 2 = 65k
		 net_buf_simple_reset(&message_data);
		 memset(message_buff, 0, sizeof(message_buff));

		 memcpy(message_buff, &id, sizeof(id));
		 net_buf_simple_add_mem(&message_data, message_buff, 4);
		 set.setting_set.sensor_setting_raw = &message_data;
		 isGet = false;*/
		break;
	case ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_SET_UNACK:
		set.level_set.op_en = false;
		set.level_set.level = id;
		set.level_set.tid = 1;
		isGet = false;
		break;
	default:
		break;
	}

	if (isGet == true) {
		err = esp_ble_mesh_sensor_client_get_state(&common, &get);
		if (err != ESP_OK) {
			ESP_LOGE(TAG, "Failed to send sensor message 0x%04x", opcode);
		} else {
			ESP_LOGI("PACKET_SENT", "%d %lld", -1, esp_timer_get_time());
		}
	} else {

		//err = esp_ble_mesh_sensor_client_set_state(&common, &set);
		err = esp_ble_mesh_generic_client_set_state(&common, &set);
		if (err != ESP_OK) {
			ESP_LOGE(TAG, "Failed to send sensor message 0x%04x", opcode);
		} else {
			ESP_LOGI("PACKET_SENT", "%u %lld", id, esp_timer_get_time());
		}
	}

}

static void example_ble_mesh_sensor_timeout(uint32_t opcode) {
	switch (opcode) {
	case ESP_BLE_MESH_MODEL_OP_SENSOR_DESCRIPTOR_GET:
		ESP_LOGW(TAG, "Sensor Descriptor Get timeout, opcode 0x%04x", opcode);
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_CADENCE_GET:
		ESP_LOGW(TAG, "Sensor Cadence Get timeout, opcode 0x%04x", opcode);
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_CADENCE_SET:
		ESP_LOGW(TAG, "Sensor Cadence Set timeout, opcode 0x%04x", opcode);
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTINGS_GET:
		ESP_LOGW(TAG, "Sensor Settings Get timeout, opcode 0x%04x", opcode);
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTING_GET:
		ESP_LOGW(TAG, "Sensor Setting Get timeout, opcode 0x%04x", opcode);
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTING_SET:
		ESP_LOGW(TAG, "Sensor Setting Set timeout, opcode 0x%04x", opcode);
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_GET:
		ESP_LOGW(TAG, "Sensor Get timeout 0x%04x", opcode);
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_COLUMN_GET:
		ESP_LOGW(TAG, "Sensor Column Get timeout, opcode 0x%04x", opcode);
		break;
	case ESP_BLE_MESH_MODEL_OP_SENSOR_SERIES_GET:
		ESP_LOGW(TAG, "Sensor Series Get timeout, opcode 0x%04x", opcode);
		break;
	default:
		ESP_LOGE(TAG, "Unknown Sensor Get/Set opcode 0x%04x", opcode);
		return;
	}

	example_ble_mesh_send_sensor_message(0xFFF,opcode, 3, 0);
}

static void example_ble_mesh_sensor_client_cb(esp_ble_mesh_sensor_client_cb_event_t event,
		esp_ble_mesh_sensor_client_cb_param_t *param) {
	esp_ble_mesh_node_t *node = NULL;

	ESP_LOGI(TAG, "Sensor client, event %u, addr 0x%04x", event, param->params->ctx.addr);

	if (param->error_code) {
		ESP_LOGE(TAG, "Send sensor client message failed (err %d)", param->error_code);
		return;
	}

	/* node = esp_ble_mesh_provisioner_get_node_with_addr(param->params->ctx.addr);
	 if (!node) {
	 ESP_LOGE(TAG, "Node 0x%04x not exists", param->params->ctx.addr);
	 return;
	 }*/

	switch (event) {
	case ESP_BLE_MESH_SENSOR_CLIENT_GET_STATE_EVT:
		switch (param->params->opcode) {
		case ESP_BLE_MESH_MODEL_OP_SENSOR_DESCRIPTOR_GET:
			ESP_LOGI("PACKET_RECEIVED", "%d %lld", -1, esp_timer_get_time());
			ESP_LOGI(TAG, "Sensor Descriptor Status, opcode 0x%04x", param->params->ctx.recv_op);
			if (param->status_cb.descriptor_status.descriptor->len != ESP_BLE_MESH_SENSOR_SETTING_PROPERTY_ID_LEN
					&& param->status_cb.descriptor_status.descriptor->len % ESP_BLE_MESH_SENSOR_DESCRIPTOR_LEN) {
				ESP_LOGE(TAG, "Invalid Sensor Descriptor Status length %d",
						param->status_cb.descriptor_status.descriptor->len);
				return;
			}
			if (param->status_cb.descriptor_status.descriptor->len) {
				ESP_LOG_BUFFER_HEX("Sensor Descriptor", param->status_cb.descriptor_status.descriptor->data,
						param->status_cb.descriptor_status.descriptor->len);
				/* If running with sensor server example, sensor client can get two Sensor Property IDs.
				 * Currently we use the first Sensor Property ID for the following demonstration.
				 */
				sensor_prop_id = param->status_cb.descriptor_status.descriptor->data[1] << 8
						| param->status_cb.descriptor_status.descriptor->data[0];
			}
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_CADENCE_GET:
			ESP_LOGI(TAG, "Sensor Cadence Status, opcode 0x%04x, Sensor Property ID 0x%04x", param->params->ctx.recv_op,
					param->status_cb.cadence_status.property_id);
			ESP_LOG_BUFFER_HEX("Sensor Cadence", param->status_cb.cadence_status.sensor_cadence_value->data,
					param->status_cb.cadence_status.sensor_cadence_value->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTINGS_GET:
			ESP_LOGI(TAG, "Sensor Settings Status, opcode 0x%04x, Sensor Property ID 0x%04x",
					param->params->ctx.recv_op, param->status_cb.settings_status.sensor_property_id);
			ESP_LOG_BUFFER_HEX("Sensor Settings", param->status_cb.settings_status.sensor_setting_property_ids->data,
					param->status_cb.settings_status.sensor_setting_property_ids->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTING_GET:
			ESP_LOGI(TAG,
					"Sensor Setting Status, opcode 0x%04x, Sensor Property ID 0x%04x, Sensor Setting Property ID 0x%04x",
					param->params->ctx.recv_op, param->status_cb.setting_status.sensor_property_id,
					param->status_cb.setting_status.sensor_setting_property_id);
			if (param->status_cb.setting_status.op_en) {
				ESP_LOGI(TAG, "Sensor Setting Access 0x%02x", param->status_cb.setting_status.sensor_setting_access);
				ESP_LOG_BUFFER_HEX("Sensor Setting Raw", param->status_cb.setting_status.sensor_setting_raw->data,
						param->status_cb.setting_status.sensor_setting_raw->len);
			}
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_GET:
			ESP_LOGI(TAG, "Sensor Status, opcode 0x%04x", param->params->ctx.recv_op);
			if (param->status_cb.sensor_status.marshalled_sensor_data->len) {
				ESP_LOG_BUFFER_HEX("Sensor Data", param->status_cb.sensor_status.marshalled_sensor_data->data,
						param->status_cb.sensor_status.marshalled_sensor_data->len);
				uint8_t *data = param->status_cb.sensor_status.marshalled_sensor_data->data;
				uint16_t length = 0;
				for (; length < param->status_cb.sensor_status.marshalled_sensor_data->len;) {
					uint8_t fmt = ESP_BLE_MESH_GET_SENSOR_DATA_FORMAT(data);
					uint8_t data_len = ESP_BLE_MESH_GET_SENSOR_DATA_LENGTH(data, fmt);
					uint16_t prop_id = ESP_BLE_MESH_GET_SENSOR_DATA_PROPERTY_ID(data, fmt);
					uint8_t mpid_len = (
							fmt == ESP_BLE_MESH_SENSOR_DATA_FORMAT_A ?
							ESP_BLE_MESH_SENSOR_DATA_FORMAT_A_MPID_LEN :
																		ESP_BLE_MESH_SENSOR_DATA_FORMAT_B_MPID_LEN);
					ESP_LOGI(TAG, "Format %s, length 0x%02x, Sensor Property ID 0x%04x",
							fmt == ESP_BLE_MESH_SENSOR_DATA_FORMAT_A ? "A" : "B", data_len, prop_id);
					if (data_len != ESP_BLE_MESH_SENSOR_DATA_ZERO_LEN) {
						ESP_LOG_BUFFER_HEX("Sensor Data", data + mpid_len, data_len + 1);
						length += mpid_len + data_len + 1;
						data += mpid_len + data_len + 1;
					} else {
						length += mpid_len;
						data += mpid_len;
					}
				}
			}
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_COLUMN_GET:
			ESP_LOGI(TAG, "Sensor Column Status, opcode 0x%04x, Sensor Property ID 0x%04x", param->params->ctx.recv_op,
					param->status_cb.column_status.property_id);
			ESP_LOG_BUFFER_HEX("Sensor Column", param->status_cb.column_status.sensor_column_value->data,
					param->status_cb.column_status.sensor_column_value->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SERIES_GET:
			ESP_LOGI(TAG, "Sensor Series Status, opcode 0x%04x, Sensor Property ID 0x%04x", param->params->ctx.recv_op,
					param->status_cb.series_status.property_id);
			ESP_LOG_BUFFER_HEX("Sensor Series", param->status_cb.series_status.sensor_series_value->data,
					param->status_cb.series_status.sensor_series_value->len);
			break;
		default:
			ESP_LOGE(TAG, "Unknown Sensor Get opcode 0x%04x", param->params->ctx.recv_op);
			break;
		}
		break;
	case ESP_BLE_MESH_SENSOR_CLIENT_SET_STATE_EVT:
		switch (param->params->opcode) {
		case ESP_BLE_MESH_MODEL_OP_SENSOR_CADENCE_SET:
			ESP_LOGI(TAG, "Sensor Cadence Status, opcode 0x%04x, Sensor Property ID 0x%04x", param->params->ctx.recv_op,
					param->status_cb.cadence_status.property_id);
			ESP_LOG_BUFFER_HEX("Sensor Cadence", param->status_cb.cadence_status.sensor_cadence_value->data,
					param->status_cb.cadence_status.sensor_cadence_value->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTING_SET:
			ESP_LOGI(TAG,
					"Sensor Setting Status, opcode 0x%04x, Sensor Property ID 0x%04x, Sensor Setting Property ID 0x%04x",
					param->params->ctx.recv_op, param->status_cb.setting_status.sensor_property_id,
					param->status_cb.setting_status.sensor_setting_property_id);
			if (param->status_cb.setting_status.op_en) {
				ESP_LOGI(TAG, "Sensor Setting Access 0x%02x", param->status_cb.setting_status.sensor_setting_access);
				ESP_LOG_BUFFER_HEX("Sensor Setting Raw", param->status_cb.setting_status.sensor_setting_raw->data,
						param->status_cb.setting_status.sensor_setting_raw->len);
			}
			break;
		default:
			ESP_LOGE(TAG, "Unknown Sensor Set opcode 0x%04x", param->params->ctx.recv_op);
			break;
		}
		break;
	case ESP_BLE_MESH_SENSOR_CLIENT_PUBLISH_EVT:

		switch (param->params->opcode) {
		case ESP_BLE_MESH_MODEL_OP_SENSOR_DESCRIPTOR_GET:
			ESP_LOGI("PACKET_RECEIVED", "%d %lld", -1, esp_timer_get_time());
			ESP_LOGI(TAG, "Sensor Descriptor Status, opcode 0x%04x", param->params->ctx.recv_op);
			if (param->status_cb.descriptor_status.descriptor->len != ESP_BLE_MESH_SENSOR_SETTING_PROPERTY_ID_LEN
					&& param->status_cb.descriptor_status.descriptor->len % ESP_BLE_MESH_SENSOR_DESCRIPTOR_LEN) {
				ESP_LOGE(TAG, "Invalid Sensor Descriptor Status length %d",
						param->status_cb.descriptor_status.descriptor->len);
				return;
			}
			if (param->status_cb.descriptor_status.descriptor->len) {
				ESP_LOG_BUFFER_HEX("Sensor Descriptor", param->status_cb.descriptor_status.descriptor->data,
						param->status_cb.descriptor_status.descriptor->len);
				// If running with sensor server example, sensor client can get two Sensor Property IDs.
				// Currently we use the first Sensor Property ID for the following demonstration.

				sensor_prop_id = param->status_cb.descriptor_status.descriptor->data[1] << 8
						| param->status_cb.descriptor_status.descriptor->data[0];
			}
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_CADENCE_GET:
			ESP_LOGI(TAG, "Sensor Cadence Status, opcode 0x%04x, Sensor Property ID 0x%04x", param->params->ctx.recv_op,
					param->status_cb.cadence_status.property_id);
			ESP_LOG_BUFFER_HEX("Sensor Cadence", param->status_cb.cadence_status.sensor_cadence_value->data,
					param->status_cb.cadence_status.sensor_cadence_value->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTINGS_GET:
			ESP_LOGI(TAG, "Sensor Settings Status, opcode 0x%04x, Sensor Property ID 0x%04x",
					param->params->ctx.recv_op, param->status_cb.settings_status.sensor_property_id);
			ESP_LOG_BUFFER_HEX("Sensor Settings", param->status_cb.settings_status.sensor_setting_property_ids->data,
					param->status_cb.settings_status.sensor_setting_property_ids->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTING_GET:
			ESP_LOGI(TAG,
					"Sensor Setting Status, opcode 0x%04x, Sensor Property ID 0x%04x, Sensor Setting Property ID 0x%04x",
					param->params->ctx.recv_op, param->status_cb.setting_status.sensor_property_id,
					param->status_cb.setting_status.sensor_setting_property_id);
			if (param->status_cb.setting_status.op_en) {
				ESP_LOGI(TAG, "Sensor Setting Access 0x%02x", param->status_cb.setting_status.sensor_setting_access);
				ESP_LOG_BUFFER_HEX("Sensor Setting Raw", param->status_cb.setting_status.sensor_setting_raw->data,
						param->status_cb.setting_status.sensor_setting_raw->len);
			}
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_GET:
			ESP_LOGI(TAG, "Sensor Status, opcode 0x%04x", param->params->ctx.recv_op);
			if (param->status_cb.sensor_status.marshalled_sensor_data->len) {
				ESP_LOG_BUFFER_HEX("Sensor Data", param->status_cb.sensor_status.marshalled_sensor_data->data,
						param->status_cb.sensor_status.marshalled_sensor_data->len);
				uint8_t *data = param->status_cb.sensor_status.marshalled_sensor_data->data;
				uint16_t length = 0;
				for (; length < param->status_cb.sensor_status.marshalled_sensor_data->len;) {
					uint8_t fmt = ESP_BLE_MESH_GET_SENSOR_DATA_FORMAT(data);
					uint8_t data_len = ESP_BLE_MESH_GET_SENSOR_DATA_LENGTH(data, fmt);
					uint16_t prop_id = ESP_BLE_MESH_GET_SENSOR_DATA_PROPERTY_ID(data, fmt);
					uint8_t mpid_len = (
							fmt == ESP_BLE_MESH_SENSOR_DATA_FORMAT_A ?
							ESP_BLE_MESH_SENSOR_DATA_FORMAT_A_MPID_LEN :
																		ESP_BLE_MESH_SENSOR_DATA_FORMAT_B_MPID_LEN);
					ESP_LOGI(TAG, "Format %s, length 0x%02x, Sensor Property ID 0x%04x",
							fmt == ESP_BLE_MESH_SENSOR_DATA_FORMAT_A ? "A" : "B", data_len, prop_id);
					if (data_len != ESP_BLE_MESH_SENSOR_DATA_ZERO_LEN) {
						ESP_LOG_BUFFER_HEX("Sensor Data", data + mpid_len, data_len + 1);
						length += mpid_len + data_len + 1;
						data += mpid_len + data_len + 1;

					} else {
						length += mpid_len;
						data += mpid_len;
					}
				}
			}
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_COLUMN_GET:
			ESP_LOGI(TAG, "Sensor Column Status, opcode 0x%04x, Sensor Property ID 0x%04x", param->params->ctx.recv_op,
					param->status_cb.column_status.property_id);
			ESP_LOG_BUFFER_HEX("Sensor Column", param->status_cb.column_status.sensor_column_value->data,
					param->status_cb.column_status.sensor_column_value->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SERIES_GET:
			ESP_LOGI(TAG, "Sensor Series Status, opcode 0x%04x, Sensor Property ID 0x%04x", param->params->ctx.recv_op,
					param->status_cb.series_status.property_id);
			ESP_LOG_BUFFER_HEX("Sensor Series", param->status_cb.series_status.sensor_series_value->data,
					param->status_cb.series_status.sensor_series_value->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_STATUS:
			ESP_LOGI(TAG, "Sensor Status, opcode 0x%04x", param->params->ctx.recv_op);
			if (param->status_cb.sensor_status.marshalled_sensor_data->len) {
				ESP_LOG_BUFFER_HEX("Sensor Data", param->status_cb.sensor_status.marshalled_sensor_data->data,
						param->status_cb.sensor_status.marshalled_sensor_data->len);
				uint8_t *data = param->status_cb.sensor_status.marshalled_sensor_data->data;
				uint16_t length = 0;
				for (; length < param->status_cb.sensor_status.marshalled_sensor_data->len;) {
					uint8_t fmt = ESP_BLE_MESH_GET_SENSOR_DATA_FORMAT(data);
					uint8_t data_len = ESP_BLE_MESH_GET_SENSOR_DATA_LENGTH(data, fmt);
					uint16_t prop_id = ESP_BLE_MESH_GET_SENSOR_DATA_PROPERTY_ID(data, fmt);
					uint8_t mpid_len = (
							fmt == ESP_BLE_MESH_SENSOR_DATA_FORMAT_A ?
							ESP_BLE_MESH_SENSOR_DATA_FORMAT_A_MPID_LEN :
																		ESP_BLE_MESH_SENSOR_DATA_FORMAT_B_MPID_LEN);
					ESP_LOGI(TAG, "Format %s, length 0x%02x, Sensor Property ID 0x%04x",
							fmt == ESP_BLE_MESH_SENSOR_DATA_FORMAT_A ? "A" : "B", data_len, prop_id);
					if (data_len != ESP_BLE_MESH_SENSOR_DATA_ZERO_LEN) {
						ESP_LOG_BUFFER_HEX("Sensor Data", data + mpid_len, data_len + 1);
						length += mpid_len + data_len + 1;
						data += mpid_len + data_len + 1;
					} else {
						length += mpid_len;
						data += mpid_len;
					}
				}
			}
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_DESCRIPTOR_STATUS:
			ESP_LOGI("PACKET_RECEIVED", "%d %lld", -1, esp_timer_get_time());
			ESP_LOGI(TAG, "Sensor Descriptor Status, opcode 0x%04x", param->params->ctx.recv_op);
			if (param->status_cb.descriptor_status.descriptor->len != ESP_BLE_MESH_SENSOR_SETTING_PROPERTY_ID_LEN
					&& param->status_cb.descriptor_status.descriptor->len % ESP_BLE_MESH_SENSOR_DESCRIPTOR_LEN) {
				ESP_LOGE(TAG, "Invalid Sensor Descriptor Status length %d",
						param->status_cb.descriptor_status.descriptor->len);
				return;
			}
			if (param->status_cb.descriptor_status.descriptor->len) {
				ESP_LOG_BUFFER_HEX("Sensor Descriptor", param->status_cb.descriptor_status.descriptor->data,
						param->status_cb.descriptor_status.descriptor->len);
				// If running with sensor server example, sensor client can get two Sensor Property IDs.
				// Currently we use the first Sensor Property ID for the following demonstration.

				sensor_prop_id = param->status_cb.descriptor_status.descriptor->data[1] << 8
						| param->status_cb.descriptor_status.descriptor->data[0];
			}
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SERIES_STATUS:
			ESP_LOGI(TAG, "Sensor Series Status, opcode 0x%04x, Sensor Property ID 0x%04x", param->params->ctx.recv_op,
					param->status_cb.series_status.property_id);
			ESP_LOG_BUFFER_HEX("Sensor Series", param->status_cb.series_status.sensor_series_value->data,
					param->status_cb.series_status.sensor_series_value->len);
			break;
		case ESP_BLE_MESH_MODEL_OP_SENSOR_SETTINGS_STATUS:
			ESP_LOGI("BLESH", "Sensor Setting Status, opcode 0x%04x, Sensor Property ID 0x%04x",
					param->params->ctx.recv_op, param->status_cb.settings_status.sensor_property_id);
			ESP_LOGI("LEN", "%d", param->status_cb.settings_status.sensor_setting_property_ids->len);
			ESP_LOG_BUFFER_HEX("Sensor Series", param->status_cb.settings_status.sensor_setting_property_ids->data,
					param->status_cb.settings_status.sensor_setting_property_ids->len);
			uint32_t id_rcv = *((uint32_t*) param->status_cb.settings_status.sensor_setting_property_ids->data);
			int rssi_rcv = *((int8_t*) (param->status_cb.settings_status.sensor_setting_property_ids->data + 4));
			ESP_LOGI("PACKET_RECEIVED", "%u %d %lld", id_rcv, rssi_rcv, esp_timer_get_time());
			break;

		default:
			ESP_LOGE(TAG, "Unknown Sensor Get opcode 0x%04x", param->params->ctx.recv_op);
			break;
		}
		break;
	case ESP_BLE_MESH_SENSOR_CLIENT_TIMEOUT_EVT:
		example_ble_mesh_sensor_timeout(param->params->opcode);
		break;
	default:
		ESP_LOGW(TAG, "Event not Handled on switch case");
		break;
	}
}

static void example_ble_mesh_generic_client_cb(esp_ble_mesh_generic_client_cb_event_t event,
		esp_ble_mesh_generic_client_cb_param_t *param) {

	ESP_LOGI(TAG, "Level client, event %u, addr 0x%04x", event, param->params->ctx.addr);
	switch (event) {
	case ESP_BLE_MESH_GENERIC_CLIENT_GET_STATE_EVT:
		if (param->params->opcode == ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_GET) {
			ESP_LOGI("MessaggioRicevuto", "LEVEL_GET, level %d receive_ttl: %d",
					param->status_cb.level_status.present_level, param->params->ctx.recv_ttl);

			struct message_return *data = (struct message_return *) &param->status_cb.level_status.present_level;


			ESP_LOGI("ID", "%d", data->id);
			ESP_LOGI("rssi", "%d", data->rssi);
			ESP_LOGI("PACKET_RECEIVED", "%u %d %lld 0x%04x", data->id,data->rssi, esp_timer_get_time(), param->params->ctx.addr);

		}
		ESP_LOGI(TAG, "--- GET_STATE_EVT");
		break;
	case ESP_BLE_MESH_GENERIC_CLIENT_SET_STATE_EVT: {
		ESP_LOGI("BLESH", "Sensor Setting Status, opcode 0x%04x,  present_level 0x%04x", param->params->ctx.recv_op,
				param->status_cb.level_status.present_level);
		break;
	}
	case ESP_BLE_MESH_GENERIC_CLIENT_PUBLISH_EVT: {
		ESP_LOGI("BLESH", "EVENT ESP_BLE_MESH_GENERIC_CLIENT_PUBLISH_EVT");
		if (param->params->opcode == ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_STATUS) {
			ESP_LOGI("remain_time", "%d", param->status_cb.level_status.remain_time);
			ESP_LOGI("op_en", "%d", param->status_cb.level_status.op_en);
			ESP_LOGI("present_level", "%d", param->status_cb.level_status.present_level);
			ESP_LOGI("target_level", "%d", param->status_cb.level_status.target_level);
			ESP_LOGI("MessaggioRicevuto", "ID: level %d rssi %d receive_ttl: %d",
					param->status_cb.level_status.present_level, param->status_cb.level_status.target_level,
					param->params->ctx.recv_ttl);

			struct message_return *data = (struct message_return *) &param->status_cb.level_status.present_level;


			ESP_LOGI("ID", "%d", data->id);
			ESP_LOGI("rssi", "%d", data->rssi);
			ESP_LOGI("PACKET_RECEIVED", "%u %d %lld 0x%04x", data->id,data->rssi, esp_timer_get_time(), param->params->ctx.addr);


		}
		break;
	}
	case ESP_BLE_MESH_GENERIC_CLIENT_TIMEOUT_EVT:
		/* If failed to receive the responses, these messages will be resend */
		//ESP_LOGI(TAG, "--- ESP_BLE_MESH_GENERIC_CLIENT_TIMEOUT_EVT");
		if (param->params->opcode == ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_SET) {
			/* If failed to get the response of Generic Level Set, resend Generic Level Set  */
			ESP_LOGE(TAG, "--- TIMEOUT_EVT");
		}
		break;
	default:
		ESP_LOGI(TAG, "--- DEFAULT opcode is 0x%x", param->params->opcode);
		break;
	case ESP_BLE_MESH_GENERIC_CLIENT_EVT_MAX:
		break;
	}
	ESP_LOGW(TAG, "%s: event is %d, error code is %d, addr: 0x%04x opcode is 0x%x", __func__, event, param->error_code,
			param->params->ctx.addr, param->params->opcode);
}
;

static void example_ble_mesh_config_server_cb(esp_ble_mesh_cfg_server_cb_event_t event,
		esp_ble_mesh_cfg_server_cb_param_t *param) {

	if (event == ESP_BLE_MESH_CFG_SERVER_STATE_CHANGE_EVT) {
		switch (param->ctx.recv_op) {
		case ESP_BLE_MESH_MODEL_OP_APP_KEY_ADD:
			ESP_LOGI(TAG, "ESP_BLE_MESH_MODEL_OP_APP_KEY_ADD");
			ESP_LOGI(TAG, "net_idx 0x%04x, app_idx 0x%04x", param->value.state_change.appkey_add.net_idx,
					param->value.state_change.appkey_add.app_idx);
			ESP_LOG_BUFFER_HEX("AppKey", param->value.state_change.appkey_add.app_key, 16);
			break;
		case ESP_BLE_MESH_MODEL_OP_MODEL_APP_BIND:
			ESP_LOGI(TAG, "ESP_BLE_MESH_MODEL_OP_MODEL_APP_BIND");
			ESP_LOGI(TAG, "elem_addr 0x%04x, app_idx 0x%04x, cid 0x%04x, mod_id 0x%04x",
					param->value.state_change.mod_app_bind.element_addr, param->value.state_change.mod_app_bind.app_idx,
					param->value.state_change.mod_app_bind.company_id, param->value.state_change.mod_app_bind.model_id);
			if (param->value.state_change.mod_app_bind.company_id == 0xFFFF&&
			param->value.state_change.mod_app_bind.model_id == ESP_BLE_MESH_MODEL_ID_GEN_LEVEL_CLI) {
				prov_key.app_idx = param->value.state_change.mod_app_bind.app_idx;
			}
			break;
		default:
			break;
		}
	}
}

static esp_err_t ble_mesh_init(void) {
	uint8_t match[2] = { 0x32, 0x10 };
	esp_err_t err = ESP_OK;

	//prov_key.net_idx = ESP_BLE_MESH_KEY_PRIMARY;
	//prov_key.app_idx = APP_KEY_IDX;
	//memset(prov_key.app_key, APP_KEY_OCTET, sizeof(prov_key.app_key));

	esp_ble_mesh_register_prov_callback(example_ble_mesh_provisioning_cb);
	esp_ble_mesh_register_config_server_callback(example_ble_mesh_config_server_cb);
	esp_ble_mesh_register_generic_client_callback(example_ble_mesh_generic_client_cb);
	esp_ble_mesh_register_sensor_client_callback(example_ble_mesh_sensor_client_cb);

	err = esp_ble_mesh_init(&provision, &composition);
	if (err != ESP_OK) {
		ESP_LOGE(TAG, "Failed to initialize mesh stack");
		return err;
	}

	/*err = esp_ble_mesh_provisioner_set_dev_uuid_match(match, sizeof(match), 0x0, false);
	 if (err != ESP_OK) {
	 ESP_LOGE(TAG, "Failed to set matching device uuid");
	 return err;
	 }

	 err = esp_ble_mesh_provisioner_prov_enable(ESP_BLE_MESH_PROV_ADV | ESP_BLE_MESH_PROV_GATT);
	 if (err != ESP_OK) {
	 ESP_LOGE(TAG, "Failed to enable mesh provisioner");
	 return err;
	 }*/

	err = esp_ble_mesh_node_prov_enable(ESP_BLE_MESH_PROV_ADV | ESP_BLE_MESH_PROV_GATT);
	if (err != ESP_OK) {
		ESP_LOGE(TAG, "Failed to enable mesh node (err %d)", err);
		return err;
	}

	/*err = esp_ble_mesh_provisioner_add_local_app_key(prov_key.app_key, prov_key.net_idx, prov_key.app_idx);
	 if (err != ESP_OK) {
	 ESP_LOGE(TAG, "Failed to add local AppKey");
	 return err;
	 }*/

	//ESP_LOGI(TAG, "BLE Mesh sensor client initialized");
	ESP_LOGI(TAG, "BLE Mesh Node initialized");

	return ESP_OK;
}

void app_main(void) {
	esp_err_t err = ESP_OK;

	ESP_LOGI(TAG, "Initializing...");

	err = nvs_flash_init();
	if (err == ESP_ERR_NVS_NO_FREE_PAGES) {
		ESP_ERROR_CHECK(nvs_flash_erase());
		err = nvs_flash_init();
	}
	ESP_ERROR_CHECK(err);

	board_init();



	err = bluetooth_init();
	if (err != ESP_OK) {
		ESP_LOGE(TAG, "esp32_bluetooth_init failed (err %d)", err);
		return;
	}


	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_DEFAULT, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_CONN_HDL0, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_CONN_HDL1, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_CONN_HDL2, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_CONN_HDL3, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_CONN_HDL4, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_CONN_HDL5, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_CONN_HDL6, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_CONN_HDL8, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_ADV, ESP_PWR_LVL_N12);
	esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_SCAN, ESP_PWR_LVL_N12);


	/* Open nvs namespace for storing/restoring mesh example info */

	ble_mesh_get_dev_uuid(dev_uuid);

	/* Initialize the Bluetooth Mesh Subsystem */
	err = ble_mesh_init();
	if (err != ESP_OK) {
		ESP_LOGE(TAG, "Bluetooth mesh init failed (err %d)", err);
	}

}
