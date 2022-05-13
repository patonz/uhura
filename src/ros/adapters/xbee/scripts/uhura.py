#!/usr/bin/env python
"""Uhura module
"""
from __future__ import print_function

import re
import sched
import sys
import threading
import time
from datetime import datetime

import rospy
import serial

# xbee imports
from digi.xbee.devices import XBeeDevice
from digi.xbee.exception import TransmitException
from digi.xbee.exception import InvalidOperatingModeException
from digi.xbee.exception import TimeoutException

from std_msgs.msg import String
from uhura_ros.msg import Coordinates, Position, Vehicle
# .srv import
from uhura_ros.srv import (SendBitsStringData, SendBitsStringDataResponse,
                           SendPositionData, SendPositionDataResponse,
                           SendStringData, SendStringDataResponse,
                           SetupNetworkDevice, SetupNetworkDeviceResponse,
                           TestBroadcastNetwork, TestBroadcastNetworkResponse)

from message import Message
from tool_manager import ToolManager

__author__ = "Patonz91"
__copyright__ = "Copyright (c) 2021 Leonardo Montecchiari"
__credits__ = ["Leonardo Patonz Montecchiari"]
__license__ = "MIT"
__version__ = "beta"
__maintainer__ = "Patonz91"
__email__ = "patonz91@gmail.com"
__status__ = "Dev"


# custom service message types
TYPE_MESSAGE_POS = 'pos'
TYPE_MESSAGE_TEST_NET_MESH = 'mesh_test'
TYPE_MESSAGE_TEST = 'test'
TYPE_MESSAGE_STRING = 'str'

# ToolManager global instance
toolManager = None

# file_log name setup
START_TIMESTAMP = int(round(time.time()*1000))
current_date = datetime.now()
string_date_time = current_date.strftime("%d-%m-%Y_%H-%H%M-%S")
NAME_FILE = 'net-test_%s.txt' % (string_date_time)


## test mesh setup params##
TEST_N_PACKETS = 0
TEST_PAYLOAD = bytearray(256)
TEST_DELAY = 1
TEST_CURRENT_N_PACKETS = 0
schedule = sched.scheduler(time.time, time.sleep)

## device setup params ##
debug_mode = None
setupDone = False
baudrate = 115200
port = None
DEVICE_NAME = "bee_n"

# XBeeDevice instance
device = None

# global sent messages counter
current_message_id = 0

# simulation vars @tiziano
uav_name = None
run_type = None
list_names = ["uav1", "uav2", "uav3", "uav4",
              "uav5", "uav6", "uav7", "uav8", "uav9", "uav10",
              "uav11", "uav12", "uav13", "uav14", "uav15", "uav16",
              "uav17", "uav18", "uav19", "uav20",
              "uav255"]

# topic names
generic_msg_rcv_pub = None
position_msg_rcv_pub = None
bits_string_msg_rcv_pub = None


