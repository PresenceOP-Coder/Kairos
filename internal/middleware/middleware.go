package middleware

import "net"

type Middleware interface {
	Wrap(net.Conn) net.Conn
}