from digi.xbee.devices import XBeeDevice
import sched, time

PORT = "COM7" 
DEVICE_NAME = "BEE_4"
BAUD_RATE = 9600
DELAY_SEND = 1 # seconds in float


DATA_TO_SEND = DEVICE_NAME+" sending something dummy payload"
schedule = sched.scheduler(time.time, time.sleep)
device = XBeeDevice(PORT, BAUD_RATE)

def sendBroadCastData(params):
    print("Sending data to %s >> %s..." % ("BROADCAST", DATA_TO_SEND))
    device.send_data_broadcast(DATA_TO_SEND)
    schedule.enter(DELAY_SEND, 1, sendBroadCastData, (params,))


def main():
    print(" +-----------------------------------------+")
    print(" | XBee Python Library Receive Data Sample |")
    print(" +-----------------------------------------+\n")

    try:
        device.open()
        schedule.enter(DELAY_SEND, 1, sendBroadCastData, (schedule,))
        def data_receive_callback(xbee_message):
            print("From %s >> %s" % (xbee_message.remote_device.get_node_id(),
                                     xbee_message.data.decode()))

        device.add_data_received_callback(data_receive_callback)

        print("Waiting for data...\n")
        schedule.run()

    finally:
        if device is not None and device.is_open():
            device.close()

    device.open()
if __name__ == '__main__':
    main()