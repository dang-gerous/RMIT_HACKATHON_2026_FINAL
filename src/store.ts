import { useEffect, useState } from 'react'

export type Role = 'tenant' | 'landlord'
export interface User { id: string; name: string; email: string; password: string; role: Role }
export type Vote = 'approve' | 'reject'
export interface Claim {
  reason: string
  amount: number
  description: string
  votes: Record<string, { vote: Vote; at: string }>
  status: 'open' | 'settled' | 'disputed'
  createdAt: string
}
export interface LogItem { at: string; text: string }

export const DEPOSIT = 400
export const PROPERTY = { name: 'Flat 3B, Sunrise City', area: 'District 7', leaseEnd: '31 Oct 2026' }

const seedUsers: User[] = [
  { id: 'minh', name: 'Minh Nguyen', email: 'minh@demo.com', password: 'demo1234', role: 'tenant' },
  { id: 'lan', name: 'Lan Tran', email: 'lan@demo.com', password: 'demo1234', role: 'tenant' },
  { id: 'tuan', name: 'Tuan Le', email: 'tuan@demo.com', password: 'demo1234', role: 'tenant' },
  { id: 'bay', name: 'Mr Bay', email: 'bay@demo.com', password: 'demo1234', role: 'landlord' },
]

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)) }, [key, v])
  return [v, setV] as const
}

export const needed = (tenants: number) => Math.ceil((2 / 3) * tenants)
export const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
export const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

export function useStore() {
  const [users, setUsers] = usePersisted<User[]>('rent.users', seedUsers)
  const [sessionId, setSessionId] = usePersisted<string | null>('rent.session', null)
  const [claim, setClaim] = usePersisted<Claim | null>('rent.claim', null)
  const [log, setLog] = usePersisted<LogItem[]>('rent.log', [
    { at: '09:00 AM', text: 'Deposits received and locked in the flat vault' },
  ])

  const me = users.find((u) => u.id === sessionId) ?? null
  const tenants = users.filter((u) => u.role === 'tenant')
  const addLog = (text: string) => setLog((l) => [{ at: now(), text }, ...l])

  const signIn = (email: string, password: string) => {
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
    if (!u) return 'Email or password is incorrect.'
    setSessionId(u.id)
    return null
  }
  const signUp = (name: string, email: string, password: string, role: Role) => {
    if (users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) return 'An account with this email already exists.'
    if (claim) return 'Move-out is in progress. New tenants can join after it is resolved.'
    const u: User = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), password, role }
    setUsers([...users, u])
    setSessionId(u.id)
    addLog(`${u.name} joined as ${role}`)
    return null
  }
  const signOut = () => setSessionId(null)

  const resolve = (c: Claim): Claim => {
    const approvals = Object.values(c.votes).filter((v) => v.vote === 'approve').length
    const rejects = Object.values(c.votes).filter((v) => v.vote === 'reject').length
    if (approvals >= needed(tenants.length)) return { ...c, status: 'settled' }
    if (rejects > tenants.length - needed(tenants.length)) return { ...c, status: 'disputed' }
    return c
  }

  const fileClaim = (reason: string, amount: number, description: string) => {
    setClaim({ reason, amount, description, votes: {}, status: 'open', createdAt: now() })
    addLog(`Mr Bay filed a ${money(amount)} claim: ${reason}`)
  }
  const castVote = (vote: Vote) => {
    if (!claim || !me || claim.status !== 'open' || claim.votes[me.id]) return
    const next = resolve({ ...claim, votes: { ...claim.votes, [me.id]: { vote, at: now() } } })
    setClaim(next)
    addLog(`${me.name} ${vote === 'approve' ? 'approved' : 'rejected'} the claim`)
    if (next.status === 'settled') addLog('Enough approvals reached. Funds released to wallets')
    if (next.status === 'disputed') addLog('Claim cannot reach approval. Sent to arbitration')
  }
  const reset = () => {
    setUsers(seedUsers); setClaim(null)
    setLog([{ at: '09:00 AM', text: 'Deposits received and locked in the flat vault' }])
  }

  return { users, me, tenants, claim, log, signIn, signUp, signOut, fileClaim, castVote, reset }
}
export type Store = ReturnType<typeof useStore>
