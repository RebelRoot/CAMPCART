package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
	"os"
)

var (
	// Default secret if not provided in env
	jwtSecret = []byte(getEnv("JWT_SECRET", "your_jwt_secret_key_change_this_in_production"))
	upgrader  = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}


// Client represents a connected user websocket
type Client struct {
	UserID string
	Conn   *websocket.Conn
}

// Hub maintains the set of active clients
type Hub struct {
	clients map[string][]*websocket.Conn // UserID -> multiple tabs/connections
	mu      sync.Mutex
}

func newHub() *Hub {
	return &Hub{
		clients: make(map[string][]*websocket.Conn),
	}
}

func (h *Hub) Register(userID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[userID] = append(h.clients[userID], conn)
	log.Printf("User %s connected. Active connections: %d", userID, len(h.clients[userID]))
}

func (h *Hub) Unregister(userID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	conns := h.clients[userID]
	for i, c := range conns {
		if c == conn {
			h.clients[userID] = append(conns[:i], conns[i+1:]...)
			break
		}
	}
	if len(h.clients[userID]) == 0 {
		delete(h.clients, userID)
	}
	log.Printf("User %s disconnected.", userID)
}

func (h *Hub) BroadcastToUser(userID string, message interface{}) {
	h.mu.Lock()
	defer h.mu.Unlock()

	payload, _ := json.Marshal(message)
	if conns, ok := h.clients[userID]; ok {
		for _, conn := range conns {
			err := conn.WriteMessage(websocket.TextMessage, payload)
			if err != nil {
				log.Printf("Error sending to user %s: %v", userID, err)
			}
		}
	}
}

var hub = newHub()

func wsHandler(w http.ResponseWriter, r *http.Request) {
	tokenStr := r.URL.Query().Get("token")
	if tokenStr == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid claims", http.StatusUnauthorized)
		return
	}

	userID := claims["id"].(string)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrade error: %v", err)
		return
	}

	hub.Register(userID, conn)

	// Keep-alive/Read loop
	go func() {
		defer func() {
			hub.Unregister(userID, conn)
			conn.Close()
		}()
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}

type BroadcastRequest struct {
	ToUserID string      `json:"to"`
	Payload  interface{} `json:"payload"`
}

func broadcastHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req BroadcastRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	hub.BroadcastToUser(req.ToUserID, req.Payload)
	w.WriteHeader(http.StatusOK)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", wsHandler)
	mux.HandleFunc("/broadcast", broadcastHandler)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	handler := cors.Default().Handler(mux)

	port := getEnv("PORT", "8801")
	if port[0] != ':' {
		port = ":" + port
	}

	fmt.Printf("Chat service starting on %s...\n", port)
	server := &http.Server{
		Addr:         port,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server dynamic error: %v", err)
	}
}
