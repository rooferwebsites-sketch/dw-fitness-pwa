'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/client'
import Navigation from '@/components/Navigation'
import { Plus, Trash2 } from 'lucide-react'

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
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null)

  // New workout form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: 'Pushups', sets: 3, reps: '12' }
  ])

  const fetchWorkouts = useCallback(async () => {
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
  }, [supabase])

  useEffect(() => {
    let ignore = false
    async function loadWorkouts() {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })

      if (!ignore) {
        if (error) {
          console.error('Error fetching workouts:', error)
        } else if (data) {
          setWorkouts(data as Workout[])
        }
        setLoading(false)
      }
    }
    loadWorkouts()
    return () => {
      ignore = true
    }
  }, [supabase])

  function handleExerciseChange(index: number, field: keyof Exercise, value: string | number) {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  function addExerciseField() {
    setExercises([...exercises, { name: '', sets: 3, reps: '10' }])
  }

  function removeExerciseField(index: number) {
    if (exercises.length <= 1) return
    setExercises(exercises.filter((_, i) => i !== index))
  }

  async function handleAddWorkout(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setStatusMessage(null)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      setStatusMessage({ text: 'Please log in in the Profile tab to associate custom workouts.', error: true })
      return
    }

    const { error } = await supabase.from('workouts').insert([
      {
        user_id: userData.user.id,
        title,
        description,
        exercises: exercises.filter(ex => ex.name.trim() !== '')
      }
    ])

    if (error) {
      setStatusMessage({ text: `Error saving workout: ${error.message}`, error: true })
    } else {
      setTitle('')
      setDescription('')
      setExercises([{ name: 'Pushups', sets: 3, reps: '12' }])
      setStatusMessage({ text: 'Workout routine saved successfully!' })
      fetchWorkouts()
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-28 p-4 max-w-md mx-auto">
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
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          />
          <textarea
            placeholder="Description or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            rows={2}
          />

          {/* Exercise list builder */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Exercises</span>
              <button
                type="button"
                onClick={addExerciseField}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Move
              </button>
            </div>
            {exercises.map((ex, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={ex.name}
                  onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Sets"
                  value={ex.sets}
                  onChange={(e) => handleExerciseChange(idx, 'sets', parseInt(e.target.value) || 1)}
                  className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                />
                <input
                  type="text"
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                  className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                />
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExerciseField(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {statusMessage && (
            <p
              className={`text-xs p-2.5 rounded-lg text-center ${
                statusMessage.error
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {statusMessage.text}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Save Routine
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