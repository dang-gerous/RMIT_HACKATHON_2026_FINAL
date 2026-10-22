import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import { useStore } from './store'

export default function App() {
  const store = useStore()
  return store.me ? <Dashboard store={store} /> : <Auth store={store} />
}
