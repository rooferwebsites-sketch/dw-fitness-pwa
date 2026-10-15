'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import Navigation from '@/components/Navigation'

interface Exercise {
  name: string
  sets: number
  reps: string
}

interface Workout {
  id: string
  title: string
  description: string
  exercises: Exercise[]
}

export default function WorkoutPage() {
  const supabase = createClient()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  // New workout form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: 'Pushups', sets: 3, reps: '12' }
  ])

  useEffect(() => {
    fetchWorkouts()
  }, [])

  async function fetchWorkouts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workouts:', error)
    } else if (data) {
      setWorkouts(data as Workout[])
    }
    setLoading(false)
  }

  async function handleAddWorkout(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      alert('Please log in to save custom workouts.')
      return
    }

    const { error } = await supabase.from('workouts').insert([
      {
        user_id: userData.user.id,
        title,
        description,
        exercises
      }
    ])

    if (error) {
      alert(`Error saving workout: ${error.message}`)
    } else {
      setTitle('')
      setDescription('')
      fetchWorkouts()
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-4 text-emerald-400">
        Workout Routines
      </h1>

      {/* Add New Workout Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Create Routine</h2>
        <form onSubmit={handleAddWorkout} className="space-y-3">
          <input
            type="text"
            placeholder="Routine Title (e.g., Upper Body Blitz)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          />
          <textarea
            placeholder="Description or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            rows={2}
          />
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            Save Routine to Database
          </button>
        </form>
      </div>

      {/* Active Workouts List */}
      <h2 className="text-lg font-semibold text-slate-200 mb-3">Your Saved Routines</h2>
      {loading ? (
        <p className="text-slate-400 text-sm">Loading routines...</p>
      ) : workouts.length === 0 ? (
        <p className="text-slate-500 text-sm">No saved routines found in your database yet.</p>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div key={w.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-emerald-400">{w.title}</h3>
              {w.description && <p className="text-xs text-slate-400 mt-1">{w.description}</p>}
              <div className="mt-3 space-y-1">
                {w.exercises?.map((ex, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-300 bg-slate-800/50 p-2 rounded">
                    <span>{ex.name}</span>
                    <span className="font-mono text-slate-400">{ex.sets} sets × {ex.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Navigation />
    </main>
  )
}