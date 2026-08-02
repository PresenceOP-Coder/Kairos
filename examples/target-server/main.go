package main

import (
	"io"
	"log"
	"net"
)

func main() {
	ln, err := net.Listen("tcp", ":9001")
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Target listening on :9001")

	for {
		conn, err := ln.Accept()
		if err != nil {
			continue
		}

		go func(c net.Conn) {
			defer c.Close()

			// Echo everything back
			_, _ = io.Copy(c, c)
		}(conn)
	}
}