/* board.c - Board-specific hooks */

/*
 * Copyright (c) 2017 Intel Corporation
 * Additional Copyright (c) 2018 Espressif Systems (Shanghai) PTE LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */
#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/uart.h"
#include "driver/gpio.h"
#include "sdkconfig.h"

#include <stdio.h>
#include "esp_log.h"
#include "iot_button.h"
#include "esp_ble_mesh_sensor_model_api.h"

#define BUF_SIZE (128)


#define TAG "BOARD"

#define BUTTON_IO_NUM           0
#define BUTTON_ACTIVE_LEVEL     0

#define UART_BUF_SIZE (128)

#define ECHO_TEST_TXD (CONFIG_EXAMPLE_UART_TXD)
#define ECHO_TEST_RXD (CONFIG_EXAMPLE_UART_RXD)
#define ECHO_TEST_RTS (UART_PIN_NO_CHANGE)
#define ECHO_TEST_CTS (UART_PIN_NO_CHANGE)

#define ECHO_UART_PORT_NUM      (CONFIG_EXAMPLE_UART_PORT_NUM)
#define ECHO_UART_BAUD_RATE     (CONFIG_EXAMPLE_UART_BAUD_RATE)
#define ECHO_TASK_STACK_SIZE    (CONFIG_EXAMPLE_TASK_STACK_SIZE)
#define STACK_SIZE 4096
extern void
example_ble_mesh_send_sensor_message(uint16_t addr, uint32_t opcode, uint8_t ttl, uint32_t id);

static uint32_t send_opcode[] = { [0] = ESP_BLE_MESH_MODEL_OP_SENSOR_DESCRIPTOR_GET, [1
		] = ESP_BLE_MESH_MODEL_OP_SENSOR_CADENCE_GET, [2] = ESP_BLE_MESH_MODEL_OP_SENSOR_SETTINGS_GET, [3
		] = ESP_BLE_MESH_MODEL_OP_SENSOR_GET, [4] = ESP_BLE_MESH_MODEL_OP_SENSOR_SERIES_GET, [5
		] = ESP_BLE_MESH_MODEL_OP_SENSOR_SETTING_SET_UNACK, [6] = ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_SET_UNACK };
static uint8_t press_count;


StaticTask_t xTaskBuffer;
StackType_t xStack[ STACK_SIZE ];
struct Rule_Message {
	uint16_t n_mex_s;
	uint8_t addr_s;
	uint16_t delay_s;
	uint8_t ttl_s;
	bool ack_s;
} rule;

struct Message_Set {
	uint8_t addr_s;
	uint16_t level_s;
	uint32_t opcode_s;
	bool ack_s;
} m2;

static uint8_t data[BUF_SIZE];

static void button_tap_cb(void *arg) {
	//example_ble_mesh_send_sensor_message(send_opcode[3]);
	//example_ble_mesh_send_sensor_message(0xFFF, send_opcode[press_count++], 3, 0);
	example_ble_mesh_send_sensor_message(0xFFF, send_opcode[6], 0, 100);
	press_count = press_count % ARRAY_SIZE(send_opcode);
}

static void board_button_init(void) {
	button_handle_t btn_handle = iot_button_create(BUTTON_IO_NUM,
	BUTTON_ACTIVE_LEVEL);
	if (btn_handle) {
		iot_button_set_evt_cb(btn_handle, BUTTON_CB_RELEASE, button_tap_cb, "RELEASE");
	}
}

void event_reporting(char *opcode, char *level, char *ttl) {
	char *str3 = malloc(1 + 2 + strlen(opcode) + strlen(level) + strlen(opcode)); // 1 end char; 1 for comma

	strcpy(str3, opcode);
	strcat(str3, ",");
	strcat(str3, level);
	strcat(str3, ",");
	strcat(str3, ttl);

	free(str3);
	if (strcmp(ttl, "0") == 0) {
		ESP_LOGE("PC", "[opcode: %s, level_error: %s ttl: %s]", opcode, level, ttl);
	} else {
		ESP_LOGI("PC", "[opcode: %s, level: %s ttl: %s]", opcode, level, ttl);
	}
}

