import { useState, type FormEvent } from 'react'
import { KeyRound, Mail, User as UserIcon, Eye, EyeOff, Home } from 'lucide-react'
import type { Store, Role } from '../store'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-sun-400 text-blue-900"><Home size={19} strokeWidth={2.5} /></span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>RentNest</span>
    </div>
  )
}

const field = 'h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-[15px] outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100'

export default function Auth({ store }: { store: Store }) {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('tenant')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'up' && password.length < 6) return setError('Password must be at least 6 characters.')
    setError(mode === 'in' ? store.signIn(email, password) : store.signUp(name, email, password, role))
  }
  const demo = (e: string) => { setMode('in'); setEmail(e); setPassword('demo1234'); setError(null) }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-blue-600 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-sun-400/90" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-blue-700" />
        <div className="relative"><Logo light /></div>
        <div className="relative max-w-md">
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight">Shared rent, <br />fair deposits.</h1>
          <p className="mt-5 text-lg text-blue-100">Every roommate's deposit stays safe in one vault. Deductions need a claim and agreement from most tenants.</p>
        </div>
        <p className="relative text-sm text-blue-100">Flat 3B, Sunrise City · District 7</p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-extrabold tracking-tight">{mode === 'in' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1.5 text-mute">{mode === 'in' ? 'Sign in to manage your rental.' : 'Join your flat in under a minute.'}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === 'up' && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 text-mute" size={20} />
                  <input className={field} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required aria-label="Full name" />
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-blue-50 p-1" role="radiogroup" aria-label="I am a">
                  {(['tenant', 'landlord'] as Role[]).map((r) => (
                    <button type="button" key={r} role="radio" aria-checked={role === r} onClick={() => setRole(r)}
                      className={`h-10 rounded-lg text-sm font-semibold capitalize transition ${role === r ? 'bg-white text-blue-700 shadow-sm' : 'text-mute hover:text-ink'}`}>{r}</button>
                  ))}
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-mute" size={20} />
              <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 text-mute" size={20} />
              <input className={field} type={show ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label="Password" />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-3 grid size-6 place-items-center text-mute hover:text-ink">
                {show ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
            <button className="h-12 w-full rounded-xl bg-blue-600 font-bold text-white transition hover:bg-blue-700 active:scale-[.99]">
              {mode === 'in' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-mute">
            {mode === 'in' ? "New here? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError(null) }} className="font-bold text-blue-600 hover:underline">
              {mode === 'in' ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <div className="mt-8 rounded-2xl border border-sun-300 bg-sun-300/25 p-4">
            <p className="text-sm font-bold">Try a demo account</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {[['Minh', 'minh@demo.com'], ['Lan', 'lan@demo.com'], ['Tuan', 'tuan@demo.com'], ['Landlord', 'bay@demo.com']].map(([l, e]) => (
                <button key={e} onClick={() => demo(e)} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-line transition hover:ring-blue-600">{l}</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-mute">Password: demo1234</p>
          </div>
        </div>
      </main>
    </div>
  )
}
