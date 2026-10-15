'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient, getLocalUser, Exercise } from '@/lib/client'
import Navigation from '@/components/Navigation'
import { Plus, Trash2, Clock, Calendar, Dumbbell, CheckCircle2 } from 'lucide-react'

interface RawWorkout {
  id: string
  title: string
  description?: string | null
  duration_minutes?: number | null
  completed_at?: string | null
  created_at?: string | null
  exercises?: unknown
}

interface ProcessedWorkout {
  id: string
  title: string
  notes: string
  duration: number
  completedAt?: string
  exercises: Exercise[]
}

function parseWorkout(w: RawWorkout): ProcessedWorkout {
  const exercises: Exercise[] = []

  // Check if exercises is already an array of exercise objects
  if (Array.isArray(w.exercises)) {
    for (const item of w.exercises) {
      if (item && typeof item === 'object') {
        const candidate = item as Record<string, unknown>
        if (candidate.name) {
          exercises.push({
            name: String(candidate.name),
            sets: Number(candidate.sets) || 1,
            reps: String(candidate.reps || '10'),
          })
        }
      }
    }
  }

  const rawDesc = w.description || ''
  let notes = rawDesc

  // If exercises are formatted inside description (e.g., "Exercises:\n• Pushups (3 sets × 12)"), extract them
  if (rawDesc.includes('Exercises:')) {
    const parts = rawDesc.split(/Exercises:\r?\n/)
    notes = parts[0]?.trim() || ''
    const exerciseLines = parts[1] ? parts[1].split(/\r?\n/) : []

    for (const line of exerciseLines) {
      const match = line.match(/^•\s*(.*?)\s*\((?:(\d+)\s*sets?\s*[×x*]\s*([^\)]+))\)/i)
      if (match) {
        exercises.push({
          name: match[1].trim(),
          sets: parseInt(match[2], 10) || 3,
          reps: match[3].trim(),
        })
      }
    }
  }

  return {
    id: w.id,
    title: w.title || 'Untitled Routine',
    notes,
    duration: w.duration_minutes || 30,
    completedAt: w.completed_at || w.created_at || undefined,
    exercises,
  }
}

export default function WorkoutPage() {
  const supabase = createClient()
  const [workouts, setWorkouts] = useState<ProcessedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null)

  // New workout form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: 'Pushups', sets: 3, reps: '12' },
  ])

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    let res = await supabase
      .from('workouts')
      .select('*')
      .order('completed_at', { ascending: false })

    if (res.error) {
      res = await supabase.from('workouts').select('*')
    }

    if (res.data) {
      const list = (res.data as RawWorkout[]).map(parseWorkout)
      setWorkouts(list)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    let ignore = false
    async function loadWorkouts() {
      let res = await supabase
        .from('workouts')
        .select('*')
        .order('completed_at', { ascending: false })

      if (res.error) {
        res = await supabase.from('workouts').select('*')
      }

      if (!ignore && res.data) {
        const list = (res.data as RawWorkout[]).map(parseWorkout)
        setWorkouts(list)
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
    const currentUser = userData?.user ?? getLocalUser()

    if (!currentUser || !currentUser.id) {
      setStatusMessage({
        text: 'Please log in in the Profile tab to save routines to your account.',
        error: true,
      })
      return
    }

    const validExercises = exercises.filter((ex) => ex.name.trim() !== '')
    const exercisesText =
      validExercises.length > 0
        ? `\n\nExercises:\n` +
          validExercises
            .map((ex) => `• ${ex.name} (${ex.sets} sets × ${ex.reps})`)
            .join('\n')
        : ''

    const finalDescription = (description.trim() + exercisesText).trim()

    // Payload compatible with standard Supabase workouts schema
    const payload: Record<string, unknown> = {
      user_id: currentUser.id,
      title: title.trim(),
      description: finalDescription || null,
      duration_minutes: durationMinutes || 30,
    }

    const { error } = await supabase.from('workouts').insert([payload])

    if (error) {
      setStatusMessage({ text: `Error saving workout: ${error.message}`, error: true })
    } else {
      setTitle('')
      setDescription('')
      setDurationMinutes(30)
      setExercises([{ name: 'Pushups', sets: 3, reps: '12' }])
      setStatusMessage({ text: 'Workout routine saved successfully!' })
      fetchWorkouts()
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-28 p-4 max-w-md mx-auto">
      <header className="mb-4">
        <h1 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">
          DW / FITNESS
        </h1>
        <p className="text-2xl font-extrabold tracking-tight text-white">Workout Routines</p>
      </header>

      {/* Add New Workout Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-emerald-400" /> Create Routine
        </h2>

        <form onSubmit={handleAddWorkout} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Routine Title</label>
            <input
              type="text"
              placeholder="e.g., Upper Body Blitz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">
              Estimated Duration (Minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 30)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors pl-9"
                required
              />
              <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Notes & Goals</label>
            <textarea
              placeholder="e.g., Target upper chest and triceps focus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              rows={2}
            />
          </div>

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
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Sets"
                  value={ex.sets}
                  onChange={(e) =>
                    handleExerciseChange(idx, 'sets', parseInt(e.target.value, 10) || 1)
                  }
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
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
              className={`text-xs p-3 rounded-xl text-center font-medium ${
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
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
          >
            Save Routine
          </button>
        </form>
      </div>

      {/* Active Workouts List */}
      <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Your Saved Routines
      </h2>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading routines...</p>
      ) : workouts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-sm">
          No saved routines found in your database yet. Create one above!
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div
              key={w.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5"
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-extrabold text-white text-base capitalize">{w.title}</h3>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" /> {w.duration} min
                </span>
              </div>

              {w.notes && <p className="text-xs text-slate-400 leading-relaxed">{w.notes}</p>}

              {w.exercises.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Exercises:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {w.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs text-slate-200 bg-slate-950/60 border border-slate-800/60 px-2.5 py-1.5 rounded-lg"
                      >
                        <span className="font-medium">{ex.name}</span>
                        <span className="font-mono text-emerald-400 text-[11px]">
                          {ex.sets} sets × {ex.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {w.completedAt && (
                <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-800/40">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>
                    Saved{' '}
                    {new Date(w.completedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Navigation />
    </main>
  )
}