package proxy

import "sync"


type Registry struct{
	mu sync.Mutex
	connections map[uint64]*Connection
}

func NewRegistry() *Registry{
	return &Registry{
		connections: make(map[uint64]*Connection),
	}
}

func (r *Registry) Add(conn *Connection) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.connections[conn.ID] = conn
}

func (r *Registry) Remove(id uint64) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.connections, id)
}

func (r *Registry) Get(id uint64) (*Connection, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	conn, ok := r.connections[id]
	return conn, ok
}

func (r *Registry) List() []*Connection {
	r.mu.Lock()
	defer r.mu.Unlock()

	connections := make([]*Connection, 0, len(r.connections))

	for _, conn := range r.connections {
		connections = append(connections, conn)
	}

	return connections
}