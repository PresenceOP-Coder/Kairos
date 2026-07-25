package main

import (
	"log"
	"net"
)

func main() {
	listener, err := net.Listen("tcp", ":9000")
	if err != nil {
		log.Fatal(err)
	}
	defer listener.Close()

	log.Println("Target server listening on :9000")

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Println(err)
			continue
		}

		log.Printf("Accepted connection from %s\n", conn.RemoteAddr())
		conn.Close()
	}
}