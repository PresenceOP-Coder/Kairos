package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"os"
	"time"
)

func main() {
	conn, err := net.Dial("tcp", "localhost:9000")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	fmt.Println("Connected to Kairos!")
	fmt.Println("Type messages (type 'exit' to quit):")

	sentTimes := make(chan time.Time, 100)

	// Read responses
	go func() {
		reader := bufio.NewReader(conn)
		for {
			msg, err := reader.ReadString('\n')
			if err != nil {
				return
			}

			sent := <-sentTimes

			fmt.Printf("Received: %s", msg)
			fmt.Printf("RTT: %v\n", time.Since(sent))
		}
	}()

	// Send messages
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		text := scanner.Text()

		if text == "exit" {
			break
		}

		sentTimes <- time.Now()

		_, err := fmt.Fprintln(conn, text)
		if err != nil {
			log.Println(err)
			break
		}
	}
}