uint8_t count_tokens(char *a_str, const char a_delim) {
	size_t count = 0;
	char *tmp = a_str;
	char *last_comma = 0;
	/* Count how many elements will be extracted. */
	while (*tmp) {
		if (a_delim == *tmp) {
			count++;
			last_comma = tmp;
		}
		tmp++;
	}

	/* Add space for trailing token. */
	count += last_comma < (a_str + strlen(a_str) - 1);

	/* Add space for terminating null string so caller
	 knows where the list of returned strings ends. */
	count++;

	return count;
}

char** str_split(char *a_str, const char a_delim) {
	char **result = 0;
	size_t count = 0;
	char delim[2];
	delim[0] = a_delim;
	delim[1] = 0;

	count = count_tokens(a_str, a_delim);

	result = malloc(sizeof(char*) * count);

	if (result) {
		size_t idx = 0;
		char *token = strtok(a_str, delim);

		while (token) {
			assert(idx < count);
			*(result + idx++) = strdup(token);
			token = strtok(0, delim);
		}
		assert(idx == count - 1);
		*(result + idx) = 0;
	}

	return result;
}

void execute_rule() {
	int16_t id = 1;
	char level_c[7];

	const TickType_t xDelay = rule.delay_s / portTICK_PERIOD_MS;
	printf("Start after first delay: %d --> delay loop: %d\n", rule.delay_s, xDelay);
	vTaskDelay(1000 / portTICK_PERIOD_MS);

	TickType_t xLastWakeTime = xTaskGetTickCount();
	ESP_LOGI("STARTED", "test started");
	for (int i = 0; i < rule.n_mex_s; ++i) {
		vTaskDelayUntil(&xLastWakeTime, xDelay);

		example_ble_mesh_send_sensor_message(rule.addr_s, ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_SET_UNACK, rule.ttl_s, id);
		id += 1;
	}
	ESP_LOGI("COMPLETED", "test completed");
}

void config_single_mex_get(char *addr_c) {
	char **addr_char = str_split(addr_c, ':');

	uint16_t addr = strtoul((const char*) addr_char[1], NULL, 16);

	example_ble_mesh_send_sensor_message(addr, ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_SET_UNACK, 10, rule.ack_s);

	free(addr_char);
}

void decoding_string(char tokens0, char *token1, char *token2, char *token3, char *token4) {
	char **t1_char = str_split(token1, ':');
	char **t2_char = str_split(token2, ':');
	char **t3_char = str_split(token3, ':');
	char **t4_char = str_split(token4, ':');

	if (tokens0 == '@') {
		m2.addr_s = strtoul((const char*) t1_char[1], NULL, 16);
		m2.level_s = strtoul((const char*) t2_char[1], NULL, 10);
		if (strcmp(t3_char[0], "unack") == 0) {
			m2.opcode_s = ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_SET_UNACK;
			m2.ack_s = 0;
		} else {
			m2.opcode_s = ESP_BLE_MESH_MODEL_OP_GEN_LEVEL_SET;
			m2.ack_s = strtoul((const char*) t3_char[1], NULL, 2);
		}
	} else if (tokens0 == '&') {
		rule.n_mex_s = strtoul((const char*) t1_char[1], NULL, 10);
		rule.addr_s = strtoul((const char*) t2_char[1], NULL, 16);
		rule.delay_s = strtoul((const char*) t3_char[1], NULL, 10);
		rule.ttl_s = strtoul((const char*) t4_char[1], NULL, 10);
		rule.ack_s = 0;
	}

	free(t1_char);
	free(t2_char);
	free(t3_char);
}

