from digi.xbee.devices import XBeeDevice
import sched, time

# TODO: Replace with the serial port where your local module is connected to.
PORT = "COM5"
# TODO: Replace with the baud rate of your local module.
BAUD_RATE = 9600
REMOTE_NODE_id = "BEE_1"

DATA_TO_SEND = "ciao mamma!"
schedule = sched.scheduler(time.time, time.sleep)
device = XBeeDevice(PORT, BAUD_RATE)

def sendBroadCastData(params, remote_device):
     print("Sending data to %s >> %s..." % (remote_device, DATA_TO_SEND))
   
     if remote_device is None:
         print("Could not find the remote device")
     else: 
        device.send_data(remote_device, DATA_TO_SEND)

     

     schedule.enter(0.01, 1, sendBroadCastData, (params, remote_device))


def main():
    print(" +-----------------------------------------+")
    print(" | XBee Python Library Receive Data Sample |")
    print(" +-----------------------------------------+\n")
    
    

    try:
        
       
        
        device.open()
        xbee_network = device.get_network()
        remote_device = xbee_network.discover_device(REMOTE_NODE_id)
        print(remote_device.get_node_id())
        schedule.enter(1, 1, sendBroadCastData, (schedule, remote_device))
        def data_receive_callback(xbee_message):
            print("From %s >> %s" % (xbee_message.remote_device.get_64bit_addr(),
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