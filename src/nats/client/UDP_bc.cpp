#include <stdio.h>
#include <unistd.h>
#include <netinet/in.h>
#include <string.h>
#include <sys/socket.h>
#include <stdlib.h>
#include <arpa/inet.h>
#include <bits/stdc++.h>
#include <thread>
#define PORT 8888
using namespace std;

struct sockaddr_in sock_self, sock_other, sock_send;
// sock_self is listening socket
// sock_other is to keep track of IP address of incoming messages.
// sock_send is to send data to other nodes.
// SOCKET sock;
int sock, i, sock_len = sizeof(sock_other), recv_len;
char buffer[5096] = {0};

void recv_Data()
{

    /* Binding a Socket
       int	bind(int socket, const struct sockaddr *address, socklen_t address_len);
       socket was created above
       Structure sockaddr is a generic container that just allows the OS to be able to read
       the first couple of bytes that identify the address family.

       struct sockaddr_in {
       __uint8_t       sin_len;
       sa_family_t     sin_family;
       in_port_t       sin_port;
       struct  in_addr sin_addr;
       char            sin_zero[8];
       };
        Before calling bind, we need to fill out this structure. The three key parts we need to set are:
       sin_family: address family we used when we set up the socket. In our case, it's AF_INET.
       sin_port: The port number (the transport address). You can explicitly assign a transport address (port). For the drone system we use one port
                   across the swarm.
       sin_addr: The address for this socket. This is just your machine's IP address.
                 For example, if your machine has both Wi-Fi and ethernet connections, that machine will have two addresses, one for each interface.
                 Most of the time, we don't care to specify a specific interface and can let the operating system use whatever it wants.
                 The special address for this is 0.0.0.0, defined by the symbolic constant INADDR_ANY.
   */
    // zero out the structure
    memset((char *)&sock_self, 0, sizeof(sock_self));
    sock_self.sin_family = AF_INET;
    sock_self.sin_port = htons(PORT);
    sock_self.sin_addr.s_addr = htonl(INADDR_ANY);

    // Bind Socket after filling structure
    if (bind(sock, (struct sockaddr *)&sock_self, sizeof(sock_self)) == -1)
    {
        printf("Binding of socket failed !");
        exit(EXIT_FAILURE);
    }

    while (1)
    {
        cout << "\n Waiting for the data....";
        fflush(stdout);

        if (recv_len = recvfrom(sock, buffer, 1024, 0, (struct sockaddr *)&sock_other, (socklen_t *)&sock_len) == -1)
        {
            cout << "Error in receving data";
        }
        printf("Received packet from %s:%d\n", inet_ntoa(sock_other.sin_addr), ntohs(sock_other.sin_port));
        printf("Data: %s\n", buffer);
        //clear the buffer by filling null, it might have previously received data
        memset(buffer,'\0', strlen(buffer));
        // Following code just to send ack to sender, but not necessery in case of broadcasting.
        // if (sendto(sock, "recived", strlen("recived"), 0, (struct sockaddr*) &sock_other, sock_len) == -1)
        // {
        // 	cout<<"Error in Sending data";
        // }
    }
}

void send_Data()
{
    char send_buffer[5096] ={0};
    // Setting Broadcasting Permission
    int broadcastPermission = 1;
    if (setsockopt(sock, SOL_SOCKET, SO_BROADCAST, (void *)&broadcastPermission,
                   sizeof(broadcastPermission)) < 0)
    {
        printf("Error");
        exit(EXIT_FAILURE);
    }
    //filling out structure
    memset((char *) &sock_send, 0, sizeof(sock_send));
    sock_send.sin_family = AF_INET;
    sock_send.sin_port = htons(PORT);
    sock_send.sin_addr.s_addr= htonl(INADDR_BROADCAST); 
    // for unicast message you need to replace it with destination IP adress as following
    // sock_send.sin_addr.s_addr = inet_addr("192.168.1.255");
    while (1)
    {
        printf("\n Enter Mesage: ");
        // to get the message every time
        cin.getline(send_buffer, sizeof(send_buffer));
        // cin>>send_buffer;
        if (sendto(sock, send_buffer, strlen(send_buffer), 0, (struct sockaddr*) &sock_send, sizeof(sock_send)) == -1)
		{
			cout<<"Error in Sending data";
            exit(EXIT_FAILURE);
        }
        //clear the buffer by filling null, it might have previously received data
        memset(send_buffer,'\0', strlen(send_buffer));
    }

}

int main(int argument, char const *argv[])
{
    /*  CREATING A SOCKET
    socket is system call. s = socket(domain, type, protocol)
        Domain: communication domain in which the socket should be created.Some of address families are AF_INET (IP), AF_INET6 (IPv6),
                AF_UNIX (local channel, similar to pipes), AF_ISO (ISO protocols), and AF_NS (Xerox Network Systems protocols).
        Type:  This is selected according to the properties required by the application:
                SOCK_STREAM (virtual circuit service), SOCK_DGRAM (datagram service), SOCK_RAW (direct IP service). We use SOCK_DGRAM for UDP.
        Protocol: indicate a specific protocol to use in supporting the sockets operation.
    */
    if ((sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)) == -1)
    {
        cout << "Socket Creation Failed";
        exit(EXIT_FAILURE);
    }
    thread th1(recv_Data);
    thread th2(send_Data);
    th1.join();
    th2.join();
    return 0;
}