def sendBroadCastData(data):
    """sendBroadCastData can accept Message or bytearray types

    Args:
        data (Message): Custom Message with headers and some helper method
        data (bytearray): row data

    Returns:
        bool: ack
    """
    global device
    global current_message_id

    if setupDone is not True:
        rospy.logerr("Call the setup service first. Maybe Xbee not connected?")
        return False

    if isinstance(data, bytearray):
        # save time before to check how much time is needed to send the time
        timeBefore = int(round(time.time()*1000))

        # try to send using the xbee and catch the exception
        try:
            device.send_data_broadcast(data)
        except TimeoutException:
            rospy.logerr("except TimeoutException")
            toolManager.log_to_file(
                "except TimeoutException in isInstance bytearray")
        except TransmitException:
            rospy.logerr("except TransmitException")
            toolManager.log_to_file(
                "except TransmitException in isInstance bytearray")
        except InvalidOperatingModeException:
            rospy.logerr("except InvalidOperatingModeException")
            toolManager.log_to_file(
                "except InvalidOperatingModeException in isInstance bytearray")

        # save time before to check how much time is needed to send the time
        timeAfter = int(round(time.time()*1000))

        # save log using rospy
        rospy.loginfo("snd %s %s %s %s %s" % (
            current_message_id,
            device.get_64bit_addr(),
            len(toolManager.bytes_to_bitstring(data)),
            int(round(time.time()*1000)),
            int(timeAfter-timeBefore))
        )
        # save log using custom tool manager
        toolManager.log_to_file("snd %s %s %s %s %s" % (
            current_message_id,
            device.get_64bit_addr(),
            len(toolManager.bytes_to_bitstring(data)),
            int(round(time.time()*1000)),
            int(timeAfter-timeBefore)))

        generate_next_message_id()
        return True

    if isinstance(data, Message):

        timeBefore = int(round(time.time()*1000))

        # prepare custom id for the message
        data.id = current_message_id #message id is on the payload, comes from the handleFunc. Here is needed for QoS stuff.
        

        # try to send using the xbee and catch the exception
        try:
            device.send_data_broadcast(data.payload)
        except TimeoutException:
            rospy.logerr("except TimeoutException")
            toolManager.log_to_file(
                "except TimeoutException in isInstance Message")
        except TransmitException:
            rospy.logerr("except TransmitException")
            toolManager.log_to_file(
                "except TransmitException in isInstance Message")
        except InvalidOperatingModeException:
            rospy.logerr("except InvalidOperatingModeException")
            toolManager.log_to_file(
                "except InvalidOperatingModeException in isInstance Message")

        timeAfter = int(round(time.time()*1000))
        rospy.loginfo("snd %s %s %s" %
                      (data.header_to_string(), data.payload_to_string(), int(round(time.time()*1000))))
        toolManager.log_to_file("snd %s %s %s %s %s" % (
            current_message_id,
            device.get_64bit_addr(),
            len(data.payload_to_string()),
            int(round(time.time()*1000)),
            int(timeAfter-timeBefore))
        )

        generate_next_message_id()
        return True

    return False


def handle_send_string_data(req):
    rospy.logdebug(req.data)
    rospy.logdebug(current_message_id)
    bitid = toolManager.int_to_bit(current_message_id, 16)
    rospy.logdebug(bitid)
    dataByteArray = bytearray(toolManager.bitstring_to_bytes(
        toolManager.int_to_bit(current_message_id, 16)))+ bytearray(req.data, "utf-8")
    rospy.logdebug(dataByteArray)

    message = Message(TYPE_MESSAGE_STRING, current_message_id,
                      DEVICE_NAME, int(round(time.time()*1000)), dataByteArray)

    return SendStringDataResponse(sendBroadCastData(message))

# sen string service request, turn off the real send if on simulation.


def handle_send_bits_string_data(req):
    global current_message_id
    global toolManager

    rospy.logdebug(req.data)
    rospy.logdebug(current_message_id)
    bitid = toolManager.int_to_bit(current_message_id, 16)
    rospy.logdebug(bitid)
    dataByteArray = bytearray(toolManager.bitstring_to_bytes(
        toolManager.int_to_bit(current_message_id, 16) + req.data))
    rospy.logdebug(dataByteArray)

    # TODO FIX IT
    global run_type, uav_name
    if run_type == "simulation":

        rospy.logdebug("[simulated] bit string len %s: %s" %
                       (len(req.data), req.data))
        encodedString = toolManager.bitstring_to_bytes(req.data)
        rospy.logdebug(
            "[simulated] encoded bits string to bytes: %s" % (encodedString))
        decodedString = toolManager.bytes_to_bitstring(encodedString)
        rospy.logdebug("[simulated] decode bytes to bits string len %s : %s" % (
            len(decodedString), decodedString))

        for uav in list_names:
            if uav == uav_name:
                continue

            tmp_publisher = rospy.Publisher('/%s%s/receive_bits_string_data' %
                                            (uav, '/uhuranode'), String, queue_size=10)

            tmp_publisher.publish(decodedString)
        generate_next_message_id()
        return SendBitsStringDataResponse(True)
    ############################################################
    return SendBitsStringDataResponse(sendBroadCastData(dataByteArray))