void command_received(char **tokens, int count) {
	count = count - 2;
	//printf("First char: %c, count: %d\n", tokens[0][0], count);
	switch (tokens[0][0]) {
	case '#':
		//config_my_log(tokens[1]);
		printf("LOG\n");
		break;

	case '@':
		if (count == 1) {
			config_single_mex_get(tokens[1]);
			printf("GET\n");
		} else if (count == 2) {
			decoding_string('@', tokens[1], tokens[2], "unack", "10");
			example_ble_mesh_send_sensor_message(m2.addr_s, m2.opcode_s, 10, m2.level_s);
			ESP_LOGI("SEND_MESSAGE", "SET_UNACK");
		} else if (count == 3) {
			decoding_string('@', tokens[1], tokens[2], tokens[3], "10");
			example_ble_mesh_send_sensor_message(m2.addr_s, m2.opcode_s, 10, m2.level_s);
			ESP_LOGI("SEND_MESSAGE", "SET");
		}
		printf("Single_mex\n");
		break;

	case '&':
		decoding_string('&', tokens[1], tokens[2], tokens[3], tokens[4]);
		printf("n_mex: %hu\n", rule.n_mex_s);
		printf("addr: %hhu\n", rule.addr_s);
		printf("delay: %u\n", rule.delay_s);
		printf("ttl: %u\n", rule.ttl_s);
		execute_rule();
		printf("Rule\n");
		break;

	default:
		printf("Errore\n");
		break;
	}
}

static void echo_task(void *arg) {
	/* Configure parameters of an UART driver,
	 * communication pins and install the driver */
	uart_config_t uart_config = { .baud_rate = ECHO_UART_BAUD_RATE, .data_bits = UART_DATA_8_BITS, .parity =
			UART_PARITY_DISABLE, .stop_bits = UART_STOP_BITS_1, .flow_ctrl = UART_HW_FLOWCTRL_DISABLE, .source_clk =
			UART_SCLK_APB, };
	int intr_alloc_flags = 0;

#if CONFIG_UART_ISR_IN_IRAM
    intr_alloc_flags = ESP_INTR_FLAG_IRAM;
#endif

	ESP_ERROR_CHECK(uart_driver_install(ECHO_UART_PORT_NUM, 1024 * 2, 0, 0, NULL, intr_alloc_flags));
	ESP_ERROR_CHECK(uart_param_config(ECHO_UART_PORT_NUM, &uart_config));
	ESP_ERROR_CHECK(uart_set_pin(ECHO_UART_PORT_NUM, ECHO_TEST_TXD, ECHO_TEST_RXD, ECHO_TEST_RTS, ECHO_TEST_CTS));

	// Configure a temporary buffer for the incoming data
	//uint8_t *data = (uint8_t*) malloc(BUF_SIZE);
	//uint8_t *data2 = (uint8_t *) malloc(BUF_SIZE);
	uint32_t action, arg0, arg1, arg2, arg3;
	int len = 0;
	while (1) {
		// Read data from the UART
		len = uart_read_bytes(ECHO_UART_PORT_NUM, data, BUF_SIZE, 20 / portTICK_RATE_MS);
		if (len > 0) {

			printf("-------------\n");
			data[len] = 0;
			//ESP_LOGI(RX_TASK_TAG, "Read %d bytes: '%s'", len, data);
			//ESP_LOG_BUFFER_HEXDUMP(RX_TASK_TAG, data, len, ESP_LOG_INFO);

			/*	size_t count = count_tokens((char*) data, ',');
			 char **tokens = str_split((char*) data, ',');
			 command_received(tokens, count);

			 memset(data, 0, UART_BUF_SIZE);
			 printf("-------------\n");
			 */
			sscanf((const char*) data, "%d %d %d %d %d", &action, &arg0, &arg1, &arg2, &arg3);

			/**
			 *  Action = 1: sensor message GET
			 *  - arg0 = {0: DESCRIPTOR, 1: CADENCE, 2: SETTINGS, 3: GENERIC GET, 4: SERIES, 5: SET settings, 6: set unack level}
			 *  - arg1 = ttl
			 *  - arg2 = id
			 *  - arg3 = addr
			 *  1 1 1 x   x= 0-65k
			 */

			switch (action) {
			case 1:
				if (arg0 <= (int) (sizeof(send_opcode) / sizeof(send_opcode[0])) && arg1 <= 100) {
					example_ble_mesh_send_sensor_message(&arg3, send_opcode[arg0], arg1, arg2);
				}

				break;
			default:
				break;
			}

		}

	}
	vTaskDelete(NULL);

}

void board_init(void) {
	board_button_init();
	xTaskCreateStatic(echo_task, "uart_echo_task", STACK_SIZE, NULL, 5, xStack, &xTaskBuffer);
}
