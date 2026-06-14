import { Loader2 } from 'lucide-react'

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-400" size={32} />
    </div>
  )
}