# Command from Basestation


def handle_send_command_data(req):

    # only accept mission command from the basestation
    # the basestation is identified with enum 255
    if req.source != "255":
        return False

    bitid = toolManager.int_to_bit(current_message_id, 16)
    sender = req.source
    sender = toolManager.int_to_bit(int(sender), 16)
    command = req.data
    command = toolManager.int_to_bit(int(command), 8)
    dataByteArray = bytearray(
        toolManager.bitstring_to_bytes(bitid + sender + command))

    ###########################################################
    # CHECK IF SIMULATION
    # TODO FIX IT
    global run_type, uav_name
    if run_type == "simulation":
        rospy.logdebug("[simulated] bit string len %s: %s" %
                       (len(bitid + sender + command), bitid + sender + command))
        encodedString = toolManager.bitstring_to_bytes(sender + command)
        rospy.logdebug(
            "[simulated] encoded bits string to bytes: %s" % (encodedString))
        decodedString = toolManager.bytes_to_bitstring(encodedString)
        rospy.logdebug("[simulated] decode bytes to bits string len %s : %s" % (
            len(decodedString), decodedString))
        for uav in list_names:
            if uav == uav_name:
                continue

            tmp_publisher = rospy.Publisher('/%s%s/receive_bits_string_data' %
                                            (uav, '/uhuranode'), String, queue_size=10)

            tmp_publisher.publish(decodedString)
        generate_next_message_id()
        return SendBitsStringDataResponse(True)
    ############################################################

    return SendBitsStringDataResponse(sendBroadCastData(dataByteArray))


# service request for position custom message
def handle_send_position_data(req):
    global current_message_id
    req.pos.id = current_message_id
    sendBroadCastData(encode_position_to_string(req.pos))
    return SendPositionDataResponse(True)


# setup service handler
# todo false return on exception
def setup(req):

    ############################################################
    # CHECK IF SIMULATION
    global run_type
    if run_type == "simulation":
        return SetupNetworkDeviceResponse(True)
    ############################################################

    # try to setup the hardware if not in simulation
    rospy.logdebug("setup: %s" % req)

    if req.device_name is not None:
        global DEVICE_NAME
        DEVICE_NAME = req.device_name
    else:
        rospy.logerr('device_name not found')

    # check free ports and test it for the xbee device, then bind
    global device, port

    if(port is not None):
        rospy.logdebug("trying to open the provided port on launch...")
        rospy.logdebug(port)
        try:
            toolManager.activate_serial_port(port, baudrate)
            device = XBeeDevice(port, baudrate)
            device.open()
        except:
            rospy.logdebug("port %s its not a Xbee device" % port)
            return SetupNetworkDeviceResponse(False)

    if port is None:

        rospy.logdebug("finding the Xbee Device port...")
        for port_free in toolManager.serial_ports():
            try:
                rospy.logdebug("port %s open" % port_free)

                toolManager.activate_serial_port(port_free, baudrate)
                device = XBeeDevice(port_free, baudrate)
                device.open()

                port = port_free

                rospy.logdebug("device found on %s" % port_free)
                break

            except:
                rospy.logdebug("port %s its not a Xbee device" % port_free)
                continue

    if port is None:
        rospy.logerr("Xbee Device Not Found")
        return SetupNetworkDeviceResponse(False)

    global setupDone
    setupDone = True

    rospy.loginfo("current setup is baudrate=%s, port=%s device_name=%s" %
                  (baudrate, port, DEVICE_NAME))
    start_receiving_data()
    return SetupNetworkDeviceResponse(True)

## test mesh functions ###


def thread_func(name):
    schedule.run()


def handle_network_test(req):
    network_test(req.delay, req.n_packets, req.n_bytes, req.to_mesh)
    return TestBroadcastNetworkResponse(True)


