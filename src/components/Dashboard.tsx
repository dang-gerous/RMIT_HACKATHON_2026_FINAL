import { useState, type FormEvent } from 'react'
import { LogOut, Check, X, Clock, ShieldCheck, Camera, RotateCcw } from 'lucide-react'
import { Logo } from './Auth'
import { DEPOSIT, PROPERTY, money, needed, type Store } from '../store'

const card = 'rounded-2xl border border-line bg-white p-6'
const initials = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

export default function Dashboard({ store }: { store: Store }) {
  const { me, tenants, claim, log, castVote, signOut, reset } = store
  if (!me) return null
  const bond = tenants.length * DEPOSIT
  const settled = claim?.status === 'settled'
  const deduction = settled ? claim!.amount : 0
  const refund = (bond - deduction) / tenants.length
  const claimPct = claim ? (claim.amount / bond) * 100 : 0
  const approvals = claim ? Object.values(claim.votes).filter((v) => v.vote === 'approve').length : 0
  const need = needed(tenants.length)
  const myVote = claim?.votes[me.id]

  const statusLabel = !claim ? 'Locked' : claim.status === 'open' ? 'Claim open' : claim.status === 'settled' ? 'Settled' : 'In dispute'
  const statusStyle = settled ? 'bg-blue-50 text-blue-700' : claim?.status === 'disputed' ? 'bg-red-50 text-red-700' : 'bg-sun-300/50 text-amber-900'

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-tight">{me.name}</p>
              <p className="text-xs capitalize text-mute">{me.role}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{initials(me.name)}</span>
            <button onClick={signOut} aria-label="Sign out" title="Sign out" className="grid size-10 place-items-center rounded-full text-mute transition hover:bg-blue-50 hover:text-blue-700"><LogOut size={19} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-600">{PROPERTY.area} · Lease ends {PROPERTY.leaseEnd}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{PROPERTY.name}</h1>
          </div>
          <span className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${statusStyle}`}>{statusLabel}</span>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl bg-blue-600 p-7 text-white">
            <p className="text-sm font-medium text-blue-100">Deposit in vault</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight">{money(settled ? 0 : bond)}</p>
            <p className="mt-1 text-sm text-blue-100">{tenants.length} tenants × {money(DEPOSIT)}</p>
            <div className="mt-8">
              <div className="flex h-3 overflow-hidden rounded-full bg-blue-700">
                <div className="bg-white/90 transition-all" style={{ width: `${100 - claimPct}%` }} />
                {claim && <div className="bg-sun-400 transition-all" style={{ width: `${claimPct}%` }} />}
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-white" />Tenant refund {money(bond - (claim?.amount ?? 0))}</span>
                {claim && <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-sun-400" />Claim {money(claim.amount)}</span>}
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className="font-bold">Roommates</h2>
            <ul className="mt-4 space-y-3.5">
              {[...tenants, ...store.users.filter((u) => u.role === 'landlord')].map((u) => {
                const amount = u.role === 'landlord' ? deduction : settled ? refund : DEPOSIT
                return (
                  <li key={u.id} className="flex items-center gap-3">
                    <span className={`grid size-9 place-items-center rounded-full text-xs font-bold ${u.role === 'landlord' ? 'bg-sun-400 text-blue-900' : 'bg-blue-100 text-blue-700'}`}>{initials(u.name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{u.name}{u.id === me.id && <span className="ml-1.5 text-xs font-medium text-mute">(you)</span>}</p>
                      <p className="text-xs capitalize text-mute">{u.role === 'landlord' ? 'Landlord' : settled ? 'Refunded' : 'Deposited'}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{money(amount)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Move-out deduction</h2>
            <span className="flex items-center gap-1.5 text-xs font-medium text-mute"><ShieldCheck size={15} />Needs {need} of {tenants.length} tenants to agree</span>
          </div>

          {!claim && me.role === 'landlord' && <ClaimForm store={store} max={bond} />}
          {!claim && me.role === 'tenant' && (
            <p className="mt-5 rounded-xl bg-blue-50 p-5 text-sm text-blue-900">No deductions have been claimed. Your {money(DEPOSIT)} is safe and will be refunded in full at move-out.</p>
          )}

          {claim && (
            <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1fr]">
              <div>
                <div className="grid aspect-video place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <div className="text-center"><Camera className="mx-auto" size={28} /><p className="mt-1 text-xs font-medium">Inspection photo</p></div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <h3 className="font-bold">{claim.reason}</h3>
                  <span className="rounded-lg bg-sun-400 px-2.5 py-1 text-sm font-extrabold text-blue-900">{money(claim.amount)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{claim.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Approvals</span><span className="text-blue-700">{approvals} / {need}</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {tenants.map((t) => {
                    const v = claim.votes[t.id]?.vote
                    return <div key={t.id} className={`h-2 flex-1 rounded-full ${v === 'approve' ? 'bg-blue-600' : v === 'reject' ? 'bg-red-400' : 'bg-line'}`} />
                  })}
                </div>
                <ul className="mt-4 divide-y divide-line">
                  {tenants.map((t) => {
                    const v = claim.votes[t.id]
                    return (
                      <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="font-medium">{t.name}</span>
                        {v ? (
                          <span className={`flex items-center gap-1.5 font-semibold ${v.vote === 'approve' ? 'text-blue-700' : 'text-red-600'}`}>
                            {v.vote === 'approve' ? <Check size={15} /> : <X size={15} />}{v.vote === 'approve' ? 'Approved' : 'Rejected'} · {v.at}
                          </span>
                        ) : <span className="flex items-center gap-1.5 text-mute"><Clock size={15} />Waiting</span>}
                      </li>
                    )
                  })}
                </ul>

                {claim.status === 'open' && me.role === 'tenant' && !myVote && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button onClick={() => castVote('approve')} className="h-11 rounded-xl bg-blue-600 font-bold text-white transition hover:bg-blue-700">Approve</button>
                    <button onClick={() => castVote('reject')} className="h-11 rounded-xl border border-line font-bold transition hover:border-red-400 hover:text-red-600">Reject</button>
                  </div>
                )}
                {claim.status === 'open' && me.role === 'landlord' && <p className="mt-4 text-sm text-mute">Waiting for tenants to respond.</p>}
                {claim.status === 'open' && myVote && <p className="mt-4 text-sm text-mute">You have responded. Waiting for the others.</p>}
                {claim.status === 'settled' && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-900">Approved. {money(claim.amount)} sent to landlord, {money(refund)} refunded to each tenant.</p>}
                {claim.status === 'disputed' && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">Not enough approvals. The funds stay frozen for arbitration.</p>}
              </div>
            </div>
          )}
        </section>

        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Activity</h2>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold text-mute hover:text-blue-700"><RotateCcw size={14} />Reset demo</button>
          </div>
          <ol className="mt-4 space-y-3">
            {log.slice(0, 6).map((l, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${i === 0 ? 'bg-sun-500' : 'bg-line'}`} />
                <span className="flex-1">{l.text}</span>
                <span className="text-xs text-mute">{l.at}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}

function ClaimForm({ store, max }: { store: Store; max: number }) {
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const input = 'w-full rounded-xl border border-line px-4 py-3 text-[15px] outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
  const submit = (e: FormEvent) => {
    e.preventDefault()
    store.fileClaim(reason, Math.min(Number(amount), max), desc)
  }
  return (
    <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="text-sm font-semibold">Reason
        <input className={`${input} mt-1.5 font-normal`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Kitchen faucet repair" required />
      </label>
      <label className="text-sm font-semibold">Amount (max {money(max)})
        <input className={`${input} mt-1.5 font-normal`} type="number" min={1} max={max} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150" required />
      </label>
      <label className="text-sm font-semibold md:col-span-2">What happened
        <textarea className={`${input} mt-1.5 min-h-24 font-normal`} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the damage found during inspection." required />
      </label>
      <button className="h-12 rounded-xl bg-sun-400 font-bold text-blue-900 transition hover:bg-sun-500 md:col-span-2">Submit claim to tenants</button>
    </form>
  )
}
