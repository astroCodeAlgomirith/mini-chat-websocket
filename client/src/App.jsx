import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'


// Cambia la URL si corres el server en otra máquina/puerto
const SOCKET_URL = 'http://localhost:3000'


export default function App() {
const [socket, setSocket] = useState(null)
const [connected, setConnected] = useState(false)
const [name, setName] = useState('')
const [users, setUsers] = useState([])
const [messages, setMessages] = useState([])
const [input, setInput] = useState('')
const [typing, setTyping] = useState({})
const typingTimeout = useRef(null)
const bottomRef = useRef(null)


useEffect(() => {
const s = io(SOCKET_URL)
setSocket(s)


s.on('connect', () => setConnected(true))
s.on('disconnect', () => setConnected(false))


s.on('message', (m) => {
setMessages(prev => [...prev, m])
})


s.on('users', (u) => setUsers(u))


s.on('typing', (t) => {
setTyping(prev => ({ ...prev, [t.id]: t.isTyping ? t.name : undefined }))
})


return () => s.disconnect()
}, [])
useEffect(() => {
bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])


const register = () => {
if (!name) return alert('Escribe un nombre')
socket.emit('register', name)
}


const send = () => {
if (!input.trim()) return
socket.emit('message', input.trim())
setInput('')
socket.emit('typing', false)
}


const handleTyping = (value) => {
setInput(value)
if (!socket) return
socket.emit('typing', true)
clearTimeout(typingTimeout.current)
typingTimeout.current = setTimeout(() => socket.emit('typing', false), 800)
}


return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 flex items-center justify-center">
<div className="w-full max-w-4xl bg-white/5 rounded-2xl shadow-xl p-6 grid grid-cols-3 gap-6">
<div className="col-span-1">
<h2 className="text-xl font-semibold mb-4">Mini Chat</h2>


<div className="mb-4">
<input className="w-full p-2 rounded bg-white/10 placeholder:text-white/60" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />
<button className="mt-2 w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500" onClick={register}>Entrar</button>
</div>


<div className="bg-white/5 rounded p-3 h-64 overflow-auto">
<h3 className="text-sm opacity-80">Conectados ({users.length})</h3>
<ul className="mt-2 space-y-2 text-sm">
{users.map((u, i) => <li key={i} className="py-1">• {u}</li>)}
</ul>
</div>


<div className="mt-4 text-xs opacity-70">
Estado socket: {connected ? 'Conectado' : 'Desconectado'}
</div>
</div>


<div className="col-span-2 flex flex-col">
<div className="flex-1 bg-white/5 rounded p-4 overflow-auto">
{messages.map((m, i) => (
<div key={i} className={`mb-3 ${m.system ? 'opacity-70 italic' : ''}`}>
{m.system ? (
<div className="text-center">— {m.text}</div>
) : (
<div>
<div className="text-sm opacity-80">{m.name} <span className="text-xs opacity-50">{new Date(m.ts).toLocaleTimeString()}</span></div>
<div className="mt-1">{m.text}</div>
</div>
)}
</div>
))}
<div ref={bottomRef} />
</div>


<div className="mt-3">
<div className="text-sm mb-1 h-5">
{Object.values(typing).filter(Boolean).length > 0 && (
<span>{Object.values(typing).filter(Boolean).join(', ')} escribiendo...</span>
)}
</div>


<div className="flex gap-2">
<input value={input} onChange={e => handleTyping(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} className="flex-1 p-2 rounded bg-white/10" placeholder="Escribe y presiona Enter" />
<button onClick={send} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500">Enviar</button>
</div>
</div>
</div>
</div>
</div>
)
}