def network_test(delay, n_packets, n_bytes, to_mesh):

    if isinstance(delay, str):
        delay = float(delay)

    if isinstance(n_packets, str):
        n_packets = int(n_packets)

    if isinstance(n_bytes, str):
        n_bytes = int(n_bytes)

    if isinstance(to_mesh, str):
        to_mesh = bool(to_mesh)

    rospy.loginfo("network mesh test started...")
    global TEST_DELAY
    TEST_DELAY = delay

    global TEST_N_PACKETS
    TEST_N_PACKETS = n_packets

    global TEST_CURRENT_N_PACKETS
    TEST_CURRENT_N_PACKETS = 0

    global TEST_PAYLOAD
    TEST_PAYLOAD = bytearray(n_bytes)

    if to_mesh:
        data = encode_test_net_to_string(
            TEST_DELAY, TEST_N_PACKETS, n_bytes)
        rospy.logdebug(current_message_id)
        bitid = toolManager.int_to_bit(current_message_id, 16)
        rospy.logdebug(bitid)


        dataByteArray = bytearray(toolManager.bitstring_to_bytes(
            toolManager.int_to_bit(current_message_id, 16)))+ bytearray(data, "utf-8")
        rospy.logdebug(dataByteArray)
        sendBroadCastData(dataByteArray)

    schedule.enter(TEST_DELAY, 1, sendBroadCastDataSchedFun, (schedule,))
    x = threading.Thread(target=thread_func, args=(1,))
    x.start()


def sendBroadCastDataSchedFun(params):

    global TEST_CURRENT_N_PACKETS
    if TEST_CURRENT_N_PACKETS < TEST_N_PACKETS:
        data = TEST_PAYLOAD
        rospy.logdebug(current_message_id)
        bitid = toolManager.int_to_bit(current_message_id, 16)
        rospy.logdebug(bitid)
        dataByteArray = bytearray(toolManager.bitstring_to_bytes(
            toolManager.int_to_bit(current_message_id, 16))) + data
        rospy.logdebug(dataByteArray)
        message = Message(TYPE_MESSAGE_TEST, 0, DEVICE_NAME,
                          int(round(time.time()*1000)), dataByteArray)

        sendBroadCastData(message)
        TEST_CURRENT_N_PACKETS = TEST_CURRENT_N_PACKETS+1
        schedule.enter(TEST_DELAY, 1, sendBroadCastDataSchedFun, (params,))
#############################

### message type handlers #####


def handle_pos_message(message_array_string):
    rospy.logdebug("handle pos called")
    pos = Position()

    pos.vehicle = Vehicle()
    pos.vehicle.id = message_array_string[1]

    pos.coordinates = Coordinates()
    pos.coordinates.x = message_array_string[2]
    pos.coordinates.y = message_array_string[3]
    pos.coordinates.z = message_array_string[4]

    pos.timestamp = message_array_string[5]
    pos.id = message_array_string[6]

    position_msg_rcv_pub.publish(pos)
    return


def handle_mesh_test_message(message_array_string):
    rospy.logdebug("handle mesh_test called")
    network_test(
        message_array_string[1], message_array_string[2], message_array_string[3], False)
    return


def handle_generic_test_message(message_array_string):
    rospy.logdebug("handle generic called")
    return


def handle_unkown_message():
    pass


def handle_type_message(type_message, message_array_string):
    switcher = {
        TYPE_MESSAGE_POS: handle_pos_message,
        TYPE_MESSAGE_TEST: handle_generic_test_message,
        TYPE_MESSAGE_TEST_NET_MESH: handle_mesh_test_message
    }

    func = switcher.get(type_message, lambda: 'message type not found')
    func(message_array_string)
#######################


def generate_next_message_id():
    global current_message_id
    temp_id = current_message_id + 1
    current_message_id = temp_id % 65535  # 16 bit for id


def start_receiving_data():
    """starts the xbee callback for data rcv

       will create a Message() if is a utf-8 **uhura** format string
          # format: type rssi sender len payloadbits
    """
    global device
    try:
        def data_receive_callback(xbee_message):
            rssi = 0
            packet_dict = xbee_message.to_dict()

            rospy.logdebug(packet_dict)  # debug mode

            bitstring = toolManager.bytes_to_bitstring(xbee_message.data)
            bitstringId = bitstring[0:16] # first 2 bytes so 16 bit
            bitstringPayload = bitstring[16:] # payload
            rospy.logdebug(bitstring)
            rospy.logdebug(bitstringPayload)
            msgid = toolManager.bitstring_to_int(bitstringId)
            rospy.logdebug(msgid)
            rospy.loginfo("rcv %s %s %s %s %s" %
                          (msgid, xbee_message.remote_device, rssi, len(xbee_message.data), xbee_message.timestamp))

            bits_string_msg_rcv_pub.publish(bitstringPayload)

            toolManager.log_to_file("rcv %s %s %s %s %s" % (
                msgid, xbee_message.remote_device, rssi, len(xbee_message.data), xbee_message.timestamp))

            message_array = parse_message(
              xbee_message.data[2:].decode(errors='ignore')) #removes 2 first bytes for message parsing
            type_message = message_array[0]
            handle_type_message(type_message, message_array)
            

        device.add_data_received_callback(data_receive_callback)

        rospy.loginfo("Waiting for data...\n")

    finally:
        if device is not None and device.is_open():

            # device.close()
            pass

        # device.open()

## uhura message helper functions ##


def parse_message(message_string):
    return re.split("\s", message_string)


def encode_position_to_string(pos: Position):
    return '%s %s %s %s %s %s %s' % (TYPE_MESSAGE_POS, pos.vehicle.id, pos.coordinates.x, pos.coordinates.y, pos.coordinates.z, pos.timestamp, pos.id)


def encode_test_net_to_string(delay, n_packets, n_bytes):
    return '%s %s %s %s %s' % (TYPE_MESSAGE_TEST_NET_MESH, delay, n_packets, n_bytes, 1)

####################################
# Main function managing uhura callbacks


def uhura_server():
    rospy.init_node('uhuranode', anonymous=False)

    global uav_name, run_type, baudrate, debug_mode, port
    uav_name = rospy.get_param("~UAV_NAME")
    run_type = rospy.get_param("~RUN_TYPE")
    baudrate = rospy.get_param("~baudrate")
    port = rospy.get_param("~port")
    debug_mode = rospy.get_param("~debug_mode")

    global toolManager
    toolManager = ToolManager(NAME_FILE)

    if debug_mode is True:
        toolManager.set_rospy_log_lvl(rospy.DEBUG)
    else:
        toolManager.set_rospy_log_lvl(rospy.INFO)

    node_name = rospy.get_name()
    rospy.loginfo('node_name: %s ' % (node_name))
    rospy.Service('%s/send_command' % (node_name),
                  SendBitsStringData, handle_send_command_data)
    rospy.Service('%s/send_string_data' % (node_name),
                  SendStringData, handle_send_string_data)
    rospy.Service('%s/send_bits_string_data' % (node_name),
                  SendBitsStringData, handle_send_bits_string_data)
    rospy.Service('%s/send_position_data' % (node_name),
                  SendPositionData, handle_send_position_data)
    rospy.Service('%s/setup_network_device' %
                  (node_name), SetupNetworkDevice, setup)
    rospy.Service('%s/test_broadcast_network' % (node_name),
                  TestBroadcastNetwork, handle_network_test)

    global generic_msg_rcv_pub, position_msg_rcv_pub, bits_string_msg_rcv_pub
    generic_msg_rcv_pub = rospy.Publisher(
        '%s/message_received' % (node_name), String, queue_size=10)
    bits_string_msg_rcv_pub = rospy.Publisher(
        '%s/receive_bits_string_data' % (node_name), String, queue_size=10)
    position_msg_rcv_pub = rospy.Publisher(
        '%s/position_message_received' % (node_name), Position, queue_size=10)

    rospy.loginfo("Uhura started")
    if(port is None):
        rospy.logdebug(toolManager.serial_ports())
    rospy.spin()


if __name__ == "__main__":
    uhura_server()
